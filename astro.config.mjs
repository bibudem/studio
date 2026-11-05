// @ts-check
import { defineConfig } from 'astro/config'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { unified } from '@astrojs/markdown-remark'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import remarkDirective from 'remark-directive'
import { remarkDirectivesBib, rehypeDirectivesBib } from './src/plugins/directives.mjs'
import { remarkHtmlPermis } from './src/plugins/directives-studio.mjs'
import rehypeAncresTitres from './src/plugins/rehype-ancres-titres.mjs'
import rehypeAbreviations from './src/plugins/rehype-abreviations.mjs'
import { REDIRECTIONS } from './src/data/redirections.mjs'

// Seule la branche main (le site public) est indexée (robots.txt, balise robots) ; SITE_ENV peut le forcer.
// Sur Amplify, le dépôt est extrait sans branche (HEAD détaché) : AWS_BRANCH donne alors son nom.
function branche() {
  if (process.env.AWS_BRANCH) return process.env.AWS_BRANCH
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return null
  }
}
process.env.SITE_ENV ||= branche() === 'main' ? 'production' : 'preprod'

// Pages Markdown : directives communes et de studio·bib (docs/REDACTION.md),
// puis ancres des titres et abréviations (<abbr>). rehypeDirectivesBib en dernier : il change les
// directives, les liens et les images en marqueurs que RenduDirectives.astro
// remplace par les composants.
const processeur = unified({
  remarkPlugins: [remarkDirective, remarkHtmlPermis, remarkDirectivesBib],
  rehypePlugins: [rehypeAncresTitres, rehypeAbreviations, rehypeDirectivesBib],
  // Les guillemets et apostrophes du contenu sont déjà typographiques
  smartypants: false,
})

export default defineConfig({
  // Cache d'Astro (images déjà converties en AVIF et WebP) hors de node_modules : `npm ci` vide
  // node_modules à chaque build Amplify, ce qui forçait la reconversion de toutes les images.
  // Le dossier est gardé d'un build à l'autre par le cache d'Amplify (amplify.yml).
  cacheDir: './.cache/astro',
  // Adresse du site : source unique (src/data/site.ts la lit sous import.meta.env.SITE)
  site: 'https://studio.bib.umontreal.ca',
  // Pages avec ou sans barre oblique finale : les deux formes restent valides
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: { processor: processeur },
  // React ne sert qu'au build : aucun îlot, aucun JavaScript React envoyé au navigateur
  integrations: [react(), sitemap({ filter: (page) => !/^\/(dev|admin|search)(\/|$)/.test(new URL(page).pathname) })],
  redirects: REDIRECTIONS,
  vite: {
    resolve: { alias: { '@/': fileURLToPath(new URL('./src/', import.meta.url)) } },
    // Dev seulement : ces bibliothèques ne sont chargées qu'à la demande (import() au clic).
    // Pré-optimisées dès le démarrage, elles ne déclenchent plus de réoptimisation en cours de
    // session (Vite répondait 504 « Outdated Optimize Dep » et la visite 360° ne s'ouvrait pas).
    optimizeDeps: { include: ['@photo-sphere-viewer/core', 'leaflet', 'minisearch'] },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: {
    // Mêmes seuils que les points de rupture du CSS
    breakpoints: [600, 900, 1200, 1536],
  },
})
