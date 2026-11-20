/*
 * Collection « Pages » de Decap (imbriquée : voir src/pages/admin/config.yml.ts),
 * avec les données de arborescence.json (src/pages/admin/arborescence.json.ts) :
 *
 * - titre de la liste du dossier ouvert (« Pages › Espaces ») ;
 * - garde-fou à l'enregistrement (preSave) : Decap tire le nom d'une nouvelle
 *   page de son titre et écrit par-dessus un fichier du même nom sans
 *   prévenir ; un changement d'emplacement déplacerait la page (liens
 *   cassés) ; une directive mal écrite ou une image introuvable ferait
 *   échouer la mise en ligne (verification-directives.js,
 *   verification-liens.js). Tous sont refusés avec un message ; un lien
 *   vers une page introuvable est signalé, et enregistré si la personne
 *   confirme ;
 * - après la création d'une page (postSave) : une place dans le menu lui
 *   est proposée (ordre-pages.js).
 *
 * Le menu de gauche et la liste des pages (ordre du menu) sont dans
 * ordre-pages.js ; « Voir la page » dans apercu.js.
 */

import { installerVueOrdre } from './ordre-pages.js'
import { installerApercu } from './apercu.js'
import { analyserTexte, messageErreurs, verifierArbre } from './verification-directives.js'
import { messageImages, questionLiens, verifierLiensArbre } from './verification-liens.js'
import { cheminsImages } from './images-connues.js'

const COLLECTION = 'pages'
const RACINE = 'src/content/pages/'

/**
 * Nom de fichier qu'aura une page d'après son titre, comme le slug de Decap
 * (config.yml.ts : ascii, accents retirés, « - ») ; l'identifiant de la page
 * est son chemin (content.config.ts, generateId). Sert aussi aux noms des
 * images importées (medias.js).
 */
export function slug(texte) {
  return texte
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/þ/g, 'th')
    .replace(/[øłđð]/g, (lettre) => ({ ø: 'o', ł: 'l', đ: 'd', ð: 'd' })[lettre])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Identifiant (adresse) qu'aura une nouvelle page : dossier + titre */
function idDeNouvellePage(entry) {
  const emplacement = entry.getIn(['meta', 'path']) || '/'
  const dossier = emplacement === '/' ? '' : emplacement.replace(/^\/+|\/+$/g, '')
  return { dossier, id: [dossier, slug(entry.getIn(['data', 'title']) || '')].filter(Boolean).join('/') }
}

/**
 * `existants` : adresses prises, partagées avec ordre-pages.js (copies,
 * suppressions) ; `vocabulaire` : directives du site (verification-directives.js) ;
 * `vueOrdre` : la vue des pages, qui propose une place dans le menu à une
 * page créée.
 */
function gardeFou(existants, vocabulaire, vueOrdre, adresses) {
  const avantEnregistrement = async ({ entry }) => {
    if (entry.get('collection') !== COLLECTION) return
    const { dossier, id } = idDeNouvellePage(entry)

    if (entry.get('newRecord')) {
      if (existants.has(id)) {
        throw new Error(`L’adresse /${id}/ est déjà celle d’une page. Changez le titre de la nouvelle page (on peut le remettre après l’enregistrement) ou son emplacement.`)
      }
    } else {
      const chemin = entry.get('path') || ''
      const dossierActuel = chemin.startsWith(RACINE) ? chemin.slice(RACINE.length).split('/').slice(0, -1).join('/') : dossier
      if (dossierActuel !== dossier) {
        throw new Error('Une page existante ne change pas d’emplacement depuis l’interface de rédaction (ses liens seraient cassés). Remettez l’emplacement d’origine ; un déplacement se fait dans le dépôt.')
      }
    }

    // Contenu : directives et images (refusées, sinon la mise en ligne échoue),
    // puis liens vers des pages introuvables (enregistrement possible après confirmation)
    const arbre = await analyserTexte(entry.getIn(['data', 'body']))
    if (!arbre) return
    if (vocabulaire) {
      const erreurs = verifierArbre(arbre, vocabulaire)
      if (erreurs.length) throw new Error(messageErreurs(erreurs))
    }
    const chemin = entry.get('path')
    const dossierPage = chemin?.startsWith(RACINE) ? chemin.split('/').slice(0, -1).join('/') : `${RACINE}${dossier}`.replace(/\/+$/, '')
    const { liens, images } = verifierLiensArbre(arbre, { adresses: new Set([...adresses, ...existants]), images: await cheminsImages(), dossier: dossierPage })
    if (images.length) throw new Error(messageImages(images))
    if (liens.length && !confirm(questionLiens(liens))) throw new Error('Enregistrement annulé : corrigez les liens signalés, puis enregistrez de nouveau.')
  }

  // Page créée : son adresse est prise jusqu'au prochain chargement de
  // arborescence.json (sinon une 2e création du même titre l'écraserait),
  // et une place dans le menu lui est proposée
  const apresEnregistrement = ({ entry }) => {
    if (entry.get('collection') !== COLLECTION || !entry.get('newRecord')) return
    const chemin = entry.get('path')
    const relatif = chemin?.startsWith(RACINE) ? chemin.slice(RACINE.length).replace(/\.md$/i, '') : idDeNouvellePage(entry).id
    const id = relatif.replace(/(^|\/)index$/i, '')
    existants.add(id)
    vueOrdre?.proposerNouvellePage({
      id,
      fichier: `${RACINE}${relatif}.md`,
      titre: entry.getIn(['data', 'titreMenu']) || entry.getIn(['data', 'title']) || id,
      nonListee: Boolean(entry.getIn(['data', 'nonListee'])),
      brouillon: Boolean(entry.getIn(['data', 'brouillon'])),
      entree: `#/collections/pages/entries/${relatif.split('/').map(encodeURIComponent).join('/')}`,
      references: [],
    })
  }

  return { avantEnregistrement, apresEnregistrement }
}

/**
 * Abréviations (src/data/abreviations.yaml) : un sigle vide, avec une espace
 * ou en double ferait échouer le build (src/data/abreviations.mjs) ; refusé
 * à l'enregistrement, avec le sigle en cause.
 */
export function erreursAbreviations(sigles) {
  const vus = new Set()
  const erreurs = []
  sigles.forEach((s, i) => {
    const sigle = String(s?.sigle ?? '').trim()
    if (!sigle) erreurs.push(`sigle ${i + 1} : le sigle est vide.`)
    else if (/\s/.test(sigle)) erreurs.push(`« ${sigle} » : un sigle s’écrit sans espace.`)
    else if (vus.has(sigle)) erreurs.push(`« ${sigle} » est en double.`)
    if (sigle && !String(s?.forme ?? '').trim()) erreurs.push(`« ${sigle} » : la forme développée est vide.`)
    vus.add(sigle)
  })
  return erreurs
}

function gardeAbreviations({ entry }) {
  if (entry.get('collection') !== 'abreviations') return
  const erreurs = erreursAbreviations(entry.getIn(['data', 'sigles'])?.toJS?.() ?? [])
  if (erreurs.length) throw new Error(`Abréviations non enregistrées :\n– ${erreurs.slice(0, 5).join('\n– ')}`)
}

/*
 * Titre de la liste : « Pages › Créatives › Textile » quand un dossier est
 * ouvert. Le titre appartient à React : on n'y touche pas, une règle CSS
 * ajoute la suite d'après l'attribut data-dossier du body (adresse courante).
 */
function titreDuDossier(dossiers) {
  const css = dossiers
    .filter(({ chemin }) => chemin !== '/')
    .map(({ chemin, libelle }) => `body[data-dossier=${JSON.stringify(chemin)}] h1[class*="CollectionTopHeading"]::after { content: ${JSON.stringify(' › ' + libelle)}; }`)
    .join('\n')
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
}

/** Dossier ouvert (attribut data-dossier du body), pour le titre de la liste */
function suivreDossier() {
  const suivre = () => {
    const ouverte = location.hash.match(/^#\/collections\/pages(?:\/filter\/([^?]*))?/)
    let dossier = ''
    try {
      dossier = ouverte?.[1] ? decodeURIComponent(ouverte[1]).replace(/\/+$/, '') : ''
    } catch {
      dossier = ''
    }
    document.body.dataset.dossier = dossier
  }
  addEventListener('hashchange', suivre)
  suivre()
}

/** `YAML` : la bibliothèque yaml (v2), pour la vue « Ordre des pages » */
export async function preparerArborescence(CMS, YAML) {
  try {
    const reponse = await fetch('./arborescence.json')
    if (!reponse.ok) throw new Error(`arborescence.json : ${reponse.status}`)
    const donnees = await reponse.json()
    const { dossiers, ids } = donnees
    titreDuDossier(dossiers)
    suivreDossier()
    const pris = new Set(ids)
    const vueOrdre = installerVueOrdre(donnees, YAML, pris)
    installerApercu(donnees.apercus ?? {})
    const { avantEnregistrement, apresEnregistrement } = gardeFou(pris, donnees.directives, vueOrdre, donnees.adresses ?? [])
    CMS.registerEventListener({ name: 'preSave', handler: avantEnregistrement })
    CMS.registerEventListener({ name: 'preSave', handler: gardeAbreviations })
    return donnees
    CMS.registerEventListener({ name: 'postSave', handler: apresEnregistrement })
  } catch (erreur) {
    // L'interface reste utilisable : menu et liste de Decap, sans garde-fou
    console.error('Arborescence des pages non chargée', erreur)
    return null
  }
}
