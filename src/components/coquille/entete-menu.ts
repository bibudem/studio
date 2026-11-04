/*
 * Comportement de l'en-tête : menu (rideau), recherche, focus, Échap et clic extérieur.
 * Chargé par Entete.astro ; le balisage et les attributs data-* y sont définis.
 */
import { courbe, duree } from '@/lib/jetons'

const entete = document.querySelector<HTMLElement>('[data-entete]')!
const rideau = entete.querySelector<HTMLElement>('[data-rideau]')!
const voile = entete.querySelector<HTMLElement>('[data-voile-menu]')!
const bouton = entete.querySelector<HTMLButtonElement>('[data-bouton-menu]')!
const loupe = entete.querySelector<HTMLButtonElement>('[data-loupe]')!
const champ = rideau.querySelector<HTMLInputElement>('input[type="search"]')!
const poignee = entete.querySelector<HTMLButtonElement>('[data-fermer-menu]')!
const feuille = rideau.querySelector<HTMLElement>('.feuille')!
const deplierBouton = rideau.querySelector<HTMLButtonElement>('[data-deplier-menu]')!
// Même seuil que le CSS : au passage, le rideau ouvert n'a plus la même forme. Exception
// voulue au « matchMedia à 900 px seulement » : la barre compacte de l'en-tête va jusqu'à
// 1200 px, et le script doit fermer le rideau quand elle change de forme
const compact = matchMedia('(width < 1200px)')

// Les outils (loupe, burger) et data-menu-js sont posés par le script inline ci-dessus, avant le
// premier affichage ; sans JavaScript, la barre garde ses liens

type Mode = 'recherche' | 'complet'
let mode: Mode = 'complet'
// Bouton qui a ouvert le rideau : il reprend le focus à la fermeture
let declencheur = bouton

function majBoutons() {
  const ouvert = !rideau.hidden
  const menuEntier = ouvert && mode === 'complet'
  const recherche = ouvert && mode === 'recherche'
  bouton.setAttribute('aria-expanded', String(menuEntier))
  bouton.setAttribute('aria-label', menuEntier ? 'Fermer le menu' : 'Menu')
  loupe.setAttribute('aria-expanded', String(recherche))
  loupe.setAttribute('aria-label', recherche ? 'Fermer la recherche' : 'Rechercher')
}

function changerMode(nouveau: Mode) {
  mode = nouveau
  rideau.dataset.mode = nouveau
  poignee.setAttribute('aria-label', nouveau === 'recherche' ? 'Fermer la recherche' : 'Fermer le menu')
  majBoutons()
}

function fermer({ rendreFocus = false } = {}) {
  if (rideau.hidden) return
  rideau.hidden = voile.hidden = true
  document.documentElement.removeAttribute('data-menu-ouvert')
  majBoutons()
  if (rendreFocus) declencheur.focus()
}

function ouvrir(origine: HTMLButtonElement, nouveau: Mode) {
  declencheur = origine
  rideau.hidden = voile.hidden = false
  document.documentElement.setAttribute('data-menu-ouvert', '')
  changerMode(nouveau)
  if (nouveau === 'recherche') champ.focus({ preventScroll: true })
}

// Passage d'un mode à l'autre : le reste du menu s'efface en remontant et la feuille se rétracte, ou l'inverse.
// Durées et courbes : jetons de tokens.css. La hauteur de la feuille est animée comme celle d'un
// volet dépliable (même exception que les accordéons) : elle doit pousser son contenu.
const COURBE_ENTREE = courbe('--courbe-emphase-deceleree')
const COURBE_SORTIE = courbe('--courbe-standard-acceleree')
let animation = false
const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const autresGroupes = () => [...feuille.querySelectorAll<HTMLElement>(':scope > .surtitre-explorer, :scope > nav')]

async function changerHauteur(avant: number) {
  feuille.style.height = ''
  const apres = feuille.getBoundingClientRect().height
  // Pas de barre de défilement le temps de l'agrandissement
  feuille.style.overflowY = 'hidden'
  await feuille.animate([{ height: `${avant}px` }, { height: `${apres}px` }], { duration: duree('--duree-moyenne-2'), easing: COURBE_ENTREE }).finished.catch(() => {})
  feuille.style.overflowY = ''
}

async function replier() {
  if (reduit() || animation) {
    changerMode('recherche')
    feuille.scrollTo({ top: 0 })
    champ.focus({ preventScroll: true })
    return
  }
  animation = true
  const autres = autresGroupes()
  const avant = feuille.getBoundingClientRect().height
  feuille.style.height = `${avant}px`
  feuille.scrollTo({ top: 0, behavior: 'smooth' })
  await Promise.all(autres.map((e) => e.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -1rem' }], { duration: duree('--duree-courte-3'), easing: COURBE_SORTIE, fill: 'forwards' }).finished))
  changerMode('recherche')
  for (const e of autres) e.getAnimations().forEach((a) => a.cancel())
  champ.focus({ preventScroll: true })
  await changerHauteur(avant)
  animation = false
}

async function deplier() {
  declencheur = bouton
  if (reduit() || animation) return changerMode('complet')
  animation = true
  const avant = feuille.getBoundingClientRect().height
  feuille.style.height = `${avant}px`
  changerMode('complet')
  autresGroupes().forEach((e, i) => e.animate([{ opacity: 0, translate: '0 -1rem' }, { opacity: 1, translate: '0 0' }], { duration: duree('--duree-moyenne-2'), delay: duree('--duree-courte-1') * (1 + i), easing: COURBE_ENTREE, fill: 'backwards' }))
  await changerHauteur(avant)
  animation = false
}

bouton.addEventListener('click', () => {
  if (rideau.hidden) ouvrir(bouton, 'complet')
  else if (mode === 'complet') fermer()
  // Ouvert en mode recherche : le menu se déplie sans se refermer
  else deplier()
})
loupe.addEventListener('click', () => {
  if (rideau.hidden) ouvrir(loupe, 'recherche')
  else if (mode === 'recherche') fermer()
  else {
    declencheur = loupe
    replier()
  }
})
// Le bouton disparaît : le focus passe au premier lien apparu
deplierBouton.addEventListener('click', () => {
  deplier()
  requestAnimationFrame(() => feuille.querySelector<HTMLElement>(':scope > nav a')?.focus({ preventScroll: true }))
})
document.addEventListener('click', (e) => {
  if (!entete.contains(e.target as Node)) fermer()
})
poignee.addEventListener('click', () => fermer({ rendreFocus: true }))
voile.addEventListener('click', () => fermer())
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fermer({ rendreFocus: true })
})
// Tab hors de l'en-tête : le rideau ne doit pas masquer l'élément qui reçoit le focus (WCAG 2.4.11)
entete.addEventListener('focusout', (e) => {
  const suivant = e.relatedTarget as Node | null
  if (suivant && !entete.contains(suivant)) fermer()
})
compact.addEventListener('change', () => fermer())
