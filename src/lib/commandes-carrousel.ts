/*
 * Commandes d'un carrousel à défilement natif (scroll-snap) : flèches
 * Précédente et Suivante, points qui montrent la carte en cours, annonce de
 * la position. Partagé par les cartes à photo sur mobile (RenduDirectives) et
 * par le carrousel des balados (CarrouselBalados), qui affichent le même bloc
 * CommandesCarrousel sous leur rangée.
 *
 * `racine` contient la piste (`[data-piste]`, dont les enfants sont les cartes)
 * et le bloc de commandes (`[data-cc]`). Les commandes ne s'affichent que si la
 * rangée défile.
 */
export function brancherCommandes(racine: HTMLElement) {
  const piste = racine.querySelector<HTMLElement>('[data-piste]')
  const commandes = racine.querySelector<HTMLElement>('[data-cc]')
  const precedent = racine.querySelector<HTMLButtonElement>('[data-cc-precedent]')
  const suivant = racine.querySelector<HTMLButtonElement>('[data-cc-suivant]')
  const position = racine.querySelector<HTMLElement>('[data-cc-position]')
  if (!piste || !commandes || !precedent || !suivant || !position) return
  const cartes = [...piste.children] as HTMLElement[]
  const points = [...racine.querySelectorAll<HTMLElement>('[data-cc-point]')]
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)')
  const bord = () => piste.getBoundingClientRect().left + parseFloat(getComputedStyle(piste).paddingLeft)

  // Carte en cours : la plus proche du bord gauche ; au bout de la rangée, la dernière
  const courante = () => {
    if (piste.scrollLeft >= piste.scrollWidth - piste.clientWidth - 2) return cartes.length - 1
    const depart = bord()
    let meilleur = 0
    cartes.forEach((c, i) => {
      if (Math.abs(c.getBoundingClientRect().left - depart) < Math.abs(cartes[meilleur].getBoundingClientRect().left - depart)) meilleur = i
    })
    return meilleur
  }

  let precedente = -1
  const maj = () => {
    commandes.hidden = piste.scrollWidth <= piste.clientWidth + 1
    const i = courante()
    precedent.setAttribute('aria-disabled', String(i === 0))
    suivant.setAttribute('aria-disabled', String(i === cartes.length - 1))
    points.forEach((p, n) => p.toggleAttribute('data-actif', n === i))
    if (i !== precedente) {
      precedente = i
      position.textContent = `Carte ${i + 1} sur ${cartes.length}`
    }
  }

  const aller = (sens: 1 | -1) => {
    const cible = cartes[Math.min(cartes.length - 1, Math.max(0, courante() + sens))]
    piste.scrollBy({ left: cible.getBoundingClientRect().left - bord(), behavior: reduit.matches ? 'auto' : 'smooth' })
  }
  precedent.addEventListener('click', () => precedent.getAttribute('aria-disabled') !== 'true' && aller(-1))
  suivant.addEventListener('click', () => suivant.getAttribute('aria-disabled') !== 'true' && aller(1))
  piste.addEventListener('scroll', maj, { passive: true })
  new ResizeObserver(maj).observe(piste)
  maj()
}
