/*
 * Fichiers CSV de public/data/, lus au build : les tableaux et le catalogue
 * des logiciels sont dans le HTML, sans requête ni bibliothèque côté
 * navigateur. Le fichier reste servi tel quel dans public/ (téléchargeable).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Analyse RFC 4180 : champs entre guillemets, "" pour un guillemet, sauts de ligne dans un champ */
export function analyserCsv(texte: string): string[][] {
  const rangees: string[][] = []
  let rangee: string[] = []
  let champ = ''
  let entreGuillemets = false
  const source = texte.replace(/^﻿/, '')
  for (let i = 0; i < source.length; i++) {
    const c = source[i]
    if (entreGuillemets) {
      if (c === '"' && source[i + 1] === '"') {
        champ += '"'
        i++
      } else if (c === '"') entreGuillemets = false
      else champ += c
    } else if (c === '"') entreGuillemets = true
    else if (c === ',') {
      rangee.push(champ)
      champ = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && source[i + 1] === '\n') i++
      rangee.push(champ)
      if (rangee.some((v) => v.trim())) rangees.push(rangee)
      rangee = []
      champ = ''
    } else champ += c
  }
  rangee.push(champ)
  if (rangee.some((v) => v.trim())) rangees.push(rangee)
  return rangees.map((r) => r.map((v) => v.trim()))
}

/** Rangées d'un CSV de public/ (`/data/fichier.csv`) ; erreur claire s'il manque */
export function lireCsvPublic(source: string): string[][] {
  if (!/^\/[\w/.-]+\.csv$/.test(source)) throw new Error(`CSV « ${source} » : donnez un chemin de public/, par exemple /data/fichier.csv.`)
  try {
    return analyserCsv(readFileSync(join(process.cwd(), 'public', source), 'utf8'))
  } catch (erreur) {
    throw new Error(`CSV introuvable ou illisible dans public/ : ${source} (${erreur})`)
  }
}

/** Rangées en objets, d'après la ligne d'en-tête */
export function lireCsvObjets(source: string): Record<string, string>[] {
  const [entetes = [], ...rangees] = lireCsvPublic(source)
  return rangees.map((r) => Object.fromEntries(entetes.map((cle, i) => [cle, r[i] ?? ''])))
}
