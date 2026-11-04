import { estListee, toutesLesPages, urlDePage, type Page } from '@/lib/contenu'
import { SITE } from '@/data/site'

/*
 * Fichiers pour les assistants d'IA (https://llmstxt.org) : /llms.txt (sommaire), /llms-full.txt
 * (tout le contenu) et une version Markdown de chaque page (/page.md).
 * Les pages en préparation et les brouillons sont exclus.
 */

const ORDRE = ['espaces', 'informatique', 'creatives', 'medias', 'a-propos']

export const ENTETE = [
  `# studio·bib — Bibliothèques de l’Université de Montréal`,
  '',
  `> ${SITE.description}`,
  '',
  'Site officiel des services technologiques et créatifs des bibliothèques de l’Université de Montréal (UdeM).',
  '',
  `Les services s’adressent à la communauté UdeM (étudiants, personnel). Réservations et soutien : ${SITE.courriel}.`,
  '',
  'Chaque page existe aussi en Markdown : ajouter .md à son adresse.',
].join('\n')

/** Pages publiées et listées, dans l'ordre des sections du site */
export async function pagesPourIA() {
  const rang = (p: Page) => {
    const i = ORDRE.indexOf(p.id.split('/')[0])
    return i < 0 ? ORDRE.length : i
  }
  return (await toutesLesPages())
    .filter((p) => estListee(p) && p.id && !p.id.startsWith('dev/'))
    .sort((a, b) => rang(a) - rang(b) || a.id.localeCompare(b.id, 'fr'))
}

/** Une page en Markdown : titre, résumé, adresse, puis le corps tel qu'écrit */
export const pageEnMarkdown = (p: Page) =>
  [`# ${p.data.title}`, '', p.data.description ? `> ${p.data.description}\n` : '', `Source : ${new URL(urlDePage(p), SITE.url).href}`, '', (p.body ?? '').trim(), ''].join('\n')
