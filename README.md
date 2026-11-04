# studio·bib

Site des services technologiques et créatifs des Bibliothèques de l'UdeM : https://studio.bib.umontreal.ca

Site statique construit avec [Astro](https://astro.build).

## Démarrer

Node 22.22 ou plus récent.

```sh
npm install
npm run dev          # http://localhost:4323
npm run build        # site statique dans dist/
npm run preview      # sert dist/
npm run verifier     # contrôle toutes les pages sur le serveur de dev
npm test             # tests unitaires
```

| Commande | Effet |
| :-- | :-- |
| `npm run dev:fond` / `dev:arreter` | Serveur de dev en arrière-plan / l'arrêter |
| `npm run dev:propre` | Après une modification d'un plugin ou du schéma : vide le cache du contenu et relance |
| `npm run cms:local` | Avec `npm run dev` : Decap CMS en local, http://localhost:4323/admin/ |

## Où se trouve quoi

| Quoi | Où |
| :-- | :-- |
| Pages (Markdown + directives) | `src/content/pages/**.md` : le chemin donne l'adresse |
| Images d'une page | `images/` à côté de la page ; partagées : `src/content/pages/images/` |
| Accueil | `src/content/accueil.yaml` |
| Encarts réutilisés | `src/content/encarts/*.yaml` |
| Menus, pied de page | `src/data/navigation.ts` |
| Données (bibliothèques, balados, redirections) | `src/data/` |
| Directives Markdown | `src/plugins/directives.mjs` (communes), `src/plugins/directives-studio.mjs` (propres au site) |
| Composants | `src/components/` (`studio/` pour ceux propres au site) |
| Jetons de design | `src/styles/tokens.css` |

- **Guide des rédacteurs : [`docs/REDACTION.md`](docs/REDACTION.md).**
- Les schémas (`src/content.config.ts`) et les directives sont stricts : une erreur de contenu fait échouer le build avec le fichier et la ligne.
- Interface de rédaction : Decap CMS sur `/admin/` ; chaque enregistrement ouvre une pull request (variables `DECAP_DEPOT`, `DECAP_ORIGINE`, `DECAP_AUTH_URL`).

## Qualité

- **Accessibilité** : WCAG 2.2 AA ; tout fonctionne sans JavaScript.
- **Sobriété** : HTML statique, bibliothèques lourdes (carte, visite 360°) chargées au besoin, images AVIF et WebP, aucun service tiers avant le consentement.
- **Trouvabilité** : données structurées, plan du site, `/llms.txt`, `/llms-full.txt` et une version Markdown de chaque page (`/page.md`).

## Déploiement

AWS Amplify (`amplify.yml`, `customHttp.yml`), sortie `dist/`. Seule la branche `production` est indexée ; ailleurs, le site est une préproduction.

## Licence

Code : MIT. Contenu : CC BY 4.0, sauf indication contraire (Les bibliothèques de l'Université de Montréal).
