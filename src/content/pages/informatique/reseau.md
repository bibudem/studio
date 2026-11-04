---
title: Réseau sans fil
description: "Se connecter aux réseaux Wi-Fi de l'UdeM (UdeM, eduroam, UdeM-Visiteurs) : configuration par appareil, dépannage, DNS et prises réseau en bibliothèque."
image: "../images/cover/reseau.webp"
aide: info
derniereMaj: 2026-10-19
---

L'Université de Montréal offre plusieurs réseaux Wi-Fi à travers ses campus pour répondre à vos besoins de connectivité.

---

## UdeM avec cryptage

Le réseau sans fil **UdeM avec cryptage** est à privilégier. En plus d'offrir d'une sécurité accrue, il permet l'accès aux ressources électroniques des bibliothèques et à l'impression. Vous pouvez y accéder grâce à votre code d'accès et votre mot de passe.

::::::onglets{groupe="os-wifi-udem"}
:::onglet[Windows]{valeur="windows"}
1. Sélectionner le réseau sans fil : **UdeM avec cryptage**.
2. Entrer les informations suivantes :
   - **Identité** : Votre code d'accès ou courriel UdeM
   - **Mot de passe** : Votre mot de passe
:::

:::onglet[macOS]{valeur="macos"}
1. Sélectionner le réseau sans fil : **UdeM avec cryptage**.
2. Entrer les informations suivantes :
   - **Identité** : Votre code d'accès ou courriel UdeM
   - **Mot de passe** : Votre mot de passe
:::

:::onglet[iOS]{valeur="ios"}
1. Dans le menu des applications, sélectionner **Réglages**.
2. Sélectionner **Wi-Fi**.
3. Vérifier que l’interrupteur soit activé (de couleur verte).
4. Sélectionner le réseau sans fil : **UdeM avec cryptage**.
5. Entrer vos informations d'authentification et appuyer sur **Rejoindre**.
6. À la fenêtre **Certificat**, appuyer sur **Se fier**.
:::

:::::onglet[Android]{valeur="android"}
::::onglets
:::onglet[Version 10 ou antérieur]{valeur="android10"}
| Champ                    | Information                         |
| ------------------------ | ----------------------------------- |
| Méthode EAP              | PEAP                                |
| Phase 2 authentification | MSCHAPV2                            |
| Certificat CA            | (non spécifié) ou ne pas vérifier   |
| Identité                 | Votre code d'accès ou courriel UdeM |
| Anonyme                  | Laisser vide                        |
| Mot de passe             | Votre mot de passe                  |
:::

:::onglet[Version 11 ou ultérieur]{valeur="android11"}
| Champ                       | Information                         |
| --------------------------- | ----------------------------------- |
| Méthode EAP                 | PEAP                                |
| Phase 2 authentification    | MSCHAPV2                            |
| Certificat CA               | Utiliser les certificats système    |
| État du certificat en ligne | Demander l'état du certificat       |
| Domaine                     | umontreal.ca                        |
| Identité                    | Votre code d'accès ou courriel UdeM |
| Anonyme                     | Laisser vide                        |
| Mot de passe                | Votre mot de passe                  |
:::
::::
:::::

:::onglet[Chromebook]
| Champ                    | Information                         |
| ------------------------ | ----------------------------------- |
| Méthode EAP              | PEAP                                |
| Phase 2 authentification | MSCHAPV2                            |
| Certificat CA            | (non spécifié) ou ne pas vérifier   |
| Identité                 | Votre code d'accès ou courriel UdeM |
| Anonyme                  | Laisser vide                        |
| Mot de passe             | Votre mot de passe                  |
:::
::::::

---

## Eduroam

Le réseau sans fil **eduroam** est disponible pour les personnes en visite depuis un autre établissement participant et pour la communauté UdeM en visite ailleurs.

::::onglets{groupe="eduroam-access"}
:::onglet[Visiteurs à l'UdeM]{valeur="visitors"}
| Université                    | Code d'accès (exemple)         | Mot de passe (exemple)                |
| ----------------------------- | ------------------------------ | ------------------------------------- |
| HEC                           | `prenom.nom@hec.ca`            | Mot de passe courriel HEC             |
| ETS                           | `dtremblay@etsmtl.ca`          | Mot de passe                          |
| Polytechnique                 | `Code_Usager@polymtl.ca`       | Mot de passe                          |
| Université Laval              | `IDUL@ulaval.ca`               | Votre NIP                             |
| UQAM Étudiants                | `CodeMS@ens.uqam.ca`           | ABC12345                              |
| UQAM Employés                 | `nom.prenom@uqam.ca`           | ABC12345                              |
| University of Toronto         | `utorid@utoronto.ca`           | UTORid password                       |
| Concordia University          | `netname@concordia.ca`         | Password (same as MyConcordia portal) |
| McGill Étudiants              | `first.last@mail.mcgill.ca`    | McGill Password                       |
| McGill Employés               | `first.last@mcgill.ca`         | McGill Password                       |
| Université de Sherbrooke      | `votreCIP@usherbrooke.ca`      | Mot de passe                          |
| Université d’Ottawa Étudiants | `adressedecourriel@uottawa.ca` | Mot de passe uoAccès                  |
| Université d’Ottawa Employés  | `adressedecourriel@uottawa.ca` | Mot de passe Exchange                 |
:::

:::onglet[Communauté UdeM en visite ailleurs]{valeur="udem-visiting"}
1. Sélectionner le réseau sans fil **eduroam**.
2. S’authentifier avec votre adresse courriel UdeM (ex. **<prenom.nom@umontreal.ca>**) et votre mot de passe.
:::
::::

---

## UdeM-Visiteurs

Le réseau sans fil **UdeM-Visiteurs** est destiné aux personnes visitant l'Université de Montréal. Il est accessible pour une durée de 24h et ne permet pas l'accès aux ressources électroniques des bibliothèques ou à l'impression. Ce réseau n'est pas sécurisé.

1. Sélectionner le réseau sans fil **UdeM-Visiteurs**.
2. Ouvrir votre navigateur.

:::alerte{type="info" titre="Remarque"}
Si la page d'authentification ne s'affiche pas : ouvrir votre navigateur et taper une adresse que vous n'avez pas l'habitude d'utiliser. Par exemple : [www.google.cz](https://www.google.cz) (ouvre une nouvelle fenêtre). Sinon [oublier le réseau](#depannage) et se rebrancher.
:::

1. Cliquer **Ou faites une demande d'accès en tant qu'invité**.
2. Entrer vos informations et cliquer **Enregistrer**.
3. Lire et accepter les conditions générales.
4. Cliquer **Accepter** et **Continuer**.

:::alerte{type="attention" titre="IMPORTANT"}
Après 24 h, il peut être nécessaire d’[oublier le réseau](#depannage) afin que la page permettant de demander un accès en tant qu’invité s’affiche à nouveau.
:::

---

## Dépannage {#depannage}

En cas de problème avec le réseau sans fil, suivez les instructions ci-dessous pour oublier ou retirer un réseau et vous y reconnecter.

Il est important de faire la procédure pour **oublier chacun des réseaux sans fil de l'UdeM :** UdeM avec cryptage, eduroam, UdeM non sécurisé et UdeM-Visiteurs.

:::::onglets{groupe="os-troubleshoot"}
:::onglet[Windows]{valeur="windows"}
1. Aller dans **Paramètres** → **Réseau et Internet** → **Wi-Fi**.
2. Sélectionner **Gérer les réseaux connus**.
3. Supprimer **UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs**
:::

::::onglet[macOS]{valeur="macos"}
1. Aller dans **Préférences Réseau** → **Wi-Fi** → **Avancé**.
2. Sélectionner **UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs** et cliquer sur le symbole **-** pour supprimer.

:::alerte{type="info"}
Encore des problèmes? Au besoin, supprimer les informations de branchement du Trousseau d’accès
**Finder** → inscrire Trousseau dans la barre de recherche → double-cliquer **Trousseau d’accès** → inscrire
**umontreal** dans la boite de recherche → supprimer la ligne correspondante aux réseaux Wi-Fi de l'Université (**UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs**)
:::
::::

:::onglet[iOS]{valeur="ios"}
1. Aller dans **Réglages** → **Wi-Fi**.
2. Appuyer l'icône "i" à côté de **UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs** et choisir **Oublier ce réseau**.
:::

:::onglet[Android]{valeur="android"}
1. Aller dans **Paramètres** → **Wi-Fi**.
2. Appuyer longuement sur le réseau **UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs** et sélectionner **Retirer le réseau**.
3. Se connecter à nouveau

En cas de problème :

- À noter que plusieurs tentatives de connexion effectuées avec les mauvaises options peuvent entraîner un blocage temporaire de 30 minutes
- Déconnectez-vous de tous les réseaux Wi-Fi de l'UdeM (*UdeM avec cryptage, Eduroam, UdeM-Visiteurs*)
- Redémarrez votre appareil
- Attendez 30 minutes
- Sélectionnez Utiliser Adresse MAC du téléphone au lieu de Utiliser adresse MAC aléatoire lors de la connexion (en bas complètement)
:::

:::onglet[Chromebook]{valeur="chromebook"}
1. Aller **Wi-Fi** (en bas à droite) →  bouton **Avancé**.
2. Dans la section réseau, sélectionner **Wi-Fi** → **UdeM avec cryptage**, **eduroam**, et **UdeM-Visiteurs** et **Retirer**.
:::
:::::

---

## Sites umontreal.ca non accessibles?

Lorsque vous êtes connecté au réseau sans fil de l’UdeM, tous les sites s’affichent normalement, sauf ceux de l’Université de Montréal (Studium, umontreal.ca, etc.). Cela signifie que votre appareil (ou un programme) utilise des serveurs DNS personnalisés qui ne sont pas compatibles avec le réseau de l’UdeM.

Pour résoudre ce problème, configurez votre connexion pour **obtenir automatiquement vos DNS**.

::::::onglets{groupe="os-troubleshoot-2"}
:::::onglet[Windows]{valeur="windows"}
::::onglets
:::onglet[Windows 11]{valeur="Windows11"}
1. Cliquer droit sur l'icône **Wi-Fi** (en bas à droite).
2. Cliquer **Paramètres du réseau d'internet**.
3. Cliquer **Wi-Fi**.
4. Cliquer **Propriétés du matériel**.
5. Cliquer **Propriétés**.
6. Cliquer **Modifier** (à droite de Attribution du serveur DNS).
7. Changer Manuel pour **Automatique (DHCP**)
8. Cliquer **Enregistrer**
:::

:::onglet[Windows 10]{valeur="Windows10"}
1. Cliquer droit sur l'icône **Wi-Fi** (en bas à droite).
2. Cliquer **Ouvrir les paramètres réseau et internet**.
3. Cliquer **Centre Réseau et partage** (en bas de la page).
4. Cliquer **Wi-Fi (UdeM avec cryptage)** (en haut à droite).
5. Cliquer **Propriétés**.
6. Double-cliquer **Protocole internet version 4 (TCP/IPv4)**.
7. Cocher **Obtenir les adresses des serveurs DNS automatiquement**.
8. Cliquer **OK**
:::
::::
:::::

:::onglet[macOS]{valeur="macos"}
1. Cliquer **Wi-Fi** (en haut à droite de l'écran).
2. Cliquer **Réglages Wi-Fi** (ou Préférences réseau).
3. Cliquer **Avancé** (ou Détails).
4. Cliquer **DNS**.
5. Sélectionner chacune des adresses (ex. 8.8.8.8) et cliquer "**-**" afin de les supprimer.
6. Deux adresses débutant par 10 sont générées automatiquement.
7. Cliquer **OK**.
8. Cliquer **Appliquer**.
:::

:::onglet[iOS]{valeur="ios"}
1. Aller dans **Réglages** → **Wi-Fi**.
2. Appuyer l'icône "i" à côté de **UdeM avec cryptage**
3. Défiler la page vers le bas jusqu'à **Configurer le DNS**.
4. Sélectionner **Automatique**
:::

:::onglet[Android]{valeur="android"}
1. Aller dans **Paramètres** → **Wi-Fi**.
2. Appuyer **Réseau et internet** et **DNS Privé**.
3. Sélectionner **Automatique**
4. Appuyer **Enregistrer**
:::

:::onglet[Chromebook]{valeur="chromebook"}
1. S'assurer que le Chromebook est connecté à un Wi-Fi
2. Dans l'angle inférieur droit, sélectionner **l'heure**
3. Sélectionner le réseau sans fil **UdeM avec cryptage**.
4. Dans le menu déroulant, sélectionner le réseau sans fil **UdeM avec cryptage**
5. Sélectionner **Réseau**
6. Dans la section "Serveurs de noms", sélectionner **Serveurs de noms automatiques**
7. Fermer la fenêtre (Cliquer **X** en haut à droite)
:::
::::::

---

## Réseau filaire en accès libre {#reseau-filaire-en-acces-libre}

En cas de difficultés avec le réseau sans fil, des prises réseau en accès libre sont disponibles dans les bibliothèques.

| Bibliothèque                                                                           | Local                         |
| -------------------------------------------------------------------------------------- | ----------------------------- |
| [Bibliothèque des lettres et sciences humaines](https://bib.umontreal.ca/espaces/#lsh) | 1er étage, près du local 1097 |
| [Bibliothèque de la santé](https://bib.umontreal.ca/espaces/#sante)                    | local L-886, L-888, L-890     |

:::alerte{type="attention"}
Une connexion au serveur mandataire (*proxy*) est nécessaire pour accéder aux ressources électroniques des bibliothèques depuis une connexion filaire.
:::
