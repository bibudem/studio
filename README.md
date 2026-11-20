<img src="public/img/logo-studiobib.svg" alt="studio·bib" width="96" />

# studio·bib

Site des services technologiques et créatifs des Bibliothèques de l'UdeM : https://studio.bib.umontreal.ca

Site statique [Astro](https://astro.build), habillé par [Harmonium](https://bibudem.github.io/harmonium/), le système de design des sites des Bibliothèques.

## Démarrer

Node 22.23 ou plus récent.

```sh
npm install
npm run dev        # http://localhost:4323
npm run build      # site statique dans dist/
npm test           # tests unitaires
npm run verifier   # contrôle toutes les pages sur le serveur de dev
```

`npm run dev:propre` vide le cache du contenu après une modification d'un plugin ou du schéma.

## Rédaction

- Une page = un fichier Markdown dans `src/content/pages/` ; le menu est dans `src/data/navigation.yaml`.
- Interface de rédaction (Decap CMS) : `/admin/`. En local : `npm run dev`, puis `npm run cms:local`, puis http://localhost:4323/admin/.

## Harmonium

Paquet `harmonium` (version fixée dans `package.json`). Le site en utilise pour l'instant :

| | |
| :-- | :-- |
| Jetons | `jetons.css` : couleurs, polices, rayons, ombres (aussi dans l'interface de rédaction) |
| Coquille | `LienEvitement`, `FilAriane`, `PiedDePage`, `EtatErreur` |
| Contenu | `Alerte`, `Bouton`, `Citation`, `Copier`, `Separateur`, `Modalites` / `Modalite`, `Pastilles`, `Video`, `Integration`, `HoraireSemaine` |
| Cartes | `CarteIcone`, `CarteImage`, `CartePhoto` |
| Listes | `ListeFiltrable`, `FicheFiltrable` |
| Icônes | `IconeUdeM`, `IconeSofia`, `IconeFlecheDroiteCercle`, `IconeFlecheGaucheCercle`, `IconeFlecheHautDroiteCercle` |
| Scripts | `bib-avis`, `bib-clavardage`, `bib-consentement`, `bib-copier`, `bib-horaire-semaine`, `bib-integration`, `bib-liste-filtrable`, `bib-pied-de-page`, `bib-sceau`, `bib-video`, `udem-urgence` |

Les composants propres à studio·bib (carte des bibliothèques, catalogue de logiciels, visite 360°, onglets…) sont dans `src/components/studio/`.

## Déploiement

AWS Amplify (`amplify.yml`, `customHttp.yml`), sortie `dist/`. La branche `main` est le site public ; l'interface de rédaction y enregistre directement, et chaque enregistrement est en ligne après la reconstruction.

Page 404 : dans la console Amplify (**Hosting** → **Rewrites and redirects**), en dernière règle : source `/<*>`, cible `/404.html`, type `404 (Rewrite)`.

## Licence

Code : MIT. Contenu : CC BY 4.0, sauf indication contraire (Les bibliothèques de l'Université de Montréal).

---

Ce site a été conçu avec l'aide de l'intelligence artificielle (Claude, d'Anthropic).
