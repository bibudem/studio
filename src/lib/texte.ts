/*
 * Petits outils de texte communs au build et aux scripts du navigateur.
 */

/** Minuscules sans accents : « Numérisation » et « numerisation » se valent pour une recherche */
export const sansAccents = (texte: string) => texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** « 1 logiciel », « 3 logiciels » : le nombre et le mot (ou les mots) accordés */
export const pluriel = (n: number, ...mots: string[]) => `${n} ${mots.map((mot) => (n > 1 ? `${mot}s` : mot)).join(' ')}`

/** Texte d'un fragment HTML, sans balises ni espaces en trop */
export const texteBrut = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
