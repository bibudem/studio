import { test } from 'node:test'
import assert from 'node:assert/strict'
import { jsonLd } from './json-ld.ts'

test('jsonLd échappe ce qui fermerait la balise script', () => {
  const texte = jsonLd({ nom: '</script><b>&' })
  assert.ok(!texte.includes('<') && !texte.includes('>') && !texte.includes('&'))
  assert.deepEqual(JSON.parse(texte), { nom: '</script><b>&' })
})
