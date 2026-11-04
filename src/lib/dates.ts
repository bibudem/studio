import { execSync } from 'node:child_process'

/*
 * Date de dernière mise à jour d'une page
 * (showLastUpdateTime) : le dernier commit qui a touché son fichier. Les
 * commits de conversion (message commençant par « Conversion ») ne comptent pas : ils ne changent pas le contenu. Le champ
 * derniereMaj du frontmatter l'emporte s'il est plus récent.
 */

let dates: Map<string, Date> | undefined

function lireHistorique() {
  const map = new Map<string, Date>()
  try {
    const sortie = execSync("git log --format='@%cI %s' --name-only -- src/content/pages", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 })
    let date: Date | null = null
    for (const ligne of sortie.split('\n')) {
      if (ligne.startsWith('@')) {
        const [iso, ...message] = ligne.slice(1).split(' ')
        date = message.join(' ').startsWith('Conversion') ? null : new Date(iso)
      } else if (ligne && date && !map.has(ligne)) map.set(ligne, date)
    }
  } catch {
    // Hors d'un dépôt git (archive) : le frontmatter seul
  }
  return map
}

/** `fichier` : chemin depuis la racine du projet (src/content/pages/…) */
export function derniereMiseAJour(fichier: string | undefined, frontmatter?: Date) {
  dates ??= lireHistorique()
  const git = fichier ? dates.get(fichier.replace(/^\.\//, '')) : undefined
  if (!git) return frontmatter
  if (!frontmatter) return git
  return git > frontmatter ? git : frontmatter
}

export const formaterDate = (date: Date) => new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Toronto' }).format(date)
