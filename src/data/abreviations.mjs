import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

/*
 * Sigles et abréviations développés dans les pages (WCAG 3.1.4, exigé par le
 * SGQRI 008 3.0). Le plugin src/plugins/rehype-abreviations.mjs entoure la
 * première occurrence de chacun, dans chaque page, d'un
 * <abbr title="forme développée">.
 *
 * Les sigles sont dans src/data/abreviations.yaml, modifiable dans
 * l'interface de rédaction (/admin/, « Abréviations ») ; ce module le lit et
 * le vérifie : une erreur fait échouer le build, avec le sigle en cause.
 * Exclus volontairement :
 * - UdeM, HEC, UQAM, Campus MIL : noms d'établissements, connus ;
 * - noms et modèles de produits (OBS, SPSS, QDA Miner, Sennheiser HD 280…) ;
 * - sigles ambigus selon la page (PC : ordinateur ou polycarbonate ; CA, BB…).
 */

const FICHIER = 'src/data/abreviations.yaml'

/** Thèmes de classement proposés dans l'interface de rédaction */
export const THEMES = ['Lieux et services', 'Accessibilité', 'Informatique et réseau', 'Connectique, supports et formats', 'Image, son et vidéo', 'Électronique', 'Impression 3D', 'Jeux et licences', 'Autres']

/** Sigles du fichier YAML, vérifiés : { sigle: forme développée } */
export function lireAbreviations(texte) {
  const donnees = parse(texte) ?? {}
  if (!Array.isArray(donnees.sigles)) throw new Error(`${FICHIER} : la clé « sigles » est une liste.`)
  const resultat = {}
  donnees.sigles.forEach((entree, i) => {
    const sigle = typeof entree?.sigle === 'string' ? entree.sigle.trim() : ''
    const forme = typeof entree?.forme === 'string' ? entree.forme.trim() : ''
    const ou = `${FICHIER}, sigle ${i + 1}${sigle ? ` (${sigle})` : ''}`
    if (!sigle) throw new Error(`${ou} : le sigle est vide.`)
    if (/\s/.test(sigle)) throw new Error(`${ou} : un sigle s'écrit sans espace.`)
    if (!forme) throw new Error(`${ou} : la forme développée est vide.`)
    if (Object.hasOwn(resultat, sigle)) throw new Error(`${ou} : sigle en double.`)
    resultat[sigle] = forme
  })
  return resultat
}

// Depuis la racine du projet (build, serveur de dev, tests)
export const ABREVIATIONS = lireAbreviations(readFileSync(join(process.cwd(), FICHIER), 'utf8'))
