import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

/*
 * Chiffres du tableau de bord de l'interface de rédaction
 * (/admin/tableau-de-bord.json), lus par public/admin/accueil.js : pages
 * (total, en préparation, brouillons). Générés au build : en
 * ligne, à jour après la reconstruction du site. Les images sont comptées
 * par la médiathèque (medias.json).
 */

export const prerender = true

export const GET: APIRoute = async () => {
  // Les pages de démonstration (dev/) ne sont jamais publiées
  const pages = (await getCollection('pages')).filter((page) => !page.id.startsWith('dev/'))
  const donnees = {
    genereLe: new Date().toISOString(),
    pages: {
      total: pages.length,
      enPreparation: pages.filter((page) => !page.data.brouillon && page.data.nonListee).length,
      brouillons: pages.filter((page) => page.data.brouillon).length,
    },
  }
  return new Response(JSON.stringify(donnees) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
