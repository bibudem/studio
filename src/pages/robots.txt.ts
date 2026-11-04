import type { APIRoute } from 'astro'
import { SITE } from '@/data/site'

/*
 * robots.txt selon l'environnement : en production, ouvert (moteurs de recherche et assistants d'IA bienvenus, pages techniques
 * exclues) ; ailleurs (préproduction), rien n'est indexé.
 */
export const GET: APIRoute = ({ site }) => {
  const racine = (site ?? new URL(SITE.url)).origin
  const contenu =
    process.env.SITE_ENV === 'production'
      ? [
          "# studio·bib — Bibliothèques de l'Université de Montréal",
          '#',
          '# Le contenu public de ce site peut être exploré, indexé et cité par les moteurs',
          "# de recherche et les assistants d'IA. Seules les pages techniques sont exclues.",
          `# Présentation du site pour les IA : ${racine}/llms.txt`,
          '',
          'User-agent: *',
          'Allow: /',
          'Disallow: /dev/',
          'Disallow: /admin/',
          'Disallow: /forms/',
          '',
          `Sitemap: ${racine}/sitemap-index.xml`,
        ]
      : ['User-agent: *', 'Disallow: /']
  return new Response(contenu.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
