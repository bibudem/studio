import { test } from 'node:test'
import assert from 'node:assert/strict'
import { globSync, readFileSync } from 'node:fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import { VOCABULAIRE } from './directives.mjs'
// Vérification de l'interface de rédaction (garde-fou avant l'enregistrement)
import { verifierArbre, messageErreurs } from '../../public/admin/verification-directives.js'

const processeur = unified().use(remarkParse).use(remarkDirective)
const verifier = (texte: string) => verifierArbre(processeur.parse(texte), VOCABULAIRE)
const corps = (fichier: string) => readFileSync(fichier, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')

test('interface de rédaction : aucune page du site n’est refusée', () => {
  for (const fichier of globSync('src/content/pages/**/*.md')) assert.deepEqual(verifier(corps(fichier)), [], fichier)
})

test('interface de rédaction : directives refusées comme au build', () => {
  assert.match(verifier(':::inconnue\nx\n:::')[0].message, /directive inconnue/)
  assert.match(verifier(':::bouton[x]{lien=/a/}\n:::')[0].message, /s’écrit ainsi/)
  assert.match(verifier(':::alerte{type=rouge}\nx\n:::')[0].message, /type=rouge n’existe pas/)
  assert.match(verifier('::bouton[x]')[0].message, /lien est obligatoire/)
  assert.match(verifier('::bouton[x]{lien=/a/ couleur=bleu}')[0].message, /« couleur » inconnu/)
  assert.equal(verifier('\n\n::bouton[x]')[0].ligne, 3)
  // Deux-points ordinaire (« voir:ici ») et drapeau (defaut) : acceptés
  assert.deepEqual(verifier('Voir:ici et 10:30.\n\n::::onglets\n:::onglet[A]{defaut}\nx\n:::\n::::'), [])
  assert.match(messageErreurs(verifier('::bouton[x]')), /Page non enregistrée/)
})

// Guide des directives de l'interface de rédaction
import { remarkDirectivesBib } from './directives.mjs'
import remarkGfm from 'remark-gfm'
import { GROUPES, groupesDuGuide } from '../../public/admin/guide-directives.js'

test('guide : chaque directive du site est décrite, et rien d’autre', () => {
  const decrites = GROUPES.flatMap((g: { directives: { nom: string }[] }) => g.directives.map((d) => d.nom))
  assert.deepEqual([...decrites].sort(), Object.keys(VOCABULAIRE).sort())
  assert.equal(groupesDuGuide(VOCABULAIRE).some((g: { titre: string }) => g.titre === 'Autres'), false)
})

test('guide : les exemples à insérer passent le build tels quels', async () => {
  const build = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).use(remarkDirectivesBib)
  for (const groupe of GROUPES) {
    for (const d of groupe.directives) {
      assert.deepEqual(verifier(d.exemple), [], `${d.nom} : vérification de l’interface`)
      if (d.inserable === false) continue
      // Même traitement que le build (icônes, structure des blocs), dans une page fictive
      await assert.doesNotReject(build.run(build.parse(d.exemple), { path: 'src/content/pages/essai.md', fail: (m: string) => { throw new Error(m) } } as never), d.nom)
    }
  }
})
