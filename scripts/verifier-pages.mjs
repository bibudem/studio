/*
 * Vérifie toutes les pages du contenu sur le serveur de développement
 * (adapté de scripts/verifier-pages.mjs de bibweb).
 *
 * Usage : npm run verifier [-- --base=http://localhost:4323 --seulement=motif --sans-axe]
 *
 * Pour chaque page de src/content/pages (hors dev/) et l'accueil :
 * - statut 200 et présence de `<footer` (sans lui, le rendu s'est interrompu) ;
 * - un seul h1 et aucun niveau de titre sauté (WCAG 1.3.1) ;
 * - aucun « [object Object] » ;
 * - aucun débordement horizontal à 390 px ni à 1440 px (WCAG 1.4.10) ;
 * - axe-core : aucune violation des règles WCAG 2.0, 2.1 et 2.2, niveaux A et AA.
 * Ne lance ni build ni serveur : d'autres personnes peuvent s'en servir en même temps.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createRequire } from 'node:module'
import { chromium } from 'playwright-core'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.base ?? 'http://localhost:4323'
const CONTENU = 'src/content/pages'
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const pages = ['/', ...readdirSync(CONTENU, { withFileTypes: true, recursive: true })
  .filter((f) => f.isFile() && f.name.endsWith('.md'))
  .map((f) => '/' + relative(CONTENU, join(f.parentPath, f.name)).replace(/\.md$/, '').replace(/(^|\/)index$/, ''))
  .filter((u) => !u.startsWith('/dev/'))]
  .filter((u) => !args.seulement || u.includes(args.seulement))
  .sort()

const navigateur = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const problemes = []
let i = 0
async function verifier(url) {
  const contexte = await navigateur.newContext()
  const page = await contexte.newPage()
  try {
    const reponse = await page.goto(BASE + url, { waitUntil: 'load', timeout: 60000 })
    const html = await page.content()
    if (reponse?.status() !== 200) problemes.push(`${url} : statut ${reponse?.status()}`)
    if (!html.includes('<footer')) problemes.push(`${url} : pas de <footer> (rendu interrompu)`)
    if (html.includes('[object Object]')) problemes.push(`${url} : « [object Object] »`)
    // document.querySelectorAll (et non $$eval de Playwright, qui traverse les shadow DOM) :
    // la barre d'outils de développement d'Astro a ses propres h1
    const niveaux = await page.evaluate(() => [...document.querySelectorAll('main :is(h1, h2, h3, h4, h5, h6)')].map((e) => Number(e.tagName[1])))
    const h1 = await page.evaluate(() => document.querySelectorAll('h1').length)
    if (h1 !== 1) problemes.push(`${url} : ${h1} h1`)
    for (let k = 1; k < niveaux.length; k++) if (niveaux[k] > niveaux[k - 1] + 1) problemes.push(`${url} : titre h${niveaux[k]} après h${niveaux[k - 1]}`)
    for (const largeur of [390, 1440]) {
      await page.setViewportSize({ width: largeur, height: 900 })
      // Les onglets se réarrangent après le changement de taille : on attend avant de mesurer
      await page.waitForTimeout(800)
      const deborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (deborde > 1) problemes.push(`${url} : déborde de ${deborde} px à ${largeur} px`)
    }
    if (!('sans-axe' in args)) {
      // Les blocs apparaissent en fondu : mesuré trop tôt, le contraste du texte semble trop faible
      await page.waitForTimeout(1500)
      await page.addScriptTag({ content: AXE })
      const violations = await page.evaluate(async () => (await window.axe.run({ exclude: [['astro-dev-toolbar']] }, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes[0]?.target}`))
      for (const v of violations) problemes.push(`${url} : axe ${v}`)
    }
  } catch (e) {
    problemes.push(`${url} : ${e.message.split('\n')[0]}`)
  } finally {
    await contexte.close()
  }
}
const travailleurs = Array.from({ length: 3 }, async () => {
  while (i < pages.length) await verifier(pages[i++])
})
await Promise.all(travailleurs)
await navigateur.close()
console.log(problemes.length ? problemes.join('\n') : 'Aucun problème.')
console.log(`\n${pages.length} pages vérifiées, ${problemes.length} problème(s).`)
process.exitCode = problemes.length ? 1 : 0
