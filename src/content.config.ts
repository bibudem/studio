import { defineCollection } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { messageIconeInconnue, trouverIcone } from '@/plugins/icones.mjs'

/*
 * Le contenu, séparé de la présentation (docs/REDACTION.md) :
 * - pages : une page = un fichier Markdown ; son chemin donne l'URL
 *   (src/content/pages/espaces/zines.md → /espaces/zines) ;
 * - encarts : textes réutilisés d'une page à l'autre (aide, droit d'auteur) ;
 * - accueil : les données de la page d'accueil.
 * Les schémas sont stricts : une clé inconnue ou mal écrite fait échouer le
 * build, avec le nom du fichier.
 */

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/(^|\/)index$/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        /** Titre de la page (h1, onglet du navigateur) */
        title: z.string(),
        /** Libellé plus court dans les menus et le fil d'Ariane, si le titre est long */
        titreMenu: z.string().optional(),
        /** Résumé pour les moteurs de recherche, les assistants d'IA et le partage (150 à 160 caractères) */
        description: z.string().optional(),
        /** Image de couverture, sous le titre ; aussi l'image de partage */
        image: image().optional(),
        /** Texte de remplacement de l'image ; vide si elle est décorative */
        imageAlt: z.string().default(''),
        /** Carte « Nous sommes là pour vous aider » en fin de page */
        aide: z.enum(['info', 'crea']).optional(),
        /** « Cette page vous a été utile? » */
        retroaction: z.boolean().default(true),
        /** Cache la date de dernière mise à jour */
        masquerDate: z.boolean().default(false),
        /** Sommaire « Sur cette page » : affiché, et jusqu'à quel niveau de titre */
        sommaire: z.boolean().default(true),
        // studio·bib : un seul niveau par défaut (les titres ##) ; 3 ou 4 ajoutent les sous-titres
        sommaireMax: z.number().int().min(2).max(4).default(2),
        /** En préparation : publiée par son adresse, mais hors des menus, du sitemap et de la recherche */
        nonListee: z.boolean().default(false),
        /** Brouillon : visible en développement seulement */
        brouillon: z.boolean().default(false),
        /** Manifeste web, principe 3 : chaque page a une personne responsable et une date de révision */
        responsable: z.string().optional(),
        revision: z.coerce.date().optional(),
        /** Date de dernière mise à jour du contenu (sinon, celle du dernier commit du fichier) */
        derniereMaj: z.coerce.date().optional(),
      })
      .strict(),
})

const encarts = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/encarts' }),
  schema: z
    .object({
      titre: z.string(),
      texte: z.string(),
      lien: z.object({ libelle: z.string(), url: z.string() }).strict(),
      /** Icône Phosphor (phosphoricons.com) */
      icone: z.string().default('hand-waving'),
      /** Animation de l'icône à son apparition */
      animation: z.enum(['vague', 'cloche']).optional(),
      couleur: z.enum(['jaune', 'rouge-orange', 'bleu']).default('jaune'),
      /** centree : bloc centré (accueil) ; ligne : icône à gauche ; carte : carte foncée cliquable (fin de page) */
      variante: z.enum(['centree', 'ligne', 'carte']).default('ligne'),
    })
    .strict(),
})

const lien = z.object({ titre: z.string(), url: z.string() }).strict()

/** Nom d'icône vérifié au build (phosphoricons.com ou icône maison) */
const nomIcone = z
  .string()
  .trim()
  .superRefine((nom, ctx) => {
    if (!trouverIcone(nom)) ctx.addIssue({ code: 'custom', message: messageIconeInconnue(nom) })
  })

const accueil = defineCollection({
  loader: file('src/content/accueil.yaml'),
  schema: ({ image }) =>
    z
      .object({
        titre: z.string(),
        description: z.string(),
        // studio·bib : une phrase fixe facultative sous le logo (plus de slogans tirés au hasard)
        banniere: z.object({ images: z.array(image()).min(1), phrase: z.string().optional() }).strict(),
        // Les tâches de l'accueil : six, deux rangées de trois
        raccourcis: z.array(lien.extend({ icone: nomIcone, appel: z.string() }).strict()).length(6),
        // Cartes à photo (fond photo sous un voile sombre) : quatre services à mettre en avant
        cartes: z.array(z.object({ titre: z.string(), description: z.string(), url: z.string(), image: image() }).strict()).length(4),
        formations: z.object({ titre: z.string(), source: z.string().url(), toutes: lien }).strict(),
      })
      .strict(),
})

export const collections = { pages, encarts, accueil }
