import type { Page } from '@/lib/contenu'

/*
 * Dossiers de src/content/pages, pour la collection « Pages » de Decap
 * (config.yml.ts : choix de l'emplacement d'une nouvelle page) et pour
 * arborescence.json (titre de la liste du dossier ouvert, garde-fou à
 * l'enregistrement) et medias.json (libellé des dossiers d'images).
 *
 * Le chemin est celui de meta.path dans Decap : relatif à src/content/pages,
 * sans barre initiale, « / » pour la racine.
 */

export type Dossier = {
  /** `creatives/textile`, ou `/` pour la racine */
  chemin: string
  /** Libellé du dossier seul : « Textile » */
  nom: string
  /** Libellé complet : « Créatives › Textile » */
  libelle: string
}

const RACINE = 'src/content/pages/'

// Emplacement que Decap accepte : chaque segment déjà « nettoyé » selon la
// configuration slug (ascii, accents retirés), sinon « chemin invalide »
const EMPLACEMENT_VALIDE = /^[\w.~-]+(\/[\w.~-]+)*$/

const fichierDe = (page: Page) => (page.filePath ?? '').replace(/^\.\//, '')

/** Chemin d'une page sans extension, relatif à src/content/pages : `espaces/index` */
export function cheminDePage(page: Page) {
  const chemin = fichierDe(page)
  return chemin.startsWith(RACINE) ? chemin.slice(RACINE.length).replace(/\.md$/i, '') : ''
}

/** Dossier d'une page, relatif à src/content/pages (`''` à la racine) */
export function dossierDePage(page: Page) {
  return cheminDePage(page).split('/').slice(0, -1).join('/')
}

/** Adresse de la fiche dans Decap (collection imbriquée « pages ») */
export const entreeDePage = (page: Page) => `#/collections/pages/entries/${cheminDePage(page).split('/').map(encodeURIComponent).join('/')}`

export function dossiersDePages(pages: Page[]): Dossier[] {
  // Page qui donne son nom à un dossier : son index.md, ou la page .md du même
  // nom à côté (« textile.md » pour le dossier « textile/ »)
  const parDossier = new Map<string, Page>()
  for (const page of pages) {
    const chemin = cheminDePage(page)
    if (/(^|\/)index$/i.test(chemin)) parDossier.set(chemin.replace(/\/?index$/i, ''), page)
    else if (!parDossier.has(chemin)) parDossier.set(chemin, page)
  }
  const nom = (chemin: string) => {
    const page = parDossier.get(chemin)
    const segment = chemin.split('/').pop() ?? chemin
    return page?.data.titreMenu ?? page?.data.title ?? segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // Tous les dossiers qui contiennent une page, et leurs parents (hors
  // démonstrations, dev/) ; plus chaque page qui n'a pas encore de
  // sous-pages, pour pouvoir lui en créer (fichier dans le dossier du même
  // nom : l'adresse de la page ne change pas)
  const chemins = new Set<string>()
  for (const page of pages) {
    const segments = dossierDePage(page).split('/').filter(Boolean)
    if (segments[0] === 'dev') continue
    segments.forEach((_, i) => chemins.add(segments.slice(0, i + 1).join('/')))
    const chemin = cheminDePage(page)
    if (!/(^|\/)index$/i.test(chemin) && EMPLACEMENT_VALIDE.test(chemin)) chemins.add(chemin)
  }

  const dossiers = [...chemins].map((chemin) => {
    const parties = chemin.split('/')
    return {
      chemin,
      nom: nom(chemin),
      libelle: parties.map((_, i) => nom(parties.slice(0, i + 1).join('/'))).join(' › '),
    }
  })
  dossiers.sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'))
  return [{ chemin: '/', nom: 'Pages', libelle: 'Racine du site (hors des sections)' }, ...dossiers]
}
