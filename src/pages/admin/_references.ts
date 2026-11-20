import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/*
 * Liens entrants de chaque page, pour l'interface de rédaction : avant de
 * supprimer une page, savoir quels fichiers pointent vers son adresse.
 *
 * Relevé textuel des adresses internes (« /espaces/zines/ », « /espaces/zines »,
 * « /espaces/zines/#ancre ») dans :
 * - src/content : pages, encarts, accueil, édités dans Decap. Un lien
 *   supprimé y devient un lien mort (404), sans faire échouer le build ;
 * - src/data, src/components, src/layouts : données, composants, gabarits.
 *   Ces liens se corrigent dans le code : la suppression est alors refusée
 *   (`bloquant`).
 * Le menu (src/data/navigation.yaml) nomme les pages sans « / » initiale :
 * ordre-pages.js refuse de supprimer une page qui y est encore.
 */

export type Reference = { fichier: string; bloquant: boolean }

const RACINE = process.cwd()
const DOSSIERS = [
  { dossier: 'src/content', bloquant: false },
  { dossier: 'src/data', bloquant: true },
  { dossier: 'src/components', bloquant: true },
  { dossier: 'src/layouts', bloquant: true },
]
const EXTENSIONS = /\.(md|mdx|yaml|yml|json|ts|mjs|astro)$/i
// Adresse interne : « / » précédé d'un délimiteur (espace, guillemet, parenthèse,
// =, crochet, :), segments en minuscules, fin d'adresse (#, ?, guillemet…)
const ADRESSE = /(?<=[\s("'`=[:>])\/([a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*)\/?(?=[#?)"'`\s\]>,;]|$)/g

function fichiersDe(dossier: string): string[] {
  try {
    return readdirSync(join(RACINE, dossier), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile() && EXTENSIONS.test(e.name))
      .map((e) => relative(RACINE, join(e.parentPath, e.name)).replaceAll('\\', '/'))
      // Démonstrations (dev/) : jamais publiées, leurs liens ne comptent pas
      .filter((f) => !f.startsWith('src/content/pages/dev/'))
  } catch {
    return []
  }
}

/** id de page → fichiers qui contiennent son adresse (hors le fichier de la page) */
export function referencesDesPages(ids: Iterable<string>, fichierDe: Map<string, string>): Map<string, Reference[]> {
  const connus = new Set(ids)
  const resultat = new Map<string, Reference[]>()
  for (const { dossier, bloquant } of DOSSIERS) {
    for (const fichier of fichiersDe(dossier)) {
      let texte: string
      try {
        texte = readFileSync(join(RACINE, fichier), 'utf8')
      } catch {
        continue
      }
      const vus = new Set<string>()
      for (const [, id] of texte.matchAll(ADRESSE)) {
        if (!connus.has(id) || vus.has(id) || fichierDe.get(id) === fichier) continue
        vus.add(id)
        resultat.set(id, [...(resultat.get(id) ?? []), { fichier, bloquant }])
      }
    }
  }
  return resultat
}
