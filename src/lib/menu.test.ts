import { test } from 'node:test'
import assert from 'node:assert/strict'
import { construireMenu, type InfoPage } from './menu.ts'

const pages: Record<string, InfoPage> = {
  '/a/publiee': { titre: 'Publiée', brouillon: false },
  '/a/brouillon': { titre: 'Brouillon', brouillon: true },
  '/a/parent': { titre: 'Parent en brouillon', brouillon: true },
  '/a/parent/enfant': { titre: 'Enfant', brouillon: false },
  '/a/suivante': { titre: 'Suivante', brouillon: false },
}
const chercher = async (url: string) => pages[url]
const resume = (noeuds: Awaited<ReturnType<typeof construireMenu>>): unknown =>
  noeuds.map(({ titre, url, ordre, enfants }) => ({ titre, url, ordre, ...(enfants.length ? { enfants: resume(enfants) } : {}) }))

test('menu : un brouillon sort du menu, les numéros suivent', async () => {
  const menu = await construireMenu(['a/publiee', 'a/brouillon', 'a/suivante'], chercher)
  assert.deepEqual(resume(menu), [
    { titre: 'Publiée', url: '/a/publiee', ordre: 0 },
    { titre: 'Suivante', url: '/a/suivante', ordre: 1 },
  ])
})

test('menu : les sous-pages d’un brouillon restent, sous son libellé sans lien', async () => {
  const menu = await construireMenu([{ page: 'a/parent', enfants: ['a/parent/enfant', 'a/brouillon'] }], chercher)
  assert.deepEqual(resume(menu), [{ titre: 'Parent en brouillon', url: undefined, ordre: 0, enfants: [{ titre: 'Enfant', url: '/a/parent/enfant', ordre: 0 }] }])
})

test('menu : un brouillon dont toutes les sous-pages sont des brouillons sort aussi', async () => {
  assert.deepEqual(await construireMenu([{ page: 'a/parent', enfants: ['a/brouillon'] }], chercher), [])
})

test('menu : une page qui n’existe pas arrête le build', async () => {
  await assert.rejects(construireMenu(['a/inconnue'], chercher), /aucune page à l'adresse \/a\/inconnue/)
})
