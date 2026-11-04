import type { APIRoute } from 'astro'
import { ENTETE, pageEnMarkdown, pagesPourIA } from '@/lib/llms'

export const GET: APIRoute = async () => {
  const pages = (await pagesPourIA()).map(pageEnMarkdown)
  return new Response(`${ENTETE}\n\n${pages.join('\n---\n\n')}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
