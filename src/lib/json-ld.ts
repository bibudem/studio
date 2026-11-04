/*
 * Données structurées (schema.org) à poser dans <script type="application/ld+json">.
 * JSON.stringify n'échappe pas « < » : un « </script> » dans le contenu (titre,
 * description) fermerait la balise et laisserait passer du HTML. On échappe donc
 * <, > et & en séquences \u, que tout lecteur JSON décode à l'identique.
 */
export const jsonLd = (donnees: unknown): string =>
  JSON.stringify(donnees).replace(/[<>&]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
