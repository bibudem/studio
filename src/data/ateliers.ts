/*
 * Ateliers de fabrication (carte et liste de /espaces/ateliers) : les trois bibliothèques qui en
 * ont un, avec leur local. Nom, liens et coordonnées : bibliotheques.ts.
 */
import { BIBLIOTHEQUES, type LieuService, type ServiceCarte } from './bibliotheques'

export const lieuxAteliers: LieuService[] = [
  {
    ...BIBLIOTHEQUES.hubertReeves,
    emplacement: 'Campus MIL, aile A, local <span class="insecable">A-0724.4</span>.',
    pastilles: [],
    details: ['[Visite virtuelle 360°](#hr)'],
  },
  {
    ...BIBLIOTHEQUES.tgd,
    emplacement: 'Pavillon Marie-Victorin, local <span class="insecable">D-280-1</span>.',
    pastilles: [],
    details: ['[Visite virtuelle 360°](#tgd)'],
  },
  {
    ...BIBLIOTHEQUES.mathInfo,
    emplacement: 'Pavillon André-Aisenstadt, local <span class="insecable">2432</span>.',
    pastilles: [],
  },
]

export const ateliers: ServiceCarte = {
  service: 'un atelier de fabrication',
  etiquettePastilles: 'Équipements',
  libelleJsonLd: 'Atelier de fabrication',
  lieux: lieuxAteliers,
}
