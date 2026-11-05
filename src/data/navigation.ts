import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info'
import { InstagramLogoIcon } from '@phosphor-icons/react/dist/ssr/InstagramLogo'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt'
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import { YoutubeLogoIcon } from '@phosphor-icons/react/dist/ssr/YoutubeLogo'

/*
 * Navigation de studio·bib : menu principal, menus de section et pied de page.
 *
 * Un élément de menu est l'identifiant d'une page (son chemin sans barre
 * initiale) : son libellé est le titre de la page. Un objet sert pour :
 * - une catégorie (`enfants`), avec ou sans page à elle (`page`) et un libellé
 *   propre (`titre`) ;
 * - une page cachée (`cache`) : absente du menu, mais rattachée à sa
 *   catégorie pour le fil d'Ariane et la mise en évidence ;
 * - un lien vers une autre section ou un autre site (`lien`).
 * Une page absente de ces menus garde son fil d'Ariane d'après son chemin.
 */

export type ElementMenu =
  | string
  | {
      page?: string
      titre?: string
      lien?: string
      enfants?: ElementMenu[]
      cache?: boolean
      /** Étoile « recommandé » à côté du libellé */
      recommande?: boolean
    }

export interface Section {
  /** Premier segment de l'URL */
  cle: string
  titre: string
  menu: ElementMenu[]
}

const cachees = (...pages: string[]) => pages.map((page) => ({ page, cache: true }))

export const SECTIONS: Section[] = [
  {
    cle: 'espaces',
    titre: 'Espaces',
    menu: [
      { titre: 'Amphithéâtre', page: 'espaces/amphitheatre', enfants: cachees('espaces/guide/amphitheatre') },
      'espaces/ateliers',
      'espaces/zines',
      { titre: 'Laboratoire de visualisation', page: 'espaces/visualisation', enfants: cachees('espaces/guide/visualisation') },
      { titre: 'Salles de visionnement', page: 'espaces/visionnement', enfants: ['espaces/salledevisio', 'espaces/placesdevisio'] },
      { titre: 'Studios balado', page: 'espaces/studiosbalado', enfants: ['espaces/studiosbaladoaudio', 'espaces/studiobaladovideo'] },
      { titre: 'Studios vidéo', page: 'espaces/studiosvideo', enfants: ['espaces/studiovideolsh', 'espaces/studiovideotgd'] },
    ],
  },
  {
    cle: 'informatique',
    titre: 'Ressources informatiques',
    menu: [
      'informatique/authentification',
      { titre: 'Accès hors campus', page: 'informatique/hors-campus', enfants: [{ page: 'informatique/proxy', recommande: true }, 'informatique/vpn'] },
      'informatique/reseau',
      'informatique/impression',
      {
        titre: 'Numérisation',
        page: 'informatique/numerisation',
        enfants: ['informatique/vinyle', 'informatique/czur', 'informatique/microdocuments', 'informatique/ocr', 'informatique/numerisation-pdf-acrobat'],
      },
      'informatique/ordinateurs',
      'informatique/ava',
      'informatique/connexion-ecrans',
      'informatique/tablettes',
      {
        titre: 'Logiciels',
        page: 'informatique/logiciels',
        enfants: [
          'informatique/connexion-distance',
          ...cachees(
            ...['acrobat', 'office', 'arcgis', 'antidote', 'spss', 'adobe', 'chemdraw', 'cisco', 'cmaptools', 'davinciresolve', 'endnote', 'onedrive', 'qdaminer', 'rstudio', 'zotero', 'ableton'].map(
              (l) => `informatique/logiciels/${l}`,
            ),
          ),
        ],
      },
      'informatique/accessoires',
    ],
  },
  {
    cle: 'creatives',
    titre: 'Technologies créatives',
    menu: [
      {
        titre: 'Impression 3D',
        page: 'creatives/impression3d',
        enfants: ['introduction', 'modeles3d', 'bambu', 'prusa', 'ultimaker'].map((p) => `creatives/impression3d/${p}`),
      },
      { titre: 'Réalité virtuelle', page: 'creatives/vr', enfants: ['creatives/vr/guide', 'creatives/vr/catalogue', 'creatives/vr/mise-en-garde'] },
      { titre: 'Électronique', page: 'creatives/electronique', enfants: ['trousses', 'arduino', 'raspberrypi', 'pieces'].map((p) => `creatives/electronique/${p}`) },
      { titre: 'Découpeuse', page: 'creatives/decoupeuse', enfants: ['cameo', 'cricut', 'brother'].map((p) => `creatives/decoupeuse/${p}`) },
      {
        titre: 'Art textile',
        page: 'creatives/art-textile',
        enfants: ['guidebrodeuse', 'modeles', 'inkscape-simple', 'inkscape-complexe', 'fils', 'faq'].map((p) => `creatives/textile/${p}`),
      },
      'creatives/robots',
      'creatives/projets',
    ],
  },
  {
    cle: 'medias',
    titre: 'Productions médias',
    menu: [
      {
        titre: 'Espaces',
        enfants: [
          { titre: 'Studios balado', lien: '/espaces/studiosbalado' },
          { titre: 'Studios vidéo', lien: '/espaces/studiosvideo' },
        ],
      },
      'medias/postes-edition',
      { titre: 'Production audio', enfants: ['medias/balado', 'medias/rodecaster', 'medias/audacity'] },
      { titre: 'Production vidéo', enfants: ['medias/obs', 'medias/guidebaladovideo', 'medias/guidevideolsh', 'medias/guidevideotgd', 'medias/teleprompteur', 'medias/handbrake'] },
      { titre: 'Infographie', enfants: ['medias/tabgraphique'] },
    ],
  },
  {
    cle: 'a-propos',
    titre: 'À propos',
    menu: [
      { titre: 'Nous joindre', page: 'a-propos/nous-joindre', enfants: cachees('a-propos/soutien-informatique', 'a-propos/soutien-creation') },
      'a-propos/contribuer',
      'a-propos/accessibilite',
      'a-propos/politique',
    ],
  },
]

/** Menu principal : la page d'accueil de chaque section */
export const MENU_PRINCIPAL = SECTIONS.map(({ cle, titre }) => ({ titre, url: `/${cle}/` }))

export const estExterne = (href: string) => /^https?:/.test(href)

/* ---- Pied de page : liens absolus vers le site des bibliothèques ---- */

const BIB = 'https://bib.umontreal.ca'

interface LienPied {
  libelle: string
  href: string
  rel?: string
  Icone?: typeof InfoIcon
  /** Pastille de la couleur du service */
  point?: string
  fonction?: string
}

export const COLONNES_PIED: { titre: string; liens: LienPied[] }[] = [
  {
    titre: "Besoin d'aide?",
    liens: [
      { libelle: 'Nous joindre', href: '/a-propos/nous-joindre/', Icone: PaperPlaneTiltIcon },
      { libelle: 'Mon dossier', href: 'https://umontreal.account.worldcat.org/account', rel: 'noopener noreferrer', Icone: UserIcon },
      { libelle: 'À propos', href: '/a-propos/', Icone: InfoIcon },
    ],
  },
  {
    titre: 'Sites connexes',
    liens: [
      { libelle: 'Site des bibliothèques', fonction: 'Espaces, services et ressources', href: `${BIB}/`, point: 'var(--bleu-principal)' },
      { libelle: 'Boîte à outils', fonction: 'Guides pour vos recherches', href: 'https://boite-outils.bib.umontreal.ca/', point: 'var(--rouge-orange)' },
      { libelle: 'Studio·bib', fonction: 'Informatique et création numérique', href: '/', point: 'var(--jaune)' },
      { libelle: 'Papyrus', fonction: 'Dépôt institutionnel', href: 'https://umontreal.scholaris.ca/', point: 'var(--vert-fonce)' },
      { libelle: 'GéoIndex', fonction: 'Données géospatiales', href: 'https://geoapp.bibl.ulaval.ca/', rel: 'noopener noreferrer', point: 'var(--bleu-200)' },
    ],
  },
]

export const RESEAUX_PIED = [
  { libelle: 'YouTube des Bibliothèques', href: 'https://www.youtube.com/user/BibliothequesUdeM', Icone: YoutubeLogoIcon },
  { libelle: "Instagram de l'Université de Montréal", href: 'https://www.instagram.com/umontreal/', Icone: InstagramLogoIcon },
]

export const URGENCE = { libelle: 'Urgence UdeM 514 343‑7771', href: 'tel:+15143437771' }

export const LIENS_QUEUE_PIED = [
  { libelle: 'Confidentialité', href: 'https://vie-privee.umontreal.ca/confidentialite/' },
  { libelle: "Conditions d'utilisation", href: `${BIB}/conditions-utilisation/` },
  { libelle: 'Accessibilité', href: '/a-propos/accessibilite/' },
]
