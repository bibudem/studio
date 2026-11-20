import type { APIRoute } from 'astro'
import { execSync } from 'node:child_process'

/*
 * Commit du site en ligne (/admin/version.json), lu par le tableau de bord de
 * l'interface de rédaction (public/admin/accueil.js) : un enregistrement
 * plus récent que ce commit n'est pas encore en ligne (reconstruction en
 * cours, ou échouée si elle tarde). Amplify fournit AWS_COMMIT_ID ; sinon
 * (poste local, « HEAD » d'un build manuel), git.
 */

export const prerender = true

function commit() {
  const amplify = process.env.AWS_COMMIT_ID
  if (amplify && /^[0-9a-f]{40}$/i.test(amplify)) return amplify
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ commit: commit(), genereLe: new Date().toISOString() }) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
