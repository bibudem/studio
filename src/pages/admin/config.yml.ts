import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { SECTIONS } from '@/data/navigation'

/*
 * Configuration de Decap CMS (/admin/config.yml), lue par public/admin/index.html.
 * Générée à partir
 * du contenu, pour qu'il n'y ait pas de second schéma à tenir à la main. Le
 * build reste le juge : le schéma Zod de content.config.ts et la validation
 * des directives refusent ce que Decap laisserait passer.
 *
 * - Le corps s'édite en Markdown brut : un éditeur visuel réécrirait les
 *   directives (:::onglets, ::bouton…) à l'enregistrement.
 * - Une collection par section du site (menu principal), plus les encarts.
 * - En ligne, chaque enregistrement est un commit direct sur la branche publiée
 *   (mode simple, sans pull request) : Amplify reconstruit le site et le publie.
 *   Si le build échoue, Amplify garde la version précédente en ligne. En
 *   développement (npm run cms:local), Decap écrit directement dans les fichiers.
 * - Dépôt, branche et connexion : DECAP_DEPOT (par défaut bibudem/studio), DECAP_BRANCHE (par
 *   défaut main : la branche publiée par Amplify, où Decap enregistre),
 *   DECAP_ORIGINE (par défaut https://studio.bib.umontreal.ca : l'origine où
 *   s'ouvre admin/connexion.html) et DECAP_AUTH_URL (connexion.html.ts). Ces
 *   adresses ne sont pas secrètes ; les variables ne servent qu'à les remplacer.
 *
 * JSON.stringify suffit : un document JSON est un document YAML valide.
 */

export const prerender = true

const DEPOT = process.env.DECAP_DEPOT ?? 'bibudem/studio'
const BRANCHE = process.env.DECAP_BRANCHE ?? 'main'
const ORIGINE = process.env.DECAP_ORIGINE ?? 'https://studio.bib.umontreal.ca'
const pageConnexion = [process.env.BASE_PATH, 'admin/connexion.html']
  .map((partie) => partie?.replace(/^\/+|\/+$/g, ''))
  .filter(Boolean)
  .join('/')

// Images d'une page : dossier images/ à côté du fichier
const imagesACote = { media_folder: 'images', public_folder: './images' }

const date = (label: string, name: string, hint?: string) => ({ label, name, widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'YYYY-MM-DD', time_format: false, required: false, hint })

const champsPage = [
  { label: 'Titre', name: 'title', widget: 'string', hint: 'Titre de la page (h1) et de l’onglet du navigateur.' },
  { label: 'Libellé du menu', name: 'titreMenu', widget: 'string', required: false, hint: 'Seulement si le titre est long : libellé plus court dans le menu et le fil d’Ariane.' },
  { label: 'Description', name: 'description', widget: 'text', required: false, hint: 'Résumé pour les moteurs de recherche, les assistants d’IA et le partage (150 à 160 caractères).' },
  { label: 'Image de couverture', name: 'image', widget: 'image', required: false },
  { label: 'Texte de remplacement de l’image', name: 'imageAlt', widget: 'string', required: false, hint: 'Ce que montre l’image ; vide si elle est décorative.' },
  { label: 'Carte d’aide en fin de page', name: 'aide', widget: 'select', required: false, options: [{ label: 'Soutien informatique', value: 'info' }, { label: 'Soutien à la création', value: 'crea' }] },
  { label: 'Personne responsable', name: 'responsable', widget: 'string', required: false, hint: 'Manifeste web, principe 3 : chaque page a une personne responsable.' },
  date('Date de révision prévue', 'revision', 'À cette date, la page est relue, mise à jour ou retirée.'),
  date('Dernière mise à jour', 'derniereMaj', 'Facultatif : sinon, la date du dernier enregistrement.'),
  { label: 'Afficher « Cette page vous a été utile? »', name: 'retroaction', widget: 'boolean', required: false, default: true },
  { label: 'Masquer la date de mise à jour', name: 'masquerDate', widget: 'boolean', required: false },
  { label: 'Afficher le sommaire « Sur cette page »', name: 'sommaire', widget: 'boolean', required: false, default: true },
  { label: 'Niveau de titre maximal du sommaire', name: 'sommaireMax', widget: 'number', value_type: 'int', min: 2, max: 4, required: false },
  { label: 'Page en préparation (hors menus et recherche)', name: 'nonListee', widget: 'boolean', required: false },
  { label: 'Brouillon (non publié)', name: 'brouillon', widget: 'boolean', required: false },
  { label: 'Contenu', name: 'body', widget: 'markdown', modes: ['raw'], hint: 'Markdown et directives du site (:::onglets, :::alerte, :::cartes, ::bouton…) : voir le guide de rédaction (docs/REDACTION.md).' },
]

const champsEncart = [
  { label: 'Titre', name: 'titre', widget: 'string' },
  { label: 'Texte', name: 'texte', widget: 'text' },
  { label: 'Lien', name: 'lien', widget: 'object', fields: [{ label: 'Libellé', name: 'libelle', widget: 'string' }, { label: 'Adresse', name: 'url', widget: 'string' }] },
  { label: 'Icône (phosphoricons.com)', name: 'icone', widget: 'string', required: false },
  { label: 'Animation de l’icône', name: 'animation', widget: 'select', required: false, options: ['vague', 'cloche'] },
  { label: 'Couleur', name: 'couleur', widget: 'select', required: false, options: ['jaune', 'rouge-orange', 'bleu'] },
  { label: 'Présentation', name: 'variante', widget: 'select', required: false, options: ['centree', 'ligne', 'carte'] },
]

const lien = (label: string, name: string) => ({ label, name, widget: 'object', fields: [{ label: 'Titre', name: 'titre', widget: 'string' }, { label: 'Adresse', name: 'url', widget: 'string' }] })

// Accueil (src/content/accueil.yaml) : mêmes champs que le schéma de content.config.ts
const champsAccueil = [
  {
    label: 'Accueil',
    name: 'accueil',
    widget: 'object',
    fields: [
      { label: 'Titre de l’onglet', name: 'titre', widget: 'string' },
      { label: 'Description', name: 'description', widget: 'text' },
      {
        label: 'Bannière',
        name: 'banniere',
        widget: 'object',
        hint: 'Une image est tirée au hasard à chaque visite ; la phrase dit ce que fait studio·bib.',
        fields: [
          { label: 'Images', name: 'images', widget: 'list', field: { label: 'Image', name: 'image', widget: 'image' } },
          { label: 'Phrase (facultative)', name: 'phrase', widget: 'string', required: false },
        ],
      },
      {
        label: 'Tâches (six cartes)',
        name: 'raccourcis',
        widget: 'list',
        min: 6,
        max: 6,
        fields: [
          { label: 'Titre', name: 'titre', widget: 'string' },
          { label: 'Adresse', name: 'url', widget: 'string' },
          { label: 'Icône (phosphoricons.com)', name: 'icone', widget: 'string' },
          { label: 'Appel', name: 'appel', widget: 'string' },
        ],
      },
      { label: 'Formations', name: 'formations', widget: 'object', fields: [{ label: 'Titre', name: 'titre', widget: 'string' }, { label: 'Source (API)', name: 'source', widget: 'string' }, lien('Lien vers toutes les formations', 'toutes')] },
    ],
  },
]

export const GET: APIRoute = async () => {
  const pages = (await getCollection('pages')).filter((p) => !p.id.startsWith('dev/'))
  const encarts = await getCollection('encarts')

  const collectionsPages = SECTIONS.map((section) => ({
    name: `pages-${section.cle}`,
    label: `Pages : ${section.titre}`,
    label_singular: 'Page',
    files: pages
      .filter((p) => p.id === section.cle || p.id.startsWith(`${section.cle}/`))
      .sort((a, b) => a.id.localeCompare(b.id, 'fr'))
      .map((p) => ({ name: p.id.replaceAll('/', '--'), label: p.data.titreMenu ?? p.data.title, file: p.filePath, ...imagesACote, fields: champsPage })),
  }))

  const config = {
    locale: 'fr',
    logo: { src: '/img/logo-studiobib.svg', show_in_header: true },
    backend: {
      name: 'github',
      repo: DEPOT,
      branch: BRANCHE,
      base_url: ORIGINE,
      auth_endpoint: pageConnexion,
      commit_messages: {
        create: 'Création de {{collection}} « {{slug}} »',
        update: 'Modification de {{collection}} « {{slug}} »',
        delete: 'Suppression de {{collection}} « {{slug}} »',
        uploadMedia: 'Ajout de l’image « {{path}} »',
        deleteMedia: 'Suppression de l’image « {{path}} »',
      },
    },
    ...(import.meta.env.DEV ? { local_backend: true } : {}),
    omit_empty_optional_fields: true,
    media_folder: 'public/televersements',
    public_folder: '/televersements',
    slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
    // L'aperçu de Decap ne connaît pas les directives : il montrerait une page sans rapport avec le site
    editor: { preview: false },
    collections: [
      {
        name: 'accueil',
        label: 'Accueil',
        files: [{ name: 'accueil', label: 'Page d’accueil', file: 'src/content/accueil.yaml', media_folder: 'accueil/images', public_folder: './accueil/images', fields: champsAccueil }],
      },
      ...collectionsPages,
      {
        name: 'encarts',
        label: 'Encarts réutilisés',
        label_singular: 'Encart',
        files: encarts.map((e) => ({ name: e.id, label: `${e.data.titre} (${e.id})`, file: e.filePath, fields: champsEncart })),
      },
    ],
  }

  return new Response(JSON.stringify(config, null, 2) + '\n', { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } })
}
