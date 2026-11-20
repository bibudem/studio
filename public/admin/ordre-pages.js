/*
 * Vue de la collection « Pages » de l'interface de rédaction, à la place de
 * la liste de Decap, selon le menu du site (src/data/navigation.yaml) :
 * - « Pages » : le menu principal (sections), leurs menus de section, puis
 *   les pages hors du menu ;
 * - « Pages › Espaces » (dossier ouvert) : la section ou la page de ce
 *   dossier et son menu.
 * Le menu de gauche est un arbre des mêmes éléments (sections, pages,
 * sous-pages qui se déplient), à la place de celui de Decap (STYLE_GAUCHE).
 *
 * Ici, le menu ne suit pas les dossiers (catégories sans page, pages cachées,
 * liens vers une autre section) : l'ordre n'est pas une clé des pages, c'est
 * celui des listes de navigation.yaml. Les éléments se réordonnent par
 * glisser-déposer ou avec les flèches, à l'intérieur de leur parent
 * seulement ; une page hors du menu s'y ajoute (« Ajouter au menu… »), une
 * page du menu sans sous-pages en sort (« Retirer du menu »). L'adresse
 * d'une page ne change jamais.
 *
 * « Enregistrer le menu » réécrit navigation.yaml en un seul enregistrement :
 * - en local (npm run cms:local), par decap-server, dans le fichier ;
 * - en ligne, par l'API GitHub avec la session de Decap : un seul commit sur
 *   la branche de config.yml, refusé si elle a bougé entre-temps.
 * Seules les listes touchées changent : leurs éléments sont déplacés tels
 * quels (commentaires, clés cache et recommande gardés), le reste du
 * fichier n'est pas réécrit. Le build vérifie le résultat
 * (src/data/navigation.ts).
 *
 * Données : arborescence.json (navigation, pages), générée au build. En
 * ligne, un menu enregistré y apparaît après la reconstruction du site.
 */

const ID_VUE = 'ordre-pages'
const FICHIER_MENU = 'src/data/navigation.yaml'
const RACINE_PAGES = 'src/content/pages/'

// ---------------------------------------------------------------- Modèle du menu

/** Identifiant d'un élément de navigation.yaml, pour vérifier que le fichier n'a pas bougé */
export function signature(element) {
  if (typeof element === 'string') return element
  if (element && typeof element.cle === 'string' && Array.isArray(element.menu)) return `section:${element.cle}`
  if (element?.page) return element.page
  if (element?.lien) return `lien:${element.lien}`
  return `titre:${element?.titre ?? ''}`
}

/**
 * Arbre du menu : racine (menu principal) → sections → éléments du menu de
 * section → leurs enfants. `conteneur` : l'élément a une liste dans
 * navigation.yaml (menu d'une section, enfants d'un élément) ; seuls les
 * conteneurs reçoivent des éléments. `hors` : pages absentes du menu.
 */
export function construireModele(navigation, pages) {
  const parId = new Map(pages.map((page) => [page.id, page]))
  let compteur = 0
  const nouvelleCle = () => `n${++compteur}`
  const dansLeMenu = new Set()

  const depuisElement = (element) => {
    const o = typeof element === 'string' ? { page: element } : element
    const page = o.page ? (parId.get(o.page) ?? null) : null
    if (o.page) dansLeMenu.add(o.page)
    return {
      cle: nouvelleCle(),
      type: o.page ? 'page' : o.lien ? 'lien' : 'categorie',
      id: o.page ?? null,
      titre: o.titre ?? page?.titre ?? o.page ?? o.lien ?? '',
      lien: o.lien ?? null,
      cache: Boolean(o.cache),
      recommande: Boolean(o.recommande),
      page,
      conteneur: Array.isArray(o.enfants),
      signature: signature(element),
      enfants: (o.enfants ?? []).map(depuisElement),
    }
  }

  const sections = navigation.map((section) => {
    const page = parId.get(section.cle) ?? null
    dansLeMenu.add(section.cle)
    return {
      cle: nouvelleCle(),
      type: 'section',
      id: page ? section.cle : null,
      titre: section.titre,
      lien: null,
      cache: false,
      recommande: false,
      page,
      conteneur: true,
      signature: signature(section),
      enfants: section.menu.map(depuisElement),
    }
  })
  const racine = { cle: 'racine', type: 'racine', id: null, titre: 'Menu du site', page: null, conteneur: true, signature: 'racine', enfants: sections }
  const hors = pages
    .filter((page) => !dansLeMenu.has(page.id))
    .sort((a, b) => a.id.localeCompare(b.id, 'fr'))
    .map((page) => horsDuMenu(page, nouvelleCle()))
  return { racine, hors, nouvelleCle }
}

/** Nœud d'une page absente du menu */
export const horsDuMenu = (page, cle) => ({ cle, type: 'page', id: page.id, titre: page.titre, lien: null, cache: false, recommande: false, page, conteneur: false, signature: page.id, enfants: [] })

// ---------------------------------------------------------------- Fichier du menu

/**
 * Nouvelle version de navigation.yaml. `plan` : une entrée par liste touchée,
 * { chemin, attendu, enfants } : chemin de la liste dans le document
 * ([] pour la racine, [0, 'menu'], [0, 'menu', 2, 'enfants']…), signatures
 * de ses éléments à la lecture de arborescence.json (le fichier n'a pas
 * bougé depuis ?), puis ses nouveaux éléments : { origine: { chemin, index } }
 * pour un élément déjà dans le fichier (déplacé tel quel), { valeur } pour
 * une page ajoutée au menu.
 */
export function appliquerMenu(YAML, texte, plan) {
  const crlf = texte.includes('\r\n')
  const doc = YAML.parseDocument(texte.replace(/\r\n/g, '\n'))
  if (doc.errors.length) throw new Error(`fichier illisible : ${doc.errors[0].message}`)
  const cleDe = (chemin) => JSON.stringify(chemin)
  // Toutes les listes sont lues avant d'en changer une : les chemins sont ceux du fichier lu
  const listes = plan.map(({ chemin, attendu }) => {
    const liste = chemin.length ? doc.getIn(chemin, true) : doc.contents
    if (!YAML.isSeq(liste)) throw new Error(`liste introuvable (${chemin.join(' › ') || 'racine'})`)
    const actuels = liste.items.map((item) => signature(item.toJSON()))
    if (actuels.length !== attendu.length || actuels.some((s, i) => s !== attendu[i])) {
      throw new Error('le menu a changé depuis le chargement de l’interface (autre enregistrement ou reconstruction en cours). Rechargez la page et recommencez.')
    }
    return liste
  })
  // Le commentaire d'en-tête du fichier est rattaché à la première section :
  // il reste en tête du fichier, quelle que soit la section qui y passe
  const premiere = YAML.isSeq(doc.contents) ? doc.contents.items[0] : null
  const entete = premiere?.commentBefore
  const anciens = new Map(plan.map(({ chemin }, i) => [cleDe(chemin), [...listes[i].items]]))
  plan.forEach(({ enfants }, i) => {
    listes[i].items = enfants.map((enfant) => {
      if (!enfant.origine) return doc.createNode(enfant.valeur)
      const item = anciens.get(cleDe(enfant.origine.chemin))?.[enfant.origine.index]
      if (!item) throw new Error('élément du menu introuvable dans le fichier')
      return item
    })
  })
  const nouvellePremiere = YAML.isSeq(doc.contents) ? doc.contents.items[0] : null
  if (entete && nouvellePremiere && nouvellePremiere !== premiere) {
    premiere.commentBefore = undefined
    nouvellePremiere.commentBefore = nouvellePremiere.commentBefore ? `${entete}\n${nouvellePremiere.commentBefore}` : entete
  }
  const resultat = doc.toString({ lineWidth: 0 })
  return crlf ? resultat.replace(/\n/g, '\r\n') : resultat
}

const base64EnTexte = (base64) => new TextDecoder().decode(Uint8Array.from(atob(base64.replace(/\s/g, '')), (c) => c.charCodeAt(0)))

/*
 * Stockage des fichiers. `appliquer(operations, message)` fait tout en un
 * seul enregistrement ; une opération est :
 * - { chemin, transformer } : modifie un fichier existant ;
 * - { chemin, source, transformer, creer: true } : crée `chemin` à partir de
 *   `source`, refusé si `chemin` existe déjà ;
 * - { chemin, supprimer: true } : supprime le fichier ;
 * - { chemin, base64, creer: true } : crée un fichier binaire (image), refusé
 *   si `chemin` existe déjà.
 * Rien n'est écrit si une lecture ou une transformation échoue.
 */

/** decap-server (npm run cms:local) : lecture et écriture directes des fichiers */
function stockageLocal(url, branche) {
  const appel = async (action, params) => {
    const reponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, params: { branch: branche, ...params } }) })
    const json = await reponse.json().catch(() => ({}))
    if (!reponse.ok) throw new Error(`serveur local : ${json.error ?? reponse.status}`)
    return json
  }
  const lire = async (chemin) => (await appel('getEntry', { path: chemin })).data
  const stockage = {
    enLigne: false,
    async appliquer(operations, message) {
      const ecrits = []
      const binaires = []
      const supprimes = []
      for (const op of operations) {
        if (op.base64) {
          if (op.creer && (await lire(op.chemin)) != null) throw new Error(`le fichier ${op.chemin} existe déjà`)
          binaires.push({ path: op.chemin, content: op.base64, encoding: 'base64' })
          continue
        }
        if (op.supprimer) {
          if ((await lire(op.chemin)) == null) throw new Error(`fichier introuvable : ${op.chemin}`)
          supprimes.push(op.chemin)
          continue
        }
        if (op.creer && (await lire(op.chemin)) != null) throw new Error(`le fichier ${op.chemin} existe déjà`)
        const texte = await lire(op.source ?? op.chemin)
        if (texte == null) throw new Error(`fichier introuvable : ${op.source ?? op.chemin}`)
        ecrits.push({ slug: op.chemin, path: op.chemin, raw: op.transformer(texte) })
      }
      if (ecrits.length || binaires.length) {
        await appel('persistEntry', {
          dataFiles: ecrits,
          assets: binaires,
          options: { commitMessage: message, useWorkflow: false, status: 'published', collectionName: 'pages' },
        })
      }
      if (supprimes.length) await appel('deleteFiles', { paths: supprimes, options: { commitMessage: message } })
    },
    modifier: (chemins, transformer, message) => stockage.appliquer(chemins.map((chemin) => ({ chemin, transformer: (texte) => transformer(chemin, texte) })), message),
  }
  return stockage
}

/** GitHub : un seul commit, à partir de l'état de la branche lu au même moment */
export function stockageGithub(backend, branche, jeton, requete = fetch) {
  const api = `${(backend.api_root || 'https://api.github.com').replace(/\/$/, '')}/repos/${backend.repo}`
  const appel = async (chemin, options = {}, absentPermis = false) => {
    const reponse = await requete(api + chemin, {
      ...options,
      headers: { Authorization: `token ${jeton}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    })
    if (absentPermis && reponse.status === 404) return null
    const json = await reponse.json().catch(() => ({}))
    if (!reponse.ok) {
      if (reponse.status === 422 && /refs/.test(chemin)) throw new Error('la branche a changé pendant l’enregistrement (autre modification en cours). Rechargez la page et recommencez.')
      throw new Error(`GitHub ${reponse.status} : ${json.message ?? ''}`)
    }
    return json
  }
  const encoder = (chemin) => chemin.split('/').map(encodeURIComponent).join('/')
  const stockage = {
    enLigne: true,
    async appliquer(operations, message) {
      const ref = await appel(`/git/ref/heads/${encoder(branche)}`)
      const tete = ref.object.sha
      const commit = await appel(`/git/commits/${tete}`)
      const lire = (chemin, absentPermis) => appel(`/contents/${encoder(chemin)}?ref=${tete}`, {}, absentPermis)
      const arbre = []
      for (const op of operations) {
        if (op.supprimer) {
          if (!(await lire(op.chemin, true))) throw new Error(`fichier introuvable : ${op.chemin}`)
          // sha nul : le fichier est retiré de l'arbre
          arbre.push({ path: op.chemin, mode: '100644', type: 'blob', sha: null })
          continue
        }
        if (op.creer && (await lire(op.chemin, true))) throw new Error(`le fichier ${op.chemin} existe déjà`)
        if (op.base64) {
          const blob = await appel('/git/blobs', { method: 'POST', body: JSON.stringify({ content: op.base64, encoding: 'base64' }) })
          arbre.push({ path: op.chemin, mode: '100644', type: 'blob', sha: blob.sha })
          continue
        }
        const fichier = await lire(op.source ?? op.chemin)
        arbre.push({ path: op.chemin, mode: '100644', type: 'blob', content: op.transformer(base64EnTexte(fichier.content)) })
      }
      const nouvelArbre = await appel('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree: arbre }) })
      const nouveau = await appel('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: nouvelArbre.sha, parents: [tete] }) })
      // Sans force : refusé si la branche a avancé depuis la lecture
      await appel(`/git/refs/heads/${encoder(branche)}`, { method: 'PATCH', body: JSON.stringify({ sha: nouveau.sha, force: false }) })
    },
    modifier: (chemins, transformer, message) => stockage.appliquer(chemins.map((chemin) => ({ chemin, transformer: (texte) => transformer(chemin, texte) })), message),
  }
  return stockage
}


// ---------------------------------------------------------------- Copie d'une page

/** Chemin normalisé (« a/b/../c/ » → « a/c/ ») */
function normaliser(chemin) {
  const parties = []
  for (const partie of chemin.split('/')) {
    if (!partie || partie === '.') continue
    if (partie === '..') parties.pop()
    else parties.push(partie)
  }
  return parties.join('/')
}

/** Chemin relatif de `de` (dossier) vers `vers` (dossier), avec « ./ » ou « ../ » */
function relatif(de, vers) {
  const a = normaliser(de).split('/').filter(Boolean)
  const b = normaliser(vers).split('/').filter(Boolean)
  let commun = 0
  while (commun < a.length && commun < b.length && a[commun] === b[commun]) commun++
  const remonte = a.length - commun
  const suite = b.slice(commun).join('/')
  return (remonte ? '../'.repeat(remonte) : './') + (suite ? `${suite}/` : '')
}

/**
 * Références relatives aux dossiers images/ (« ./images/… », « ../images/… »,
 * « blrcs/images/… ») recalculées pour un fichier déplacé de `ancien` vers
 * `nouveau` (dossiers relatifs à src/content/pages). Les adresses absolues et
 * externes ne changent pas.
 */
export function deplacerReferencesImages(texte, ancien, nouveau) {
  if (normaliser(ancien) === normaliser(nouveau)) return texte
  return texte.replace(/(\]\(|:[ \t]+|=")((?:\.{1,2}\/)*(?:[\w-]+\/)*?images\/)/g, (_, avant, chemin) => avant + relatif(nouveau, `${normaliser(`${ancien}/${chemin}`)}`) )
}


/**
 * Contenu de la copie d'une page : titre (et libellé du menu) suivis de
 * « (copie) », en préparation (nonListee : hors des menus et de la
 * recherche), images recalculées si la copie change de dossier. Le corps
 * n'est pas touché autrement.
 */
export function copierPage(YAML, texte, ancienDossier, nouveauDossier) {
  const crlf = texte.includes('\r\n')
  const lf = deplacerReferencesImages(texte.replace(/\r\n/g, '\n'), ancienDossier, nouveauDossier)
  const m = lf.match(/^---\n([\s\S]*?\n)?---(?=\n|$)/)
  if (!m) throw new Error('en-tête (---) introuvable')
  const doc = YAML.parseDocument(m[1] ?? '')
  if (doc.errors.length) throw new Error(`en-tête illisible : ${doc.errors[0].message}`)
  doc.set('title', `${doc.get('title') ?? 'Page'} (copie)`)
  if (doc.get('titreMenu')) doc.set('titreMenu', `${doc.get('titreMenu')} (copie)`)
  doc.set('nonListee', true)
  const resultat = '---\n' + doc.toString({ lineWidth: 0 }) + '---' + lf.slice(m[0].length)
  return crlf ? resultat.replace(/\n/g, '\r\n') : resultat
}

/** Même choix que Decap : le serveur local s'il répond (local_backend), sinon GitHub */
export async function choisirStockage() {
  const config = await (await fetch('./config.yml')).json()
  const branche = config.backend?.branch || 'main'
  if (config.local_backend) {
    const url = (typeof config.local_backend === 'object' && config.local_backend.url) || 'http://localhost:8081/api/v1'
    try {
      const reponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'info' }) })
      if (reponse.ok) return stockageLocal(url, branche)
    } catch {
      // Pas de serveur local : GitHub, comme Decap
    }
  }
  let jeton = null
  try {
    jeton = JSON.parse(localStorage.getItem('decap-cms-user') || 'null')?.token
  } catch {
    jeton = null
  }
  if (!jeton) throw new Error('session GitHub introuvable. Reconnectez-vous à l’interface de rédaction.')
  return stockageGithub(config.backend, branche, jeton)
}


// ---------------------------------------------------------------- Menu de gauche (styles)

/*
 * Menu de gauche : l'arbre de Decap ne montre que des dossiers, qui ne sont
 * pas ceux du menu du site, et se replie au clic sur « Pages ». Ses liens
 * sous « Pages » sont masqués, et un arbre du menu est placé après le lien
 * « Pages » (dans le <li> de Decap) : sections, pages, sous-pages, puis les
 * pages hors du menu. Les liens de Decap portent data-testid : propre à
 * cette version de Decap, à revérifier si on en change.
 */
const LISTE_DECAP = 'li:has(> a[data-testid="/"])'
const STYLE_GAUCHE = `
${LISTE_DECAP} > a:not([data-testid="/"]) { display: none !important; }
${LISTE_DECAP} > a[data-testid="/"] [class*="Caret"] { display: none; }
#arbre-gauche, #arbre-gauche ul { list-style: none; margin: 0; padding: 0; }
#arbre-gauche .ag-ligne { display: flex; align-items: center; border-left: 2px solid transparent; }
#arbre-gauche .ag-lien { flex: 1; display: block; padding: 8px 8px 8px var(--retrait); font-size: 14px; font-weight: var(--graisse-moyenne, 500); line-height: 1.3; color: var(--couleur-texte, #0b113a); text-decoration: none; }
#arbre-gauche .ag-inactif { color: var(--couleur-contour, #7d8696); }
#arbre-gauche .ag-masquee { font-style: italic; }
#arbre-gauche .ag-ligne:hover, #arbre-gauche .ag-ligne:has(> [aria-current="page"]) { background: var(--couleur-teinte, #e5eef7); border-left-color: var(--couleur-accent, #0057ac); }
#arbre-gauche .ag-ligne:hover > .ag-lien, #arbre-gauche [aria-current="page"] { color: var(--couleur-lien, #0057ac); }
#arbre-gauche .ag-bascule { flex: none; width: 28px; height: 28px; margin-right: 6px; border: 0; border-radius: var(--rayon-minuscule, 4px); background: transparent; color: var(--couleur-texte-secondaire, #4a5160); cursor: pointer; font-size: 11px; }
#arbre-gauche .ag-bascule:hover { background: var(--couleur-teinte-forte, #cce2f3); color: var(--couleur-lien, #0057ac); }
#arbre-gauche .ag-bascule::before { content: ''; display: inline-block; border-left: 5px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; transition: transform .15s var(--courbe-standard, ease); }
#arbre-gauche .ag-bascule[aria-expanded="true"]::before { transform: rotate(90deg); }
#arbre-gauche > li:not(.ag-generale) > .ag-ligne > .ag-lien { font-weight: var(--graisse-forte, 600); }
#arbre-gauche .ag-separateur { margin: 6px 12px; border-top: 1px solid var(--couleur-bordure, #c3ccd5); }
#arbre-gauche :focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: -3px; }
`

const CLE_OUVERTS = 'studio-admin-menu-ouvert'

// ---------------------------------------------------------------- Vue

/*
 * Styles de la liste : jetons Harmonium du site (paquet harmonium, servis
 * par /admin/theme.css), avec une valeur de repli si la feuille manque.
 * Boutons : plein (fond fort) et contour, en pilule ; cartes : rayon et
 * ombre Harmonium ; titres de carte en Lora, comme les h4 du site.
 */
const STYLE = `
body[data-vue-ordre] main > :not(:first-child):not(#${ID_VUE}) { display: none !important; }
#${ID_VUE} { margin-top: 16px; font-size: 14px; color: var(--couleur-texte, #0b113a); }
#${ID_VUE} .op-barre { position: sticky; top: 72px; z-index: 2; display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; padding: 14px 18px; margin-bottom: 16px; background: var(--couleur-surface, #fff); border-radius: var(--rayon-carte, 12px); box-shadow: var(--ombre-1); }
#${ID_VUE} .op-aide { flex: 1 1 320px; margin: 0; color: var(--couleur-texte-secondaire, #4a5160); line-height: 1.45; }
#${ID_VUE} .op-etat { flex-basis: 100%; min-height: 1.2em; margin: 0; font-weight: var(--graisse-forte, 600); }
#${ID_VUE} .op-etat:empty { display: none; }
#${ID_VUE} .op-etat[data-type="erreur"] { color: var(--alerte-erreur-icone, #b10000); }
#${ID_VUE} .op-etat[data-type="succes"] { color: var(--vert-fonce, #024244); }
#${ID_VUE} button { font: inherit; cursor: pointer; }
#${ID_VUE} .op-bouton { min-height: 40px; padding: 0 20px; border-radius: var(--rayon-plein, 9999px); font-weight: var(--graisse-forte, 600); transition: background-color .15s, color .15s; }
#${ID_VUE} .op-enregistrer { border: 2px solid var(--couleur-fond-fort, #0b113a); background: var(--couleur-fond-fort, #0b113a); color: var(--couleur-sur-fonce, #fff); }
#${ID_VUE} .op-enregistrer:not(:disabled):hover { border-color: var(--couleur-fond-fort-survol, #0057ac); background: var(--couleur-fond-fort-survol, #0057ac); }
#${ID_VUE} .op-annuler { border: 2px solid var(--couleur-fond-fort, #0b113a); background: transparent; color: var(--couleur-fond-fort, #0b113a); }
#${ID_VUE} .op-annuler:not(:disabled):hover { background: var(--couleur-teinte, #e5eef7); }
#${ID_VUE} .op-bouton:disabled { border-color: var(--couleur-bordure, #c3ccd5); background: var(--couleur-fond, #f8fafb); color: var(--couleur-texte-secondaire, #4a5160); cursor: default; }
#${ID_VUE} ul { list-style: none; margin: 0; padding: 0; }
#${ID_VUE} .op-section { margin-bottom: 16px; background: var(--couleur-surface, #fff); border-radius: var(--rayon-carte, 12px); box-shadow: var(--ombre-1); padding: 10px 10px 14px; }
#${ID_VUE} .op-section > .op-ligne { padding: 8px; }
#${ID_VUE} .op-section > .op-ligne .op-titre { font-family: var(--police-serif, Georgia, serif); font-size: 1.25rem; font-weight: var(--graisse-normale, 400); line-height: 1.2; }
#${ID_VUE} .op-vide { margin: 4px 8px; color: var(--couleur-texte-secondaire, #4a5160); }
#${ID_VUE} .op-liste .op-liste { margin-left: 28px; border-left: 2px solid var(--couleur-teinte, #e5eef7); }
#${ID_VUE} .op-ligne { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: var(--rayon-tres-petit, 8px); border-top: 2px solid transparent; border-bottom: 2px solid transparent; }
#${ID_VUE} li.op-item > .op-ligne:hover { background: var(--couleur-fond, #f8fafb); }
#${ID_VUE} .op-poignee { cursor: grab; color: var(--couleur-contour, #7d8696); font-size: 16px; line-height: 1; user-select: none; border-radius: var(--rayon-minuscule, 4px); padding: 2px; }
#${ID_VUE} .op-poignee:hover { color: var(--couleur-texte, #0b113a); }
#${ID_VUE} li[data-fixe] > .op-ligne .op-poignee, #${ID_VUE} li[data-seul] > .op-ligne .op-poignee { visibility: hidden; }
#${ID_VUE} .op-numero { flex: none; box-sizing: border-box; min-width: 3.4em; padding: 2px 8px; border-radius: var(--rayon-plein, 9999px); font-size: var(--texte-minuscule, .75rem); font-weight: var(--graisse-grasse, 700); line-height: 1.4; font-variant-numeric: tabular-nums; text-align: center; }
#${ID_VUE} li[data-niveau="2"] > .op-ligne .op-numero { background: var(--bleu-fonce, #0b113a); color: var(--couleur-sur-fonce, #fff); }
#${ID_VUE} li[data-niveau="3"] > .op-ligne .op-numero { background: var(--couleur-teinte-forte, #cce2f3); color: var(--bleu-fonce, #0b113a); }
#${ID_VUE} li[data-niveau="4"] > .op-ligne .op-numero, #${ID_VUE} li[data-niveau="5"] > .op-ligne .op-numero { background: var(--couleur-surface, #fff); color: var(--couleur-texte-secondaire, #4a5160); box-shadow: inset 0 0 0 1px var(--couleur-bordure, #c3ccd5); }
#${ID_VUE} li[data-niveau="2"] > .op-ligne .op-titre { font-weight: var(--graisse-forte, 600); }
#${ID_VUE} li[data-fixe] > .op-ligne .op-numero { background: none; box-shadow: none; color: var(--couleur-contour, #7d8696); }
#${ID_VUE} .op-titre { flex: 1; color: inherit; font-weight: var(--graisse-moyenne, 500); text-decoration: none; }
#${ID_VUE} a.op-titre:hover { color: var(--couleur-lien-survol, #003c78); text-decoration: underline; }
#${ID_VUE} .op-badge { padding: 1px 8px; border-radius: var(--rayon-plein, 9999px); background: var(--couleur-teinte, #e5eef7); color: var(--couleur-texte-secondaire, #4a5160); font-size: var(--texte-minuscule, .75rem); font-weight: var(--graisse-forte, 600); white-space: nowrap; }
#${ID_VUE} li.op-modifie > .op-ligne .op-numero { background: var(--couleur-accent, #0057ac); color: var(--couleur-sur-fonce, #fff); box-shadow: none; }
#${ID_VUE} .op-actions-conteneur { position: relative; flex: none; }
#${ID_VUE} .op-actions { width: 30px; height: 30px; padding: 0; border: 0; border-radius: var(--rayon-plein, 9999px); background: transparent; color: var(--couleur-texte-secondaire, #4a5160); font-size: 18px; line-height: 1; opacity: .45; }
#${ID_VUE} .op-ligne:hover .op-actions, #${ID_VUE} .op-ligne:focus-within .op-actions, #${ID_VUE} .op-actions[aria-expanded="true"] { opacity: 1; }
#${ID_VUE} .op-actions:hover, #${ID_VUE} .op-actions[aria-expanded="true"] { background: var(--couleur-teinte, #e5eef7); color: var(--couleur-lien, #0057ac); }
#${ID_VUE} .op-menu { position: absolute; right: 0; top: calc(100% + 4px); z-index: 10; display: flex; flex-direction: column; min-width: 210px; padding: 6px; background: var(--couleur-surface, #fff); border-radius: var(--rayon-tres-petit, 8px); box-shadow: var(--ombre-2); }
#${ID_VUE} .op-menu[hidden] { display: none; }
#${ID_VUE} .op-action { display: block; padding: 8px 12px; border: 0; border-radius: var(--rayon-minuscule, 4px); background: none; color: var(--couleur-texte, #0b113a); font-size: 14px; font-weight: var(--graisse-moyenne, 500); text-align: left; text-decoration: none; white-space: nowrap; }
#${ID_VUE} .op-action:hover, #${ID_VUE} .op-action:focus-visible { background: var(--couleur-teinte, #e5eef7); color: var(--couleur-lien, #0057ac); }
#${ID_VUE} .op-action.op-danger { color: var(--alerte-erreur-icone, #b10000); }
#${ID_VUE} .op-action.op-danger:hover { background: var(--alerte-erreur-fond, #fee1de); color: var(--alerte-erreur-icone, #b10000); }
#${ID_VUE} .op-action[aria-disabled="true"], #${ID_VUE} .op-action[aria-disabled="true"]:hover { background: none; color: var(--couleur-contour, #7d8696); cursor: not-allowed; }
.op-dialogue { max-width: min(560px, calc(100vw - 32px)); padding: 28px; border: 0; border-radius: var(--rayon-carte, 12px); color: var(--couleur-texte, #0b113a); font-family: var(--police-sans, sans-serif); font-size: 14px; line-height: 1.5; box-shadow: var(--ombre-2); }
.op-dialogue::backdrop { background: rgb(11 17 58 / 45%); }
.op-dialogue h2 { margin: 0 0 12px; font-size: var(--texte-grand, 1.25rem); font-weight: var(--graisse-forte, 600); line-height: 1.2; }
.op-dialogue p { margin: 0 0 8px; }
.op-dialogue ul { max-height: 240px; overflow: auto; margin: 4px 0 12px; padding-left: 20px; }
.op-dialogue .op-note { color: var(--couleur-texte-secondaire, #4a5160); }
.op-bandeau { position: fixed; right: 24px; bottom: 24px; z-index: 1000; max-width: min(520px, calc(100vw - 48px)); margin: 0; padding: 14px 18px; border-left: 4px solid var(--couleur-accent, #0057ac); border-radius: var(--rayon-tres-petit, 8px); background: var(--couleur-surface, #fff); color: var(--couleur-texte, #0b113a); font-family: var(--police-sans, sans-serif); font-size: 14px; line-height: 1.45; box-shadow: var(--ombre-2); }
.op-bandeau[hidden] { display: none; }
.op-bandeau[data-type="succes"] { border-color: var(--vert-fonce, #024244); }
.op-bandeau[data-type="erreur"] { border-color: var(--alerte-erreur-icone, #b10000); }
.op-dialogue .op-champ { display: block; margin: 12px 0 4px; font-weight: var(--graisse-forte, 600); }
.op-dialogue .op-choix { width: 100%; min-height: 40px; padding: 0 12px; border: 1px solid var(--couleur-bordure, #c3ccd5); border-radius: var(--rayon-tres-petit, 8px); background: var(--couleur-surface, #fff); color: var(--couleur-texte, #0b113a); font: inherit; }
.op-dialogue-boutons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.op-dialogue button { min-height: 40px; padding: 0 20px; border: 2px solid var(--couleur-fond-fort, #0b113a); border-radius: var(--rayon-plein, 9999px); font: inherit; font-weight: var(--graisse-forte, 600); cursor: pointer; transition: background-color .15s; }
.op-dialogue .op-fermer { background: transparent; color: var(--couleur-fond-fort, #0b113a); }
.op-dialogue .op-fermer:hover { background: var(--couleur-teinte, #e5eef7); }
.op-dialogue .op-confirmer { background: var(--couleur-fond-fort, #0b113a); color: var(--couleur-sur-fonce, #fff); }
.op-dialogue .op-confirmer:hover { border-color: var(--couleur-fond-fort-survol, #0057ac); background: var(--couleur-fond-fort-survol, #0057ac); }
.op-dialogue .op-confirmer.op-danger { border-color: var(--alerte-erreur-icone, #b10000); background: var(--alerte-erreur-icone, #b10000); }
.op-dialogue .op-confirmer.op-danger:hover { border-color: #8a0000; background: #8a0000; }
.op-dialogue :focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
#${ID_VUE} li[data-fixe] > .op-ligne { color: var(--couleur-texte-secondaire, #4a5160); }
#${ID_VUE} .op-glisse { opacity: .4; }
#${ID_VUE} .op-avant > .op-ligne { border-top-color: var(--couleur-accent, #0057ac); }
#${ID_VUE} .op-apres > .op-ligne { border-bottom-color: var(--couleur-accent, #0057ac); }
#${ID_VUE} :focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
`


/**
 * Vue de la collection « Pages ». Un seul modèle en mémoire (le menu et les
 * pages hors du menu) : chaque vue en est un rendu, les changements non
 * enregistrés suivent d'une vue à l'autre.
 */
export function installerVueOrdre(donnees, YAML, pris = new Set(donnees.ids ?? [])) {
  const { racine, hors, nouvelleCle } = construireModele(donnees.navigation ?? [], donnees.pages ?? [])
  const dossiers = new Set((donnees.dossiers ?? []).map((d) => d.chemin))
  const noeuds = new Map()
  const parents = new Map()
  const indexer = (liste, parent) =>
    liste.forEach((n) => {
      noeuds.set(n.cle, n)
      parents.set(n.cle, parent)
      indexer(n.enfants, n)
    })
  indexer(racine.enfants, racine)
  hors.forEach((n) => {
    noeuds.set(n.cle, n)
    parents.set(n.cle, null)
  })

  /** Dossier ouvert dans Decap (filter/<dossier>) → nœud du menu affiché */
  const parDossier = new Map()
  for (const n of noeuds.values()) if (n.id && n.enfants.length && dossiers.has(n.id) && !parDossier.has(n.id)) parDossier.set(n.id, n)

  // État enregistré (celui de navigation.yaml) : enfants de chaque liste,
  // signatures, chemin de chaque liste et place de chaque élément dans le fichier
  const origine = new Map()
  const signatures = new Map()
  const cheminDe = new Map()
  const placeDe = new Map()
  function memoriserOrigine() {
    origine.clear()
    signatures.clear()
    cheminDe.clear()
    placeDe.clear()
    const parcourir = (conteneur, chemin) => {
      cheminDe.set(conteneur.cle, chemin)
      origine.set(conteneur.cle, conteneur.enfants.map((e) => e.cle))
      signatures.set(conteneur.cle, conteneur.enfants.map((e) => e.signature))
      conteneur.enfants.forEach((e, i) => {
        placeDe.set(e.cle, { chemin, index: i })
        if (e.conteneur) parcourir(e, [...chemin, i, e.type === 'section' ? 'menu' : 'enfants'])
      })
    }
    parcourir(racine, [])
  }
  memoriserOrigine()

  /** Listes dont la suite diffère de celle enregistrée */
  function listesModifiees() {
    const liste = []
    const parcourir = (conteneur) => {
      const avant = origine.get(conteneur.cle) ?? []
      const maintenant = conteneur.enfants.map((e) => e.cle)
      if (avant.length !== maintenant.length || avant.some((cle, i) => cle !== maintenant[i])) liste.push(conteneur)
      conteneur.enfants.forEach((e) => e.conteneur && parcourir(e))
    }
    parcourir(racine)
    return liste
  }
  /** Éléments à une autre place qu'à l'enregistrement (numéro en couleur) */
  function elementsModifies() {
    const cles = new Set()
    for (const conteneur of listesModifiees()) {
      const avant = origine.get(conteneur.cle) ?? []
      conteneur.enfants.forEach((e, i) => {
        if (avant[i] !== e.cle) cles.add(e.cle)
      })
    }
    return cles
  }

  let vue = null
  let portee = undefined
  let etat = null
  let enCours = false
  let majAuPlacement = false
  let modifies = new Set()
  let nbListes = 0

  const style = document.createElement('style')
  style.textContent = STYLE + '\n' + STYLE_GAUCHE
  document.head.append(style)

  // ------------------------------------------------ Modèle

  const numerotes = (parent) => parent.enfants.filter((n) => !n.cache)

  /**
   * Numéro hiérarchique d'après l'ordre courant : « 2 » pour la 2e section
   * du menu principal, « 2.1 » dans son menu, « 2.1.3 » plus bas. Une page
   * cachée (cache: true, absente du menu affiché) : « – ».
   */
  function numeroDe(noeud) {
    const parent = parents.get(noeud.cle)
    if (!parent || noeud.cache) return '–'
    const rang = String(numerotes(parent).indexOf(noeud) + 1)
    if (parent === racine) return rang
    const avant = numeroDe(parent)
    return avant === '–' ? rang : `${avant}.${rang}`
  }
  const resumeChangements = () => (nbListes ? `${nbListes} liste${nbListes > 1 ? 's' : ''} du menu à enregistrer.` : 'Aucun changement à enregistrer.')

  function recalculer() {
    nbListes = listesModifiees().length
    modifies = elementsModifies()
  }

  /** Déplace `cle` avant ou après `cible` (même parent), dans le modèle puis à l'écran */
  function deplacer(cle, cible, avant) {
    const parent = parents.get(cle)
    if (!parent || parents.get(cible) !== parent || cle === cible) return
    const liste = parent.enfants
    const noeud = liste.splice(liste.findIndex((n) => n.cle === cle), 1)[0]
    liste.splice(liste.findIndex((n) => n.cle === cible) + (avant ? 0 : 1), 0, noeud)
    recalculer()
    const li = vue?.querySelector(`li.op-item[data-cle="${CSS.escape(cle)}"]`)
    const liCible = vue?.querySelector(`li.op-item[data-cle="${CSS.escape(cible)}"]`)
    if (li && liCible) {
      if (avant) liCible.before(li)
      else liCible.after(li)
    }
    majNumeros()
    rendreGauche()
    annoncer(`« ${noeud.titre} » en position ${numeroDe(noeud)}. ${resumeChangements()}`)
  }

  /** Page hors du menu → fin de la liste `conteneur` */
  function ajouterAuMenu(noeud, conteneur) {
    hors.splice(hors.indexOf(noeud), 1)
    conteneur.enfants.push(noeud)
    parents.set(noeud.cle, conteneur)
    recalculer()
    rendre()
    rendreGauche()
    annoncer(`« ${noeud.titre} » ajoutée au menu, en position ${numeroDe(noeud)}. ${resumeChangements()}`)
  }

  /** Page du menu (sans sous-pages) → pages hors du menu */
  function retirerDuMenu(noeud) {
    const parent = parents.get(noeud.cle)
    if (!parent) return
    parent.enfants.splice(parent.enfants.indexOf(noeud), 1)
    hors.push(noeud)
    hors.sort((a, b) => a.id.localeCompare(b.id, 'fr'))
    parents.set(noeud.cle, null)
    recalculer()
    rendre()
    rendreGauche()
    annoncer(`« ${noeud.titre} » retirée du menu (la page reste en ligne à son adresse). ${resumeChangements()}`)
  }

  function annuler() {
    // Chaque liste reprend ses éléments enregistrés ; les pages ajoutées repartent hors du menu
    const tous = new Map([...noeuds].filter(([, n]) => n.type !== 'racine'))
    const places = new Set()
    for (const [cle, suite] of origine) {
      const conteneur = cle === racine.cle ? racine : noeuds.get(cle)
      conteneur.enfants = suite.map((c) => tous.get(c))
      suite.forEach((c) => {
        parents.set(c, conteneur)
        places.add(c)
      })
    }
    hors.length = 0
    for (const n of tous.values()) {
      if (places.has(n.cle)) continue
      parents.set(n.cle, null)
      hors.push(n)
    }
    hors.sort((a, b) => a.id.localeCompare(b.id, 'fr'))
    recalculer()
    rendre()
    rendreGauche()
    annoncer('Modifications annulées.')
  }

  // ------------------------------------------------ Rendu

  function element(balise, attributs = {}, ...enfants) {
    const el = document.createElement(balise)
    for (const [cle, valeur] of Object.entries(attributs)) {
      if (valeur === false || valeur == null) continue
      if (cle === 'class') el.className = valeur
      else if (cle === 'texte') el.textContent = valeur
      else el.setAttribute(cle, valeur === true ? '' : valeur)
    }
    el.append(...enfants.filter(Boolean))
    return el
  }

  const entreeDe = (noeud) => noeud.page?.entree ?? null
  const titreDe = (noeud) => (entreeDe(noeud) ? element('a', { class: 'op-titre', href: entreeDe(noeud), texte: noeud.titre }) : element('span', { class: 'op-titre', texte: noeud.titre }))

  function badgesDe(noeud) {
    const badges = []
    const badge = (texte, title) => element('span', { class: 'op-badge', texte, title })
    if (noeud.type === 'lien') badges.push(badge(`Lien → ${noeud.lien}`, noeud.lien))
    if (noeud.type === 'categorie') badges.push(badge('Catégorie', 'Catégorie sans page à elle : son libellé et ses sous-pages se modifient dans src/data/navigation.yaml.'))
    if (noeud.type !== 'lien' && noeud.type !== 'categorie' && !noeud.page && noeud.id) badges.push(badge('Page introuvable', `Aucune page ${noeud.id} : le build le signalera.`))
    if (noeud.cache) badges.push(badge('Cachée', 'Absente du menu affiché, rattachée ici pour le fil d’Ariane.'))
    if (noeud.recommande) badges.push(badge('★ Recommandée'))
    if (noeud.page?.brouillon) badges.push(badge('Brouillon', 'Non publiée.'))
    else if (noeud.page?.nonListee) badges.push(badge('En préparation', 'Publiée à son adresse, hors des menus et de la recherche.'))
    return badges
  }

  function rendreItem(noeud, deplacable = true) {
    const li = element(
      'li',
      { class: 'op-item', 'data-cle': noeud.cle, draggable: deplacable ? 'true' : false, 'data-fixe': !deplacable },
      element(
        'div',
        { class: 'op-ligne' },
        deplacable
          ? element('span', { class: 'op-poignee', role: 'button', tabindex: '0', title: 'Glisser pour déplacer (au clavier : flèches haut et bas)', 'aria-label': `Déplacer « ${noeud.titre} » : flèches haut et bas`, texte: '⠿' })
          : element('span', { class: 'op-poignee', 'aria-hidden': 'true', texte: '⠿' }),
        deplacable ? element('span', { class: 'op-numero', title: 'Position dans le menu' }) : null,
        titreDe(noeud),
        ...badgesDe(noeud),
        menuActions(noeud),
      ),
    )
    if (deplacable && noeud.enfants.length) li.append(rendreListe(noeud))
    return li
  }

  function rendreListe(parent) {
    const ul = element('ul', { class: 'op-liste', 'data-parent': parent.cle, 'aria-label': parent === racine ? 'Menu principal' : `Menu de « ${parent.titre} »` })
    ul.append(...parent.enfants.map((n) => rendreItem(n)))
    return ul
  }

  /** Carte d'un nœud : son titre (lien vers l'éditeur), puis son menu */
  function rendreCarte(noeud) {
    const entete = element('div', { class: 'op-ligne' }, titreDe(noeud), ...(noeud === racine ? [] : [...badgesDe(noeud), menuActions(noeud)]))
    const contenu = noeud.enfants.length ? rendreListe(noeud) : element('p', { class: 'op-vide', texte: 'Aucun élément.' })
    return element('li', { class: 'op-section', 'data-cle': noeud.cle }, entete, contenu)
  }

  function rendreHors() {
    const ul = element('ul', { class: 'op-liste', 'aria-label': 'Pages hors du menu' })
    ul.append(...hors.map((page) => rendreItem(page, false)))
    return element(
      'li',
      { class: 'op-section' },
      element('div', { class: 'op-ligne' }, element('span', { class: 'op-titre', texte: `Pages hors du menu (${hors.length})` })),
      hors.length ? ul : element('p', { class: 'op-vide', texte: 'Toutes les pages sont dans le menu.' }),
      element('p', { class: 'op-vide', texte: 'Publiées à leur adresse, sans place dans le menu. Le bouton ⋯ d’une page : « Ajouter au menu… ».' }),
    )
  }

  function rendreArbre() {
    const arbre = element('ul', { class: 'op-arbre' })
    arbre.append(portee ? rendreCarte(portee) : rendreCarte(racine))
    if (!portee) arbre.append(rendreHors())
    return arbre
  }

  function construireVue() {
    const enregistrer = element('button', { type: 'button', class: 'op-bouton op-enregistrer', disabled: true, texte: 'Enregistrer le menu' })
    const boutonAnnuler = element('button', { type: 'button', class: 'op-bouton op-annuler', disabled: true, texte: 'Annuler' })
    etat = element('p', { class: 'op-etat', role: 'status', 'aria-live': 'polite' })
    const section = element(
      'section',
      { id: ID_VUE, 'aria-label': 'Pages et ordre du menu' },
      element(
        'div',
        { class: 'op-barre' },
        element('p', { class: 'op-aide', texte: 'Menu du site (src/data/navigation.yaml). Glissez un élément par sa poignée ⠿ (au clavier : la poignée, puis les flèches haut et bas) pour changer son ordre sous son parent ; l’adresse des pages ne change pas. Le bouton ⋯ : modifier, ajouter au menu ou en retirer, dupliquer, supprimer.' }),
        boutonAnnuler,
        enregistrer,
        etat,
      ),
      rendreArbre(),
    )
    enregistrer.addEventListener('click', sauvegarder)
    boutonAnnuler.addEventListener('click', annuler)
    brancherInteractions(section)
    return section
  }

  /** Nouveau rendu de l'arbre dans la vue existante (annulation, ajout, changement de dossier) */
  function rendre() {
    if (!vue) return
    vue.querySelector('.op-arbre').replaceWith(rendreArbre())
    majNumeros()
  }

  function majNumeros() {
    if (!vue) return
    for (const ul of vue.querySelectorAll('ul.op-liste[data-parent]')) {
      const freres = [...ul.children].filter((li) => li.matches('li.op-item:not([data-fixe])'))
      freres.forEach((li) => {
        li.toggleAttribute('data-seul', freres.length === 1)
        li.draggable = freres.length > 1 && !enCours
        const poignee = li.querySelector(':scope > .op-ligne .op-poignee')
        poignee.tabIndex = freres.length > 1 ? 0 : -1
        poignee.toggleAttribute('aria-hidden', freres.length === 1)
        const numero = numeroDe(noeuds.get(li.dataset.cle))
        li.dataset.niveau = String(numero.split('.').length + 1)
        li.querySelector(':scope > .op-ligne .op-numero').textContent = numero
        li.classList.toggle('op-modifie', modifies.has(li.dataset.cle))
      })
    }
    vue.querySelector('.op-enregistrer').disabled = !nbListes || enCours
    vue.querySelector('.op-annuler').disabled = !nbListes || enCours
  }

  let bandeau = null
  let minuterie = null
  function annoncer(texte, type = '') {
    if (etat?.isConnected) {
      etat.textContent = texte
      etat.dataset.type = type
      return
    }
    // Vue des pages absente (éditeur) : bandeau en bas de l'écran, quelques secondes
    bandeau ??= element('p', { class: 'op-bandeau', role: 'status', 'aria-live': 'polite' })
    if (!bandeau.isConnected) document.body.append(bandeau)
    bandeau.textContent = texte
    bandeau.dataset.type = type
    bandeau.hidden = false
    clearTimeout(minuterie)
    minuterie = setTimeout(() => (bandeau.hidden = true), type === 'erreur' ? 12000 : 7000)
  }

  // ------------------------------------------------ Glisser-déposer et flèches

  function brancherInteractions(racineVue) {
    let glisse = null
    let indicateur = null
    const nettoyer = () => {
      indicateur?.classList.remove('op-avant', 'op-apres')
      indicateur = null
    }
    /** Élément frère de celui qu'on glisse, sous le pointeur */
    const frereSous = (cible) => {
      let li = cible.closest?.('li.op-item')
      while (li && li.parentElement !== glisse.parentElement) li = li.parentElement.closest('li.op-item')
      return li && li !== glisse && !li.hasAttribute('data-fixe') ? li : null
    }
    const avantDe = (li, y) => {
      const ligne = li.querySelector(':scope > .op-ligne').getBoundingClientRect()
      return y < ligne.top + ligne.height / 2
    }

    racineVue.addEventListener('dragstart', (e) => {
      const li = e.target
      if (enCours || !(li instanceof HTMLElement) || !li.matches('li.op-item[draggable="true"]')) return
      glisse = li
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', li.dataset.cle)
      requestAnimationFrame(() => li.classList.add('op-glisse'))
    })
    racineVue.addEventListener('dragover', (e) => {
      if (!glisse) return
      const li = frereSous(e.target)
      nettoyer()
      if (!li) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      indicateur = li
      li.classList.add(avantDe(li, e.clientY) ? 'op-avant' : 'op-apres')
    })
    racineVue.addEventListener('drop', (e) => {
      if (!glisse) return
      const li = frereSous(e.target)
      nettoyer()
      if (!li) return
      e.preventDefault()
      deplacer(glisse.dataset.cle, li.dataset.cle, avantDe(li, e.clientY))
    })
    racineVue.addEventListener('dragend', () => {
      glisse?.classList.remove('op-glisse')
      glisse = null
      nettoyer()
    })
    // Clavier : poignée, puis flèches haut et bas ; Échap ferme le menu d'actions
    racineVue.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOuvert) {
        e.preventDefault()
        fermerMenu(true)
        return
      }
      const poignee = e.target.closest?.('.op-poignee[role="button"]')
      if (!poignee || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return
      e.preventDefault()
      if (enCours) return
      const li = poignee.closest('li.op-item')
      const freres = [...li.parentElement.children].filter((x) => x.matches('li.op-item:not([data-fixe])'))
      const i = freres.indexOf(li)
      const haut = e.key === 'ArrowUp'
      const voisin = haut ? freres[i - 1] : freres[i + 1]
      if (!voisin) return
      deplacer(li.dataset.cle, voisin.dataset.cle, haut)
      li.querySelector(':scope > .op-ligne .op-poignee').focus()
    })
    racineVue.addEventListener('click', (e) => {
      const declencheur = e.target.closest?.('.op-actions')
      if (declencheur) {
        const menu = declencheur.nextElementSibling
        if (menuOuvert === menu) fermerMenu(true)
        else ouvrirMenu(declencheur, menu)
        return
      }
      const action = e.target.closest?.('.op-action')
      if (!action) return
      const raison = action.getAttribute('data-raison')
      const noeud = noeuds.get(action.dataset.cle)
      if (action.getAttribute('aria-disabled') === 'true') {
        e.preventDefault()
        fermerMenu(true)
        annoncer(raison, 'erreur')
        return
      }
      fermerMenu(false)
      if (action.dataset.action === 'ajouter') choisirPlace(noeud)
      else if (action.dataset.action === 'retirer') retirerDuMenu(noeud)
      else if (action.dataset.action === 'dupliquer') dupliquer(noeud)
      else if (action.dataset.action === 'supprimer') supprimer(noeud)
    })
  }

  // ------------------------------------------------ Menu d'actions (⋯)

  let menuOuvert = null
  function ouvrirMenu(declencheur, menu) {
    fermerMenu(false)
    menu.hidden = false
    declencheur.setAttribute('aria-expanded', 'true')
    menuOuvert = menu
    menu.querySelector('.op-action:not([aria-disabled="true"])')?.focus()
  }
  function fermerMenu(rendreFocus) {
    if (!menuOuvert) return
    const declencheur = menuOuvert.previousElementSibling
    menuOuvert.hidden = true
    declencheur?.setAttribute('aria-expanded', 'false')
    menuOuvert = null
    if (rendreFocus) declencheur?.focus()
  }
  document.addEventListener('click', (e) => {
    if (menuOuvert && !menuOuvert.parentElement.contains(e.target)) fermerMenu(false)
  })

  const fichierDe = (noeud) => noeud.page?.fichier ?? null
  /** Autres pages dont l'adresse commence par celle-ci (sous-pages dans les dossiers) */
  const sousPagesDe = (noeud) => (noeud.id ? (donnees.pages ?? []).filter((p) => p.id.startsWith(`${noeud.id}/`)) : [])

  /** Pourquoi une page ne se duplique pas depuis l'interface (null : elle se duplique) */
  function raisonPasDeCopie(noeud) {
    if (noeud.type === 'lien') return 'Lien vers une autre section ou un autre site : rien à dupliquer.'
    if (!fichierDe(noeud)) return 'Catégorie sans page à elle : rien à dupliquer.'
    return null
  }

  /** Pourquoi une page ne se supprime pas depuis l'interface (null : elle se supprime, après confirmation) */
  function raisonPasDeSuppression(noeud) {
    if (noeud.type === 'lien' || !fichierDe(noeud)) return 'Élément du menu sans page à lui : il se retire dans src/data/navigation.yaml.'
    if (noeud.type === 'section') return 'Page d’accueil d’une section : elle se supprime dans le dépôt, avec la section (src/data/navigation.yaml).'
    if (parents.get(noeud.cle)) return `« ${noeud.titre} » est dans le menu : retirez-la d’abord du menu (⋯ › Retirer du menu) et enregistrez le menu.`
    if (sousPagesDe(noeud).length) return `« ${noeud.titre} » a des sous-pages : supprimez-les ou déplacez-les d’abord (dans le dépôt).`
    return null
  }

  /** Pourquoi un élément ne sort pas du menu (null : il en sort), ou undefined si l'action n'a pas lieu d'être */
  function raisonPasDeRetrait(noeud) {
    const parent = parents.get(noeud.cle)
    if (!parent || noeud.type === 'section') return undefined
    if (noeud.type !== 'page') return 'Lien ou catégorie : il se retire dans src/data/navigation.yaml.'
    if (noeud.enfants.length || noeud.conteneur) return `« ${noeud.titre} » a des éléments dans son menu : déplacez-les ou retirez-les d’abord.`
    return null
  }

  function menuActions(noeud) {
    const id = `op-menu-${noeud.cle}`
    const modifier = entreeDe(noeud)
    const desactive = (raison) => (raison ? { 'aria-disabled': 'true', 'data-raison': raison, title: raison } : {})
    const horsMenu = !parents.get(noeud.cle)
    const raisonRetrait = raisonPasDeRetrait(noeud)
    const action = (nom, texte, raison, classe = '') => element('button', { type: 'button', class: `op-action${classe}`, 'data-action': nom, 'data-cle': noeud.cle, ...desactive(raison), texte })
    return element(
      'div',
      { class: 'op-actions-conteneur' },
      element('button', { type: 'button', class: 'op-actions', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': `Actions pour « ${noeud.titre} »`, title: 'Modifier, menu, dupliquer, supprimer', texte: '⋯' }),
      element(
        'div',
        { class: 'op-menu', id, hidden: true },
        modifier
          ? element('a', { class: 'op-action', href: modifier, 'data-cle': noeud.cle, texte: 'Modifier' })
          : element('button', { type: 'button', class: 'op-action', 'data-cle': noeud.cle, ...desactive(noeud.type === 'lien' ? `Lien vers ${noeud.lien} : il se modifie dans src/data/navigation.yaml.` : 'Catégorie sans page : son libellé se modifie dans src/data/navigation.yaml.'), texte: 'Modifier' }),
        horsMenu ? action('ajouter', 'Ajouter au menu…', null) : null,
        raisonRetrait !== undefined ? action('retirer', 'Retirer du menu', raisonRetrait) : null,
        noeud.type === 'section' ? null : action('dupliquer', 'Dupliquer', raisonPasDeCopie(noeud)),
        noeud.type === 'section' ? null : action('supprimer', 'Supprimer…', raisonPasDeSuppression(noeud), ' op-danger'),
      ),
    )
  }

  /** Boîte de dialogue : résout true si l'action est confirmée (ou la valeur choisie, avec `choix`) */
  function dialogue({ titre, texte, liste = [], note = null, confirmer = null, annuler = null, danger = false, choix = null }) {
    return new Promise((resoudre) => {
      const fermer = element('button', { type: 'button', class: 'op-fermer', texte: annuler ?? (confirmer ? 'Annuler' : 'Fermer') })
      const valider = confirmer ? element('button', { type: 'button', class: `op-confirmer${danger ? ' op-danger' : ''}`, texte: confirmer }) : null
      const select = choix ? element('select', { class: 'op-choix', id: 'op-dialogue-choix' }, ...choix.options.map(({ valeur, libelle }) => element('option', { value: valeur, texte: libelle }))) : null
      if (select && choix.valeur) select.value = choix.valeur
      const boite = element(
        'dialog',
        { class: 'op-dialogue', 'aria-labelledby': 'op-dialogue-titre' },
        element('h2', { id: 'op-dialogue-titre', texte: titre }),
        element('p', { texte }),
        liste.length ? element('ul', {}, ...liste.map((t) => element('li', { texte: t }))) : null,
        select ? element('label', { class: 'op-champ', for: 'op-dialogue-choix', texte: choix.libelle }) : null,
        select,
        note ? element('p', { class: 'op-note', texte: note }) : null,
        element('div', { class: 'op-dialogue-boutons' }, fermer, valider),
      )
      const finir = (reponse) => {
        boite.close()
        boite.remove()
        resoudre(reponse)
      }
      fermer.addEventListener('click', () => finir(select ? null : false))
      valider?.addEventListener('click', () => finir(select ? select.value : true))
      boite.addEventListener('cancel', (e) => {
        e.preventDefault()
        finir(select ? null : false)
      })
      document.body.append(boite)
      boite.showModal()
      // Choix : le focus part sur la liste ; action destructive : sur « Annuler »
      ;(select ?? fermer).focus()
    })
  }

  const nomReference = (r) => (r.titre ? `${r.titre} — ${r.fichier.replace(/^src\/content\/pages\//, '')}` : r.fichier)
  const versId = (nom) => nom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

  // ------------------------------------------------ Ajouter au menu, dupliquer et supprimer

  /** Listes qui peuvent recevoir une page, avec leur libellé complet (« Espaces › Studios vidéo ») */
  function listesPossibles() {
    const resultat = []
    const parcourir = (conteneur, chemin) =>
      conteneur.enfants.forEach((e) => {
        if (!e.conteneur) return
        const libelle = [...chemin, e.titre]
        resultat.push({ noeud: e, libelle: libelle.join(' › ') })
        parcourir(e, libelle)
      })
    parcourir(racine, [])
    return resultat
  }

  /** Liste du menu où placer `noeud` (choisie dans une boîte de dialogue), ou null */
  async function demanderPlace(noeud, { titre, texte, confirmer = 'Ajouter', annuler = null } = {}) {
    const possibles = listesPossibles()
    // Proposée par défaut : la liste dont la page est le plus long préfixe de l'adresse
    const prefixe = (p) => (p.noeud.id && noeud.id.startsWith(`${p.noeud.id}/`) ? p.noeud.id.length : -1)
    const meilleure = possibles.reduce((a, b) => (prefixe(b) > prefixe(a) ? b : a), possibles[0])
    const valeur = await dialogue({
      titre: titre ?? `Ajouter « ${noeud.titre} » au menu`,
      texte: texte ?? 'La page est ajoutée à la fin de la liste choisie ; glissez-la ensuite à sa place, puis enregistrez le menu.',
      choix: { libelle: 'Dans le menu de', options: possibles.map((p) => ({ valeur: p.noeud.cle, libelle: p.libelle })), valeur: meilleure?.noeud.cle },
      confirmer,
      annuler,
    })
    return valeur ? noeuds.get(valeur) : null
  }

  async function choisirPlace(noeud) {
    if (enCours) return
    const conteneur = await demanderPlace(noeud)
    const declencheur = vue?.querySelector(`li[data-cle="${CSS.escape(noeud.cle)}"] .op-actions`)
    if (!conteneur) return declencheur?.focus()
    ajouterAuMenu(noeud, conteneur)
    vue?.querySelector(`li[data-cle="${CSS.escape(noeud.cle)}"] .op-poignee`)?.focus()
  }

  /**
   * Page créée dans l'éditeur (postSave, arborescence.js) : elle entre dans
   * les pages hors du menu, et une place dans le menu est proposée tout de
   * suite ; acceptée, le menu est enregistré aussitôt. Si d'autres
   * changements du menu attendent, la page reste hors du menu (à placer
   * depuis « Pages »).
   */
  async function proposerNouvellePage(page) {
    if ([...noeuds.values()].some((n) => n.id === page.id)) return
    const noeud = horsDuMenu(page, nouvelleCle())
    hors.push(noeud)
    hors.sort((a, b) => a.id.localeCompare(b.id, 'fr'))
    noeuds.set(noeud.cle, noeud)
    parents.set(noeud.cle, null)
    rendre()
    rendreGauche()
    if (nbListes || enCours) return
    const conteneur = await demanderPlace(noeud, {
      titre: `Placer « ${noeud.titre} » dans le menu ?`,
      texte: 'La page est créée. Pour qu’on la trouve dans le menu du site, choisissez sous quoi l’afficher : elle s’ajoute à la fin de cette liste (sa position se change ensuite dans « Pages »). Sans place dans le menu, elle reste publiée à son adresse.',
      confirmer: 'Ajouter au menu',
      annuler: 'Plus tard',
    })
    if (!conteneur) return annoncer(`« ${noeud.titre} » est hors du menu. Pour l’y placer : « Pages », bouton ⋯ de la page, « Ajouter au menu… ».`)
    ajouterAuMenu(noeud, conteneur)
    await sauvegarder()
  }

  async function dupliquer(noeud) {
    const raison = raisonPasDeCopie(noeud)
    if (raison) return annoncer(raison, 'erreur')
    if (enCours) return
    if (nbListes) return annoncer('Enregistrez ou annulez d’abord les changements du menu.', 'erreur')
    // La copie est à côté du fichier de la page (pour un index.md : à côté de son dossier)
    const source = fichierDe(noeud).replace(RACINE_PAGES, '')
    const dossierSource = source.split('/').slice(0, -1).join('/')
    const estIndex = /(^|\/)index\.md$/i.test(source)
    const dossier = estIndex ? dossierSource.split('/').slice(0, -1).join('/') : dossierSource
    const base = estIndex ? dossierSource.split('/').pop() : source.split('/').pop().replace(/\.md$/i, '')
    const idDe = (nom) => versId(dossier ? `${dossier}/${nom}` : nom)
    let nom = `${base}-copie`
    for (let n = 2; pris.has(idDe(nom)); n++) nom = `${base}-copie-${n}`
    const relatifCopie = dossier ? `${dossier}/${nom}` : nom
    const chemin = `${RACINE_PAGES}${relatifCopie}.md`
    enCours = true
    majNumeros()
    annoncer(`Copie de « ${noeud.titre} »…`)
    try {
      const stockage = await choisirStockage()
      await stockage.appliquer([{ chemin, source: fichierDe(noeud), creer: true, transformer: (texte) => copierPage(YAML, texte, dossierSource, dossier) }], `Pages : copie de « ${noeud.titre} »`)
    } catch (erreur) {
      console.error('Copie de page', erreur)
      annoncer(`Échec de la copie : ${erreur.message} Rien n’a été créé.`, 'erreur')
      return
    } finally {
      enCours = false
      majNumeros()
    }
    const page = {
      id: idDe(nom),
      fichier: chemin,
      titre: `${noeud.titre} (copie)`,
      nonListee: true,
      brouillon: Boolean(noeud.page?.brouillon),
      entree: `#/collections/pages/entries/${relatifCopie.split('/').map(encodeURIComponent).join('/')}`,
      references: [],
    }
    const copie = horsDuMenu(page, nouvelleCle())
    hors.push(copie)
    hors.sort((a, b) => a.id.localeCompare(b.id, 'fr'))
    noeuds.set(copie.cle, copie)
    parents.set(copie.cle, null)
    pris.add(page.id)
    rendre()
    rendreGauche()
    annoncer(`Copie créée : « ${copie.titre} », en préparation et hors du menu. Elle s’ouvre dans l’éditeur : changez son titre, puis décochez « Page en préparation » quand elle est prête.`, 'succes')
    location.hash = page.entree
  }

  async function supprimer(noeud) {
    const raison = raisonPasDeSuppression(noeud)
    if (raison) return annoncer(raison, 'erreur')
    if (enCours) return
    if (nbListes) return annoncer('Enregistrez ou annulez d’abord les changements du menu.', 'erreur')
    const references = noeud.page.references ?? []
    const bloquants = references.filter((r) => r.bloquant)
    const declencheur = vue?.querySelector(`li[data-cle="${CSS.escape(noeud.cle)}"] .op-actions`)
    if (bloquants.length) {
      await dialogue({
        titre: 'Suppression impossible ici',
        texte: `« ${noeud.titre} » est utilisée par le code du site (données, composants, gabarits). La supprimer laisserait un lien mort, ou ferait échouer la mise en ligne. Elle se supprime dans le dépôt, en corrigeant ces fichiers :`,
        liste: bloquants.map(nomReference),
      })
      declencheur?.focus()
      return
    }
    const confirme = await dialogue({
      titre: `Supprimer « ${noeud.titre} » ?`,
      texte: references.length ? `${references.length} page${references.length > 1 ? 's ont' : ' a'} un lien vers elle. Ce lien deviendra un lien mort, à corriger ensuite :` : 'Aucune autre page n’a de lien vers elle.',
      liste: references.map(nomReference),
      note: `Le fichier ${fichierDe(noeud)} sera supprimé ; ses images restent dans le dossier images/. L’adresse /${noeud.id}/ ne répondra plus.`,
      confirmer: 'Supprimer la page',
      danger: true,
    })
    if (!confirme) {
      declencheur?.focus()
      return
    }
    enCours = true
    majNumeros()
    annoncer(`Suppression de « ${noeud.titre} »…`)
    let stockage
    try {
      stockage = await choisirStockage()
      await stockage.appliquer([{ chemin: fichierDe(noeud), supprimer: true }], `Pages : suppression de « ${noeud.titre} »`)
    } catch (erreur) {
      console.error('Suppression de page', erreur)
      annoncer(`Échec de la suppression : ${erreur.message} Rien n’a été supprimé.`, 'erreur')
      return
    } finally {
      enCours = false
      majNumeros()
    }
    hors.splice(hors.indexOf(noeud), 1)
    noeuds.delete(noeud.cle)
    parents.delete(noeud.cle)
    pris.delete(noeud.id)
    rendre()
    rendreGauche()
    annoncer(`« ${noeud.titre} » supprimée${stockage.enLigne ? ' (un commit ; le site sera à jour après sa reconstruction)' : ''}.`, 'succes')
  }

  // ------------------------------------------------ Enregistrement

  async function sauvegarder() {
    const listes = listesModifiees()
    if (!listes.length || enCours) return
    enCours = true
    majNumeros()
    annoncer('Enregistrement…')
    try {
      const plan = listes.map((conteneur) => ({
        chemin: cheminDe.get(conteneur.cle),
        attendu: signatures.get(conteneur.cle),
        enfants: conteneur.enfants.map((e) => (placeDe.has(e.cle) ? { origine: placeDe.get(e.cle) } : { valeur: e.id })),
      }))
      const stockage = await choisirStockage()
      const n = listes.length
      await stockage.modifier(
        [FICHIER_MENU],
        (chemin, texte) => {
          try {
            return appliquerMenu(YAML, texte, plan)
          } catch (erreur) {
            throw new Error(`${chemin} : ${erreur.message}`)
          }
        },
        `Pages : ordre du menu (${n} liste${n > 1 ? 's' : ''})`,
      )
      memoriserOrigine()
      recalculer()
      rendreGauche()
      annoncer(stockage.enLigne ? 'Menu enregistré (un commit). Le site sera à jour après sa reconstruction, dans quelques minutes.' : 'Menu enregistré dans src/data/navigation.yaml.', 'succes')
    } catch (erreur) {
      console.error('Ordre du menu', erreur)
      annoncer(`Échec de l’enregistrement : ${erreur.message} Rien n’a été modifié.`, 'erreur')
    } finally {
      enCours = false
      majNumeros()
    }
  }

  // ------------------------------------------------ Menu de gauche

  const hrefDossier = (dossier) => `#/collections/pages/filter/${dossier.split('/').map(encodeURIComponent).join('/')}`
  const enfantsGauche = (noeud) => noeud.enfants.filter((e) => e.type !== 'lien')
  const adresseCourante = () => location.hash.replace(/\?.*$/, '')
  const CLE_HORS = 'hors-du-menu'

  /** Adresse d'un élément du menu : sa liste s'il a un dossier et des sous-pages, sinon l'éditeur */
  function cibleGauche(noeud) {
    if (noeud.id && parDossier.get(noeud.id) === noeud) return hrefDossier(noeud.id)
    return entreeDe(noeud)
  }

  // Éléments dépliés : mémorisés dans ce navigateur (par signature, stable
  // d'un chargement à l'autre) ; par défaut, aucun
  let ouverts
  try {
    const memoire = JSON.parse(localStorage.getItem(CLE_OUVERTS) || 'null')
    ouverts = new Set(Array.isArray(memoire) ? memoire : [])
  } catch {
    ouverts = new Set()
  }
  const memoriserOuverts = () => {
    try {
      localStorage.setItem(CLE_OUVERTS, JSON.stringify([...ouverts]))
    } catch {
      // Sans stockage : l'état dure le temps de la page
    }
  }

  /** Nœud de l'adresse courante : liste d'un dossier, ou page ouverte dans l'éditeur */
  function noeudCourant() {
    const adresse = adresseCourante()
    for (const n of noeuds.values()) if (n.type !== 'lien' && (cibleGauche(n) === adresse || entreeDe(n) === adresse)) return n
    return null
  }

  /** Déplie le chemin jusqu'à la page ouverte (sans rien replier) */
  function deplierChemin() {
    const courant = noeudCourant()
    if (!courant) return
    let change = false
    const ouvrir = (cle) => {
      if (ouverts.has(cle)) return
      ouverts.add(cle)
      change = true
    }
    if (!parents.get(courant.cle)) ouvrir(CLE_HORS)
    let n = courant
    while ((n = parents.get(n.cle)) && n !== racine) ouvrir(n.signature)
    if (change) memoriserOuverts()
  }

  function ligneGauche(titre, cible, profondeur, { inactif = null, italique = false } = {}) {
    const lien = cible
      ? element('a', { class: `ag-lien${italique ? ' ag-masquee' : ''}`, href: cible, texte: titre })
      : element('span', { class: 'ag-lien ag-inactif', texte: titre, title: inactif })
    lien.style.setProperty('--retrait', `${34 + profondeur * 14}px`)
    if (cible && adresseCourante() === cible) lien.setAttribute('aria-current', 'page')
    return element('div', { class: 'ag-ligne' }, lien)
  }

  function bascule(cle, titre, ouvert) {
    return element('button', { type: 'button', class: 'ag-bascule', 'data-cle': cle, 'aria-expanded': String(ouvert), 'aria-label': `${ouvert ? 'Replier' : 'Déplier'} « ${titre} »` })
  }

  function itemGauche(noeud, profondeur) {
    const li = element('li', { 'data-cle': noeud.cle })
    const ligne = ligneGauche(noeud.titre, cibleGauche(noeud), profondeur, { inactif: 'Catégorie sans page à elle', italique: noeud.cache || !parents.get(noeud.cle) })
    li.append(ligne)
    const sous = enfantsGauche(noeud)
    if (sous.length) {
      const ouvert = ouverts.has(noeud.signature)
      ligne.append(bascule(noeud.signature, noeud.titre, ouvert))
      if (ouvert) li.append(element('ul', {}, ...sous.map((e) => itemGauche(e, profondeur + 1))))
    }
    return li
  }

  let gauche = null
  function rendreGauche() {
    const ouvertHors = ouverts.has(CLE_HORS)
    const groupeHors = hors.length
      ? element(
          'li',
          { class: 'ag-generale' },
          (() => {
            const ligne = ligneGauche(`Hors du menu (${hors.length})`, null, 0, { inactif: 'Pages publiées sans place dans le menu' })
            ligne.append(bascule(CLE_HORS, 'Hors du menu', ouvertHors))
            return ligne
          })(),
          ouvertHors ? element('ul', {}, ...hors.map((n) => itemGauche(n, 1))) : null,
        )
      : null
    const nouveau = element('ul', { id: 'arbre-gauche', 'aria-label': 'Menu du site' }, ...racine.enfants.map((n) => itemGauche(n, 0)), groupeHors ? element('li', { class: 'ag-separateur', role: 'presentation' }) : null, groupeHors)
    nouveau.addEventListener('click', (e) => {
      const bouton = e.target.closest?.('.ag-bascule')
      if (!bouton) return
      const cle = bouton.dataset.cle
      if (ouverts.has(cle)) ouverts.delete(cle)
      else ouverts.add(cle)
      memoriserOuverts()
      rendreGauche()
      gauche?.querySelector(`.ag-bascule[data-cle="${CSS.escape(cle)}"]`)?.focus()
    })
    if (gauche?.isConnected) gauche.replaceWith(nouveau)
    gauche = nouveau
  }

  /** Place l'arbre après le lien « Pages » de Decap (que React peut recréer) */
  function placerGauche() {
    const pages = document.querySelector(`${LISTE_DECAP} > a[data-testid="/"]`)
    if (!pages) return
    if (!gauche) rendreGauche()
    if (gauche.parentElement !== pages.parentElement || gauche.previousElementSibling !== pages) pages.after(gauche)
  }

  let derniereAdresse = null
  function suivreAdresseGauche() {
    if (location.hash === derniereAdresse) return
    derniereAdresse = location.hash
    deplierChemin()
    rendreGauche()
  }

  // ------------------------------------------------ Affichage selon l'adresse

  /** Portée de l'adresse : null (tout le menu), un nœud (dossier ouvert), ou undefined (liste de Decap) */
  function porteeCourante() {
    const m = location.hash.match(/^#\/collections\/pages(?:\/filter\/([^?]*?))?\/?(?:\?.*)?$/)
    if (!m) return undefined
    if (!m[1]) return null
    try {
      return parDossier.get(decodeURIComponent(m[1])) ?? undefined
    } catch {
      return undefined
    }
  }

  function synchroniser() {
    suivreAdresseGauche()
    placerGauche()
    const nouvelle = porteeCourante()
    const main = document.querySelector('main')
    if (nouvelle === undefined || !main?.firstElementChild) {
      delete document.body.dataset.vueOrdre
      vue?.remove()
      return
    }
    document.body.dataset.vueOrdre = ''
    if (!vue) {
      portee = nouvelle
      vue = construireVue()
      majAuPlacement = true
    } else if (nouvelle !== portee) {
      portee = nouvelle
      rendre()
    }
    if (vue.parentElement !== main || vue.previousElementSibling !== main.firstElementChild) main.firstElementChild.after(vue)
    if (majAuPlacement) {
      majAuPlacement = false
      majNumeros()
    }
    // Même largeur que le bandeau de Decap (titre et « + Page »)
    const largeur = `${main.firstElementChild.getBoundingClientRect().width}px`
    if (vue.style.maxWidth !== largeur) vue.style.maxWidth = largeur
  }

  let prevu = false
  const planifier = () => {
    if (prevu) return
    prevu = true
    requestAnimationFrame(() => {
      prevu = false
      synchroniser()
    })
  }
  new MutationObserver(planifier).observe(document.body, { childList: true, subtree: true })
  addEventListener('hashchange', planifier)
  addEventListener('resize', planifier)
  addEventListener('beforeunload', (e) => {
    if (nbListes) e.preventDefault()
  })
  planifier()
  return { proposerNouvellePage }
}
