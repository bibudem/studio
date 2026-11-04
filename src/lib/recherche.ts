/*
 * Moteur de la recherche dans le site. L'index statique
 * (/search-index.json) et MiniSearch ne sont chargés qu'au premier usage :
 * ensemble, ils pèsent plus que toute la coquille, et la plupart des visites
 * ne cherchent rien. Sert au champ de l'en-tête (suggestions) et à la page
 * /search (tous les résultats).
 */
import type MiniSearch from 'minisearch'
import { sansAccents } from '@/lib/texte'
import { avecBase } from '@/lib/chemin'

/** Entrée de /search-index.json (src/pages/search-index.json.ts) */
/** `section` : libellé affiché ; `cleSection` : clé de la section (« espaces »…), pour filtrer */
export type EntreeIndex = { titre: string; url: string; description: string; section: string; cleSection: string; texte: string }
export type Resultat = Omit<EntreeIndex, 'texte'>
type Document = EntreeIndex & { id: number }

// « numerisation » doit trouver « Numérisation » (sansAccents) : on tape souvent sans accent,
// et la tolérance aux fautes ne comble pas l'écart sur les mots courts

let chargement: Promise<MiniSearch<Document>> | undefined

export function chargerIndex() {
  chargement ??= Promise.all([import('minisearch'), fetch(avecBase('/search-index.json')).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))])
    .then(([{ default: MiniSearchClasse }, entrees]: [{ default: typeof MiniSearch }, EntreeIndex[]]) => {
      const index = new MiniSearchClasse<Document>({
        fields: ['titre', 'description', 'texte'],
        storeFields: ['titre', 'url', 'description', 'section', 'cleSection'],
        processTerm: sansAccents,
        searchOptions: {
          prefix: true,
          // Un mot du titre compte plus que la description, qui compte plus que
          // le reste de la page : la page qui porte le sujet passe en tête
          boost: { titre: 3, description: 1.5, texte: 0.5 },
        },
      })
      index.addAll(entrees.map((entree, id) => ({ id, ...entree })))
      return index
    })
    .catch((erreur) => {
      // Réseau coupé : la prochaine saisie retentera le chargement
      chargement = undefined
      throw erreur
    })
  return chargement
}

const versResultat = ({ titre, url, description, section, cleSection }: Record<string, string>): Resultat => ({ titre, url, description, section, cleSection })

/**
 * Suggestions sous le champ : tous les mots d'abord (« studio video » ne
 * propose pas chaque page qui parle de vidéo), sinon n'importe lequel ; pas
 * de tolérance aux fautes sur les mots courts, où une lettre change le mot
 * (« vpn » trouverait « van »).
 */
export function suggerer(index: MiniSearch<Document>, requete: string): Resultat[] {
  if (!requete.trim()) return []
  const fuzzy = (terme: string) => (terme.length > 4 ? 0.2 : false)
  let resultats = index.search(requete, { combineWith: 'AND', fuzzy })
  if (!resultats.length) resultats = index.search(requete, { fuzzy })
  return resultats.map(versResultat)
}

/** Page de résultats : même classement, avec la tolérance aux fautes */
export function chercher(index: MiniSearch<Document>, requete: string): Resultat[] {
  if (!requete.trim()) return []
  let resultats = index.search(requete, { combineWith: 'AND', fuzzy: 0.2 })
  if (!resultats.length) resultats = index.search(requete, { fuzzy: 0.2 })
  return resultats.map(versResultat)
}
