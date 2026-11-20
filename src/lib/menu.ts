/*
 * Arbre d'un menu de section, à partir des éléments de src/data/navigation.yaml
 * (utilisé par navigationDeSection, src/lib/contenu.ts).
 *
 * Une page en brouillon sort du menu jusqu'à sa publication, sans qu'on
 * touche à navigation.yaml : décocher « Brouillon » la remet à sa place.
 * Si elle a des sous-pages, elles restent, sous son libellé (une catégorie
 * sans lien). Les numéros (`ordre`) suivent les éléments affichés.
 */
import type { ElementMenu } from '@/data/navigation'

export type NoeudNavigation = {
  titre: string
  /** Absente pour une catégorie sans page (« Production audio ») */
  url?: string
  ordre: number
  enfants: NoeudNavigation[]
  /** Page rattachée au menu sans y figurer (guides, fiches de logiciels) */
  cache?: boolean
  recommande?: boolean
  lang?: string
}

/** Ce que le menu doit savoir d'une page ; undefined : aucune page à cette adresse */
export type InfoPage = { titre: string; brouillon: boolean }

export async function construireMenu(elements: ElementMenu[], chercher: (url: string) => Promise<InfoPage | undefined>): Promise<NoeudNavigation[]> {
  const noeuds = await Promise.all(elements.map((element) => construireNoeud(element, chercher)))
  return noeuds.filter((n) => n !== null).map((n, ordre) => ({ ...n, ordre }))
}

async function construireNoeud(element: ElementMenu, chercher: (url: string) => Promise<InfoPage | undefined>): Promise<NoeudNavigation | null> {
  const e = typeof element === 'string' ? { page: element } : element
  let url = e.lien ?? (e.page ? `/${e.page}` : undefined)
  let titre = e.titre
  const enfants = await construireMenu(e.enfants ?? [], chercher)
  if (e.page) {
    const page = await chercher(url!)
    // Une page du menu qui n'existe plus ferait un lien mort : le build s'arrête
    if (!page) throw new Error(`src/data/navigation.ts : aucune page à l'adresse ${url}.`)
    titre ??= page.titre
    if (page.brouillon) {
      if (!enfants.length) return null
      url = undefined
    }
  }
  if (!titre) throw new Error(`src/data/navigation.ts : un élément sans page ni lien doit avoir un titre.`)
  return { titre, url, ordre: 0, enfants, cache: e.cache, recommande: e.recommande }
}
