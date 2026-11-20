/*
 * « Voir la page ↗ » dans la barre de l'éditeur, à la place du bouton
 * « Vérifier l'aperçu » de Decap (l'aperçu de Decap ne connaît pas les
 * directives du site, config.yml.ts le désactive).
 *
 * L'adresse vient de arborescence.json (apercus : fiche → adresse, au build),
 * sinon de la règle du site (content.config.ts, generateId) pour une fiche
 * créée depuis : chemin du fichier sans « .md », « index » donne le dossier.
 * Le lien s'ouvre dans un nouvel onglet, sur le site qui sert l'interface
 * (/admin/ → / ; /<base>/admin/ → /<base>/).
 *
 * La barre appartient à React : le lien est ajouté en tête de sa partie
 * droite (ToolbarSectionMeta), et remis s'il disparaît. Noms de composants
 * propres à cette version de Decap : à revérifier si on en change.
 */
const STYLE = `
/* Selon l'état de la fiche, Decap place ce bouton à droite (ToolbarSectionMeta)
   ou au centre (ToolbarSectionMain) de la barre : masqué partout */
:root [class*='-ToolbarContainer'] [class*='-PreviewButtonContainer'] { display: none !important; }
#apercu-page { display: inline-flex; align-items: center; gap: 6px; align-self: center; min-height: 36px; margin-right: 16px; padding: 0 16px; border: 2px solid var(--couleur-fond-fort, #0b113a); border-radius: var(--rayon-plein, 9999px); color: var(--couleur-fond-fort, #0b113a); font-family: var(--police-sans, sans-serif); font-size: 14px; font-weight: var(--graisse-forte, 600); text-decoration: none; white-space: nowrap; }
#apercu-page:hover { background: var(--couleur-teinte, #e5eef7); }
#apercu-page:focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
`

const FICHE = /^#\/collections\/(pages|accueil)\/entries\/([^?]+)/

/** Adresse sur le site de la fiche ouverte (chemin commençant par « / »), ou null */
export function adresseDeFiche(hash, apercus = {}) {
  const m = hash.match(FICHE)
  if (!m) return null
  const entree = hash.replace(/\?.*$/, '')
  if (apercus[entree]) return apercus[entree]
  if (m[1] === 'accueil') return '/'
  let chemin
  try {
    chemin = decodeURIComponent(m[2])
  } catch {
    return null
  }
  // Même règle que generateId (content.config.ts) : « espaces/index » → /espaces/
  const id = chemin.replace(/\/+$/, '').replace(/(^|\/)index$/i, '')
  return id ? `/${id}/` : '/'
}

export function installerApercu(apercus) {
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  // Racine du site : le dossier parent de /admin/
  const racine = new URL('../', location.href.replace(/#.*$/, ''))
  let lien = null

  function synchroniser() {
    const adresse = adresseDeFiche(location.hash, apercus)
    const barre = document.querySelector('[class*="-ToolbarSectionMeta"]')
    if (!adresse || !barre) {
      lien?.remove()
      return
    }
    if (!lien) {
      lien = document.createElement('a')
      lien.id = 'apercu-page'
      lien.target = '_blank'
      lien.rel = 'noopener'
      lien.title = 'Version enregistrée de la page. En ligne : à jour après la reconstruction du site, quelques minutes après l’enregistrement.'
      lien.innerHTML = 'Voir la page <span aria-hidden="true">↗</span>'
    }
    const href = new URL(adresse.replace(/^\//, ''), racine).href
    if (lien.href !== href) {
      lien.href = href
      lien.setAttribute('aria-label', `Voir la page ${adresse} sur le site (nouvel onglet)`)
    }
    if (lien.parentElement !== barre || barre.firstElementChild !== lien) barre.prepend(lien)
  }

  let prevu = false
  const planifier = () => {
    if (prevu) return
    prevu = true
    requestAnimationFrame(() => {
      prevu = false
      synchroniser()
    })
  }
  new MutationObserver(planifier).observe(document.body, { childList: true, subtree: true })
  addEventListener('hashchange', planifier)
  planifier()
}
