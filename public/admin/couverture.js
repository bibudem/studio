/*
 * Champ « Image de couverture » des pages (widget « couverture », config.yml.ts).
 *
 * Le champ Image de Decap ne trouve pas les couvertures du site : elles sont
 * rangées dans src/content/pages/images/cover et désignées par un chemin
 * relatif à la page (« ../images/cover/zines.webp »), que Decap cherche dans
 * le dossier images/ de la page (vignette vide, erreurs 500 de
 * decap-server). Ce champ propose une liste : les couvertures communes,
 * puis les images du dossier images/ de la page, avec un aperçu. Il écrit
 * le chemin relatif à la page, quelle que soit sa profondeur, comme le
 * schéma du site l'attend (content.config.ts, image()).
 *
 * Images : medias.json (médiathèque), généré au build. Une image importée
 * dans la médiathèque y apparaît après la reconstruction du site.
 * Composant React de Decap (window.h, window.createClass) : API des widgets
 * personnalisés de Decap 3.
 */

import { cheminRelatif } from './barre-markdown.js'
import { chargerImages as imagesDuDepot } from './images-connues.js'

const COUVERTURES = 'src/content/pages/images/cover'
const RACINE = 'src/content/pages'

const STYLE = `
.cv-champ { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; }
.cv-champ select { flex: 1 1 280px; min-height: 44px; padding: 0 12px; border: 2px solid var(--couleur-bordure, #c3ccd5); border-radius: var(--rayon-tres-petit, 8px); background: var(--couleur-surface, #fff); color: var(--couleur-texte, #0b113a); font: inherit; }
.cv-apercu { display: block; width: 240px; max-width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--rayon-tres-petit, 8px); background: var(--couleur-teinte, #e5eef7); }
.cv-note { flex-basis: 100%; margin: 0; color: var(--couleur-texte-secondaire, #4a5160); font-size: 13px; }
`

/** Chemin normalisé (« a/b/../c » → « a/c ») */
function normaliser(chemin) {
  const parties = []
  for (const partie of chemin.split('/')) {
    if (!partie || partie === '.') continue
    if (partie === '..') parties.pop()
    else parties.push(partie)
  }
  return parties.join('/')
}

/** Dossier de la page dans le dépôt (src/content/pages/…), page existante ou nouvelle */
export function dossierDeLaPage(chemin, emplacement) {
  if (chemin) return chemin.split('/').slice(0, -1).join('/')
  const dossier = (emplacement || '/').replace(/^\/+|\/+$/g, '')
  return dossier ? `${RACINE}/${dossier}` : RACINE
}

/** Valeur du champ (relative à la page) → chemin dans le dépôt */
export const versDepot = (dossier, valeur) => (valeur ? normaliser(`${dossier}/${valeur.replace(/^["']|["']$/g, '')}`) : '')

const chargerImages = () => imagesDuDepot().catch(() => [])

export function installerCouverture(CMS) {
  const { h, createClass } = window
  if (!h || !createClass) return console.error('Champ de couverture : API des widgets de Decap introuvable')
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  const Controle = createClass({
    getInitialState() {
      return { images: [] }
    },
    componentDidMount() {
      chargerImages().then((liste) => this.setState({ images: liste }))
    },
    render() {
      const { value, onChange, forID, classNameWrapper, setActiveStyle, setInactiveStyle, entry } = this.props
      const dossier = dossierDeLaPage(entry.get('path'), entry.getIn(['meta', 'path']))
      const actuel = versDepot(dossier, value)
      const communes = this.state.images.filter((i) => i.dossier === COUVERTURES)
      const locales = this.state.images.filter((i) => i.dossier === `${dossier}/images`)
      const connue = [...communes, ...locales].find((i) => i.chemin === actuel)
      const option = (i) => h('option', { key: i.chemin, value: i.chemin }, i.nom)
      const groupes = [
        h('option', { key: '', value: '' }, '— Aucune image —'),
        actuel && !connue ? h('option', { key: actuel, value: actuel }, `Image actuelle : ${value}`) : null,
        communes.length ? h('optgroup', { key: 'communes', label: 'Couvertures communes' }, ...communes.map(option)) : null,
        locales.length ? h('optgroup', { key: 'locales', label: 'Images de cette page' }, ...locales.map(option)) : null,
      ].filter(Boolean)
      return h(
        'div',
        { className: `${classNameWrapper} cv-champ` },
        h(
          'select',
          {
            id: forID,
            value: actuel,
            onFocus: setActiveStyle,
            onBlur: setInactiveStyle,
            onChange: (e) => onChange(e.target.value ? cheminRelatif(dossier, e.target.value) : ''),
          },
          ...groupes,
        ),
        connue ? h('img', { className: 'cv-apercu', src: connue.vignette, alt: '' }) : null,
        h('p', { className: 'cv-note' }, 'Pour une nouvelle image : la médiathèque (« Media », en haut), « Importer une image » dans « Images communes › cover » ; elle apparaît ici après la reconstruction du site.'),
      )
    },
  })

  CMS.registerWidget('couverture', Controle)
}
