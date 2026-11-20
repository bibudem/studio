/*
 * Couleurs du thème vers les jetons de harmonium.
 *
 * Deux lectures coexistent : `couleurTheme` pour le
 * texte (Typography, Box : `color="text.secondary"`, l'orange passe par sa
 * variante lisible), `couleurPalette` pour les fonds et les icônes des cartes
 * (`bgColor="vertPale"`, l'orange reste l'orange graphique).
 */

// Noms de palette du contenu vers les jetons de harmonium (src/jetons/jetons.css)
const JETONS: Record<string, string> = {
  'bleu-principal': 'bleu-principal',
  'bleu-fonce': 'bleu-fonce',
  'bleu-100': 'bleu-10',
  'bleu-200': 'bleu-20',
  'bleu-600': 'bleu-principal-fonce',
  jaune: 'jaune',
  'jaune-pale': 'jaune-40',
  'rose-100': 'rose-50',
  'rose-300': 'rose',
  'rose-500': 'rouge-orange-40',
  'rouge-orange': 'rouge-orange',
  'vert-fonce': 'vert-fonce',
  'vert-pale': 'vert',
}

/**
 * Clé de palette du contenu (`vertPale`, `bleu600`, `primary`) vers son jeton ;
 * une autre valeur (`'#fff'`, écrite par le contenu) passe telle quelle.
 */
export function couleurPalette(nom: string | undefined): string | undefined {
  if (!nom) return undefined
  const cle = nom.replace(/\.main$/, '')
  if (cle === 'primary') return 'var(--bleu-principal)'
  if (cle === 'white' || cle === 'common.white') return 'var(--couleur-sur-fonce)'
  const jeton = cle
    .replace(/([A-Z])/g, '-$1')
    .replace(/(\d+)/, '-$1')
    .toLowerCase()
  return jeton in JETONS ? `var(--${JETONS[jeton]})` : nom
}

/**
 * Couleurs du thème telles que le contenu les écrit (`color="text.secondary"`,
 * `color="primary"`, noms de palette) vers les jetons. Le texte orange passe
 * par la variante assombrie, seule lisible sur les fonds clairs.
 */
const COULEURS: Record<string, string> = {
  primary: 'var(--bleu-principal)',
  'primary.main': 'var(--bleu-principal)',
  'text.primary': 'var(--couleur-texte)',
  'text.secondary': 'var(--couleur-texte-secondaire)',
  inherit: 'inherit',
  bleuPrincipal: 'var(--bleu-principal)',
  bleuFonce: 'var(--bleu-fonce)',
  bleu600: 'var(--bleu-principal-fonce)',
  rougeOrange: 'var(--couleur-texte-accent)',
  vertFonce: 'var(--vert-fonce)',
  white: 'var(--couleur-sur-fonce)',
  blanc: 'var(--couleur-sur-fonce)',
}

export function couleurTheme(nom: string | undefined): string | undefined {
  if (!nom) return undefined
  const cle = nom.replace(/\.main$/, '')
  return COULEURS[nom] ?? COULEURS[cle] ?? nom
}
