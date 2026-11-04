/*
 * Jetons de mouvement (src/styles/tokens.css) lus depuis le CSS, pour les animations en
 * JavaScript (Web Animations API) : aucune durée ni courbe en dur dans les scripts.
 */
const valeur = (nom: string) => getComputedStyle(document.documentElement).getPropertyValue(nom).trim()

/** Durée d'un jeton --duree-* en millisecondes (0 si le jeton est absent) */
export function duree(nom: `--duree-${string}`): number {
  const texte = valeur(nom)
  const nombre = parseFloat(texte)
  if (Number.isNaN(nombre)) return 0
  return texte.endsWith('ms') ? nombre : nombre * 1000
}

/** Courbe d'un jeton --courbe-* (repli : ease) */
export function courbe(nom: `--courbe-${string}`): string {
  return valeur(nom) || 'ease'
}
