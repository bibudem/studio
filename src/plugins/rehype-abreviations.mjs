import { ABREVIATIONS } from '../data/abreviations.mjs'

/*
 * Abréviations (WCAG 3.1.4, exigé par le SGQRI 008 3.0) : dans chaque page, la
 * première occurrence de chaque sigle de src/data/abreviations.mjs devient
 * <abbr title="forme développée">. Les suivantes restent du texte simple.
 *
 * Ignorés : le code (code, pre, kbd), une abbr déjà posée à la main, et un
 * sigle collé à une lettre, un chiffre ou un trait d'union (BIB-BLSH-5123,
 * MK3S…), qui fait partie d'un nom ou d'un code.
 */

const IGNORES = new Set(['code', 'pre', 'kbd', 'abbr', 'script', 'style', 'svg'])

const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const sigles = Object.keys(ABREVIATIONS).sort((a, b) => b.length - a.length)
const MOTIF = new RegExp(`(?<![\\p{L}\\p{N}-])(?:${sigles.map(echapper).join('|')})(?![\\p{L}\\p{N}-])`, 'gu')

export default function rehypeAbreviations() {
  return (arbre) => {
    const vus = new Set()

    const traiter = (parent) => {
      if (!parent.children) return
      const enfants = []
      for (const enfant of parent.children) {
        if (enfant.type === 'element') {
          if (!IGNORES.has(enfant.tagName)) traiter(enfant)
          enfants.push(enfant)
          continue
        }
        if (enfant.type !== 'text') {
          enfants.push(enfant)
          continue
        }
        let reste = enfant.value
        let debut = 0
        for (const m of enfant.value.matchAll(MOTIF)) {
          if (vus.has(m[0])) continue
          vus.add(m[0])
          const avant = enfant.value.slice(debut, m.index)
          if (avant) enfants.push({ type: 'text', value: avant })
          enfants.push({
            type: 'element',
            tagName: 'abbr',
            properties: { title: ABREVIATIONS[m[0]] },
            children: [{ type: 'text', value: m[0] }],
          })
          debut = m.index + m[0].length
          reste = enfant.value.slice(debut)
        }
        if (debut === 0) enfants.push(enfant)
        else if (reste) enfants.push({ type: 'text', value: reste })
      }
      parent.children = enfants
    }

    traiter(arbre)
  }
}
