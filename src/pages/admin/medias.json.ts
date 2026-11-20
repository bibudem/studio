import type { APIRoute, ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import { dossiersDePages, entreeDePage } from './_arborescence'

/*
 * Médiathèque de l'interface de rédaction (/admin/medias.json), lue par
 * public/admin/medias.js. Le bouton « Media » de Decap ne liste qu'un dossier
 * global (sans sous-dossiers) ; les images du site sont rangées à côté des
 * contenus (dossiers images/ de src/content/pages, images de l'accueil).
 * Pour chacune : dossier, dimensions, poids, vignette et version agrandie
 * (générées par Astro), et ce qui l'utilise :
 * - chemins relatifs (« ./images/x.webp », « ../images/x.webp ») dans les
 *   pages, les encarts et l'accueil ;
 * - code du site (composants, données) qui nomme l'image par son fichier.
 *
 * Générée au build : une image ajoutée en ligne y apparaît au build suivant.
 */

export const prerender = true

const RACINE = process.cwd()
const CONTENU = 'src/content'
const EXTENSIONS_TEXTE = /\.(md|ya?ml|json)$/i

const MODULES = import.meta.glob<{ default: ImageMetadata }>('/src/content/**/*.{png,jpg,jpeg,webp,gif,avif,svg,PNG,JPG,JPEG,WEBP}', { eager: true })

type Utilisation = { titre: string; fichier: string; entree: string | null }

const sansPrefixe = (chemin: string) => chemin.replace(/^\.?\//, '')

function fichiersDe(dossier: string, extensions: RegExp): string[] {
  return readdirSync(join(RACINE, dossier), { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && extensions.test(e.name))
    .map((e) => relative(RACINE, join(e.parentPath, e.name)).replaceAll('\\', '/'))
}

/** Libellé d'un dossier d'images : « Créatives › Impression 3D », « Accueil »… */
function libelleGroupe(dossier: string, libelles: Map<string, string>) {
  const relatif = dossier.replace(/^src\/content\/?/, '')
  if (relatif.startsWith('accueil')) return { libelle: 'Page d’accueil', rang: 0 }
  if (!relatif.startsWith('pages')) return { libelle: relatif, rang: 3 }
  const [avant, apres] = relatif.replace(/^pages\/?/, '').split(/\/?images\/?/)
  if (!avant) return { libelle: apres ? `Images communes › ${apres}` : 'Images communes', rang: 1 }
  const base = libelles.get(avant) ?? avant
  return { libelle: apres ? `${base} › ${apres}` : base, rang: 2 }
}

export const GET: APIRoute = async () => {
  const pages = (await getCollection('pages')).filter((page) => !page.id.startsWith('dev/'))
  const encarts = await getCollection('encarts')
  const libelles = new Map(dossiersDePages(pages).map((d) => [d.chemin, d.libelle]))

  // Fichier de contenu → titre et adresse dans Decap
  const parFichier = new Map<string, Omit<Utilisation, 'fichier'>>()
  for (const page of pages) parFichier.set(sansPrefixe(page.filePath ?? ''), { titre: page.data.title, entree: entreeDePage(page) })
  // Encarts : modifiés dans le dépôt, pas dans l'interface
  for (const encart of encarts) parFichier.set(sansPrefixe(encart.filePath ?? ''), { titre: `Encart : ${encart.data.titre}`, entree: null })
  parFichier.set('src/content/accueil.yaml', { titre: 'Page d’accueil', entree: '#/collections/accueil/entries/accueil' })

  // Images connues, par chemin dans le dépôt (hors démonstrations)
  const images = new Map<string, { meta: ImageMetadata; utilisations: Utilisation[] }>()
  for (const [chemin, module] of Object.entries(MODULES)) {
    if (chemin.startsWith('/src/content/pages/dev/')) continue
    images.set(sansPrefixe(chemin), { meta: module.default, utilisations: [] })
  }

  const ajouter = (image: string | undefined, utilisation: Utilisation) => {
    const entree = image && images.get(image)
    if (entree && !entree.utilisations.some((u) => u.fichier === utilisation.fichier && u.titre === utilisation.titre)) entree.utilisations.push(utilisation)
  }

  for (const fichier of fichiersDe(CONTENU, EXTENSIONS_TEXTE)) {
    let texte: string
    try {
      texte = readFileSync(join(RACINE, fichier), 'utf8')
    } catch {
      continue
    }
    const dossier = posix.dirname(fichier)
    const source = parFichier.get(fichier) ?? { titre: fichier.replace(/^src\/content\//, ''), entree: null }
    // Chemins relatifs vers une image
    for (const [, ref] of texte.matchAll(/["'(\s:=]((?:\.{1,2}\/)*[\w-][\w./-]*\.(?:png|jpe?g|webp|gif|avif|svg))(?=["')\s#?]|$)/gi)) {
      if (ref.startsWith('/') || /^https?:/i.test(ref)) continue
      ajouter(posix.normalize(posix.join(dossier, ref)), { ...source, fichier })
    }
  }

  // Code du site (composants, données, bibliothèques) qui nomme une image par
  // son fichier, entre guillemets ou après un « / »
  const code = fichiersDe('src', /\.(ts|astro|mjs|js|css)$/).filter((f) => !f.startsWith('src/pages/admin/') && !f.startsWith('src/content/') && !/\.test\.ts$/.test(f))
  for (const fichier of code) {
    let texte: string
    try {
      texte = readFileSync(join(RACINE, fichier), 'utf8')
    } catch {
      continue
    }
    for (const chemin of images.keys()) {
      const nom = posix.basename(chemin).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (new RegExp(`['"\`/]${nom}['"\`]`).test(texte)) ajouter(chemin, { titre: `Code du site : ${fichier.replace(/^src\//, '')}`, fichier, entree: null })
    }
  }

  const resultat = []
  for (const [chemin, { meta, utilisations }] of images) {
    const svg = /\.svg$/i.test(chemin)
    let vignette = meta.src
    let grande = meta.src
    if (!svg) {
      vignette = (await getImage({ src: meta, width: Math.min(360, meta.width), format: 'webp' })).src
      grande = (await getImage({ src: meta, width: Math.min(1600, meta.width), format: 'webp' })).src
    }
    const dossier = posix.dirname(chemin)
    let poids = 0
    try {
      poids = statSync(join(RACINE, chemin)).size
    } catch {
      poids = 0
    }
    resultat.push({
      chemin,
      nom: posix.basename(chemin),
      dossier,
      ...libelleGroupe(dossier, libelles),
      largeur: meta.width ?? null,
      hauteur: meta.height ?? null,
      poids,
      vignette,
      grande,
      utilisations: utilisations.sort((a, b) => a.titre.localeCompare(b.titre, 'fr')),
    })
  }
  resultat.sort((a, b) => a.rang - b.rang || a.libelle.localeCompare(b.libelle, 'fr') || a.nom.localeCompare(b.nom, 'fr'))

  return new Response(JSON.stringify({ images: resultat }) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
