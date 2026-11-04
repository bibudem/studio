/*
 * Bibliothèques de l'Université de Montréal : source unique des cartes
 * (CarteBibliotheques) et des listes de lieux du site.
 * - lien : fiche de la bibliothèque sur bib.umontreal.ca
 * - itineraire : itinéraire Google Maps
 * - coords : [latitude, longitude] (liens Google Maps des fiches, ou OpenStreetMap)
 * - region : vue de la carte où apparaît la bibliothèque (Montréal par défaut)
 */

export interface Bibliotheque {
  nom: string
  lien: string
  itineraire: string
  coords: [number, number]
  region?: string
}

const ESPACES = 'https://bib.umontreal.ca/espaces/'
const RECHERCHE_MAPS = 'https://www.google.com/maps/search/?api=1&query='

export const REGION_DEFAUT = 'Montréal'

export const BIBLIOTHEQUES = {
  amenagement: {
    nom: 'Aménagement',
    lien: `${ESPACES}#amenagement`,
    itineraire: 'https://maps.app.goo.gl/irzr8ofQRdBNMFd86',
    coords: [45.5046547, -73.621263],
  },
  droit: {
    nom: 'Droit',
    lien: `${ESPACES}#droit`,
    itineraire: `${RECHERCHE_MAPS}${encodeURIComponent('Bibliothèque de droit Université de Montréal')}`,
    // Pavillon Maximilien-Caron (OpenStreetMap)
    coords: [45.4986407, -73.616983],
  },
  hubertReeves: {
    nom: 'Hubert-Reeves',
    lien: `${ESPACES}#Hubert-reeves`,
    itineraire: 'https://maps.app.goo.gl/T6E9TaKNk6dDgrds9',
    coords: [45.5231104, -73.6196605],
  },
  lsh: {
    nom: 'Lettres et sciences humaines',
    lien: `${ESPACES}#lsh`,
    itineraire: 'https://maps.app.goo.gl/6HsLMAxoBWpQZgcD8',
    // Pavillon Samuel-Bronfman (OpenStreetMap)
    coords: [45.4993923, -73.6165279],
  },
  mathInfo: {
    nom: 'Mathématiques et informatique',
    lien: `${ESPACES}#math-info`,
    itineraire: 'https://maps.app.goo.gl/Jwg5Q34WrjR7vhGV8',
    coords: [45.5010087, -73.6157778],
  },
  tgd: {
    nom: 'Thérèse-Gouin-Décarie',
    lien: `${ESPACES}#tgd`,
    itineraire: 'https://maps.app.goo.gl/t8GE4RdMBEJiHJtd8',
    coords: [45.5106865, -73.6115803],
  },
  sante: {
    nom: 'Santé',
    lien: `${ESPACES}#sante`,
    itineraire: 'https://maps.app.goo.gl/KVE9w3JN2BKp278q8',
    coords: [45.5025116, -73.6158328],
  },
  margueriteDYouville: {
    nom: "Marguerite d'Youville",
    lien: `${ESPACES}#marguerite-d-youville`,
    itineraire: 'https://g.co/kgs/q8wfQY2',
    coords: [45.5096654, -73.6190605],
  },
  medecineVeterinaire: {
    nom: 'Médecine vétérinaire',
    lien: `${ESPACES}#medecine-veterinaire`,
    itineraire: `${RECHERCHE_MAPS}${encodeURIComponent('Bibliothèque de médecine vétérinaire Université de Montréal')}`,
    coords: [45.6215436, -72.9657664],
    region: 'Saint-Hyacinthe',
  },
} satisfies Record<string, Bibliotheque>

/** Un lieu de la carte : une bibliothèque et ce qu'elle offre */
export interface LieuService extends Bibliotheque {
  /** Emplacement dans la bibliothèque (Markdown d'une ligne) */
  emplacement?: string
  /** Pastilles : modèles, nombre de postes… */
  pastilles: { libelle: string; lien?: string; nombre?: number }[]
  /** Précisions (Markdown d'une ligne chacune) */
  details?: string[]
}

/** Ce que la carte dit du service */
export interface ServiceCarte {
  /** Complète « Carte des bibliothèques offrant … » */
  service: string
  /** Nom de la liste de pastilles d'un lieu (lecteurs d'écran) */
  etiquettePastilles: string
  /** Préfixe des pastilles dans les données structurées */
  libelleJsonLd: string
  /** Ajouté au nombre de bibliothèques dans l'en-tête de la liste */
  sousTitre?: string
  lieux: LieuService[]
}
