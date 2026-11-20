/*
 * Liens internes et images du corps d'une page, vérifiés avant
 * l'enregistrement (garde-fou de arborescence.js), avec la vérification des
 * directives (verification-directives.js, même analyse du texte) :
 *
 * - une image locale introuvable (« ./images/photo.webp ») fait échouer la
 *   mise en ligne (le build vérifie chaque image) : l'enregistrement est
 *   refusé ;
 * - un lien vers une page qui n'existe pas (« /espaces/zine/ ») ne fait pas
 *   échouer la mise en ligne, mais mène à la page 404 : la personne est
 *   prévenue, et choisit d'enregistrer quand même ou de corriger.
 *
 * Adresses valides (`adresses`, arborescence.json) : les pages, l'accueil,
 * les autres pages du site (recherche…) et les anciennes adresses
 * redirigées. Une adresse de fichier (avec une extension : .pdf, .csv, .md)
 * n'est pas vérifiée. Images connues (`images`) : celles de medias.json.
 */

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

/** Adresse interne à vérifier (« espaces/zines »), ou null (externe, ancre, fichier) */
export function adresseInterne(url) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return null
  const chemin = url.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '')
  if (/\.[a-z0-9]{1,5}$/i.test(chemin.split('/').pop() ?? '')) return null
  return chemin
}

/** Image locale (relative à la page) → chemin dans le dépôt, ou null */
export function imageLocale(url, dossier) {
  if (typeof url !== 'string' || !url || /^(\/|[a-z][a-z0-9+.-]*:)/i.test(url)) return null
  return normaliser(`${dossier}/${decodeURI(url.replace(/[?#].*$/, ''))}`)
}

/**
 * Problèmes d'un arbre mdast. `adresses` : adresses valides (sans barres) ;
 * `images` : chemins d'images du dépôt (null : non vérifiées) ; `dossier` :
 * dossier de la page dans le dépôt. Résultat : { liens, images }, chacun une
 * liste de { ligne, url }.
 */
export function verifierLiensArbre(arbre, { adresses, images = null, dossier }) {
  const liens = []
  const manquantes = []
  const lien = (url, noeud) => {
    const adresse = adresseInterne(url)
    if (adresse != null && !adresses.has(adresse)) liens.push({ ligne: noeud.position?.start.line ?? null, url })
  }
  const visiter = (noeud) => {
    if (noeud.type === 'link' || noeud.type === 'definition') lien(noeud.url, noeud)
    if (noeud.type === 'image' && images) {
      const chemin = imageLocale(noeud.url, dossier)
      if (chemin && !images.has(chemin)) manquantes.push({ ligne: noeud.position?.start.line ?? null, url: noeud.url })
    }
    // Attributs de directives : ::bouton[…]{lien=/…}, :::lieu{lien=…}…
    if (noeud.attributes) for (const valeur of Object.values(noeud.attributes)) lien(valeur, noeud)
    for (const enfant of noeud.children ?? []) visiter(enfant)
  }
  visiter(arbre)
  return { liens, images: manquantes }
}

const ligne = (p) => `– ${p.ligne ? `ligne ${p.ligne} du contenu : ` : ''}${p.url}`

/** Message de refus (images introuvables) */
export function messageImages(manquantes) {
  return `Page non enregistrée : ${manquantes.length > 1 ? `${manquantes.length} images sont introuvables` : 'une image est introuvable'} (sinon la mise en ligne échouerait).\n${manquantes.slice(0, 5).map(ligne).join('\n')}\nVérifiez le chemin (la médiathèque donne celui de chaque image) ou importez l’image.`
}

/** Question posée pour des liens vers des pages introuvables */
export function questionLiens(liens) {
  return `${liens.length > 1 ? `${liens.length} liens mènent` : 'Un lien mène'} vers une page qui n’existe pas (les visiteurs verraient la page « introuvable ») :\n${liens.slice(0, 8).map(ligne).join('\n')}${liens.length > 8 ? `\n… et ${liens.length - 8} autres.` : ''}\n\nEnregistrer quand même ?`
}
