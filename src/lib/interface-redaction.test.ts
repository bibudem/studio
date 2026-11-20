import { test } from 'node:test'
import assert from 'node:assert/strict'
// Interface de rédaction (public/admin) : fonctions sans navigateur
import { etatsMiseEnLigne } from '../../public/admin/accueil.js'
import { dossierDeLaPage, versDepot } from '../../public/admin/couverture.js'
import { cheminRelatif } from '../../public/admin/barre-markdown.js'
import { adresseDeFiche } from '../../public/admin/apercu.js'

test('tableau de bord : état de mise en ligne des derniers commits', () => {
  const maintenant = Date.parse('2026-11-20T12:00:00Z')
  const commits = [
    { sha: 'c', date: '2026-11-20T11:55:00Z' },
    { sha: 'b', date: '2026-11-20T11:00:00Z' },
    { sha: 'a', date: '2026-11-20T10:00:00Z' },
  ]
  assert.deepEqual(etatsMiseEnLigne(commits, 'a', maintenant).map((e) => e?.type ?? null), ['attente', 'erreur', 'succes'])
  assert.deepEqual(etatsMiseEnLigne(commits, 'c', maintenant).map((e) => e?.type ?? null), ['succes', null, null])
  assert.deepEqual(etatsMiseEnLigne(commits, null, maintenant), [null, null, null])
})

test('couverture : chemins relatifs à la page, à toute profondeur', () => {
  const dossier = dossierDeLaPage('src/content/pages/espaces/zines.md')
  assert.equal(dossier, 'src/content/pages/espaces')
  assert.equal(versDepot(dossier, '../images/cover/zines.webp'), 'src/content/pages/images/cover/zines.webp')
  assert.equal(cheminRelatif(dossier, 'src/content/pages/images/cover/zines.webp'), '../images/cover/zines.webp')
  assert.equal(cheminRelatif('src/content/pages/espaces/guide', 'src/content/pages/images/cover/x.webp'), '../../images/cover/x.webp')
  assert.equal(cheminRelatif(dossier, 'src/content/pages/espaces/images/a.webp'), './images/a.webp')
  // Nouvelle page : dossier choisi dans « Emplacement »
  assert.equal(dossierDeLaPage(undefined, 'creatives/textile'), 'src/content/pages/creatives/textile')
  assert.equal(dossierDeLaPage(undefined, '/'), 'src/content/pages')
})

test('voir la page : adresse d’une fiche', () => {
  assert.equal(adresseDeFiche('#/collections/pages/entries/espaces/index'), '/espaces/')
  assert.equal(adresseDeFiche('#/collections/pages/entries/espaces/zines?x=1'), '/espaces/zines/')
  assert.equal(adresseDeFiche('#/collections/accueil/entries/accueil'), '/')
  assert.equal(adresseDeFiche('#/collections/pages'), null)
})

// Abréviations : même règles au build (abreviations.mjs) et à l'enregistrement (arborescence.js)
import { lireAbreviations } from '../data/abreviations.mjs'
import { erreursAbreviations } from '../../public/admin/arborescence.js'

test('abréviations : lecture et vérification', () => {
  assert.deepEqual(lireAbreviations('sigles:\n  - sigle: VPN\n    forme: réseau privé virtuel\n'), { VPN: 'réseau privé virtuel' })
  assert.throws(() => lireAbreviations('sigles:\n  - sigle: VPN\n    forme: a\n  - sigle: VPN\n    forme: b\n'), /en double/)
  assert.throws(() => lireAbreviations('sigles:\n  - sigle: A B\n    forme: a\n'), /sans espace/)
  assert.throws(() => lireAbreviations('sigles:\n  - sigle: VPN\n'), /forme développée est vide/)
  assert.deepEqual(erreursAbreviations([{ sigle: 'VPN', forme: 'x' }]), [])
  assert.equal(erreursAbreviations([{ sigle: 'VPN', forme: 'x' }, { sigle: 'VPN', forme: 'y' }, { sigle: 'A B', forme: 'z' }, { sigle: 'DNS' }]).length, 3)
})

// Liens et images vérifiés à l'enregistrement (verification-liens.js)
import { adresseInterne, imageLocale, verifierLiensArbre } from '../../public/admin/verification-liens.js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'

test('liens : adresses internes et images locales', () => {
  assert.equal(adresseInterne('/espaces/zines/#horaire'), 'espaces/zines')
  assert.equal(adresseInterne('/'), '')
  assert.equal(adresseInterne('/data/logiciels.csv'), null)
  assert.equal(adresseInterne('https://exemple.ca/'), null)
  assert.equal(adresseInterne('#ancre'), null)
  assert.equal(imageLocale('../images/cover/a.webp', 'src/content/pages/espaces'), 'src/content/pages/images/cover/a.webp')
  assert.equal(imageLocale('/img/a.webp', 'src/content/pages'), null)
  const arbre = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse('[Zines](/espaces/zines/) [Oups](/espaces/zine/)\n\n::bouton[Aller]{lien=/nulle-part/}\n\n![](./images/absente.webp) ![](./images/la.webp)')
  const r = verifierLiensArbre(arbre, { adresses: new Set(['espaces/zines']), images: new Set(['src/content/pages/espaces/images/la.webp']), dossier: 'src/content/pages/espaces' })
  assert.deepEqual(r.liens.map((l) => l.url), ['/espaces/zine/', '/nulle-part/'])
  assert.deepEqual(r.images.map((i) => [i.ligne, i.url]), [[5, './images/absente.webp']])
})

// Aperçu du brouillon (apercu-page.js) : rendu avec les modules du site
import { remarkApercu, gabaritsPossibles } from '../../public/admin/apercu-page.js'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { globSync, readFileSync } from 'node:fs'

const apercu = (texte: string, options = {}) =>
  String(unified().use(remarkParse).use(remarkGfm).use(remarkDirective).use(remarkApercu, options).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeStringify, { allowDangerousHtml: true }).processSync(texte))

test('aperçu : toutes les pages se rendent', () => {
  for (const f of globSync('src/content/pages/**/*.md')) {
    const html = apercu(readFileSync(f, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, ''))
    assert.ok(html.length > 0, f)
    assert.doesNotMatch(html, /<div>:::|\[object /, f)
  }
})

test('aperçu : directives en HTML de harmonium ou simplifiées', () => {
  assert.match(apercu(':::alerte{type=attention titre="Note"}\nTexte.\n:::'), /class="bib-alerte bib-alerte--avertissement".*bib-alerte__titre">Note</s)
  assert.match(apercu('::bouton[Réserver]{lien=/espaces/}'), /<a class="bib-bouton bib-bouton--plein bib-bouton--bleu-fonce" href="\/espaces\/"><span class="bib-bouton__libelle">Réserver<\/span>/)
  assert.match(apercu(':::accordeon\n### Un\n\nA\n\n### Deux\n\nB\n:::'), /(<details class="bib-accordeon">.*){2}/s)
  assert.match(apercu('::::onglets\n:::onglet[Windows]{defaut}\nX\n:::\n::::'), /apercu-onglet__titre">Windows \(ouvert au départ\)/)
  assert.match(apercu('::catalogue-logiciels'), /apercu-dynamique.*catalogue-logiciels/s)
  assert.match(apercu('Voir:ici'), /Voir:ici/)
  assert.match(apercu('![x](./images/a.webp)', { images: new Map([['src/content/pages/espaces/images/a.webp', '/_astro/a.webp']]), dossier: 'src/content/pages/espaces' }), /src="\/_astro\/a.webp"/)
})

test('aperçu : gabarit de la page, sinon de son dossier ou d’une section', () => {
  const adresses = new Set(['espaces', 'espaces/zines', 'informatique'])
  assert.deepEqual(gabaritsPossibles('src/content/pages/espaces/zines.md', null, adresses), ['espaces/zines', 'espaces', 'informatique'])
  assert.deepEqual(gabaritsPossibles(undefined, 'espaces/guide', adresses), ['espaces', 'informatique'])
})
