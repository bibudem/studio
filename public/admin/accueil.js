/*
 * Tableau de bord de l'interface de rédaction (#/accueil) : page d'arrivée
 * après la connexion, et lien du logo de l'en-tête.
 *
 * Decap n'a pas de pages personnalisées : sur une adresse qu'il ne connaît
 * pas, il affiche son en-tête et « Introuvable » dans AppMainContainer. Le
 * tableau de bord prend la place de ce message (même technique que la liste
 * des pages, ordre-pages.js).
 *
 * Contenu : la personne connectée (session de Decap : nom, compte et avatar
 * GitHub ; en local, mode fichiers du poste), les chiffres du site
 * (tableau-de-bord.json et medias.json, générés au build), des raccourcis et, en ligne, les dernières modifications publiées (commits de
 * la branche, API GitHub avec la session de Decap) avec leur état de mise en
 * ligne (version.json : commit du site en ligne).
 */

const ROUTE = '#/accueil'

import { ouvrirGuide } from './guide-directives.js'

const STYLE = `
body[data-accueil] [class*='-AppMainContainer'] > :not(#accueil) { display: none !important; }
#accueil { max-width: 1104px; margin: 24px auto 48px; padding: 0 16px; color: var(--couleur-texte, #0b113a); font-family: var(--police-sans, sans-serif); font-size: 14px; }
#accueil h1 { margin: 0 0 16px; font-size: var(--texte-tres-grand, 1.5rem); font-weight: var(--graisse-forte, 600); }
#accueil h2 { margin: 0 0 12px; font-family: var(--police-serif, Georgia, serif); font-size: 1.25rem; font-weight: var(--graisse-normale, 400); }
#accueil a { color: var(--couleur-lien, #0057ac); }
#accueil a:hover { color: var(--couleur-lien-survol, #003c78); }
#accueil :focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
.ac-carte { padding: 20px 24px; background: var(--couleur-surface, #fff); border-radius: var(--rayon-carte, 12px); box-shadow: var(--ombre-1); }
.ac-grille { display: grid; gap: 16px; }
.ac-profil { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 20px; margin-bottom: 16px; }
.ac-avatar { flex: none; width: 64px; height: 64px; border-radius: var(--rayon-plein, 9999px); background: var(--couleur-teinte-forte, #cce2f3); color: var(--bleu-fonce, #0b113a); display: grid; place-items: center; font-size: 26px; font-weight: var(--graisse-forte, 600); object-fit: cover; }
.ac-profil-texte { flex: 1 1 280px; }
.ac-bonjour { margin: 0 0 4px; font-size: var(--texte-grand, 1.25rem); font-weight: var(--graisse-forte, 600); }
.ac-sous { margin: 0; color: var(--couleur-texte-secondaire, #4a5160); line-height: 1.5; }
.ac-bouton { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 18px; border: 2px solid var(--couleur-fond-fort, #0b113a); border-radius: var(--rayon-plein, 9999px); background: var(--couleur-surface, #fff); color: var(--couleur-fond-fort, #0b113a) !important; font: inherit; font-weight: var(--graisse-forte, 600); text-decoration: none; cursor: pointer; white-space: nowrap; }
.ac-bouton:hover { background: var(--couleur-teinte, #e5eef7); }
.ac-bouton.ac-plein { background: var(--couleur-fond-fort, #0b113a); color: var(--couleur-sur-fonce, #fff) !important; }
.ac-bouton.ac-plein:hover { border-color: var(--couleur-fond-fort-survol, #0057ac); background: var(--couleur-fond-fort-survol, #0057ac); }
/* Grille commune : 2 tuiles au-dessus de 2 colonnes, même écart, bords alignés */
.ac-chiffres { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0 0 16px; padding: 0; list-style: none; }
.ac-chiffres > li { display: flex; }
.ac-chiffres > li > * { flex: 1; }
.ac-chiffre { display: flex; flex-direction: column; gap: 4px; padding: 18px 20px; background: var(--couleur-surface, #fff); border: 0; border-radius: var(--rayon-carte, 12px); box-shadow: var(--ombre-1); color: var(--couleur-texte, #0b113a) !important; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.ac-chiffre:hover { box-shadow: var(--ombre-2); }
.ac-chiffre:hover .ac-libelle { color: var(--couleur-lien, #0057ac); }
.ac-libelle { color: var(--couleur-texte-secondaire, #4a5160); font-size: 12px; font-weight: var(--graisse-grasse, 700); letter-spacing: .04em; text-transform: uppercase; }
.ac-nombre { font-size: 2.25rem; font-weight: var(--graisse-forte, 600); line-height: 1.1; font-variant-numeric: tabular-nums; }
.ac-detail { color: var(--couleur-texte-secondaire, #4a5160); font-size: 13px; }
.ac-detail.ac-alerte { color: var(--alerte-erreur-icone, #b10000); }
.ac-colonnes { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; }
.ac-colonnes > .ac-carte { display: flex; flex-direction: column; }
.ac-colonnes .ac-lien-tout { margin-top: auto; padding-top: 12px; }
@media (max-width: 900px) {
  .ac-chiffres { grid-template-columns: minmax(0, 1fr); }
  .ac-colonnes { grid-template-columns: minmax(0, 1fr); }
}
.ac-liste { margin: 0; padding: 0; list-style: none; }
.ac-liste li { display: flex; gap: 12px; padding: 10px 0; border-top: 1px solid var(--couleur-teinte, #e5eef7); line-height: 1.4; }
.ac-liste li:first-child { border-top: 0; padding-top: 0; }
.ac-date { flex: none; min-width: 6.5em; color: var(--couleur-texte-secondaire, #4a5160); font-variant-numeric: tabular-nums; }
.ac-qui { color: var(--couleur-texte-secondaire, #4a5160); font-size: 13px; }
.ac-raccourcis { display: flex; flex-wrap: wrap; gap: 8px; }
.ac-note { margin: 0; color: var(--couleur-texte-secondaire, #4a5160); line-height: 1.5; }
.ac-pied { margin: 16px 0 0; color: var(--couleur-texte-secondaire, #4a5160); font-size: 12px; }
.ac-carte > .ac-lien-tout { align-self: flex-start; font-weight: var(--graisse-forte, 600); }
.ac-etat { display: inline-block; margin-left: 8px; padding: 1px 8px; border-radius: var(--rayon-plein, 9999px); font-size: 12px; font-weight: var(--graisse-forte, 600); }
.ac-etat-succes { background: var(--alerte-succes-fond, #d6f0e2); color: var(--vert-fonce, #024244); }
.ac-etat-attente { background: var(--couleur-teinte, #e5eef7); color: var(--couleur-texte, #0b113a); }
.ac-etat-erreur { background: var(--alerte-erreur-fond, #fee1de); color: var(--alerte-erreur-icone, #b10000); }
.ac-avatar svg { width: 34px; height: 34px; fill: currentColor; }
/* Logo de l'en-tête : lien vers le tableau de bord */
[class*='-AppHeaderLogo'] { position: relative; }
.ac-logo { position: absolute; inset: 0; border-radius: var(--rayon-minuscule, 4px); }
.ac-logo:focus-visible { outline: 3px solid var(--couleur-focus, #0057ac); outline-offset: 2px; }
`

// Icône Phosphor « user » (256 × 256), avatar sans photo
const SILHOUETTE = '<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z"/></svg>'

/*
 * Mot d'accueil, tiré au hasard à chaque visite du tableau de bord : un
 * salut à l'équipe, pour donner du courage ou une idée. Formulations
 * neutres (aucun accord au masculin ni au féminin).
 */
export const MOTS_ACCUEIL = [
  'Bonjour, équipe de feu!',
  'Salut, l’équipe! On crée quelque chose de beau aujourd’hui?',
  'Bonjour, équipe de choc!',
  'Allô, la gang du studio! Le studio n’attend que vos idées.',
  'Bonjour! Une page claire, c’est une question de moins au comptoir.',
  'Salut! Qu’est-ce qu’on imprime en 3D aujourd’hui?',
  'Bienvenue au poste de pilotage!',
  'Bonjour! Vos pages font avancer des projets partout sur le campus.',
  'Bonjour! Derrière chaque page, il y a un projet qui avance.',
  'Bonjour! Vos pages aident des projets à prendre forme.',
  'Allô! Un bon titre, et la moitié du travail est faite.',
  'Salut! Ici, les idées folles sont les bienvenues.',
  'Bonjour! Petit rappel : vous faites du bon travail.',
  'On rend la technologie accessible, une page à la fois. Bonne rédaction!',
  'Bonjour! Une phrase simple vaut mieux qu’une longue explication.',
  'Salut, l’équipe! Aujourd’hui est un bon jour pour relire une vieille page.',
  'Bonjour! Une image bien choisie en dit plus qu’un paragraphe.',
  'Allô! Le café est prêt? Les studios aussi.',
  'Bonjour, l’équipe! Chaque mise à jour, c’est un service de plus.',
  'Salut! Un balado, une impression 3D, une page : tout commence par une idée.',
  'Bonjour! Ce que vous écrivez ici aide quelqu’un à se lancer.',
  'Bonne journée de création, l’équipe!',
  'Bonjour! Et si on rendait une page encore plus simple aujourd’hui?',
]

const motAccueil = () => MOTS_ACCUEIL[Math.floor(Math.random() * MOTS_ACCUEIL.length)]

const nombre = (n) => new Intl.NumberFormat('fr-CA').format(n)
const dateLongue = (d) => new Intl.DateTimeFormat('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
const relatif = new Intl.RelativeTimeFormat('fr-CA', { numeric: 'auto' })
function ilYa(iso) {
  const secondes = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unite, s] of [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
    if (Math.abs(secondes) >= s) return relatif.format(Math.round(secondes / s), unite)
  }
  return 'à l’instant'
}

function element(balise, attributs = {}, ...enfants) {
  const el = document.createElement(balise)
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === false || valeur == null) continue
    if (cle === 'class') el.className = valeur
    else if (cle === 'texte') el.textContent = valeur
    else el.setAttribute(cle, valeur === true ? '' : valeur)
  }
  el.append(...enfants.filter((e) => e != null && e !== false))
  return el
}

const lireJson = async (url) => {
  try {
    const reponse = await fetch(url)
    return reponse.ok ? await reponse.json() : null
  } catch {
    return null
  }
}

function utilisateur() {
  try {
    return JSON.parse(localStorage.getItem('decap-cms-user') || 'null') ?? {}
  } catch {
    return {}
  }
}

/** Ouvre la médiathèque (bouton « Media » de l'en-tête, intercepté par medias.js) */
const ouvrirMediatheque = () => document.querySelector('header button[class*="-AppHeaderButton"]')?.click()

/** Dernières modifications publiées : commits de la branche (en ligne seulement) */
/** Délai au-delà duquel un enregistrement pas encore en ligne est signalé (reconstruction échouée ?) */
const DELAI_MISE_EN_LIGNE = 20 * 60 * 1000

/**
 * État de mise en ligne de chaque commit (du plus récent au plus ancien),
 * d'après le commit du site en ligne (`enLigne`, version.json) : le commit
 * publié est « en ligne » ; les plus récents sont en cours de mise en ligne,
 * ou signalés s'ils attendent depuis plus de DELAI_MISE_EN_LIGNE. Les plus
 * anciens, et tous si le commit en ligne est inconnu : null.
 */
export function etatsMiseEnLigne(commits, enLigne, maintenant = Date.now()) {
  if (!enLigne) return commits.map(() => null)
  const rang = commits.findIndex((c) => c.sha === enLigne)
  return commits.map((c, i) => {
    if (i === rang) return { type: 'succes', texte: 'En ligne' }
    if (rang !== -1 && i > rang) return null
    const attente = maintenant - new Date(c.date).getTime()
    return attente > DELAI_MISE_EN_LIGNE ? { type: 'erreur', texte: 'Pas en ligne : la reconstruction a sans doute échoué' } : { type: 'attente', texte: 'Mise en ligne en cours' }
  })
}

/** Commit du site en ligne (version.json, à côté de l'interface), ou null */
async function commitEnLigne() {
  try {
    // Sans cache : la version servie change à chaque reconstruction
    const reponse = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
    return reponse.ok ? ((await reponse.json()).commit ?? null) : null
  } catch {
    return null
  }
}

async function activite(config, jeton) {
  const backend = config?.backend
  if (!backend?.repo || !jeton) return null
  const api = `${(backend.api_root || 'https://api.github.com').replace(/\/$/, '')}/repos/${backend.repo}/commits?sha=${encodeURIComponent(backend.branch || 'main')}&per_page=6`
  try {
    const reponse = await fetch(api, { headers: { Authorization: `token ${jeton}`, Accept: 'application/vnd.github+json' } })
    if (!reponse.ok) return null
    return (await reponse.json()).map((c) => ({
      sha: c.sha,
      message: c.commit.message.split('\n')[0],
      auteur: c.commit.author?.name ?? c.author?.login ?? '',
      date: c.commit.author?.date,
      url: c.html_url,
    }))
  } catch {
    return null
  }
}

async function construire() {
  const [chiffres, medias, config] = await Promise.all([lireJson('./tableau-de-bord.json'), lireJson('./medias.json'), lireJson('./config.yml')])
  const user = utilisateur()
  const local = user.backendName === 'proxy' || !user.token
  const racine = new URL('../', location.href.replace(/#.*$/, '')).href
  const prenom = (user.name || '').trim().split(/\s+/)[0]

  // Personne connectée
  const avatar = user.avatar_url
    ? element('img', { class: 'ac-avatar', src: user.avatar_url, alt: '' })
    : element('span', { class: 'ac-avatar', 'aria-hidden': 'true', texte: prenom || user.login ? (prenom || user.login).charAt(0).toUpperCase() : null })
  if (!user.avatar_url && !(prenom || user.login)) avatar.innerHTML = SILHOUETTE
  const profil = element(
    'section',
    { class: 'ac-carte ac-profil', 'aria-labelledby': 'ac-bonjour' },
    avatar,
    element(
      'div',
      { class: 'ac-profil-texte' },
      element('p', { class: 'ac-bonjour', id: 'ac-bonjour', texte: motAccueil() }),
      element(
        'p',
        { class: 'ac-sous' },
        local
          ? 'Mode local : les modifications sont écrites directement dans les fichiers du poste.'
          : `Connexion GitHub${user.login ? ` : @${user.login}` : ''} · dépôt ${config?.backend?.repo ?? ''}, branche ${config?.backend?.branch ?? 'main'}. Chaque enregistrement est publié après la reconstruction du site, quelques minutes plus tard.`,
      ),
      element('p', { class: 'ac-sous', texte: dateLongue(new Date()).replace(/^./, (c) => c.toUpperCase()) }),
    ),
    element('a', { class: 'ac-bouton', href: racine, target: '_blank', rel: 'noopener' }, 'Voir le site ', element('span', { 'aria-hidden': 'true', texte: '↗' })),
  )

  // Chiffres
  const libres = medias?.images?.filter((i) => !i.utilisations.length).length ?? 0
  const tuile = (balise, attributs, valeur, libelle, detail, alerte = false) =>
    element(
      balise,
      { class: 'ac-chiffre', ...attributs },
      element('span', { class: 'ac-libelle', texte: libelle }),
      element('span', { class: 'ac-nombre', texte: valeur == null ? '–' : nombre(valeur) }),
      detail ? element('span', { class: `ac-detail${alerte ? ' ac-alerte' : ''}`, texte: detail }) : null,
    )
  const boutonImages = tuile('button', { type: 'button' }, medias?.images?.length, 'Images', libres ? `${nombre(libres)} non utilisées` : 'Toutes utilisées', libres > 0)
  boutonImages.addEventListener('click', ouvrirMediatheque)
  const tuiles = element(
    'ul',
    { class: 'ac-grille ac-chiffres', 'aria-label': 'Chiffres du site' },
    ...[
      tuile('a', { href: '#/collections/pages' }, chiffres?.pages.total, 'Pages', chiffres ? `${nombre(chiffres.pages.enPreparation)} en préparation · ${nombre(chiffres.pages.brouillons)} brouillon${chiffres.pages.brouillons > 1 ? 's' : ''}` : null),
      boutonImages,
    ].map((t) => element('li', {}, t)),
  )

  // Raccourcis
  const media = element('button', { type: 'button', class: 'ac-bouton', texte: 'Médiathèque' })
  media.addEventListener('click', ouvrirMediatheque)
  const guide = element('button', { type: 'button', class: 'ac-bouton', 'aria-haspopup': 'dialog', texte: 'Guide des directives' })
  guide.addEventListener('click', () => ouvrirGuide())
  const raccourcis = element(
    'section',
    { class: 'ac-carte', 'aria-labelledby': 'ac-raccourcis' },
    element('h2', { id: 'ac-raccourcis', texte: 'Raccourcis' }),
    element(
      'div',
      { class: 'ac-raccourcis' },
      element('a', { class: 'ac-bouton ac-plein', href: '#/collections/pages/new', texte: '+ Page' }),
      element('a', { class: 'ac-bouton', href: '#/collections/pages', texte: 'Pages et ordre du menu' }),
      element('a', { class: 'ac-bouton', href: '#/collections/accueil/entries/accueil', texte: 'Page d’accueil' }),
      element('a', { class: 'ac-bouton', href: '#/collections/abreviations/entries/abreviations', texte: 'Abréviations' }),
      media,
      guide,
    ),
  )

  // Activité récente (en ligne)
  const activiteCarte = element('section', { class: 'ac-carte', 'aria-labelledby': 'ac-activite' }, element('h2', { id: 'ac-activite', texte: 'Dernières modifications' }))
  if (local) {
    activiteCarte.append(element('p', { class: 'ac-note', texte: 'En local, les modifications ne sont pas publiées : l’historique s’affiche dans l’interface en ligne.' }))
  } else {
    const attente = element('p', { class: 'ac-note', texte: 'Chargement…' })
    activiteCarte.append(attente)
    Promise.all([activite(config, user.token), commitEnLigne()]).then(([liste, enLigne]) => {
      const etats = liste ? etatsMiseEnLigne(liste, enLigne) : []
      attente.replaceWith(
        liste?.length
          ? element(
              'ul',
              { class: 'ac-liste' },
              ...liste.map((c, i) =>
                element(
                  'li',
                  {},
                  element('span', { class: 'ac-date', title: c.date, texte: ilYa(c.date) }),
                  element(
                    'span',
                    {},
                    element('a', { href: c.url, target: '_blank', rel: 'noopener', texte: c.message }),
                    element('br'),
                    element('span', { class: 'ac-qui', texte: c.auteur }),
                    etats[i] ? element('span', { class: `ac-etat ac-etat-${etats[i].type}`, texte: etats[i].texte }) : null,
                  ),
                ),
              ),
            )
          : element('p', { class: 'ac-note', texte: 'Historique indisponible pour le moment.' }),
      )
    })
  }

  return element(
    'div',
    { id: 'accueil' },
    element('h1', { texte: 'Tableau de bord' }),
    profil,
    tuiles,
    element('div', { class: 'ac-grille ac-colonnes' }, raccourcis, activiteCarte),
    chiffres ? element('p', { class: 'ac-pied', texte: `Chiffres du dernier build : ${new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(chiffres.genereLe))}.` }) : null,
  )
}

export function installerAccueil() {
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  // Arrivée sur l'interface (et après la connexion) : le tableau de bord, pas
  // la première collection
  if (!location.hash || location.hash === '#' || location.hash === '#/') history.replaceState(null, '', ROUTE)
  // Après la connexion, Decap renvoie vers la première collection : si
  // l'arrivée visait le tableau de bord, ce premier renvoi est annulé (une
  // seule fois, dans les 3 s qui suivent l'affichage de l'interface)
  let retour = location.hash === ROUTE
  let interfaceVueA = 0
  // Un clic ou une touche dans l'interface : c'est la personne qui navigue
  // (« Contenus » vise aussi la première collection), plus de retour automatique
  for (const type of ['pointerdown', 'keydown']) {
    addEventListener(type, () => {
      if (interfaceVueA) retour = false
    }, true)
  }

  let vue = null
  let enConstruction = false

  async function synchroniser() {
    if (!interfaceVueA && document.querySelector('header[class*="-AppHeader"]')) interfaceVueA = Date.now()
    // Logo de l'en-tête : lien vers le tableau de bord
    const logo = document.querySelector('[class*="-AppHeaderLogo"]')
    if (logo && !logo.querySelector('.ac-logo')) logo.append(element('a', { class: 'ac-logo', href: ROUTE, 'aria-label': 'Tableau de bord', title: 'Tableau de bord' }))

    const actif = location.hash.replace(/\?.*$/, '') === ROUTE

    const conteneur = document.querySelector('[class*="-AppMainContainer"]')
    if (!actif || !conteneur) {
      delete document.body.dataset.accueil
      vue?.remove()
      return
    }
    document.body.dataset.accueil = ''
    if (!vue && !enConstruction) {
      enConstruction = true
      vue = await construire()
      enConstruction = false
    }
    if (vue && vue.parentElement !== conteneur) conteneur.append(vue)
    document.title = 'Tableau de bord | Rédaction'
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
  addEventListener('hashchange', () => {
    const renvoi = /^#\/?$/.test(location.hash) || /^#\/collections\/[^/?]+$/.test(location.hash)
    if (retour && renvoi && (!interfaceVueA || Date.now() - interfaceVueA < 3000)) {
      retour = false
      location.replace(ROUTE)
      return
    }
    // Toute autre navigation : plus de retour automatique
    if (!renvoi) retour = false
    // Retour au tableau de bord : chiffres et activité relus
    if (location.hash === ROUTE) {
      vue?.remove()
      vue = null
    }
    planifier()
  })
  planifier()
}
