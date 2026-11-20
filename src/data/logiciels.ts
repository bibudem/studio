/*
 * Catalogue des logiciels : lien de chaque lieu écrit dans la colonne « bibliotheques » de
 * public/data/logiciels.csv vers sa fiche sur le site des Bibliothèques. Un lieu absent de
 * la table reste en texte.
 */
const HORAIRES = 'https://bib.umontreal.ca/horaires/'

export const LIENS_BIBLIOTHEQUES: Record<string, string> = {
  'Lettres et sciences humaines': `${HORAIRES}#lettres-et-sciences-humaines`,
  'Mathématiques et informatique': `${HORAIRES}#mathematiques-et-informatique`,
  Musique: `${HORAIRES}#musique`,
  'Hubert-Reeves': `${HORAIRES}#hubert-reeves`,
  'Thérèse-Gouin-Décarie': `${HORAIRES}#therese-gouin-decarie`,
  Santé: `${HORAIRES}#sante`,
  'Tous les postes informatiques des bibliothèques': HORAIRES,
  'Toutes les bibliothèques - sur ordinateurs identifiés et de numérisation': HORAIRES,
  'Lettres et sciences humaines (Service accessibilité)': `${HORAIRES}#lettres-et-sciences-humaines`,
  'Lettres et sciences humaines ordinateurs identifiés «Données statistiques» du 3e étage': `${HORAIRES}#lettres-et-sciences-humaines`,
  'Mathématiques et informatique local 2486': `${HORAIRES}#mathematiques-et-informatique`,
  'Campus de Laval': `${HORAIRES}#campus-de-laval`,
}
