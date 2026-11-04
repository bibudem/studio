/*
 * Balados réalisés dans les studios (carrousel de /espaces/studiosbalado).
 * Les pochettes sont dans images/balados/ : optimisées par astro:assets.
 * Le texte de remplacement est vide : le titre du balado suit l'image.
 */
import type { ImageMetadata } from 'astro'
import imageMignardises from './images/balados/mignardises.webp'
import imageVoiescroisees from './images/balados/voiescroisees.webp'
import imageRechercheEnCours from './images/balados/recherche-en-cours.webp'
import imageLucioles from './images/balados/lucioles.webp'
import imageDocument from './images/balados/document.webp'
import imageCare from './images/balados/care.webp'
import imageAfrovoix from './images/balados/afrovoix.webp'
import imageYoucanbe from './images/balados/youcanbe.webp'
import imageRegardscroises from './images/balados/regardscroises.webp'
import imageTouratour from './images/balados/touratour.webp'

export interface Balado {
  id: string
  image: ImageMetadata
  titre: string
  description: string
  /** Page du balado ; le lien s'intitule « Écouter » */
  lien: string
}

export const balados: Balado[] = [
  {
    id: 'mignardises-litteraires',
    image: imageMignardises,
    titre: 'Mignardises littéraires',
    description:
      'Mignardises littéraires, c’est un balado à la conjonction de la créativité, de la francophonie et de la communauté étudiante de l’Université de Montréal.',
    lien: 'https://francais.umontreal.ca/vivre-en-francais/mignardises-litteraires/',
  },
  {
    id: 'voix-croisees',
    image: imageVoiescroisees,
    titre: 'Voi(x)es croisées',
    description:
      'Ce balado du CRI-Jade explore la diversité de perspectives et de réflexion sur l’ÉDI et la décolonisation en matière de recherche et dans les milieux de pratique.',
    lien: 'https://crijade.com/activites/balados/',
  },
  {
    id: 'recherche-en-cours',
    image: imageRechercheEnCours,
    titre: 'Recherche en cours',
    description:
      'Recherche en cours est une série balado qui met en lumière les projets de recherche menés par des étudiantes et étudiants aux cycles supérieurs. Produit par la Faculté des arts et des sciences, chaque épisode réunit trois personnes issues de disciplines différentes qui présentent leur sujet de recherche, échangent entre elles et participent à une discussion autour d’un thème commun.',
    lien: 'https://fas.umontreal.ca/recherche-en-cours/',
  },
  {
    id: 'les-lucioles',
    image: imageLucioles,
    titre: 'Les Lucioles',
    description:
      'Doctorantes et chercheuses en sciences biologiques, Marie-Christine Lafrenière et Stéphanie Shousha reçoivent leurs collègues de l’UdeM pour vulgariser la recherche actuelle dans leur discipline. Phytotechnologies, milieux humides et changements climatiques font partie des sujets abordés.',
    lien: 'https://podcasters.spotify.com/pod/show/leslucioles',
  },
  {
    id: 'qui-releve-du-document',
    image: imageDocument,
    titre: 'Qui relève du document',
    description:
      'Avis aux amateurs et amatrices de documentaires : les étudiants de la Faculté des arts et des sciences Alexandre Ruffier et Ludi Marwood proposent chaque mois un balado dans lequel ils analysent et critiquent finement un film documentaire.',
    lien: 'https://podcasters.spotify.com/pod/show/dudocument',
  },
  {
    id: 'care',
    image: imageCare,
    titre: 'Temps, lieux et voix du care dans l’écriture des femmes',
    description:
      'La littérature peut-elle porter les voix silenciées ? La série « Temps, lieux et voix du care dans l’écriture des femmes » explore, en huit épisodes, le soin d’autrui et de soi dans les textes français, québécois et francophones. Ce projet a été dirigé par Andrea Oberhuber, professeure à l’Université de Montréal, et Sarah Cornet, doctorante, lors d’un séminaire à l’automne 2025. En duo ou trio, les étudiant·es y analysent les enjeux, limites et pièges du care-giving et care-receiving en littérature. Une exploration sonore au cœur de l’éthique du care !',
    lien: 'https://open.spotify.com/show/2ideOAil01nRVh604tfOeh',
  },
  {
    id: 'afro-voix',
    image: imageAfrovoix,
    titre: 'Afro-Voix',
    description:
      'Animé par Gabriella « Kinté » Gabreau, propriétaire de la Librairie Racines, cette série aborde plusieurs sujets complexes. Chaque épisode prend comme prétexte une œuvre littéraire marquante d’un auteur ou d’une autrice afro-descendants pour explorer des thèmes tels que l’histoire, l’immigration, l’intégration, le choc culturel, l’exil, l’identité québécoise et canadienne, ainsi que les identités multiples.',
    lien: 'https://www.umontreal.ca/afro-voix/',
  },
  {
    id: 'you-can-be-anything',
    image: imageYoucanbe,
    titre: 'You Can be Anything',
    description:
      'You can be anything est un balado dédié à mettre de l’avant le parcours inspirant de femmes qui connaissent du succès dans des milieux de travail autrefois dominés par les hommes.',
    lien: 'https://open.spotify.com/show/2jiGpdqsOvv4v3TggxPH1I?si=3d6e973b4818467b',
  },
  {
    id: 'regards-croises-environnement',
    image: imageRegardscroises,
    titre: 'Regards croisés sur l’environnement',
    description:
      'Dans chaque épisode, le professeur de philosophie Christian Nadeau s’entretient avec deux collègues du corps professoral de l’UdeM provenant de diverses disciplines. Ensemble, ils croisent leurs regards pour explorer les multiples dimensions de l’environnement.',
    lien: 'https://fas.umontreal.ca/regards-croises-sur-lenvironnement/',
  },
  {
    id: 'tour-a-tour-admission-recrutement',
    image: imageTouratour,
    titre: 'Tour à tour – Service de l’admission et du recrutement',
    description:
      'Les animatrices Amélie et Sarah s’entretiennent avec des étudiantes et étudiants venus de différents horizons. Découvrez des parcours diversifiés qui illustrent de belle façon l’enthousiasme pour les études aux cycles supérieurs et la recherche à l’Université de Montréal.',
    lien: 'https://admission.umontreal.ca/tour-a-tour/',
  },
]
