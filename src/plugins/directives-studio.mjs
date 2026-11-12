import { visit } from 'unist-util-visit'
import { messageIconeInconnue, trouverIcone } from './icones.mjs'

/*
 * Directives propres à studio·bib, ajoutées au vocabulaire commun des
 * directives (directives.mjs). Même principe : chaque directive est vérifiée au
 * build, puis marquée ; RenduDirectives.astro la confie à RenduStudio.astro,
 * qui la rend par son composant (src/components/studio/).
 *
 * Guide des rédacteurs : docs/REDACTION.md. Garder directives.mjs aussi
 * proche que possible de l'original : tout ajout propre à studio·bib va ici.
 */

const drapeau = { drapeau: true }

export const VOCABULAIRE_STUDIO = {
  onglets: { genre: 'containerDirective', syntaxe: '::::onglets{groupe=os} puis un :::onglet[Libellé] par volet', attributs: { groupe: {}, url: drapeau } },
  onglet: { genre: 'containerDirective', syntaxe: ':::onglet[Libellé]{valeur=windows defaut}', attributs: { valeur: {}, defaut: drapeau } },
  'masquer-si': { genre: 'containerDirective', syntaxe: ':::masquer-si{groupe=os valeur=iOS}', attributs: { groupe: { obligatoire: true }, valeur: { obligatoire: true } } },
  lieu: { genre: 'containerDirective', syntaxe: ':::lieu{titre="Bibliothèque…" carte=https://maps…} puis ::adresse[…], le texte et des ::bouton', attributs: { titre: { obligatoire: true }, carte: {}, lien: {} } },
  adresse: { genre: 'leafDirective', syntaxe: '::adresse[Pavillon…, local…] (dans un :::lieu)', attributs: {} },
  'parcours-reservation': { genre: 'containerDirective', syntaxe: ':::parcours-reservation{reservation=… accompagnement=… guide=/medias/…} (texte : réserver sans technicien)', attributs: { reservation: { obligatoire: true }, accompagnement: { obligatoire: true }, guide: { obligatoire: true } } },
  disponibilites: { genre: 'containerDirective', syntaxe: ':::disponibilites puis un ::disponibilite[Bibliothèque]{oclc=123} par ligne', attributs: {} },
  disponibilite: { genre: 'leafDirective', syntaxe: '::disponibilite[Bibliothèque]{oclc=1234567}', attributs: { oclc: { obligatoire: true } } },
  colonnes: { genre: 'containerDirective', syntaxe: '::::colonnes puis un :::colonne par colonne', attributs: {} },
  colonne: { genre: 'containerDirective', syntaxe: ':::colonne', attributs: {} },
  video: { genre: 'leafDirective', syntaxe: '::video[Titre de la vidéo]{youtube=ID} (ou loom=ID, fichier=/videos/x.mp4, integration=https://… pour une autre plateforme)', attributs: { youtube: {}, loom: {}, fichier: {}, integration: {} } },
  copier: { genre: 'textDirective', syntaxe: ':copier[texte à copier]', attributs: {} },
  encart: { genre: 'leafDirective', syntaxe: '::encart{nom=droit-auteur} (src/content/encarts/)', attributs: { nom: { obligatoire: true } } },
  pano360: { genre: 'leafDirective', syntaxe: '::pano360[Titre]{image=/img/pano/x.webp alt="…" legende="…"}', attributs: { image: { obligatoire: true }, alt: { obligatoire: true }, legende: {} } },
  'carte-bibliotheques': { genre: 'leafDirective', syntaxe: '::carte-bibliotheques{lieux=ava} (ou impression3d, ateliers)', attributs: { lieux: { obligatoire: true, valeurs: ['ateliers', 'ava', 'impression3d'] } } },
  'catalogue-logiciels': { genre: 'leafDirective', syntaxe: '::catalogue-logiciels', attributs: {} },
  'postes-disponibles': { genre: 'leafDirective', syntaxe: '::postes-disponibles{zone=AdobePro titre="Adobe Acrobat Pro"}', attributs: { zone: { obligatoire: true }, titre: {} } },
  'horaire-soutien': { genre: 'leafDirective', syntaxe: '::horaire-soutien{bibliotheque=ss}', attributs: { bibliotheque: { obligatoire: true } } },
  clavardage: { genre: 'leafDirective', syntaxe: '::clavardage{hash=…}', attributs: { hash: { obligatoire: true } } },
  'tableau-donnees': { genre: 'leafDirective', syntaxe: '::tableau-donnees[Nom du tableau]{source=/data/fichier.csv}', attributs: { source: { obligatoire: true } } },
  'carrousel-balados': { genre: 'leafDirective', syntaxe: '::carrousel-balados (src/data/balados.ts)', attributs: {} },
  telecommande: { genre: 'containerDirective', syntaxe: ':::telecommande[Prompteur] puis une liste, une touche par élément : - :icone[arrow-up] **Touche** : effet (« - (touche non utilisée) » pour une touche vide)', attributs: {} },
  'image-interactive': { genre: 'leafDirective', syntaxe: '::image-interactive{nom=resolve}', attributs: { nom: { obligatoire: true } } },
  legende: { genre: 'containerDirective', syntaxe: ':::legende puis une liste, un élément par icône : - ![Ce que montre l’icône](./images/icone.webp) **Nom** : description (ou :icone[nom] au lieu de l’image ; une liste décalée de deux espaces sous l’élément pour ses sous-menus ; forme=panneau : un seul cadre, une rangée par icône)', attributs: { forme: { valeurs: ['panneau'] } } },
}

const texteDe = (n) => n.value ?? (n.children ?? []).map(texteDe).join('')

/** Libellé [entre crochets] d'une directive conteneur, retiré de ses enfants */
function retirerLabel(noeud) {
  const premier = noeud.children[0]
  if (!premier?.data?.directiveLabel) return ''
  noeud.children.shift()
  return texteDe(premier).trim()
}

/*
 * Directives qui portent des titres : ils se placent juste sous le titre qui précède la
 * directive (WCAG 1.3.1, pas de saut de niveau). Communes (liens, cartes) et propres au site
 * (fiches de lieu, titres des panneaux d'onglets, titres des groupes de postes).
 */
export const DIRECTIVES_TITREES = ['liens', 'cartes', 'lieu', 'onglets', 'postes-disponibles']

const ENFANTS = { onglets: 'onglet', disponibilites: 'disponibilite', colonnes: 'colonne' }
const PARENTS = { onglet: 'onglets', disponibilite: 'disponibilites', colonne: 'colonnes', adresse: 'lieu' }

/**
 * Vérifie et marque une directive de studio·bib.
 * `outils` vient de directives.mjs : { marquer, fichier, parent }.
 */
export function traiterStudio(noeud, attributs, { marquer, fichier, parent }) {
  const nom = noeud.name
  if (PARENTS[nom] && parent?.name !== PARENTS[nom]) fichier.fail(`« ${nom} » se place dans :::${PARENTS[nom]} (${VOCABULAIRE_STUDIO[PARENTS[nom]].syntaxe}).`, noeud)
  if (ENFANTS[nom]) {
    const intrus = noeud.children.find((e) => e.name !== ENFANTS[nom])
    if (intrus || !noeud.children.length) fichier.fail(`« ${nom} » ne contient que des ${ENFANTS[nom]} : ${VOCABULAIRE_STUDIO[nom].syntaxe}`, intrus ?? noeud)
  }
  const a = { ...attributs }
  for (const [cle, regle] of Object.entries(VOCABULAIRE_STUDIO[nom].attributs)) if (regle.drapeau) a[cle] = cle in attributs
  switch (nom) {
    case 'onglet': {
      a.libelle = retirerLabel(noeud)
      if (!a.libelle) fichier.fail(`« onglet » : le libellé est obligatoire (${VOCABULAIRE_STUDIO.onglet.syntaxe}).`, noeud)
      a.valeur ||= a.libelle
      break
    }
    case 'disponibilite':
      if (!/^\d+$/.test(a.oclc ?? '')) fichier.fail(`« disponibilite » : oclc=${a.oclc} doit être un numéro OCLC.`, noeud)
      a.libelle = texteDe(noeud).trim()
      noeud.children = []
      break
    case 'video': {
      a.titre = texteDe(noeud).trim()
      if (!a.titre) fichier.fail(`« video » : le titre de la vidéo est obligatoire, entre crochets (${VOCABULAIRE_STUDIO.video.syntaxe}).`, noeud)
      const sources = ['youtube', 'loom', 'fichier', 'integration'].filter((s) => a[s])
      if (sources.length !== 1) fichier.fail(`« video » : donnez une seule source : youtube=…, loom=…, fichier=… ou integration=… (${VOCABULAIRE_STUDIO.video.syntaxe}).`, noeud)
      noeud.children = []
      break
    }
    case 'pano360':
      a.titre = texteDe(noeud).trim()
      noeud.children = []
      break
    case 'tableau-donnees':
      // Le nom entre crochets nomme le tableau pour les lecteurs d'écran
      a.titre = texteDe(noeud).trim() || undefined
      if (!a.titre) fichier.fail(`« tableau-donnees » : nommez le tableau entre crochets (${VOCABULAIRE_STUDIO['tableau-donnees'].syntaxe}).`, noeud)
      noeud.children = []
      break
    case 'copier':
      a.texte = texteDe(noeud)
      noeud.children = []
      break
    case 'telecommande': {
      a.titre = retirerLabel(noeud)
      const liste = noeud.children[0]
      if (noeud.children.length !== 1 || liste.type !== 'list') fichier.fail(`« telecommande » contient seulement une liste (${VOCABULAIRE_STUDIO.telecommande.syntaxe}).`, noeud)
      // Une touche par élément, dans l'ordre de la grille : l'icône est retirée
      // du texte et passée en attribut ; un élément sans **nom** est une touche vide
      a.touches = liste.children.map((element) => {
        const paragraphe = element.children[0]
        const premier = paragraphe?.type === 'paragraph' ? paragraphe.children[0] : undefined
        const nomme = paragraphe?.type === 'paragraph' && paragraphe.children.some((n) => n.type === 'strong')
        if (premier?.type === 'textDirective' && premier.name === 'icone') {
          const icone = texteDe(premier).trim()
          if (!trouverIcone(icone)) fichier.fail(messageIconeInconnue(icone), premier)
          paragraphe.children.shift()
          const suivant = paragraphe.children[0]
          if (suivant?.type === 'text') {
            suivant.value = suivant.value.replace(/^\s+/, '')
            if (!suivant.value) paragraphe.children.shift()
          }
          if (paragraphe.children[0]?.type !== 'strong') fichier.fail(`« telecommande » : après l'icône, le nom de la touche en gras (${VOCABULAIRE_STUDIO.telecommande.syntaxe}).`, element)
          return { icone }
        }
        if (nomme) fichier.fail(`« telecommande » : chaque touche commence par son icône, :icone[nom] (${VOCABULAIRE_STUDIO.telecommande.syntaxe}).`, element)
        return { vide: true }
      })
      if (!a.touches.some((t) => !t.vide)) fichier.fail(`« telecommande » : aucune touche (${VOCABULAIRE_STUDIO.telecommande.syntaxe}).`, noeud)
      break
    }
    case 'legende': {
      const liste = noeud.children[0]
      if (noeud.children.length !== 1 || liste.type !== 'list') fichier.fail(`« legende » contient seulement une liste (${VOCABULAIRE_STUDIO.legende.syntaxe}).`, noeud)
      elementsLegende(liste, { marquer, fichier })
      break
    }
    default:
      if (noeud.type === 'leafDirective' && nom !== 'adresse') noeud.children = []
  }
  marquer(noeud, nom, a)
}

/*
 * :::legende : chaque élément devient une rangée « visuel + texte ». Le visuel
 * (image ou :icone[nom]) est sorti du texte dans son propre conteneur ; une
 * liste imbriquée (sous-menus) reste sous l'élément, à toute profondeur.
 * Le rendu (Legende.astro) ne fait que la mise en page de ce HTML.
 */
const enveloppe = (balise, classe, children) => ({ type: 'paragraph', data: { hName: balise, hProperties: { className: [classe] } }, children })

function elementsLegende(liste, { marquer, fichier }, profondeur = 0) {
  const syntaxe = VOCABULAIRE_STUDIO.legende.syntaxe
  liste.data = { ...liste.data, hProperties: { className: [profondeur ? 'legende-sous' : 'legende-liste'] } }
  for (const element of liste.children) {
    const [paragraphe, ...sous] = element.children
    const morceaux = paragraphe?.type === 'paragraph' ? paragraphe.children.filter((n) => !(n.type === 'text' && !n.value.trim())) : []
    const [visuel, ...texte] = morceaux
    let blocVisuel
    if (visuel?.type === 'image') {
      // Petite image sans agrandissement au clic (comme ![](… "icone"))
      visuel.title = 'icone'
      blocVisuel = enveloppe('span', 'legende-visuel', [visuel])
    } else if (visuel?.type === 'textDirective' && visuel.name === 'icone') {
      const icone = texteDe(visuel).trim()
      if (!trouverIcone(icone)) fichier.fail(messageIconeInconnue(icone), visuel)
      blocVisuel = enveloppe('span', 'legende-visuel', [])
      marquer(blocVisuel, 'legende-icone', { icone })
    } else {
      fichier.fail(`« legende » : chaque élément commence par une image ou une icône (${syntaxe}).`, element)
    }
    if (texte[0]?.type === 'text') texte[0].value = texte[0].value.replace(/^\s+/, '')
    if (!texte.map(texteDe).join('').trim()) fichier.fail(`« legende » : après l'image ou l'icône, le nom ou la description (${syntaxe}).`, element)
    for (const n of sous) {
      if (n.type !== 'list') fichier.fail(`« legende » : sous un élément, seulement une liste de sous-menus, décalée de deux espaces (${syntaxe}).`, n)
      elementsLegende(n, { marquer, fichier }, profondeur + 1)
    }
    element.children = [blocVisuel, enveloppe('div', 'legende-texte', texte), ...sous]
  }
}

/* ---------- HTML permis dans le Markdown ---------- */

// Quelques balises de texte et les commentaires ; pour le reste, une directive
const HTML_PERMIS = /^(?:<!--[\s\S]*?-->|<\/?(?:sup|sub|kbd|br|abbr(?: title="[^"]*")?)\s*\/?>)$/i

/**
 * Refuse le HTML de mise en page dans un .md : un besoin récurrent devient une
 * directive, documentée dans docs/REDACTION.md.
 */
export function remarkHtmlPermis() {
  return (arbre, fichier) => {
    visit(arbre, 'html', (noeud) => {
      const valeur = noeud.value.trim()
      if (valeur.startsWith('<!--')) return
      for (const morceau of valeur.split(/(?=<)/).map((m) => m.trim()).filter(Boolean)) {
        const balise = morceau.match(/^<\/?[^>]*>/)?.[0] ?? morceau
        if (!HTML_PERMIS.test(balise)) fichier.fail(`HTML non permis dans une page Markdown : « ${balise.slice(0, 60)} ». Permis : <sup>, <sub>, <kbd>, <br>, <abbr>. Pour le reste, utilisez une directive (docs/REDACTION.md).`, noeud)
      }
    })
  }
}
