import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { dossiersDePages } from './_arborescence'
import { THEMES } from '@/data/abreviations.mjs'

/*
 * Configuration de Decap CMS (/admin/config.yml), lue par public/admin/index.html.
 * Générée à partir
 * du contenu, pour qu'il n'y ait pas de second schéma à tenir à la main. Le
 * build reste le juge : le schéma Zod de content.config.ts et la validation
 * des directives refusent ce que Decap laisserait passer.
 *
 * - Le corps s'édite en Markdown brut : un éditeur visuel réécrirait les
 *   directives (:::onglets, ::bouton…) à l'enregistrement.
 * - Pages : une seule collection « Pages », imbriquée (nested, subfolders:
 *   false), sur src/content/pages. public/admin/ordre-pages.js remplace sa
 *   liste et son menu de gauche par le menu du site (src/data/navigation.yaml),
 *   réordonnable par glisser-déposer. Une page se crée dans le dossier ouvert,
 *   ou celui choisi dans « Emplacement » (meta.path : dossiers, et toute page,
 *   dont le dossier du même nom reçoit alors ses sous-pages, voir
 *   _arborescence.ts) ; elle n'entre pas d'elle-même dans le menu (« Ajouter
 *   au menu… »). Le garde-fou de public/admin/arborescence.js refuse une
 *   création qui reprendrait l'adresse d'une page existante (Decap écraserait
 *   le fichier) et un changement d'emplacement (déplacement : liens cassés).
 *   La suppression passe par la liste des pages (liens entrants vérifiés),
 *   pas par Decap.
 * - Plus l'accueil, et les abréviations (src/data/abreviations.yaml : sigles
 *   développés en <abbr> au build). Les encarts (src/content/encarts) se
 *   modifient dans le dépôt.
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

// Ordre du formulaire : l'essentiel (titre, description, couverture,
// contenu), puis les options d'affichage, rarement touchées. Les champs
// responsable et revision du schéma (content.config.ts) ne sont pas
// proposés ici : ils restent possibles dans le fichier.
const champsPage = [
  { label: 'Titre', name: 'title', widget: 'string', hint: 'Titre de la page (h1) et de l’onglet du navigateur.' },
  { label: 'Libellé du menu', name: 'titreMenu', widget: 'string', required: false, hint: 'Seulement si le titre est long : libellé plus court dans le menu et le fil d’Ariane.' },
  { label: 'Description', name: 'description', widget: 'text', required: false, hint: 'Résumé pour les moteurs de recherche, les assistants d’IA et le partage (150 à 160 caractères).' },
  // Widget propre au site (public/admin/couverture.js) : celui de Decap ne trouve pas images/cover
  { label: 'Image de couverture', name: 'image', widget: 'couverture', required: false },
  { label: 'Texte de remplacement de l’image', name: 'imageAlt', widget: 'string', required: false, hint: 'Ce que montre l’image ; vide si elle est décorative.' },
  { label: 'Contenu', name: 'body', widget: 'markdown', modes: ['raw'], hint: 'Markdown et directives du site : barre ci-dessus (« Guide » pour toutes les directives, « Blocs du site » pour les plus courantes). Les directives sont vérifiées à l’enregistrement.' },
  { label: 'Carte d’aide en fin de page', name: 'aide', widget: 'select', required: false, options: [{ label: 'Soutien informatique', value: 'info' }, { label: 'Soutien à la création', value: 'crea' }] },
  { label: 'Page en préparation (hors menus et recherche)', name: 'nonListee', widget: 'boolean', required: false },
  { label: 'Brouillon (non publié)', name: 'brouillon', widget: 'boolean', required: false },
  date('Dernière mise à jour', 'derniereMaj', 'Facultatif : sinon, la date du dernier enregistrement.'),
  { label: 'Afficher « Cette page vous a été utile? »', name: 'retroaction', widget: 'boolean', required: false, default: true },
  { label: 'Masquer la date de mise à jour', name: 'masquerDate', widget: 'boolean', required: false },
  { label: 'Afficher le sommaire « Sur cette page »', name: 'sommaire', widget: 'boolean', required: false, default: true },
  { label: 'Niveau de titre maximal du sommaire', name: 'sommaireMax', widget: 'number', value_type: 'int', min: 2, max: 4, required: false },
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

// Abréviations (src/data/abreviations.yaml), vérifiées au build par src/data/abreviations.mjs
const collectionAbreviations = {
  name: 'abreviations',
  label: 'Abréviations',
  editor: { preview: false },
  description: 'Sigles développés au survol dans les pages (balise <abbr>, première occurrence de chaque page). Pas de noms d’établissements connus (UdeM, HEC), de noms de produits (OBS, SPSS) ni de sigles ambigus (PC : ordinateur ou polycarbonate). Le site est à jour après la reconstruction.',
  files: [
    {
      name: 'abreviations',
      label: 'Sigles et abréviations',
      file: 'src/data/abreviations.yaml',
      fields: [
        {
          label: 'Sigles',
          name: 'sigles',
          widget: 'list',
          collapsed: true,
          summary: '{{fields.sigle}} : {{fields.forme}}',
          label_singular: 'sigle',
          fields: [
            { label: 'Sigle', name: 'sigle', widget: 'string', pattern: ['^\\S+$', 'Sans espace, tel qu’il s’écrit dans le texte (la casse compte : RGB, LUTs).'], hint: 'Tel qu’il s’écrit dans le texte ; la casse compte.' },
            { label: 'Forme développée', name: 'forme', widget: 'string', hint: 'Affichée au survol du sigle. En minuscules, sauf nom propre (« réseau privé virtuel », « Creative Commons »).' },
            { label: 'Thème', name: 'theme', widget: 'select', options: THEMES, default: 'Autres', required: false },
          ],
        },
      ],
    },
  ],
}

export const GET: APIRoute = async () => {
  const pages = (await getCollection('pages')).filter((p) => !p.id.startsWith('dev/'))

  // Un titre est exigé : il donne le nom du fichier, donc l'adresse de la page
  const champsPageCreable = champsPage.map((champ) => (champ.name === 'title' ? { ...champ, required: true, hint: 'Titre de la page (h1) et de l’onglet du navigateur. À la création, il donne aussi l’adresse de la page : il ne doit pas reprendre celle d’une page existante du même dossier.' } : champ))
  const collectionPages = {
    name: 'pages',
    label: 'Pages',
    label_singular: 'Page',
    folder: 'src/content/pages',
    extension: 'md',
    format: 'frontmatter',
    create: true,
    delete: false,
    nested: { depth: 10, subfolders: false },
    meta: {
      path: {
        label: 'Emplacement',
        widget: 'select',
        options: dossiersDePages(pages).map(({ chemin, libelle }) => ({ label: libelle, value: chemin })),
        default: '/',
        hint: 'Section ou page parente : l’adresse de la nouvelle page commence par la sienne. À choisir à la création ; une page existante ne se déplace pas depuis ici. Sa place dans le menu se choisit ensuite dans « Pages » (Ajouter au menu…).',
      },
    },
    slug: '{{slug}}',
    summary: '{{title}}',
    sortable_fields: ['title'],
    ...imagesACote,
    fields: champsPageCreable,
  }

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
    // Aperçu des pages : la page du site, avec le brouillon (public/admin/apercu-page.js) ;
    // pas d'aperçu pour l'accueil et les abréviations (celui de Decap n'y montrerait que les champs)
    editor: { preview: true },
    collections: [
      {
        name: 'accueil',
        label: 'Accueil',
        editor: { preview: false },
        files: [{ name: 'accueil', label: 'Page d’accueil', file: 'src/content/accueil.yaml', media_folder: 'accueil/images', public_folder: './accueil/images', fields: champsAccueil }],
      },
      collectionPages,
      collectionAbreviations,
    ],
  }

  return new Response(JSON.stringify(config, null, 2) + '\n', { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } })
}
