/*
 * Vérification des directives du corps d'une page avant l'enregistrement
 * (garde-fou de arborescence.js, événement preSave de Decap).
 *
 * En ligne, chaque enregistrement est un commit publié par Amplify : une
 * directive mal écrite fait échouer le build, l'ancienne version reste en
 * ligne et personne n'est prévenu. On applique donc ici, dans le navigateur,
 * les mêmes règles que verifier() de src/plugins/directives.mjs : nom connu,
 * bonne forme (:::, ::, :), attributs permis, valeurs permises, attributs
 * obligatoires. Le vocabulaire vient du build (arborescence.json,
 * `directives`) : une seule source. Le texte est analysé par le même
 * analyseur que le site (remark-parse, remark-gfm et remark-directive,
 * mêmes versions que le site). Les règles de structure propres à certains blocs
 * (contenu d'un :::tableau, éléments de :::cartes…) restent vérifiées au
 * build seulement.
 */

const FORMES = { containerDirective: ':::', leafDirective: '::', textDirective: ':' }

/** Erreurs de directives d'un arbre mdast : [{ ligne, message }] */
export function verifierArbre(arbre, vocabulaire) {
  const erreurs = []
  const visiter = (noeud) => {
    const regle = vocabulaire[noeud.name]
    // Directive de texte inconnue (« voir:ici ») : un deux-points ordinaire, rendu tel quel
    if (FORMES[noeud.type] && (regle || noeud.type !== 'textDirective')) {
      const ligne = noeud.position?.start.line ?? null
      const ajouter = (message) => erreurs.push({ ligne, message })
      if (!regle) {
        ajouter(`directive inconnue « ${FORMES[noeud.type]}${noeud.name} ».`)
      } else if (regle.genre !== noeud.type) {
        ajouter(`« ${noeud.name} » s’écrit ainsi : ${regle.syntaxe}`)
      } else {
        const attributs = noeud.attributes ?? {}
        for (const [cle, valeur] of Object.entries(attributs)) {
          const permis = Object.keys(regle.attributs)
          if (!(cle in regle.attributs)) {
            ajouter(`attribut « ${cle} » inconnu pour « ${noeud.name} ». ${permis.length ? `Attributs possibles : ${permis.join(', ')}.` : 'Cette directive ne prend pas d’attribut.'}`)
            continue
          }
          const { valeurs } = regle.attributs[cle]
          if (valeurs && !valeurs.includes(valeur)) ajouter(`« ${noeud.name} » : ${cle}=${valeur} n’existe pas. Valeurs possibles : ${valeurs.join(', ')}.`)
        }
        for (const [cle, { obligatoire }] of Object.entries(regle.attributs)) {
          if (obligatoire && !attributs[cle]?.trim()) ajouter(`« ${noeud.name} » : l’attribut ${cle} est obligatoire (${regle.syntaxe}).`)
        }
      }
    }
    for (const enfant of noeud.children ?? []) visiter(enfant)
  }
  visiter(arbre)
  return erreurs
}

/** Message d'erreur lisible pour Decap (cinq erreurs au plus) */
export function messageErreurs(erreurs) {
  const lignes = erreurs.slice(0, 5).map((e) => `– ${e.ligne ? `ligne ${e.ligne} du contenu : ` : ''}${e.message}`)
  const reste = erreurs.length > 5 ? `\n… et ${erreurs.length - 5} autre${erreurs.length - 5 > 1 ? 's' : ''}.` : ''
  return `Page non enregistrée : le contenu a ${erreurs.length > 1 ? `${erreurs.length} directives à corriger` : 'une directive à corriger'} (sinon la mise en ligne échouerait).\n${lignes.join('\n')}${reste}\nSyntaxe et exemples : bouton « Guide » de la barre du contenu.`
}

// Même version que celle du site (node_modules/remark-gfm)
const VERSION_GFM = '4.0.1'

let analyseur = null
/** Analyseur Markdown + directives, chargé à la première vérification */
async function charger() {
  analyseur ??= Promise.all([import('https://esm.sh/unified@11.0.5'), import('https://esm.sh/remark-parse@11.0.0'), import('https://esm.sh/remark-directive@4.0.0'), import(`https://esm.sh/remark-gfm@${VERSION_GFM}`)]).then(([{ unified }, { default: remarkParse }, { default: remarkDirective }, { default: remarkGfm }]) => {
    const processeur = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)
    return (texte) => processeur.parse(texte)
  })
  return analyseur
}

/** Arbre mdast d'un texte Markdown (avec directives), ou null si l'analyseur ne se charge pas */
export async function analyserTexte(texte) {
  try {
    return (await charger())(texte ?? '')
  } catch (erreur) {
    analyseur = null
    console.warn('Vérification du contenu indisponible', erreur)
    return null
  }
}

/** Erreurs de directives d'un texte Markdown ; [] si l'analyseur ne se charge pas (le build reste le juge) */
export async function verifierTexte(texte, vocabulaire) {
  const arbre = await analyserTexte(texte)
  return arbre ? verifierArbre(arbre, vocabulaire) : []
}
