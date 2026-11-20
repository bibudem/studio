import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info'
import { InstagramLogoIcon } from '@phosphor-icons/react/dist/ssr/InstagramLogo'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt'
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import { YoutubeLogoIcon } from '@phosphor-icons/react/dist/ssr/YoutubeLogo'

import { parse } from 'yaml'
import brut from './navigation.yaml?raw'

/*
 * Navigation de studio·bib : menu principal, menus de section et pied de page.
 *
 * Le menu vit dans src/data/navigation.yaml, que l'interface de rédaction (/admin/) peut
 * réordonner ; ce module le lit et le vérifie au build. Un élément de menu est l'identifiant
 * d'une page (son chemin sans barre initiale) : son libellé est le titre de la page. Un objet
 * sert pour :
 * - une catégorie (`enfants`), avec ou sans page à elle (`page`) et un libellé propre (`titre`) ;
 * - une page cachée (`cache`) : absente du menu, mais rattachée à sa catégorie pour le fil
 *   d'Ariane et la mise en évidence ;
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

const CLES_ELEMENT = new Set(['page', 'titre', 'lien', 'enfants', 'cache', 'recommande'])

/** Vérifie un élément de menu du YAML ; `ou` situe l'erreur dans le message */
function verifierElement(e: unknown, ou: string): ElementMenu {
  if (typeof e === 'string' && e.trim()) return e.trim()
  if (!e || typeof e !== 'object' || Array.isArray(e)) throw new Error(`src/data/navigation.yaml, ${ou} : un élément est un identifiant de page ou un objet.`)
  const o = e as Record<string, unknown>
  for (const cle of Object.keys(o)) if (!CLES_ELEMENT.has(cle)) throw new Error(`src/data/navigation.yaml, ${ou} : clé inconnue « ${cle} ».`)
  for (const cle of ['page', 'titre', 'lien'] as const) if (o[cle] !== undefined && typeof o[cle] !== 'string') throw new Error(`src/data/navigation.yaml, ${ou} : « ${cle} » doit être un texte.`)
  for (const cle of ['cache', 'recommande'] as const) if (o[cle] !== undefined && typeof o[cle] !== 'boolean') throw new Error(`src/data/navigation.yaml, ${ou} : « ${cle} » vaut true ou false.`)
  if (!o.page && !o.titre && !o.lien) throw new Error(`src/data/navigation.yaml, ${ou} : un élément a une page, un titre ou un lien.`)
  if (o.enfants !== undefined && !Array.isArray(o.enfants)) throw new Error(`src/data/navigation.yaml, ${ou} : « enfants » est une liste.`)
  const libelle = (o.titre ?? o.page ?? o.lien) as string
  return { ...(o as object), enfants: (o.enfants as unknown[] | undefined)?.map((x, i) => verifierElement(x, `${ou} › ${libelle} › élément ${i + 1}`)) } as ElementMenu
}

function lireSections(): Section[] {
  const donnees = parse(brut) as unknown
  if (!Array.isArray(donnees)) throw new Error('src/data/navigation.yaml : la racine est la liste des sections.')
  return donnees.map((s, i) => {
    const { cle, titre, menu } = (s ?? {}) as Record<string, unknown>
    if (typeof cle !== 'string' || typeof titre !== 'string' || !Array.isArray(menu)) throw new Error(`src/data/navigation.yaml, section ${i + 1} : « cle », « titre » et « menu » sont obligatoires.`)
    return { cle, titre, menu: menu.map((e, j) => verifierElement(e, `${titre} › élément ${j + 1}`)) }
  })
}

export const SECTIONS: Section[] = lireSections()

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
      { libelle: 'Bases de données A-Z', fonction: 'Ressources électroniques par sujet', href: 'https://boite-outils.bib.umontreal.ca/az.php', point: 'var(--rouge-orange)' },
      { libelle: 'Papyrus', fonction: 'Dépôt institutionnel', href: 'https://umontreal.scholaris.ca/', point: 'var(--vert-fonce)' },
      { libelle: 'Sofia', fonction: 'Catalogue des collections', href: 'https://umontreal.on.worldcat.org/discovery?lang=fr', rel: 'noopener noreferrer', point: 'var(--bleu-20)' },
      { libelle: 'Collections spéciales', fonction: 'Objets numériques', href: 'https://collections-speciales.bib.umontreal.ca/', point: 'var(--rose)' },
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
