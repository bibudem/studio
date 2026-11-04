---
title: Structure et directives
description: Page de développement qui montre chaque directive de structure de studio·bib et ses variantes.
nonListee: true
---

Page de vérification : onglets, masquer-si, lieu, parcours de réservation, disponibilités, colonnes, vidéo, copier et encarts.

## Onglets synchronisés et imbriqués

Le proxy se configure avec :copier[https://proxy.umontreal.ca] dans le navigateur.

::::::onglets{groupe=os-tabs}

:::::onglet[Windows]{valeur=Windows}

::::onglets{groupe=Windows}

:::onglet[Windows 11]{valeur=Windows11}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy**.
2. Saisir :copier[https://proxy.umontreal.ca].
:::

:::onglet[Windows 10]{valeur=Windows10}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy**.
2. Activer **Utiliser un script d’installation**.
:::

::::

:::::

:::::onglet[macOS]{valeur=macOS defaut}
Sur macOS, utilisez Chrome, Firefox, Edge ou Brave plutôt que Safari.

[Un lien dans le panneau](/a-propos/)
:::::

:::::onglet[iOS et iPadOS]{valeur=iOS}
Sur iPhone et iPad, utilisez le VPN plutôt que le proxy.
:::::

::::::

:::masquer-si{groupe=os-tabs valeur=iOS}
### Étape 2 : tester le proxy

Ce texte est masqué quand l’onglet iOS est choisi.
:::

Second jeu du même groupe (synchronisé avec le premier) :

::::onglets{groupe=os-tabs}

:::onglet[Windows]
Rappel pour Windows.
:::

:::onglet[macOS]
Rappel pour macOS.
:::

:::onglet[iOS et iPadOS]{valeur=iOS}
Rappel pour iOS.
:::

::::

## Onglets avec paramètre d’adresse

::::onglets{groupe=imprimante url}

:::onglet[Pharos]{valeur=pharos}
Imprimer avec Pharos.
:::

:::onglet[Courriel]{valeur=courriel}
Imprimer par courriel.
:::

::::

## Onglets sans groupe

::::onglets

:::onglet[Premier]
Premier volet.
:::

:::onglet[Second]
Second volet.
:::

::::

## Lieux

:::::colonnes

::::colonne

:::lieu{titre="Bibliothèque des lettres et sciences humaines" carte=https://maps.app.goo.gl/7LA5xUwwGKmAbZ6H6 lien=/a-propos/}
::adresse[Pavillon Samuel-Bronfman, 2<sup>e</sup> étage, local 2078]

Pour vérifier la disponibilité et pour réserver, écrivez à la technicienne.

::bouton[Réserver]{lien=https://calendrier.bib.umontreal.ca/space/27038}
::bouton[Guide d’utilisation]{lien=/a-propos/ type=secondaire}
:::

::::

::::colonne

:::lieu{titre="Bibliothèque Hubert-Reeves"}
::adresse[Campus MIL, Aile A, local A-0724.4]
:::

::::

:::::

::::lieu{titre="Bibliothèque Thérèse-Gouin-Décarie (TGD)" carte=https://maps.app.goo.gl/t8GE4RdMBEJiHJtd8}
::adresse[Pavillon Marie-Victorin, 2<sup>e</sup> étage, local G-305-12]

À votre arrivée, présentez-vous au bureau de référence du 2<sup>e</sup> étage.

:::parcours-reservation{reservation=https://calendrier.bib.umontreal.ca/space/27038 accompagnement=https://bookings.cloud.microsoft/book/studiobib@umontreal.ca/s/8H_NwNa_w0SuVTJV2MUyEw2 guide=/a-propos/}
Gardez votre réservation du studio. Sur place, le guide d’utilisation pas à pas vous accompagne.
:::
::::

## Parcours seul

:::parcours-reservation{reservation=https://calendrier.bib.umontreal.ca/space/27038 accompagnement=https://bookings.cloud.microsoft/ guide=/a-propos/}
Gardez votre réservation du studio.
:::

## Disponibilités

:::disponibilites
::disponibilite[Campus Laval]{oclc=1245965028}
::disponibilite[Droit]{oclc=1245964868}
::disponibilite[Hubert-Reeves]{oclc=1135290920}
::disponibilite[Numéro inexistant]{oclc=1}
:::

## Colonnes

::::colonnes

:::colonne
### Première colonne

Texte de la première colonne.
:::

:::colonne
### Deuxième colonne

Texte de la deuxième colonne.
:::

:::colonne
### Troisième colonne

Texte de la troisième colonne.
:::

::::

## Vidéos

::video[Configurer le proxy sous Windows 11]{youtube=IApth7W-yzw}

::video[Démonstration Loom]{loom=0281766fa2d04bb788eaf19e65135184}

::video[Fichier vidéo local]{fichier=/videos/essai.mp4}

## Encarts

::encart{nom=droit-auteur}

::encart{nom=aide}

::encart{nom=aide-crea}
