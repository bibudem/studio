/*
 * Images interactives (::image-interactive{nom=…}) : une capture d'écran et
 * ses zones, chacune décrite par un texte de la liste qui l'accompagne.
 * Positions en % de l'image (haut, gauche, largeur, hauteur).
 * Les images sont dans images/images-interactives/ (optimisées par astro:assets).
 */
import type { ImageMetadata } from 'astro'
import resolveInterface from './images/images-interactives/resolve-interface.webp'
import resolveBarrePages from './images/images-interactives/resolve-barre-pages.webp'

export interface Zone {
  id: string
  libelle: string
  haut: number
  gauche: number
  largeur: number
  hauteur: number
}

export interface ImageInteractive {
  image: ImageMetadata
  alt: string
  /** Liste numérotée (étapes, ordre) ou à puces */
  numerotee?: boolean
  zones: Zone[]
}

// Sept pages de même largeur dans la barre de DaVinci Resolve
const page = (i: number) => ({ haut: 0, gauche: (i * 100) / 7, largeur: 100 / 7, hauteur: 100 })

export const IMAGES_INTERACTIVES: Record<string, ImageInteractive> = {
  'resolve-interface': {
    image: resolveInterface,
    alt: 'Fenêtre de démarrage de DaVinci Resolve Studio 20 : la bibliothèque de projets à gauche, les projets à droite.',
    zones: [
      {
        id: 'gestionnaire-projet',
        libelle: 'Le gestionnaire de projet : affiché au lancement, il permet de visualiser et gérer vos projets ainsi que les bases de données.',
        haut: 0,
        gauche: 0,
        largeur: 26,
        hauteur: 100,
      },
      {
        id: 'pages-de-travail',
        libelle: 'Les pages de travail : accessibles après l’ouverture d’un projet, elles regroupent les outils pour importer, monter, étalonner, mixer et exporter vos médias.',
        haut: 0,
        gauche: 26,
        largeur: 74,
        hauteur: 100,
      },
    ],
  },
  'resolve-barre-pages': {
    image: resolveBarrePages,
    alt: 'Barre des pages de DaVinci Resolve : Média, Cut, Montage, Fusion, Étalonnage, Fairlight et Exportation.',
    numerotee: true,
    zones: [
      { id: 'media', libelle: 'Média – Importer sons, images, vidéos', ...page(0) },
      { id: 'cut', libelle: 'Cut – Montage rapide', ...page(1) },
      { id: 'edit', libelle: 'Montage – Édition principale', ...page(2) },
      { id: 'fusion', libelle: 'Fusion – Composition d’image', ...page(3) },
      { id: 'color', libelle: 'Étalonnage – Correction colorimétrique', ...page(4) },
      { id: 'fairlight', libelle: 'Fairlight – Mixer et traiter le son', ...page(5) },
      { id: 'deliver', libelle: 'Exportation – Rendu final', ...page(6) },
    ],
  },
}
