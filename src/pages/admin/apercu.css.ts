import type { APIRoute } from 'astro'
import composants from 'harmonium/composants.css?raw'
import apercu from './_apercu.css?raw'

/*
 * Feuille de l'aperçu du brouillon (/admin/apercu.css), ajoutée par
 * public/admin/apercu-page.js à la page du site chargée dans le panneau
 * d'aperçu : tous les composants de harmonium (une page publiée ne charge
 * que ceux qu'elle utilise, le brouillon peut en ajouter), puis la forme
 * simplifiée des composants propres à studio·bib (_apercu.css).
 */

export const prerender = true

export const GET: APIRoute = () =>
  new Response(`${composants}\n${apercu}`, {
    headers: { 'Content-Type': 'text/css; charset=utf-8' },
  })
