import type { APIRoute } from 'astro'
import { ENTETE, pagesPourIA } from '@/lib/llms'
import { urlDePage } from '@/lib/contenu'
import { SITE } from '@/data/site'

export const GET: APIRoute = async () => {
  const lignes = (await pagesPourIA()).map((p) => `- [${p.data.title}](${SITE.url}${urlDePage(p)}.md)${p.data.description ? `: ${p.data.description}` : ''}`)
  return new Response(`${ENTETE}\n\n## Pages\n\n${lignes.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
