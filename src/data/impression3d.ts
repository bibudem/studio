/*
 * Bibliothèques offrant l'impression 3D (carte et liste de
 * /creatives/impression3d). Nom, liens et coordonnées : bibliotheques.ts.
 */
import { BIBLIOTHEQUES, type LieuService, type ServiceCarte } from './bibliotheques'

const atelier = (local: string) => `[Atelier de fabrication](/espaces/ateliers), local <span class="insecable">${local}</span>.`

// Les deux Bambu Lab partagent un guide ; ?imprimante= ouvre directement le bon onglet
const X1C = { libelle: 'BambuLab X1C AMS', lien: '/creatives/impression3d/bambu?imprimante=x1c' }
const X2D = { libelle: 'BambuLab X2D AMS', lien: '/creatives/impression3d/bambu?imprimante=x2d' }
const PRUSA = { libelle: 'Prusa i3 MK3s+', lien: '/creatives/impression3d/prusa' }
const SATURN = { libelle: 'Elegoo Saturn 3 Ultra', lien: '/creatives/impression3d/saturn' }

export const lieuxImpression3d: LieuService[] = [
  { ...BIBLIOTHEQUES.amenagement, emplacement: 'À côté du comptoir.', pastilles: [X1C] },
  { ...BIBLIOTHEQUES.mathInfo, emplacement: atelier('2432'), pastilles: [X1C, X2D, PRUSA] },
  { ...BIBLIOTHEQUES.hubertReeves, emplacement: atelier('A-0724.4'), pastilles: [X1C, PRUSA] },
  {
    ...BIBLIOTHEQUES.tgd,
    emplacement: atelier('D-280-1'),
    pastilles: [SATURN, X1C, PRUSA],
  },
  {
    ...BIBLIOTHEQUES.sante,
    emplacement: '6<sup>e</sup> étage, à l’entrée de la bibliothèque.',
    pastilles: [
      { libelle: 'Ultimaker S3', lien: '/creatives/impression3d/ultimaker' },
      { libelle: 'Ultimaker 2', lien: '/creatives/impression3d/ultimaker' },
    ],
  },
  { ...BIBLIOTHEQUES.margueriteDYouville, pastilles: [X1C] },
  { ...BIBLIOTHEQUES.medecineVeterinaire, pastilles: [X1C] },
]

export const impression3d: ServiceCarte = {
  service: 'l’impression 3D',
  etiquettePastilles: 'Modèles disponibles',
  libelleJsonLd: 'Imprimantes 3D',
  lieux: lieuxImpression3d,
}
