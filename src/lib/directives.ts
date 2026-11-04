/*
 * Arbre des directives tel que RenduDirectives le passe aux composants de studio·bib
 * (`enfants`), et petits outils pour le parcourir.
 */

/** Directive : nom, attributs et enfants (texte HTML déjà rendu ou directives) */
export type Directive = { nom: string; attributs: Record<string, any>; enfants: NoeudDirective[] }
export type NoeudDirective = string | Directive

export const estDirective = (n: NoeudDirective): n is Directive => typeof n !== 'string'

/** Les enfants qui sont des directives de ce nom (onglets, colonnes, fiches…) */
export const directivesNommees = (enfants: NoeudDirective[], nom: string): Directive[] => enfants.filter((n): n is Directive => estDirective(n) && n.nom === nom)

/** Niveau de titre d'une directive, borné entre h2 et h6 */
export const niveauTitre = (niveau: number) => Math.min(6, Math.max(2, niveau)) as 2 | 3 | 4 | 5 | 6
