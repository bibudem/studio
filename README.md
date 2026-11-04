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


## Qualité

- **Accessibilité** : WCAG 2.2 AA ; tout fonctionne sans JavaScript.
- **Sobriété** : HTML statique, bibliothèques lourdes (carte, visite 360°) chargées au besoin, images AVIF et WebP, aucun service tiers avant le consentement.
- **Trouvabilité** : données structurées, plan du site, `/llms.txt`, `/llms-full.txt` et une version Markdown de chaque page (`/page.md`).

## Déploiement

AWS Amplify (`amplify.yml`, `customHttp.yml`), sortie `dist/`. La branche `main` est le site public (seule indexée) ; Decap CMS y enregistre directement. Ailleurs, le site est une préproduction.

Page 404 : une règle de la console Amplify (**Hosting** → **Rewrites and redirects**) sert `404.html` pour toute adresse inconnue. À placer en dernier : source `/<*>`, cible `/404.html`, type `404 (Rewrite)`.

## Licence

Code : MIT. Contenu : CC BY 4.0, sauf indication contraire (Les bibliothèques de l'Université de Montréal).
