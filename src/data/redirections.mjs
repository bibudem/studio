/*
 * Anciennes adresses. Un lien externe ou un favori peut encore y mener : on
 * ne les retire pas.
 */
const SANS_GUIDE = 'accessibilite anaconda beyond2020 cariseasyview gaussian gimp hyperchem inkscape jabref jaws krita mathematica meshroom musescore openrefine pymol qgis qtgrace reaper sas stata texmaker wordstat zoom'.split(' ')

export const REDIRECTIONS = {
  '/espaces/studiovideo': '/espaces/studiosvideo',
  '/espaces/studioaudio': '/espaces/studiosbalado',
  '/creatives/impression3d/imprimantes3d': '/creatives/impression3d',
  // Logiciels sans guide : pages retirées, le catalogue indique où les trouver
  ...Object.fromEntries(SANS_GUIDE.map((nom) => [`/informatique/logiciels/${nom}`, '/informatique/logiciels'])),
}
