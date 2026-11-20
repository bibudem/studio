/*
 * Images du dépôt connues de l'interface de rédaction : celles de
 * medias.json (au build), plus celles importées ou supprimées depuis
 * l'ouverture de l'interface (médiathèque, medias.js). Partagées avec la
 * vérification des images à l'enregistrement (verification-liens.js) : une
 * image importée à l'instant s'utilise tout de suite dans une page.
 */

let liste = null
const ajoutees = new Set()
const retirees = new Set()

/** Images de medias.json (chargées une fois) ; [] si indisponible */
export function chargerImages() {
  liste ??= fetch('./medias.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`medias.json : ${r.status}`))))
    .then((d) => d.images ?? [])
  return liste
}

/** Chemins des images connues, ou null si medias.json est indisponible (pas de vérification) */
export async function cheminsImages() {
  try {
    const images = await chargerImages()
    return new Set([...images.map((i) => i.chemin), ...ajoutees].filter((c) => !retirees.has(c)))
  } catch {
    return null
  }
}

export const imageAjoutee = (chemin) => (retirees.delete(chemin), ajoutees.add(chemin))
export const imageRetiree = (chemin) => (ajoutees.delete(chemin), retirees.add(chemin))
