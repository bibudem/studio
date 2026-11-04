/*
 * Identité du site : nom, description, données structurées (schema.org).
 */
// Une seule source : l'option `site` d'astro.config.mjs, qu'Astro expose sous import.meta.env.SITE
const URL_SITE = import.meta.env.SITE.replace(/\/$/, '')
const description =
  "studio·bib : les services technologiques et créatifs des bibliothèques de l'Université de Montréal. Studios balado et vidéo, impression 3D, ateliers de fabrication, réalité virtuelle, postes d'édition, logiciels, accès à distance et soutien informatique pour la communauté UdeM."

export const SITE = {
  nom: 'studio·bib',
  /** Titre de l'accueil (onglet, résultats de recherche, partage) */
  titreAccueil: 'studio·bib | Services technologiques et créatifs des bibliothèques UdeM',
  url: URL_SITE,
  description,
  courriel: 'studio@bib.umontreal.ca',
  /** Onglet flottant du clavardage LibChat */
  clavardage: '2cdfcaf0f2e776291e8bfc9296e8b7573083d9b6ad33c930fa46024633447cce',
  ORGANISATION_ID: `${URL_SITE}/#organisation`,
  SITE_ID: `${URL_SITE}/#site`,
  donneesStructurees: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${URL_SITE}/#organisation`,
        name: 'studio·bib',
        alternateName: 'Services technologiques et créatifs des bibliothèques de l’Université de Montréal',
        url: `${URL_SITE}/`,
        logo: `${URL_SITE}/img/logo-studiobib.svg`,
        email: 'studio@bib.umontreal.ca',
        description,
        parentOrganization: {
          '@type': 'Library',
          name: 'Bibliothèques de l’Université de Montréal',
          url: 'https://bib.umontreal.ca/',
          parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Université de Montréal', url: 'https://www.umontreal.ca/' },
        },
        areaServed: { '@type': 'City', name: 'Montréal' },
      },
      {
        '@type': 'WebSite',
        '@id': `${URL_SITE}/#site`,
        url: `${URL_SITE}/`,
        name: 'studio·bib',
        description,
        inLanguage: 'fr-CA',
        publisher: { '@id': `${URL_SITE}/#organisation` },
        potentialAction: { '@type': 'SearchAction', target: `${URL_SITE}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
      },
    ],
  },
}
