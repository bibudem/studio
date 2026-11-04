import type { APIRoute, GetStaticPaths } from 'astro'
import { pageEnMarkdown, pagesPourIA } from '@/lib/llms'
import type { Page } from '@/lib/contenu'

/* Version Markdown de chaque page : /espaces/zines.md (voir src/lib/llms.ts) */
export const getStaticPaths = (async () => (await pagesPourIA()).map((page) => ({ params: { chemin: page.id }, props: { page } }))) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) => new Response(pageEnMarkdown((props as { page: Page }).page), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
