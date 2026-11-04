/*
 * Postes Apportez Votre Appareil (AVA) par bibliothèque (carte et liste de
 * /informatique/ava). Nom, liens et coordonnées : bibliotheques.ts.
 */
import { BIBLIOTHEQUES, type LieuService, type ServiceCarte } from './bibliotheques'

const postes = (n: number) => [{ libelle: `${n} postes`, nombre: n }]

export const lieuxAva: LieuService[] = [
  { ...BIBLIOTHEQUES.amenagement, pastilles: postes(2), details: ['Section arrière'] },
  {
    ...BIBLIOTHEQUES.droit,
    pastilles: postes(17),
    details: ['14 dans les salles de travail pour cycles supérieurs (10 avec écran standard, 4 avec écran ultralarge 21:9)', '3 dans la salle de lecture'],
  },
  { ...BIBLIOTHEQUES.hubertReeves, pastilles: postes(6), details: ['5 à la cartothèque', '1 à l’entrée A'] },
  {
    ...BIBLIOTHEQUES.lsh,
    pastilles: postes(20),
    details: [
      '1 au service Accessibilité (local 1085-2)',
      '2 au 1<sup>er</sup> étage',
      '4 au 2<sup>e</sup> étage',
      '4 au 3<sup>e</sup> étage',
      '8 au 5<sup>e</sup> étage',
      '1 au 6<sup>e</sup> étage',
    ],
  },
  { ...BIBLIOTHEQUES.mathInfo, pastilles: postes(6), details: ['Dans la zone de silence'] },
  { ...BIBLIOTHEQUES.medecineVeterinaire, pastilles: postes(2), details: ['Dans l’aire publique'] },
  { ...BIBLIOTHEQUES.sante, pastilles: postes(5), details: ['4 au 2<sup>e</sup> étage', '1 au 3<sup>e</sup> étage'] },
  { ...BIBLIOTHEQUES.tgd, pastilles: postes(3), details: ['2 au 2<sup>e</sup> étage, section de la rotonde', '1 au 3<sup>e</sup> étage'] },
]

const totalPostes = lieuxAva.reduce((total, lieu) => total + lieu.pastilles.reduce((n, p) => n + (p.nombre ?? 0), 0), 0)

export const ava: ServiceCarte = {
  service: 'des postes Apportez Votre Appareil (AVA)',
  etiquettePastilles: 'Nombre de postes',
  libelleJsonLd: 'Postes AVA',
  sousTitre: `${totalPostes} postes`,
  lieux: lieuxAva,
}
