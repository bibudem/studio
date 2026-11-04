/*
 * Analyse d'une adresse de lien, partagée par Link, Button,
 * ListeRicheElementLien et les cartes.
 *
 * La « famille
 * Bibliothèques » (bib.umontreal.ca, bib-pp, bib-prod et leurs sous-domaines)
 * compte comme interne pour le choix des icônes, et mailto:, tel: (origine
 * nulle) comme externes. Tout lien finit dans un <a> ordinaire.
 */

const HOTES_INTERNES: (string | RegExp)[] = [
  'bib.umontreal.ca',
  /\.bib\.umontreal\.ca$/,
  'bib-pp.umontreal.ca',
  /\.bib-pp\.umontreal\.ca$/,
  'bib-prod.umontreal.ca',
  /\.bib-prod\.umontreal\.ca$/,
]

export type AnalyseLien = {
  /** Chemin du site ou adresse de la famille Bibliothèques */
  interne: boolean
  /** mailto: ou tel: */
  courrielOuTelephone: boolean
  /** Le fichier visé est un PDF (l'icône vient du CSS global) */
  pdf: boolean
}

export function analyserLien(adresse: string | undefined | null): AnalyseLien {
  const href = (adresse ?? '').trim()
  const courrielOuTelephone = /^(mailto|tel):/i.test(href)
  // Même détection que le CSS global (href$=.pdf, .pdf#, .pdf?)
  const pdf = /\.pdf([?#]|$)/i.test(href)
  let interne = false
  try {
    const url = new URL(href, 'https://bib.umontreal.ca')
    interne = url.origin !== 'null' && HOTES_INTERNES.some((hote) => (typeof hote === 'string' ? url.hostname === hote : hote.test(url.hostname)))
  } catch {
    interne = false
  }
  return { interne, courrielOuTelephone, pdf }
}

/**
 * Le lien mène-t-il ailleurs (flèche oblique ↗) ? Oui pour une adresse hors de la famille
 * Bibliothèques, ou pour un lien qui s'ouvre dans un nouvel onglet (même vers
 * calendrier.bib.umontreal.ca). Jamais pour un PDF (son icône vient du CSS) ni pour un
 * courriel ou un téléphone. Seule règle du site : liens, boutons et cartes l'appliquent.
 */
export function versAilleurs({ interne, courrielOuTelephone, pdf }: AnalyseLien, nouvelOnglet = false) {
  return !pdf && !courrielOuTelephone && (!interne || nouvelOnglet)
}

/** Texte masqué qui annonce ce que la vue seule laisse deviner (PDF, onglet) */
export function annonceLien({ pdf, nouvelOnglet }: { pdf: boolean; nouvelOnglet: boolean }) {
  const parties = [pdf && 'PDF', nouvelOnglet && 'nouvel onglet'].filter(Boolean)
  return parties.length ? ` (${parties.join(', ')})` : ''
}

/*
 * Lien d'une carte : l'analyse est calculée au build, plus d'icône ni de
 * `rel` qui changent après l'hydratation.
 */

/** Attributs et annonce d'un lien de carte */
export function lienCarte(href: string, target?: string, rel?: string) {
  const analyse = analyserLien(href)
  const { interne, pdf } = analyse
  const nouvelOnglet = target === '_blank'
  const rels = new Set((rel ?? '').split(/\s+/).filter(Boolean))
  if (!interne || nouvelOnglet) rels.add('noopener')
  return {
    interne,
    externe: versAilleurs(analyse, nouvelOnglet),
    rel: rels.size ? [...rels].join(' ') : undefined,
    annonce: annonceLien({ pdf, nouvelOnglet }),
  }
}
