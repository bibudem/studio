import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import YAML from 'yaml'
// Réécriture du menu par l'interface de rédaction (« Pages », ordre du menu)
import { appliquerMenu, construireModele, signature } from '../../public/admin/ordre-pages.js'

const texte = readFileSync('src/data/navigation.yaml', 'utf8')
const doc = () => YAML.parseDocument(texte)
const sigs = (chemin: (string | number)[]) => {
  const d = doc()
  const liste = (chemin.length ? d.getIn(chemin, true) : d.contents) as YAML.YAMLSeq
  return liste.items.map((item) => signature((item as YAML.Node).toJSON()))
}
const tels = (chemin: (string | number)[], n: number) => Array.from({ length: n }, (_, index) => ({ origine: { chemin, index } }))

test('menu : sans changement, le fichier reste identique', () => {
  const m = sigs([0, 'menu'])
  assert.equal(appliquerMenu(YAML, texte, [{ chemin: [0, 'menu'], attendu: m, enfants: tels([0, 'menu'], m.length) }]), texte)
})

test('menu : sections et pages déplacées, page ajoutée, commentaires gardés', () => {
  const r = sigs([])
  const m = sigs([0, 'menu'])
  const [a, b, ...reste] = tels([], r.length)
  const [x, y, , ...suite] = tels([0, 'menu'], m.length)
  const sortie = appliquerMenu(YAML, texte, [
    { chemin: [], attendu: r, enfants: [b, a, ...reste] },
    { chemin: [0, 'menu'], attendu: m, enfants: [y, x, ...suite, { valeur: 'espaces/laboformation' }] },
  ])
  const apres = YAML.parse(sortie)
  assert.deepEqual(apres.map((s: { cle: string }) => s.cle).slice(0, 2), [r[1], r[0]].map((s) => s.replace('section:', '')))
  assert.deepEqual(apres[1].menu.map(signature), [m[1], m[0], ...m.slice(3), 'espaces/laboformation'])
  assert.ok(sortie.startsWith(texte.split('\n')[0]), 'commentaire d’en-tête en tête du fichier')
  assert.equal(sortie.split('\n').filter((l) => l.startsWith('#')).length, texte.split('\n').filter((l) => l.startsWith('#')).length)
})

test('menu : refusé si le fichier a changé depuis le chargement', () => {
  const m = sigs([0, 'menu'])
  const autre = texte.replace(/\n {4}- espaces\/zines\n/, '\n')
  assert.notEqual(autre, texte)
  assert.throws(() => appliquerMenu(YAML, autre, [{ chemin: [0, 'menu'], attendu: m, enfants: tels([0, 'menu'], m.length) }]), /a changé/)
})

test('menu : modèle (sections, pages hors du menu)', () => {
  const navigation = YAML.parse(texte)
  const { racine, hors } = construireModele(navigation, [{ id: 'espaces', titre: 'Espaces' }, { id: 'pas-au-menu', titre: 'Ailleurs' }])
  assert.equal(racine.enfants.length, navigation.length)
  assert.deepEqual(hors.map((n: { id: string }) => n.id), ['pas-au-menu'])
})
