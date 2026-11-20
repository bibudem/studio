/*
 * Aperçu du brouillon dans l'éditeur des pages (panneau d'aperçu de Decap,
 * registerPreviewTemplate) : la page s'affiche dans le gabarit du site.
 *
 * Le panneau charge la page publiée (même origine que l'interface : en-tête,
 * menu, colonne de navigation et feuilles de style du site), puis remplace
 * son titre, sa couverture et son contenu par ceux du brouillon, à chaque
 * modification. Une page nouvelle, ou pas encore en ligne (brouillon),
 * s'affiche dans le gabarit de sa section.
 *
 * Le contenu est rendu dans le navigateur, avec le même analyseur que le
 * site (remark-parse, remark-gfm, remark-directive) : texte, titres, listes,
 * tableaux, liens et images comme sur le site ; alertes, boutons, citations
 * et accordéons avec le HTML et le style de harmonium (apercu.css : toute la
 * feuille des composants) ; les composants propres à studio·bib (onglets,
 * lieu, colonnes…) sous une forme simplifiée ; ceux qui affichent des
 * données en direct (carte, catalogue, disponibilités…), par une case qui
 * dit ce qui s'affichera. La page publiée reste la référence (« Voir la
 * page »).
 */

import { GROUPES } from './guide-directives.js'
import { imageLocale } from './verification-liens.js'
import { chargerImages } from './images-connues.js'

const DESCRIPTIONS = new Map(GROUPES.flatMap((g) => g.directives.map((d) => [d.nom, d.description])))
const TYPES_ALERTE = { info: 'info', succes: 'succes', attention: 'avertissement', erreur: 'erreur' }
const LIBELLES_ALERTE = { info: 'Information', succes: 'Succès', avertissement: 'Avertissement', erreur: 'Erreur' }
// Blocs de mise en page rendus tels quels, dans un cadre nommé
const SIMPLES = new Set(['cartes', 'liens', 'modalites', 'encadres', 'chiffres', 'galerie', 'logos', 'legende', 'icone-texte', 'image-texte', 'section'])

// ------------------------------------------------ Rendu (remark)

/** Nœud intermédiaire : devient l'élément `hName` au passage en HTML (mdast-util-to-hast) */
const bloc = (hName, className, children = [], props = {}) => ({ type: 'apercuBloc', data: { hName, hProperties: { className, ...props } }, children })
const texte = (value) => ({ type: 'text', value })
const texteDe = (n) => n.value ?? (n.children ?? []).map(texteDe).join('')

/** Libellé [entre crochets] d'une directive conteneur, séparé de ses autres enfants */
function separerLibelle(noeud) {
  const [premier, ...reste] = noeud.children ?? []
  return premier?.data?.directiveLabel ? { libelle: premier.children, reste } : { libelle: null, reste: noeud.children ?? [] }
}

/** Accordéon : un volet (details de harmonium) par titre du premier niveau rencontré */
function accordeon(enfants) {
  const niveau = enfants.find((e) => e.type === 'heading')?.depth
  const volets = []
  for (const e of enfants) {
    if (e.type === 'heading' && e.depth === niveau) {
      volets.push({ titre: e, contenu: [] })
    } else if (volets.length) volets.at(-1).contenu.push(e)
  }
  return bloc(
    'div',
    ['bib-accordeons'],
    volets.map(({ titre, contenu }) =>
      bloc('details', ['bib-accordeon'], [
        bloc('summary', ['bib-accordeon__titre'], [{ ...titre, data: { hProperties: { className: ['bib-accordeon__intitule'] } } }, bloc('span', ['bib-accordeon__indicateur'], [], { ariaHidden: 'true' })]),
        bloc('div', ['bib-accordeon__contenu'], contenu),
      ]),
    ),
  )
}

/** Case d'un composant qui affiche des données en direct (ou d'une directive inconnue) */
function dynamique(noeud, connu = true) {
  const description = DESCRIPTIONS.get(noeud.name)
  const { libelle } = separerLibelle(noeud)
  const titre = noeud.type === 'leafDirective' && noeud.children?.length ? noeud.children : libelle
  return bloc('div', ['apercu-dynamique'], [
    bloc('p', ['apercu-dynamique__nom'], [texte(connu ? noeud.name : `Directive inconnue : ${noeud.name}`), ...(titre ? [texte(' — '), ...titre] : [])]),
    ...(description ? [bloc('p', ['apercu-dynamique__aide'], [texte(description)])] : []),
    bloc('p', ['apercu-dynamique__aide'], [texte(connu ? 'Affiché sur le site avec ses données ; l’aperçu ne le montre pas.' : 'Le site refusera cette directive : voir le « Guide ».')]),
  ])
}

function directive(n) {
  const a = n.attributes ?? {}
  switch (n.name) {
    case 'alerte': {
      const type = TYPES_ALERTE[a.type] ?? 'info'
      return bloc('div', ['bib-alerte', `bib-alerte--${type}`], [
        bloc('span', ['bib-alerte__icone'], [], { ariaHidden: 'true' }),
        bloc('div', ['bib-alerte__message'], [bloc('span', ['bib-masque'], [texte(`${LIBELLES_ALERTE[type]} : `)]), ...(a.titre ? [bloc('p', ['bib-alerte__titre'], [texte(a.titre)])] : []), ...n.children]),
      ])
    }
    case 'bouton':
      return bloc('p', ['apercu-boutons'], [
        bloc('a', ['bib-bouton', a.type === 'secondaire' ? 'bib-bouton--contour' : 'bib-bouton--plein', 'bib-bouton--bleu-fonce'], [bloc('span', ['bib-bouton__libelle'], n.children)], { href: a.lien ?? '#' }),
      ])
    case 'citation':
      return bloc('figure', ['bib-citation'], [bloc('blockquote', ['bib-citation__texte'], n.children), ...(a.source ? [bloc('figcaption', ['bib-citation__source'], [texte(a.source)])] : [])])
    case 'accordeon':
      return accordeon(n.children)
    case 'tableau':
      return bloc('div', ['apercu-tableau'], [...(a.titre ? [bloc('p', ['apercu-tableau__titre'], [texte(a.titre)])] : []), ...n.children])
    case 'onglets':
      return bloc('div', ['apercu-onglets'], n.children)
    case 'onglet': {
      const { libelle, reste } = separerLibelle(n)
      return bloc('section', ['apercu-onglet'], [bloc('p', ['apercu-onglet__titre'], [...(libelle ?? [texte('Onglet')]), ...('defaut' in a ? [texte(' (ouvert au départ)')] : [])]), ...reste])
    }
    case 'colonnes':
      return bloc('div', ['apercu-colonnes'], n.children)
    case 'colonne':
      return bloc('div', ['apercu-colonne'], n.children)
    case 'masquer-si':
      return bloc('div', ['apercu-masquer'], [bloc('p', ['apercu-dynamique__aide'], [texte(`Masqué quand l’onglet « ${a.groupe} » vaut « ${a.valeur} »`)]), ...n.children])
    case 'lieu':
      return bloc('article', ['apercu-lieu'], [bloc('h3', ['apercu-lieu__titre'], [texte(a.titre ?? '')]), ...n.children])
    case 'adresse':
      return bloc('p', ['apercu-adresse'], n.children)
    case 'video':
      return bloc('div', ['apercu-media'], [bloc('p', [], [texte('▶ '), ...(n.children?.length ? n.children : [texte('Vidéo')])])])
    default:
      if (SIMPLES.has(n.name)) return bloc('div', ['apercu-bloc', `apercu-${n.name}`], n.children)
      return dynamique(n, Boolean(DESCRIPTIONS.get(n.name)))
  }
}

/**
 * Plugin remark : directives → HTML de l'aperçu ; images locales → leur
 * adresse sur le site (`images` : chemin dans le dépôt → adresse) ; liens et
 * séparateurs avec les classes du site.
 */
export function remarkApercu({ images = new Map(), dossier = '' } = {}) {
  const convertir = (n) => {
    if (n.children) n.children = n.children.map(convertir)
    switch (n.type) {
      case 'image': {
        const chemin = imageLocale(n.url, dossier)
        if (chemin) n.url = images.get(chemin) ?? n.url
        return n
      }
      case 'link':
        n.data = { ...n.data, hProperties: { className: ['lien'] } }
        return n
      // Comme rehype-ancres-titres : chaque titre du contenu prend l'apparence du niveau suivant
      case 'heading':
        if (n.depth < 6) n.data = { ...n.data, hProperties: { className: [`apparence-h${n.depth + 1}`] } }
        return n
      case 'thematicBreak':
        n.data = { ...n.data, hProperties: { className: ['bib-separateur'] } }
        return n
      case 'textDirective':
        if (n.name === 'icone') return bloc('span', ['apercu-icone'], [texte('◆')], { title: `Icône ${texteDe(n)}` })
        if (n.name === 'copier') return bloc('span', ['apercu-copier'], [bloc('code', [], n.children), bloc('span', ['apercu-copier__bouton'], [texte('Copier')])])
        // Deux-points ordinaire (« voir:ici ») : texte tel qu'écrit
        return texte(`:${n.name}${n.children?.length ? `[${texteDe(n)}]` : ''}`)
      case 'leafDirective':
      case 'containerDirective':
        return directive(n)
      default:
        return n
    }
  }
  return (arbre) => {
    arbre.children = arbre.children.map(convertir)
  }
}

let moteur = null
/** unified et ses plugins (mêmes versions que le site), chargés au premier aperçu */
function chargerMoteur() {
  moteur ??= Promise.all([
    import('https://esm.sh/unified@11.0.5'),
    import('https://esm.sh/remark-parse@11.0.0'),
    import('https://esm.sh/remark-gfm@4.0.1'),
    import('https://esm.sh/remark-directive@4.0.0'),
    import('https://esm.sh/remark-rehype@11.1.2'),
    import('https://esm.sh/rehype-stringify@10.0.1'),
  ]).then(([{ unified }, ...plugins]) => {
    const [remarkParse, remarkGfm, remarkDirective, remarkRehype, rehypeStringify] = plugins.map((m) => m.default)
    return (options) => unified().use(remarkParse).use(remarkGfm).use(remarkDirective).use(remarkApercu, options).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeStringify, { allowDangerousHtml: true })
  })
  return moteur
}

/** HTML de l'aperçu d'un texte Markdown */
export async function rendreApercu(texteMd, options) {
  const processeur = (await chargerMoteur())(options)
  return String(await processeur.process(texteMd ?? ''))
}

// ------------------------------------------------ Panneau d'aperçu (Decap)

const RACINE = 'src/content/pages'
const BANDEAU = 'apercu-bandeau'

/** Adresses où chercher le gabarit : la page elle-même, puis son dossier, puis ses parents */
export function gabaritsPossibles(chemin, emplacement, adresses) {
  const relatif = chemin?.startsWith(`${RACINE}/`) ? chemin.slice(RACINE.length + 1).replace(/\.md$/i, '') : null
  const id = relatif?.replace(/(^|\/)index$/i, '') ?? null
  const dossier = relatif ? relatif.split('/').slice(0, -1).join('/') : (emplacement || '/').replace(/^\/+|\/+$/g, '')
  const candidats = []
  if (id) candidats.push(id)
  const parties = dossier.split('/').filter(Boolean)
  for (let i = parties.length; i > 0; i--) candidats.push(parties.slice(0, i).join('/'))
  // Dernier recours : une section (le gabarit des pages de texte)
  candidats.push(...[...adresses].filter((a) => a && !a.includes('/')).sort())
  return [...new Set(candidats)].filter((c) => adresses.has(c))
}

export function installerApercuPage(CMS, adresses) {
  const { h, createClass } = window
  if (!h || !createClass) return console.error('Aperçu : API de Decap introuvable')
  const racine = new URL('../', location.href.replace(/#.*$/, ''))
  const connues = new Set(adresses)

  const Apercu = createClass({
    componentDidMount() {
      this.essai = 0
      this.candidats = gabaritsPossibles(this.props.entry.get('path'), this.props.entry.getIn(['meta', 'path']), connues)
      this.charger()
    },
    componentDidUpdate() {
      this.planifier()
    },
    componentWillUnmount() {
      clearTimeout(this.minuterie)
    },
    charger() {
      const id = this.candidats[this.essai]
      if (!this.cadre || id == null) return
      this.cadre.src = new URL(id ? `${id}/` : '', racine).href
    },
    auChargement() {
      const doc = this.cadre?.contentDocument
      if (!doc) return
      // Page absente ou sans contenu de texte (404, brouillon non publié) : gabarit suivant
      if (!doc.querySelector('main .contenu')) {
        this.essai++
        return this.charger()
      }
      if (!doc.getElementById('apercu-css')) {
        doc.head.append(Object.assign(doc.createElement('link'), { id: 'apercu-css', rel: 'stylesheet', href: new URL('admin/apercu.css', racine).href }))
      }
      for (const el of doc.querySelectorAll('.colonne-sommaire, .sommaire-repliable, .date-maj, .section-apres')) el.hidden = true
      if (!doc.getElementById(BANDEAU)) {
        const bandeau = doc.createElement('p')
        bandeau.id = BANDEAU
        bandeau.textContent = 'Aperçu du brouillon, dans le gabarit du site. Les composants qui affichent des données en direct sont résumés ; la page publiée reste la référence.'
        doc.querySelector('main')?.prepend(bandeau)
      }
      this.mettreAJour()
    },
    planifier() {
      clearTimeout(this.minuterie)
      this.minuterie = setTimeout(() => this.mettreAJour(), 250)
    },
    async mettreAJour() {
      const doc = this.cadre?.contentDocument
      const contenu = doc?.querySelector('main .contenu')
      if (!contenu) return
      const { entry } = this.props
      const chemin = entry.get('path')
      const dossier = chemin?.startsWith(`${RACINE}/`) ? chemin.split('/').slice(0, -1).join('/') : `${RACINE}/${(entry.getIn(['meta', 'path']) || '').replace(/^\/+|\/+$/g, '')}`.replace(/\/+$/, '')
      let images = new Map()
      try {
        images = new Map((await chargerImages()).map((i) => [i.chemin, i.grande]))
      } catch {
        // Sans medias.json : images locales non affichées
      }
      const version = (this.version = (this.version ?? 0) + 1)
      let html
      try {
        html = await rendreApercu(entry.getIn(['data', 'body']), { images, dossier })
      } catch (erreur) {
        console.error('Aperçu', erreur)
        html = '<p>Aperçu indisponible pour le moment.</p>'
      }
      // Une frappe plus récente a déjà été rendue : on n'écrase pas
      if (version !== this.version) return
      contenu.innerHTML = html
      const titre = doc.querySelector('main .titre-page')
      if (titre) titre.textContent = entry.getIn(['data', 'title']) || 'Sans titre'
      // Couverture : celle du brouillon, ou rien
      const couverture = doc.querySelector('main .couverture')
      const image = imageLocale(entry.getIn(['data', 'image']), dossier)
      if (couverture) {
        const img = couverture.tagName === 'IMG' ? couverture : couverture.querySelector('img')
        couverture.querySelectorAll?.('source').forEach((s) => s.remove())
        if (img && image && images.get(image)) {
          img.removeAttribute('srcset')
          img.src = images.get(image)
          img.alt = entry.getIn(['data', 'imageAlt']) || ''
          couverture.hidden = false
        } else couverture.hidden = true
      }
    },
    render() {
      return h('iframe', {
        ref: (el) => (this.cadre = el),
        title: 'Aperçu de la page',
        onLoad: () => this.auChargement(),
        style: { display: 'block', width: '100%', height: '100vh', border: 0 },
      })
    },
  })

  CMS.registerPreviewTemplate('pages', Apercu)
  installerBoutonApercu()
}

/*
 * Bouton « Aperçu » dans la barre de l'éditeur, juste après « Publier » :
 * affiche ou masque le panneau d'aperçu. Il actionne le bouton de Decap (œil
 * en haut du panneau, EditorToggle « Aperçu »), masqué pour éviter le
 * doublon ; le bouton de défilement synchronisé reste. Seulement là où Decap
 * propose l'aperçu (les pages). Noms de composants propres à cette version
 * de Decap : à revérifier si on en change.
 */
const OEIL = '<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5ZM128 192c-30.78 0-57.67-11.19-79.93-33.25A133.47 133.47 0 0 1 25 128a133.33 133.33 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.46 133.46 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64Zm0-112a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32Z"/></svg>'

const STYLE_BOUTON = `
:root [class*='-EditorToggle'][title='Aperçu'] { display: none !important; }
#bouton-apercu { display: inline-flex; align-items: center; gap: 6px; align-self: center; min-height: 36px; margin-left: 10px; padding: 0 16px; border: 2px solid var(--couleur-fond-fort, #0b113a); border-radius: var(--rayon-plein, 9999px); background: transparent; color: var(--couleur-fond-fort, #0b113a); font: inherit; font-family: var(--police-sans, sans-serif); font-size: 14px; font-weight: var(--graisse-forte, 600); white-space: nowrap; cursor: pointer; }
#bouton-apercu svg { width: 18px; height: 18px; fill: currentColor; }
#bouton-apercu:hover { background: var(--couleur-teinte, #e5eef7); }
#bouton-apercu[aria-pressed="true"] { background: var(--couleur-fond-fort, #0b113a); color: var(--couleur-sur-fonce, #fff); }
#bouton-apercu[aria-pressed="true"]:hover { border-color: var(--couleur-fond-fort-survol, #0057ac); background: var(--couleur-fond-fort-survol, #0057ac); }
#bouton-apercu:focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
`

function installerBoutonApercu() {
  const style = document.createElement('style')
  style.textContent = STYLE_BOUTON
  document.head.append(style)

  const bouton = document.createElement('button')
  bouton.type = 'button'
  bouton.id = 'bouton-apercu'
  bouton.innerHTML = `${OEIL}<span>Aperçu</span>`
  bouton.title = 'Afficher ou masquer l’aperçu de la page'
  bouton.addEventListener('click', () => {
    document.querySelector("[class*='-EditorToggle'][title='Aperçu']")?.click()
    bouton.focus()
  })

  const synchroniser = () => {
    const toggle = document.querySelector("[class*='-EditorToggle'][title='Aperçu']")
    const barre = document.querySelector("[class*='-ToolbarSectionMain']")
    // Groupe de « Publier » (première sous-section de la barre) : le bouton à sa suite
    const groupe = barre?.querySelector("[class*='-ToolbarSubSectionFirst']")
    if (!toggle || !groupe) return bouton.remove()
    if (groupe.lastElementChild !== bouton) groupe.append(bouton)
    // Affiché : le panneau d'aperçu de Decap est là
    const visible = Boolean(document.querySelector("iframe[class*='PreviewPaneFrame'], #preview-pane"))
    if (bouton.getAttribute('aria-pressed') !== String(visible)) bouton.setAttribute('aria-pressed', String(visible))
  }
  let prevu = false
  new MutationObserver(() => {
    if (prevu) return
    prevu = true
    requestAnimationFrame(() => {
      prevu = false
      synchroniser()
    })
  }).observe(document.body, { childList: true, subtree: true })
}
