/*
 * Pages, URL, fil d'Ariane et navigation de section (filAriane,
 * navigationDeSection), utilisés par les composants de coquille ; les
 * menus viennent de src/data/navigation.ts.
 */
import { getCollection, type CollectionEntry } from 'astro:content'
import { SECTIONS } from '@/data/navigation'
import { construireMenu, type NoeudNavigation } from '@/lib/menu'

export type Page = CollectionEntry<'pages'>

export const LANGUE_SITE = 'fr-CA'
export const estEnFrancais = (lang?: string) => !lang || lang.toLowerCase().startsWith('fr')

/** URL publique d'une page : son identifiant, sans barre oblique finale */
export const urlDePage = (page: Page) => (page.id ? `/${page.id}` : '/')

/** Chemin normalisé : sans barre oblique finale ni index.html */
export const normaliser = (chemin: string) => chemin.replace(/\/index\.html$/, '').replace(/(.)\/+$/, '$1') || '/'

/** En production, ni les brouillons ni les pages de démonstration (dev/) ne sont publiés */
const visible = (page: Page) => import.meta.env.DEV || (!page.data.brouillon && !page.id.startsWith('dev/'))

let cache: Map<string, Page> | undefined
async function pagesParUrl() {
  // En développement, une page ajoutée doit apparaître sans redémarrer le serveur
  if (import.meta.env.DEV) cache = undefined
  cache ??= new Map((await getCollection('pages', visible)).map((p) => [urlDePage(p), p]))
  return cache
}

export async function toutesLesPages() {
  return [...(await pagesParUrl()).values()]
}

export async function pageParUrl(url: string) {
  return (await pagesParUrl()).get(normaliser(url))
}

/** Hors des menus, du sitemap et de la recherche */
export const estListee = (page: Page) => !page.data.nonListee && !page.data.brouillon

/* ---------- Navigation ---------- */

export type { NoeudNavigation }

/** `sommaire` : la racine est le sommaire « Sur cette page » d'une page, et non un menu de section */
export type RacineNavigation = Omit<NoeudNavigation, 'url' | 'ordre'> & { url?: string; sommaire?: boolean }

/** Titre du sommaire d'une page (colonne de droite et volet repliable) */
export const TITRE_SOMMAIRE = 'Sur cette page'

/** Brouillons par URL : absents du site en production, mais leur place dans le menu est gardée */
let brouillons: Map<string, Page> | undefined
async function brouillonsParUrl() {
  if (import.meta.env.DEV) brouillons = undefined
  brouillons ??= new Map((await getCollection('pages', (p: Page) => p.data.brouillon)).map((p) => [urlDePage(p), p]))
  return brouillons
}

/** Page d'un élément du menu ; un brouillon en sort jusqu'à sa publication (src/lib/menu.ts) */
async function infoPage(url: string) {
  const page = (await pageParUrl(url)) ?? (await brouillonsParUrl()).get(url)
  return page && { titre: page.data.titreMenu ?? page.data.title, brouillon: page.data.brouillon }
}

/** Menu de la section (premier segment de l'URL), ou null hors section */
export async function navigationDeSection(section: string): Promise<RacineNavigation | null> {
  const s = SECTIONS.find((x) => x.cle === section)
  if (!s) return null
  return { titre: s.titre, url: `/${s.cle}`, enfants: await construireMenu(s.menu, infoPage) }
}

/* ---------- Fil d'Ariane ---------- */

export type Maillon = { url?: string; libelle: string; lang?: string }

/** Chemin des nœuds du menu jusqu'à l'URL (pages cachées comprises) */
function cheminVers(noeuds: NoeudNavigation[], url: string): NoeudNavigation[] | null {
  for (const n of noeuds) {
    if (n.url === url) return [n]
    const suite = cheminVers(n.enfants, url)
    if (suite) return [n, ...suite]
  }
  return null
}

/**
 * Fil d'Ariane : les Bibliothèques, studio·bib, la
 * section, puis les catégories du menu jusqu'à la page. Une page absente du
 * menu suit son chemin d'URL.
 */
export async function filAriane(url: string): Promise<Maillon[]> {
  url = normaliser(url)
  const maillons: Maillon[] = [
    { url: 'https://bib.umontreal.ca/', libelle: 'Les bibliothèques UdeM' },
    { url: '/', libelle: 'studio·bib' },
  ]
  if (url === '/') return maillons
  const [cle] = url.split('/').filter(Boolean)
  const racine = await navigationDeSection(cle)
  if (racine) maillons.push({ url: racine.url, libelle: racine.titre })
  if (racine && url === racine.url) return maillons
  const chemin = racine && cheminVers(racine.enfants, url)
  if (chemin) {
    maillons.push(...chemin.map((n) => ({ url: n.url, libelle: n.titre })))
    return maillons
  }
  // Hors menu : chaque segment de l'URL, avec le titre de sa page s'il y en a une
  let courant = ''
  for (const segment of url.split('/').filter(Boolean).slice(racine ? 1 : 0)) {
    courant += `/${segment}`
    const page = await pageParUrl(`${racine?.url ?? ''}${courant}`)
    maillons.push({ url: page ? urlDePage(page) : undefined, libelle: page?.data.titreMenu ?? page?.data.title ?? segment })
  }
  return maillons
}
