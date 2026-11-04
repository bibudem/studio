/*
 * Catalogue des logiciels : lien de chaque lieu écrit dans la colonne « bibliotheques » de
 * public/data/logiciels.csv vers sa fiche sur le site des Bibliothèques. Un lieu absent de
 * la table reste en texte.
 */
const ESPACES = 'https://bib.umontreal.ca/espaces/'

export const LIENS_BIBLIOTHEQUES: Record<string, string> = {
  'Lettres et sciences humaines': `${ESPACES}#lsh`,
  'Mathématiques et informatique': `${ESPACES}#math-info`,
  Musique: `${ESPACES}#musique`,
  'Hubert-Reeves': `${ESPACES}#Hubert-reeves`,
  'Thérèse-Gouin-Décarie': `${ESPACES}#tgd`,
  Santé: `${ESPACES}#sante`,
  'Tous les postes informatiques des bibliothèques': ESPACES,
  'Toutes les bibliothèques - sur ordinateurs identifiés et de numérisation': ESPACES,
  'Lettres et sciences humaines (Service accessibilité)': `${ESPACES}#lsh`,
  'Lettres et sciences humaines ordinateurs identifiés «Données statistiques» du 3e étage': `${ESPACES}#lsh`,
  'Mathématiques et informatique local 2486': `${ESPACES}#math-info`,
  'Campus de Laval': `${ESPACES}#laval`,
}
