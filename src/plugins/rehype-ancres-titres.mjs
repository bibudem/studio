import GithubSlugger from 'github-slugger'
import { ICONE_ANCRE, idDeTitre, nomLienAncre } from '../lib/ancres.ts'

/*
 * Identifiants et liens d'ancre des titres h2 à h6.
 * L'identifiant suit les règles de src/lib/ancres.ts ; un id posé dans le
 * contenu (« {#ancre} ») est gardé. Le lien d'ancre porte un nom accessible
 * et vient après le texte du titre, pour ne pas être lu en premier.
 * studio·bib : les titres d'un volet d'onglets ou d'une carte gardent leur id
 * sans lien (data-sans-ancre).
 *
 * studio·bib, apparence : le titre de la page (h1) a sa propre taille et
 * chaque titre du contenu prend l'apparence du niveau suivant (h2 →
 * apparence-h3…), pour que les intertitres restent sous le titre de page.
 * Le niveau réel, lu par les lecteurs d'écran, ne change pas.
 */

const TITRES = new Set(['h2', 'h3', 'h4', 'h5', 'h6'])

const texteDe = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(texteDe).join(''))

function parcourir(noeud, visite) {
  visite(noeud)
  for (const enfant of noeud.children ?? []) parcourir(enfant, visite)
}

export default function rehypeAncresTitres() {
  return (arbre) => {
    const slugger = new GithubSlugger()
    parcourir(arbre, (noeud) => {
      if (noeud.type !== 'element' || !TITRES.has(noeud.tagName)) return
      const texte = texteDe(noeud).trim()
      if (!texte) return
      noeud.properties ??= {}
      const id = noeud.properties.id ?? idDeTitre(texte, slugger)
      noeud.properties.id = id
      if (noeud.properties.dataSansAncre !== undefined) return
      const niveau = Number(noeud.tagName[1])
      noeud.properties.className = [...(noeud.properties.className ?? []), 'titre-ancre', ...(niveau < 6 ? [`apparence-h${niveau + 1}`] : [])]
      noeud.children.push({
        type: 'element',
        tagName: 'a',
        properties: { href: `#${id}`, className: ['ancre-titre'] },
        children: [
          { type: 'element', tagName: 'span', properties: { className: ['visuellement-masque'] }, children: [{ type: 'text', value: nomLienAncre(texte) }] },
          {
            type: 'element',
            tagName: 'svg',
            properties: { 'aria-hidden': 'true', focusable: 'false', viewBox: '0 0 256 256', width: '1em', height: '1em', fill: 'currentColor' },
            children: [{ type: 'element', tagName: 'path', properties: { d: ICONE_ANCRE }, children: [] }],
          },
        ],
      })
    })
  }
}
