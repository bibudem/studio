/*
 * Guide des directives, dans l'interface de rédaction : bouton « Guide » de
 * la barre du champ Contenu (barre-markdown.js, avec insertion au curseur)
 * et raccourci du tableau de bord (accueil.js, lecture seule).
 *
 * Syntaxe, attributs, valeurs permises et attributs obligatoires viennent du
 * vocabulaire des directives (src/plugins/directives.mjs et
 * directives-studio.mjs), servi au build par arborescence.json : le guide
 * suit toujours le code, comme la vérification avant l'enregistrement
 * (verification-directives.js). Seuls les descriptions, les groupes et les
 * exemples sont écrits ici. Une directive du vocabulaire absente de GROUPES
 * s'affiche quand même, dans « Autres ».
 *
 * Exemple `inserable: false` : il désigne une image ou un fichier à
 * fournir ; inséré tel quel, il ferait échouer la mise en ligne.
 */

/** Groupes du guide ; dans chaque directive : description, exemple, et options */
export const GROUPES = [
  {
    titre: 'Mise en évidence',
    directives: [
      { nom: 'alerte', description: 'Message mis en évidence : information, succès, mise en garde ou erreur.', exemple: ':::alerte{type=info titre="À noter"}\nTexte de l’alerte.\n:::' },
      { nom: 'citation', description: 'Citation avec sa source.', exemple: ':::citation{source="Nom, fonction"}\nTexte de la citation.\n:::' },
      { nom: 'encadres', description: 'Cartes de texte colorées : un titre #### par encadré, suivi au besoin d’une icône.', exemple: ':::encadres{fond=bleu100}\n#### Premier encadré :icone[lightbulb]\n\nTexte du premier encadré.\n\n#### Deuxième encadré\n\nTexte du deuxième encadré.\n:::' },
      { nom: 'section', description: 'Bande de couleur pour détacher une partie de la page. Préférer les fonds clairs, une ou deux par page.', exemple: ':::section{fond=bleu100}\n### Besoin d’aide?\n\nÉcrivez-nous.\n:::' },
      { nom: 'icone-texte', description: 'Texte à gauche, grande icône dans un carré de couleur à droite.', exemple: ':::icone-texte{icone=target fond=vertPale}\n### Notre mission\n\nTexte.\n:::' },
      { nom: 'chiffres', description: 'Chiffres clés : un titre #### par groupe, puis 2 ou 3 éléments.', exemple: ':::chiffres\n#### Postes\n\n- 12 ordinateurs\n- 3 imprimantes 3D\n:::' },
    ],
  },
  {
    titre: 'Liens et boutons',
    directives: [
      { nom: 'bouton', description: 'Lien en forme de bouton, vers une page du site ou une adresse externe.', exemple: '::bouton[Réserver]{lien=/espaces/}' },
      { nom: 'liens', description: 'Liste de liens, avec une courte description sous chacun (décalée de deux espaces, sans ligne vide).', exemple: ':::liens\n- [Titre du lien](/adresse/)\n  Courte description.\n- [Autre lien](/adresse/)\n  Courte description.\n:::' },
      { nom: 'cartes', description: 'Grille de cartes cliquables, chacune avec une icône (ou une image) et un lien.', exemple: ':::cartes\n- :icone[books] [Titre de la carte](/adresse/)\n- :icone[printer] [Autre carte](/adresse/)\n:::' },
      { nom: 'modalites', description: 'Liste où chaque ligne commence par une icône (conditions, étapes).', exemple: ':::modalites\n- :icone[calendar-dots] Durée : 3 heures\n- :icone[users] Groupe : 6 personnes au plus\n:::' },
    ],
  },
  {
    titre: 'Organisation de la page',
    directives: [
      { nom: 'accordeon', description: 'Volets qui s’ouvrent : un titre ### par volet.', exemple: ':::accordeon\n### Premier volet\n\nContenu du premier volet.\n\n### Deuxième volet\n\nContenu du deuxième volet.\n:::' },
      { nom: 'onglets', description: 'Volets côte à côte (Windows, macOS…), un :::onglet[Libellé] par volet. Quatre deux-points autour, trois autour de chaque onglet.', exemple: '::::onglets\n:::onglet[Windows]\n1. Première étape.\n:::\n\n:::onglet[macOS]\n1. Première étape.\n:::\n::::' },
      { nom: 'onglet', description: 'Un volet d’un ::::onglets. defaut : volet ouvert au départ.', exemple: ':::onglet[macOS]{defaut}\nTexte du volet.\n:::', inserable: false },
      { nom: 'masquer-si', description: 'Cache un passage quand l’onglet choisi d’un groupe d’onglets vaut une valeur (ex. : une étape qui ne concerne pas iOS).', exemple: ':::masquer-si{groupe=os valeur=iOS}\nÉtape inutile sous iOS.\n:::' },
      { nom: 'colonnes', description: 'Contenus côte à côte, un :::colonne par colonne (l’un sous l’autre sur un téléphone).', exemple: '::::colonnes\n:::colonne\n### Première colonne\n\nTexte.\n:::\n:::colonne\n### Deuxième colonne\n\nTexte.\n:::\n::::' },
      { nom: 'colonne', description: 'Une colonne d’un ::::colonnes.', exemple: ':::colonne\nTexte.\n:::', inserable: false },
      { nom: 'tableau', description: 'Tableau Markdown avec un titre, lu par les lecteurs d’écran.', exemple: ':::tableau{titre="Nom du tableau"}\n| Colonne 1 | Colonne 2 |\n| --- | --- |\n| Valeur | Valeur |\n:::' },
    ],
  },
  {
    titre: 'Images et médias',
    directives: [
      { nom: 'video', description: 'Vidéo YouTube, Loom, fichier du site ou autre plateforme. Le titre décrit la vidéo ; rien n’est chargé avant le clic.', exemple: '::video[Configurer le proxy sous Windows 11]{youtube=IApth7W-yzw}' },
      { nom: 'image-texte', description: 'Une image d’un côté, du texte de l’autre. L’image d’abord, seule sur sa ligne.', exemple: ':::image-texte{position=gauche}\n![](./images/photo.webp)\n\nTexte à côté de l’image.\n:::', inserable: false },
      { nom: 'galerie', description: 'Photos côte à côte, chacune avec sa légende (obligatoire).', exemple: ':::galerie\n- ![](./images/photo-1.webp) Légende de la première photo\n- ![](./images/photo-2.webp) Légende de la deuxième photo\n:::', inserable: false },
      { nom: 'logos', description: 'Rangée de logos, liés ou non ; la description entre crochets est obligatoire.', exemple: ':::logos\n- [![Nom du partenaire](./images/logo.webp)](https://exemple.ca/)\n:::', inserable: false },
      { nom: 'legende', description: 'Icônes ou boutons d’un logiciel ou d’un appareil, chacun avec son nom et ce qu’il fait.', exemple: ':::legende\n- ![](./images/navigation.webp) **Navigation** Rechercher dans les contenus\n- :icone[hand-swipe-right] **Glisser** Faire tourner\n:::', inserable: false },
      { nom: 'image-interactive', description: 'Capture d’écran commentée : la zone choisie dans la liste s’éclaire. Données : src/data/images-interactives.ts.', exemple: '::image-interactive{nom=resolve-interface}' },
      { nom: 'pano360', description: 'Vue à 360° d’un lieu. Image dans public/img/pano/.', exemple: '::pano360[Studio vidéo]{image=/img/pano/studio.webp alt="Vue du studio" legende="Le studio vidéo"}', inserable: false },
    ],
  },
  {
    titre: 'Dans le texte',
    directives: [
      { nom: 'icone', description: 'Icône de phosphoricons.com (ou maison : sofia, udem, lien-interne…), dans :::modalites, :::cartes ou un titre de :::encadres.', exemple: ':icone[books]{taille=40 couleur=bleuPrincipal}', inserable: false },
      { nom: 'copier', description: 'Texte avec un bouton « Copier » (adresse, commande).', exemple: ':copier[https://proxy.umontreal.ca]', enLigne: true },
    ],
  },
  {
    titre: 'Propres à studio·bib',
    directives: [
      { nom: 'lieu', description: 'Fiche d’un lieu : titre, adresse, texte, boutons. carte : lien « Localiser sur Google Maps ».', exemple: ':::lieu{titre="Bibliothèque des lettres et sciences humaines"}\n::adresse[Pavillon Samuel-Bronfman, local 2076-5]\n\nPrésentez-vous au bureau de référence.\n\n::bouton[Réserver]{lien=https://calendrier.bib.umontreal.ca/}\n:::' },
      { nom: 'adresse', description: 'Adresse d’un :::lieu.', exemple: '::adresse[Pavillon Samuel-Bronfman, local 2076-5]', inserable: false },
      { nom: 'parcours-reservation', description: 'Dans un :::lieu (studios vidéo) : réserver avec ou sans technicien ; le texte s’affiche pour la réservation sans technicien.', exemple: ':::parcours-reservation{reservation=https://calendrier.bib.umontreal.ca/ accompagnement=https://calendrier.bib.umontreal.ca/ guide=/medias/}\nTexte pour la réservation sans technicien.\n:::' },
      { nom: 'disponibilites', description: 'Nombre d’exemplaires disponibles en direct (Sofia), un ::disponibilite par bibliothèque.', exemple: ':::disponibilites\n::disponibilite[Droit]{oclc=1287017409}\n:::' },
      { nom: 'disponibilite', description: 'Une ligne d’un :::disponibilites : bibliothèque et numéro OCLC.', exemple: '::disponibilite[Droit]{oclc=1287017409}', inserable: false },
      { nom: 'encart', description: 'Texte commun à plusieurs pages (src/content/encarts) : aide, aide-info, aide-crea, droit-auteur.', exemple: '::encart{nom=aide}' },
      { nom: 'telecommande', description: 'Télécommande d’un appareil : une touche par élément de la liste.', exemple: ':::telecommande[Prompteur]\n- :icone[arrow-up] **Défiler vers le haut** : remonte le texte\n- (touche non utilisée)\n:::' },
    ],
  },
  {
    titre: 'Données affichées en direct',
    directives: [
      { nom: 'carte-bibliotheques', description: 'Carte et liste des bibliothèques.', exemple: '::carte-bibliotheques{lieux=ava}' },
      { nom: 'catalogue-logiciels', description: 'Catalogue des logiciels, avec filtre (public/data/logiciels.csv).', exemple: '::catalogue-logiciels' },
      { nom: 'postes-disponibles', description: 'Postes à distance libres en ce moment.', exemple: '::postes-disponibles{zone=AdobePro titre="Adobe Acrobat Pro"}' },
      { nom: 'horaire-soutien', description: 'Horaire du soutien informatique de la semaine.', exemple: '::horaire-soutien{bibliotheque=ss}' },
      { nom: 'clavardage', description: 'Fenêtre de clavardage (LibChat).', exemple: '::clavardage{hash=…}', inserable: false },
      { nom: 'tableau-donnees', description: 'Tableau à partir d’un fichier CSV de public/data/.', exemple: '::tableau-donnees[Nom du tableau]{source=/data/fichier.csv}', inserable: false },
      { nom: 'carrousel-balados', description: 'Carrousel des balados produits dans les studios (src/data/balados.ts).', exemple: '::carrousel-balados' },
    ],
  },
]

const FORMES = { containerDirective: 'Bloc', leafDirective: 'Ligne', textDirective: 'Dans le texte' }

const STYLE = `
.gd-dialogue { width: min(980px, calc(100vw - 32px)); height: min(860px, calc(100vh - 32px)); max-width: none; max-height: none; padding: 0; border: 0; border-radius: var(--rayon-carte, 12px); background: var(--couleur-fond, #f8fafb); color: var(--couleur-texte, #0b113a); font-family: var(--police-sans, sans-serif); font-size: 14px; box-shadow: var(--ombre-2); overflow: hidden; }
.gd-dialogue[open] { display: flex; flex-direction: column; }
.gd-dialogue::backdrop { background: rgb(11 17 58 / 45%); }
.gd-entete { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; padding: 18px 24px; background: var(--couleur-surface, #fff); box-shadow: var(--ombre-1); position: relative; z-index: 1; }
.gd-entete h2 { margin: 0; font-size: var(--texte-tres-grand, 1.5rem); font-weight: var(--graisse-forte, 600); }
.gd-entete input { flex: 1 1 240px; min-height: 40px; padding: 0 12px; border: 1px solid var(--couleur-bordure, #c3ccd5); border-radius: var(--rayon-tres-petit, 8px); font: inherit; }
.gd-fermer { width: 40px; height: 40px; border: 0; border-radius: var(--rayon-plein, 9999px); background: var(--couleur-teinte, #e5eef7); color: var(--couleur-texte, #0b113a); font-size: 22px; line-height: 1; cursor: pointer; }
.gd-fermer:hover { background: var(--couleur-teinte-forte, #cce2f3); }
.gd-aide { flex-basis: 100%; margin: 0; color: var(--couleur-texte-secondaire, #4a5160); line-height: 1.45; }
.gd-corps { flex: 1; overflow: auto; padding: 8px 24px 24px; }
.gd-groupe h3 { position: sticky; top: -8px; z-index: 1; margin: 0 -24px; padding: 14px 24px 8px; background: var(--couleur-fond, #f8fafb); font-family: var(--police-serif, Georgia, serif); font-size: 1.25rem; font-weight: var(--graisse-normale, 400); }
.gd-directive { margin: 0 0 12px; padding: 16px 20px; background: var(--couleur-surface, #fff); border-radius: var(--rayon-carte, 12px); box-shadow: var(--ombre-1); }
.gd-titre { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 4px; }
.gd-titre h4 { margin: 0; font-size: 16px; font-weight: var(--graisse-forte, 600); }
.gd-forme { padding: 1px 8px; border-radius: var(--rayon-plein, 9999px); background: var(--couleur-teinte, #e5eef7); color: var(--couleur-texte-secondaire, #4a5160); font-size: 12px; font-weight: var(--graisse-forte, 600); }
.gd-directive p { margin: 0 0 8px; line-height: 1.5; }
.gd-attributs { margin: 0 0 10px; padding-left: 18px; line-height: 1.5; }
.gd-attributs code, .gd-directive p code { padding: 1px 5px; border-radius: var(--rayon-minuscule, 4px); background: var(--couleur-fond, #f8fafb); font-size: 13px; }
.gd-obligatoire { color: var(--alerte-erreur-icone, #b10000); font-weight: var(--graisse-forte, 600); }
.gd-directive pre { margin: 0 0 10px; padding: 10px 12px; border-radius: var(--rayon-tres-petit, 8px); background: var(--couleur-fond, #f8fafb); font-size: 13px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.gd-boutons { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.gd-bouton { min-height: 34px; padding: 0 14px; border: 2px solid var(--couleur-fond-fort, #0b113a); border-radius: var(--rayon-plein, 9999px); background: transparent; color: var(--couleur-fond-fort, #0b113a); font: inherit; font-weight: var(--graisse-forte, 600); cursor: pointer; }
.gd-bouton:hover { background: var(--couleur-teinte, #e5eef7); }
.gd-bouton.gd-plein { background: var(--couleur-fond-fort, #0b113a); color: var(--couleur-sur-fonce, #fff); }
.gd-bouton.gd-plein:hover { border-color: var(--couleur-fond-fort-survol, #0057ac); background: var(--couleur-fond-fort-survol, #0057ac); }
.gd-note { color: var(--couleur-texte-secondaire, #4a5160); font-size: 13px; }
.gd-vide { padding: 40px 0; text-align: center; color: var(--couleur-texte-secondaire, #4a5160); font-size: 16px; }
.gd-dialogue :focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
`

const normaliser = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function element(balise, attributs = {}, ...enfants) {
  const el = document.createElement(balise)
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === false || valeur == null) continue
    if (cle === 'class') el.className = valeur
    else if (cle === 'texte') el.textContent = valeur
    else el.setAttribute(cle, valeur === true ? '' : valeur)
  }
  el.append(...enfants.filter((e) => e != null && e !== false))
  return el
}

/** Groupes du guide complétés par le vocabulaire : seules les directives connues, les autres dans « Autres » */
export function groupesDuGuide(vocabulaire) {
  const decrites = new Set(GROUPES.flatMap((g) => g.directives.map((d) => d.nom)))
  const groupes = GROUPES.map((g) => ({ ...g, directives: g.directives.filter((d) => vocabulaire[d.nom]) }))
  const autres = Object.keys(vocabulaire)
    .filter((nom) => !decrites.has(nom))
    .map((nom) => ({ nom, description: '', exemple: vocabulaire[nom].syntaxe, inserable: false }))
  if (autres.length) groupes.push({ titre: 'Autres', directives: autres })
  return groupes.filter((g) => g.directives.length)
}

let vocabulaire = null
const chargerVocabulaire = () => {
  vocabulaire ??= fetch('./arborescence.json')
    .then((r) => (r.ok ? r.json() : {}))
    .then((d) => d.directives ?? {})
    .catch(() => ({}))
  return vocabulaire
}

let style = null
let boite = null

/**
 * Ouvre le guide. `inserer(texte, enLigne)` : fourni depuis l'éditeur
 * (bouton « Insérer » de chaque exemple) ; sans lui, le guide se lit et
 * l'exemple se copie.
 */
export async function ouvrirGuide({ inserer = null } = {}) {
  if (!style) {
    style = document.createElement('style')
    style.textContent = STYLE
    document.head.append(style)
  }
  const voc = await chargerVocabulaire()
  boite?.remove()

  const recherche = element('input', { type: 'search', placeholder: 'Rechercher : vidéo, bouton, onglets…', 'aria-label': 'Rechercher une directive', autocomplete: 'off' })
  const fermer = element('button', { type: 'button', class: 'gd-fermer', 'aria-label': 'Fermer le guide', texte: '×' })
  const corps = element('div', { class: 'gd-corps' })
  boite = element(
    'dialog',
    { class: 'gd-dialogue', 'aria-labelledby': 'gd-titre' },
    element(
      'div',
      { class: 'gd-entete' },
      element('h2', { id: 'gd-titre', texte: 'Guide des directives' }),
      recherche,
      fermer,
      element('p', { class: 'gd-aide', texte: `Les directives mettent en forme le contenu : ::: pour un bloc, :: pour une ligne, : dans le texte. Elles sont vérifiées à l’enregistrement.${inserer ? ' « Insérer » place l’exemple au curseur.' : ''}` }),
    ),
    corps,
  )

  const carte = (d) => {
    const regle = voc[d.nom]
    const attributs = Object.entries(regle.attributs)
    const etat = element('span', { class: 'gd-note', role: 'status', 'aria-live': 'polite' })
    const copier = element('button', { type: 'button', class: 'gd-bouton', texte: 'Copier' })
    copier.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(d.exemple)
        etat.textContent = 'Copié.'
      } catch {
        etat.textContent = 'Copie impossible : sélectionnez l’exemple.'
      }
    })
    let boutonInserer = null
    if (inserer && d.inserable !== false) {
      boutonInserer = element('button', { type: 'button', class: 'gd-bouton gd-plein', texte: 'Insérer' })
      boutonInserer.addEventListener('click', () => {
        boite.close()
        inserer(d.exemple, Boolean(d.enLigne))
      })
    }
    return element(
      'article',
      { class: 'gd-directive', 'data-recherche': normaliser([d.nom, d.description, regle.syntaxe].join(' ')) },
      element('div', { class: 'gd-titre' }, element('h4', { texte: d.nom }), element('span', { class: 'gd-forme', texte: FORMES[regle.genre] ?? regle.genre })),
      d.description ? element('p', { texte: d.description }) : null,
      attributs.length
        ? element(
            'ul',
            { class: 'gd-attributs', 'aria-label': 'Réglages' },
            ...attributs.map(([cle, r]) =>
              element(
                'li',
                {},
                element('code', { texte: cle }),
                r.obligatoire ? element('span', { class: 'gd-obligatoire', texte: ' obligatoire' }) : null,
                r.drapeau ? ' : sans valeur (le mot seul)' : r.valeurs ? ` : ${r.valeurs.join(', ')}` : ' : texte libre',
              ),
            ),
          )
        : null,
      element('pre', {}, element('code', { texte: d.exemple })),
      element('div', { class: 'gd-boutons' }, boutonInserer, copier, d.inserable === false ? element('span', { class: 'gd-note', texte: inserer ? 'À adapter avant usage (image, fichier ou bloc parent).' : null }) : null, etat),
    )
  }

  const groupes = groupesDuGuide(voc).map((g) => element('section', { class: 'gd-groupe', 'aria-label': g.titre }, element('h3', { texte: g.titre }), ...g.directives.map(carte)))
  const vide = element('p', { class: 'gd-vide', hidden: true, texte: 'Aucune directive ne correspond.' })
  corps.append(...groupes, vide)
  if (!groupes.length) vide.hidden = false

  recherche.addEventListener('input', () => {
    const terme = normaliser(recherche.value.trim())
    let visibles = 0
    for (const section of corps.querySelectorAll('.gd-groupe')) {
      let dansSection = 0
      for (const article of section.querySelectorAll('.gd-directive')) {
        const montre = !terme || article.dataset.recherche.includes(terme)
        article.hidden = !montre
        dansSection += montre ? 1 : 0
      }
      section.hidden = !dansSection
      visibles += dansSection
    }
    vide.hidden = Boolean(visibles)
  })
  fermer.addEventListener('click', () => boite.close())
  boite.addEventListener('close', () => boite.remove())
  document.body.append(boite)
  boite.showModal()
  recherche.focus()
}
