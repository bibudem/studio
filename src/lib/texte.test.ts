import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pluriel, sansAccents, texteBrut } from './texte.ts'

test('sansAccents', () => assert.equal(sansAccents('Numérisation Été'), 'numerisation ete'))
test('pluriel', () => {
  assert.equal(pluriel(1, 'poste', 'disponible'), '1 poste disponible')
  assert.equal(pluriel(3, 'poste', 'disponible'), '3 postes disponibles')
})
test('texteBrut', () => assert.equal(texteBrut('<p>Local <b>2076</b></p>\n x'), 'Local 2076 x'))
