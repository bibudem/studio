import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { SECTIONS } from '@/data/navigation'
import { VOCABULAIRE } from '@/plugins/directives.mjs'
import { REDIRECTIONS } from '@/data/redirections.mjs'
import { dossiersDePages, entreeDePage } from './_arborescence'
import { referencesDesPages } from './_references'

/*
 * Données de l'interface de rédaction (/admin/arborescence.json), lues par
 * public/admin/index.html :
 * - dossiers : libellé complet de chaque dossier, en titre de la liste du
 *   dossier ouvert (« Pages › Espaces ») ;
 * - ids : identifiants de toutes les pages, pour refuser une création qui
 *   reprendrait l'adresse d'une page existante. Decap écrirait par-dessus le
 *   fichier du même nom sans prévenir ;
 * - apercus : adresse sur le site de chaque fiche de l'éditeur (« Voir la
 *   page », public/admin/apercu.js) ;
 * - navigation : le menu (src/data/navigation.yaml, tel que le lit
 *   navigation.ts), et pages : chaque page avec son titre, son état et ses
 *   liens entrants (`references`, voir _references.ts, vérifiés avant une
 *   suppression), pour la liste des pages et le menu de gauche
 *   (public/admin/ordre-pages.js) ;
 * - adresses : adresses internes valides (pages, accueil, recherche, anciennes
 *   adresses redirigées), pour signaler un lien vers une page qui n'existe pas
 *   (public/admin/verification-liens.js) ;
 * - directives : le vocabulaire des directives (src/plugins/directives.mjs,
 *   avec celles de studio·bib), vérifié avant chaque enregistrement
 *   (public/admin/verification-directives.js).
 *
 * Générée au build, comme config.yml : une page créée en ligne y entre au
 * build suivant (quelques minutes).
 */

export const prerender = true

const fichierDe = (filePath?: string) => (filePath ?? '').replace(/^\.\//, '')

export const GET: APIRoute = async () => {
  // Brouillons compris (ils se modifient), démonstrations (dev/) non
  const pages = (await getCollection('pages')).filter((page) => !page.id.startsWith('dev/'))
  const parId = new Map(pages.map((page) => [page.id, fichierDe(page.filePath)]))
  const references = referencesDesPages(parId.keys(), parId)
  // Titre d'un fichier de page, pour nommer les liens entrants
  const titreDe = new Map(pages.map((page) => [fichierDe(page.filePath), page.data.title]))

  const donnees = {
    dossiers: dossiersDePages(pages).map(({ chemin, libelle }) => ({ chemin, libelle })),
    ids: pages.map((page) => page.id).sort(),
    apercus: Object.fromEntries([['#/collections/accueil/entries/accueil', '/'], ...pages.map((page) => [entreeDePage(page), page.id ? `/${page.id}/` : '/'])]),
    navigation: SECTIONS,
    directives: VOCABULAIRE,
    // Sans barres : « espaces/zines » ; '' pour l'accueil
    adresses: [...new Set(['', 'search', ...pages.map((page) => page.id), ...Object.keys(REDIRECTIONS).map((r) => r.replace(/^\/+|\/+$/g, ''))])].sort(),
    pages: pages
      .map((page) => ({
        id: page.id,
        fichier: fichierDe(page.filePath),
        titre: page.data.titreMenu ?? page.data.title,
        nonListee: page.data.nonListee,
        brouillon: page.data.brouillon,
        entree: entreeDePage(page),
        references: (references.get(page.id) ?? []).map((r) => ({ ...r, titre: titreDe.get(r.fichier) ?? null })),
      }))
      .sort((a, b) => a.id.localeCompare(b.id, 'fr')),
  }
  return new Response(JSON.stringify(donnees) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
