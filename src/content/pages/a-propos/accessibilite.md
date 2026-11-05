---
title: Accessibilité
description: "Engagements d'accessibilité de studio·bib (bibliothèques de l'UdeM) : normes WCAG et SGQRI 008, principes appliqués, outils de vérification et icônes."
image: "../images/cover/accessibilite.webp"
imageAlt: Photo par Gloria Obeid, étudiante au baccalauréat en architecture (2023)
masquerDate: true
---

Nous nous efforçons de rendre ce site accessible au plus grand nombre, conformément aux [normes WCAG (Web Content Accessibility Guidelines)](https://www.w3.org/WAI/standards-guidelines/wcag/) et au [Standard sur l'accessibilité des sites Web du gouvernement du Québec (SGQRI 008 3.0)](https://www.quebec.ca/gouvernement/ministeres-organismes/cybersecurite-numerique/publications/standard-accessibilite-sites-web).

## Principes appliqués

- Structure hiérarchique claire des pages et des titres, sans saut de niveau.
- Liens, boutons et images étiquetés, avec un texte alternatif lorsque l’image porte une information.
- Contrastes respectant le niveau AA (au moins 4,5:1 pour le texte et 3:1 pour les éléments d’interface).
- Aucune animation clignotante ou à flash lumineux. Si votre appareil est réglé pour limiter les animations, le site les réduit au minimum.
- Navigation complète au clavier, avec un lien « Aller au contenu principal » et un indicateur de focus bien visible.
- Photos agrandissables au clavier comme à la souris, dans une fenêtre qui se ferme avec la touche Échap.
- Liens qui s’ouvrent dans un nouvel onglet ou qui mènent à un fichier (PDF, par exemple) annoncés avant le clic.
- Texte agrandissable jusqu’à 200 %, et contenu qui s’adapte sans défilement horizontal, même sur un petit écran.
- Aucun raccourci clavier ni changement de contexte automatique.

## Technologies utilisées pour vérifier la conformité

- **axe-core 4.14.0** (Deque Systems) : vérification automatique de toutes les pages selon les règles WCAG 2.0, 2.1 et 2.2, niveaux A et AA, lancée par Playwright 1.64 dans Chromium.
- Vérifications automatiques des titres (un seul titre de niveau 1, aucun niveau sauté) et du débordement horizontal de la page à 390 px et à 1440 px.
<!-- À compléter avec les tests manuels réellement faits, avec le nom et la version de chaque outil : lecteurs d’écran (NVDA, VoiceOver, JAWS), navigateurs, essais au clavier seul. -->

## Signification des icônes

Les icônes accompagnent le texte et ne sont jamais le seul moyen de comprendre une information. Celles dont le sens peut être moins évident :

:::modalites
- :icone[magnifying-glass] Loupe : ouvrir la recherche dans le site. Elle devient une croix pour la fermer.
- :icone[list] Trois traits horizontaux (menu) : ouvrir le menu de navigation. Ils deviennent une croix pour le fermer.
- :icone[arrow-right] Flèche vers la droite : lien vers une autre page.
- :icone[arrow-up-right] Flèche en diagonale : lien vers un site externe. Les lecteurs d’écran annoncent « lien externe ».
- :icone[arrow-square-out] Flèche qui sort d’un carré : lien vers un site externe, qui s’ouvre dans un nouvel onglet.
- :icone[arrow-up] Flèche vers le haut : retourner en haut de la page.
- :icone[magnifying-glass-plus] Loupe dans le coin d’une photo : cliquer pour agrandir la photo.
- :icone[info] Icône dans un encadré (information, succès, attention, erreur) : type de message. Le texte de l’encadré indique toujours la même chose.
- :icone[desktop] Icône sur une carte : illustration du sujet. Elle est décorative et n’est pas lue par les lecteurs d’écran.
:::

## Technologies utilisées

Le site est développé avec [Astro](https://astro.build/), utilise les langages HTML5, CSS et JavaScript modernes, et sépare clairement contenu et présentation. Les pages restent lisibles et utilisables sans JavaScript.

<!-- Outil d’accessibilité désactivé pour l’instant ; retirer ce commentaire pour réactiver la section (voir aussi Base.astro).

## Outil d’accessibilité intégré

Ce site propose également un outil d’accessibilité permettant d’ajuster l’affichage selon vos besoins (fond chaud, police OpenDyslexic, mise en évidence des liens, etc.).

Cet outil est basé sur un projet libre développé par les [North Carolina State University Libraries](https://github.com/NCSU-Libraries-UX/readability-widget). Nous l’avons adapté, traduit et intégré à l’environnement studio·bib afin qu’il corresponde à nos usages et à notre communauté.

Les préférences sélectionnées sont conservées automatiquement lors de votre navigation.
-->

## Besoin d’aide?

Si vous rencontrez une barrière à l’accessibilité ou si vous avez besoin d’assistance pour accéder à certains contenus, [n’hésitez pas à nous contacter](/a-propos/nous-joindre). Nous ferons tout notre possible pour vous aider rapidement.
