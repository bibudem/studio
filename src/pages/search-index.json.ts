import type { APIRoute } from 'astro'
import { SECTIONS } from '@/data/navigation'
import { estListee, toutesLesPages, urlDePage, type Page } from '@/lib/contenu'
import type { EntreeIndex } from '@/lib/recherche'

/*
 * Index de la recherche dans le site, fichier statique produit au build
 * (/search-index.json). Le champ de l'en-tête et la page /search ne le
 * chargent qu'au premier usage (src/lib/recherche.ts).
 *
 * Une entrée par page listée (ni brouillon ni `nonListee`) : titre, adresse,
 * description, section (le premier segment de l'URL, nommé comme dans le
 * menu principal) et texte brut, pour trouver un mot du contenu et pas
 * seulement du titre.
 */

export const prerender = true

const LONGUEUR_DESCRIPTION = 155
const SECTION_HORS_MENU = 'studio·bib'

const ENTITES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decoder = (texte: string) =>
  texte.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (tout, code: string) => {
    if (code[0] !== '#') return ENTITES[code.toLowerCase()] ?? tout
    return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
  })

/*
 * Texte d'une page, d'après son HTML déjà rendu par le loader (directives
 * comprises) plutôt que d'après le Markdown : pas de syntaxe de directive ni
 * d'adresse de lien dans l'index. Les blocs sont séparés d'une espace, sinon
 * « </h2><p>Réserver » collerait deux mots.
 */
function texteDe(page: Page) {
  const html = page.rendered?.html ?? page.body ?? ''
  return decoder(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, ' ')
      // Liens d'ancre des titres (rehype-ancres-titres) : « Lien vers la section… » répété à chaque titre
      .replace(/<a [^>]*class="ancre-titre"[\s\S]*?<\/a>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

const extrait = (texte: string) => (texte.length <= LONGUEUR_DESCRIPTION ? texte : `${texte.slice(0, LONGUEUR_DESCRIPTION).replace(/\s+\S*$/, '')}…`)

export const GET: APIRoute = async () => {
  const entrees: EntreeIndex[] = (await toutesLesPages()).filter(estListee).map((page) => {
    const texte = texteDe(page)
    const cle = page.id.split('/')[0]
    return {
      titre: page.data.title,
      url: urlDePage(page),
      description: page.data.description ?? extrait(texte),
      section: SECTIONS.find((s) => s.cle === cle)?.titre ?? SECTION_HORS_MENU,
      cleSection: cle,
      texte,
    }
  })
  return new Response(JSON.stringify(entrees), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
}
