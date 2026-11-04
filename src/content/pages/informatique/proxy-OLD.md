---
title: Configurer le serveur mandataire (proxy)
description: Guide pour configurer le serveur mandataire (proxy) afin d'accéder aux ressources électroniques.
aide: info
brouillon: true
derniereMaj: 2026-10-31
---

## Étape 1 - Configurer selon votre système d'exploitation {#selectionner-votre-systeme-d-exploitation}

:::::::onglets{groupe="os-tabs"}
:::::onglet[Windows]
::::onglets{groupe="Windows"}
:::onglet[Windows 11]{valeur="Windows11"}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy** (*ou Mandataire*).
2. Désactiver **Détecter automatiquement les paramètres**.
3. Sous **Utiliser un script d’installation**, cliquer **Configurer**.
4. Activer **Utiliser un script de configuration**.
5. Saisir :copier[https://proxy.umontreal.ca].
6. Cliquer **Enregistrer**.

**Tutoriel vidéo**

::video[Tutoriel vidéo : Configurer le serveur mandataire (proxy) (Windows, Windows 11)]{youtube="IApth7W-yzw"}
:::

:::onglet[Windows 10]{valeur="Windows10"}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy**.
2. Activer **Utiliser un script d’installation**.
3. Saisir :copier[https://proxy.umontreal.ca].
4. Cliquer **Enregistrer**.

**Tutoriel vidéo**

::video[Tutoriel vidéo : Configurer le serveur mandataire (proxy) (Windows, Windows 10)]{youtube="dk1oUdLo84Y"}
:::
::::
:::::

::::::onglet[macOS]
:::::onglets{groupe="macOS"}
::::onglet[13 et ultérieurs (récents)]{valeur="13 et ultérieurs"}
:::alerte{type="attention" titre="Attention"}
Apple limite la compatibilité de Safari avec notre proxy. À compter du 13 juillet, sur Mac, veuillez utiliser Chrome, Firefox, Edge ou Brave à la place de Safari.
:::

1. Cliquer l'icône Wi‑Fi en haut à droite de l'écran.
2. Cliquer **Réglages Wi‑Fi**. Si un cadenas fermé s’affiche, cliquer pour le débloquer.
3. Cliquer **Détails**.
4. Sélectionner l'onglet **Serveurs mandataires** → activer **Configuration de serveur mandataire automatique**.
5. Saisir :copier[http://proxy.umontreal.ca].
6. Cliquer **OK**, puis **Appliquer**.

**Tutoriel vidéo**

::video[Tutoriel vidéo : Configurer le serveur mandataire (proxy) (macOS, 13 et ultérieurs (récents))]{youtube="D5VeqdvUNdM"}
::::

::::onglet[macOS 12 et antérieurs (anciens)]{valeur="12 et antérieurs"}
:::alerte{type="attention" titre="Attention"}
Apple limite la compatibilité de Safari avec notre proxy. À compter du 13 juillet, sur Mac, veuillez utiliser Chrome, Firefox, Edge ou Brave à la place de Safari.
:::

1. Cliquer l'icône Wi‑Fi en haut à droite de l'écran.
2. Cliquer **Préférences réseau**. Si un cadenas fermé s’affiche, cliquer pour le débloquer avec le mot de passe administrateur.
3. Cliquer **Avancé**.
4. Sélectionner l'onglet **Proxys** → activer **Configuration de serveur mandataire automatique**.
5. Saisir :copier[http://proxy.umontreal.ca].
6. Cliquer **OK**, puis **Appliquer**.

Pour désinstaller le proxy, refaire les mêmes étapes et désactiver **Configuration de serveur mandataire automatique** à l’étape 4.

**Tutoriel vidéo**

::video[Tutoriel vidéo : Configurer le serveur mandataire (proxy) (macOS, macOS 12 et antérieurs (anciens))]{youtube="Qy5FlukamTM"}
::::
:::::
::::::

::::onglet[iOS]
:::alerte{type="attention" titre="Attention"}
Apple limite la compatibilité de Safari avec notre proxy. À compter du 13 juillet, sur iPhone et iPad, veuillez utiliser le VPN à la place du Proxy.
La configuration du proxy sur iOS est disponible pour les connexions Wi‑Fi seulement, pas cellulaires.
:::

1. **Réglages → Wi‑Fi → ⓘ** à côté du réseau sans‑fil.
2. Sous **Serveur mandataire HTTP**, sélectionner **Automatique**.
3. Saisir :copier[http://proxy.umontreal.ca].
4. **Enregistrer**.
::::

:::onglet[Android]
1. Glisser le doigt du haut vers le bas (2 fois) et toucher le Wi‑Fi.
2. **Plus de paramètres → Modifier le réseau → Options avancées**.
3. Sous **Serveur mandataire**, sélectionner **Config. auto du mandataire**.
4. Saisir :copier[https://proxy.umontreal.ca].
5. **Enregistrer**.
:::

:::onglet[Linux]
1. Cliquer **WiFi** (en haut à droite)
2. Cliquer **Paramètres**
3. Cliquer **Réseau**
4. Activer **Serveur mandataire** ou **Proxy**
5. Cliquer **Automatique**
6. Dans URL de configuration, taper sans espace :copier[https://proxy.umontreal.ca]
7. Fermer la fenêtre
:::
:::::::

---

## Étape 2 - Tester la configuration {#tester-configuration}

1. Ouvrir [testproxy.umontreal.ca](http://testproxy.umontreal.ca).
2. S'authentifier avec vos identifiants UdeM.
3. Vérifier que vous voyez le message **« Votre configuration Proxy est fonctionnelle »**.

---

## Dépannage {#depannage}

::::::onglets
:::onglet[Tous les navigateurs]{valeur="Tous navigateurs"}
- [Vérifier le statut des services TI](https://ti.umontreal.ca/etat-des-services/)
- Désactiver tout **VPN**
- Désactiver tout **bloqueurs de publicités**
- Vider la mémoire cache du navigateur et refaire le test (voir l’onglet suivant)
- Tester la configuration dans un autre navigateur
:::

:::onglet[Edge]
- Pour Edge, préfixer le code d’accès par `sim\ab12345`
- Attention au sens de la barre oblique.
- S'il n'est pas possible d'éditer le nom d'utilisateur, cliquer sur l'option **"Utiliser un autre compte"** (ou **"Changer de compte"**). Il peut être nécessaire de défiler la fenêtre d'authentification vers le bas pour voir cette option.
:::

:::onglet[Firefox]
En haut à droite, cliquer **Menu ► Options ► Général ► Paramètres ►** Cocher **Utiliser les paramètres de Proxy du système**

- Tester la configuration à l'adresse : [testproxy.umontreal.ca](http://testproxy.umontreal.ca)

Si le problème persiste :

- Taper `about:config` dans la barre d’adresse de Firefox et appuyer sur **Entrée**
- Cliquer sur **Je prends le risque**
- Entrer `ntlm` dans la boîte **Rechercher** et appuyer sur **Entrée**
- Double-cliquer sur `network.automatic-ntlm-auth.allow-proxies` pour changer la valeur à **False**
- Tester la configuration à l'adresse : [testproxy.umontreal.ca](http://testproxy.umontreal.ca)
:::

:::::onglet[Vider le cache]{valeur="ViderCache"}
::::onglets
:::onglet[Chrome]
**PC/Mac :** Menu → supprimer les données de navigation → Période **Depuis le début** → Cocher uniquement **Images et fichiers en cache** → **Supprimer les données**

**ChromeBook :** Menu → supprimer les données de navigation → Période **toutes les données** → Cocher uniquement **Images et fichiers en cache** → **Supprimer les données**

**Android :** Menu → Supp.données de navig.. → Période **Toutes les périodes** → Autres options → cocher uniquement **Images et fichiers mis en cache** → **Supprimer les données**
:::

:::onglet[Firefox]
**PC et Mac** : Menu → Paramètres → **Vie privée et sécurité** → à la section **Cookies et données de sites**, cliquer **Effacer les données** → Intervalle è effacer **Tout** → cocher seulement **Fichiers et pages en cache temporaire** → bouton **Effacer**

**Android** : Menu → Paramètres → **Supprimer les données de navigation** → cocher seulement **Images et fichiers mis en cache** → Supprimer les données de navigation → Supprimer
:::

:::onglet[Edge]
**PC/Mac :** Menu → **Supprimer les données de navigation** → Intervalle de temps **À tout moment** → Cocher uniquement **Images et fichiers mis en cache**  → **Effacer maintenant**

**Android :** Menu → Paramètres → Confidentialité et sécurité → Effacer données de navigation → Intervalle **À tout moment** → cocher uniquement **Images et fichiers en cache** → **Supprimer les données**
:::

:::onglet[Safari]
**MAC** : Menu Safari → Réglages (ou Préférences) → Avancées → cocher **Afficher les fonctionnalités de développement web** → menu Développement (en haut) → **Vider les caches** → **Redémarrer l’ordinateur**.

**iOS** (iPhone, iPad, iPod) : Réglages → Apps → Safari → **Effacer l’historique de navigation** → **Tout l'historique** → **Effacer l'historique** →  **Redémarrer l’appareil**.
:::
::::
:::::
::::::

Tester la configuration à : [testproxy.umontreal.ca](http://testproxy.umontreal.ca).

## Désinstaller {#desinstaller}

::::::onglets{groupe="os-tabs"}
:::::onglet[Windows]
::::onglets{groupe="Windows"}
:::onglet[Windows 11]{valeur="Windows11"}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy** (*ou Mandataire*).
2. Sous **Utiliser un script d’installation**, cliquer **Configurer**.
3. Désactiver **Utiliser un script de configuration**.
4. Cliquer **Enregistrer**
5. [Vider la mémoire cache de votre navigateur](#depannage).
6. **Redémarrer l'ordinateur**.
:::

:::onglet[Windows 10]{valeur="Windows10"}
1. **Démarrer → Paramètres → Réseau et Internet → Proxy**.
2. Désactiver **Utiliser un script de configuration**.
3. Cliquer **Enregistrer**
4. [Vider la mémoire cache de votre navigateur](#depannage).
5. **Redémarrer l'ordinateur**.
:::
::::
:::::

:::::onglet[macOS]
::::onglets{groupe="macOS"}
:::onglet[13 et ultérieurs (récents)]{valeur="13 et ultérieurs"}
1. Cliquer l'icône Wi‑Fi en haut à droite de l'écran.
2. Cliquer **Réglages Wi‑Fi**. Si un cadenas fermé s’affiche, cliquer pour le débloquer.
3. Cliquer **Détails**.
4. Sélectionner l'onglet **Serveurs mandataires** → Désactiver **Configuration de serveur mandataire automatique**.
5. Cliquer **Ok**.
6. [Vider la mémoire cache de votre navigateur](#depannage).
7. **Redémarrer l'ordinateur**.
:::

:::onglet[macOS 12 et antérieurs (anciens)]{valeur="12 et antérieurs"}
1. Cliquer l'icône Wi‑Fi en haut à droite de l'écran.
2. Cliquer **Préférences réseau**. Si un cadenas fermé s’affiche, cliquer pour le débloquer avec le mot de passe administrateur.
3. Cliquer **Avancé**.
4. Sélectionner l'onglet **Proxys** → Désactiver **Configuration de serveur mandataire automatique**.
5. Cliquer **Ok**.
6. [Vider la mémoire cache de votre navigateur](#depannage).
7. **Redémarrer l'apapreil**.
:::
::::
:::::

:::onglet[iOS]
1. **Réglages → Wi‑Fi → ⓘ** à côté du réseau sans‑fil.
2. Sous **Serveur mandataire HTTP**, sélectionner **Non**.
3. Cliquer **Enregistrer**
4. [Vider la mémoire cache de votre navigateur](#depannage).
5. **Redémarrer l'apapreil**.
:::

:::onglet[Android]
1. Glisser le doigt du haut vers le bas (2 fois) et toucher le Wi‑Fi.
2. **Plus de paramètres → Modifier le réseau → Options avancées**.
3. Sous **Serveur mandataire**, sélectionner **Aucun**.
4. **Enregistrer**.
5. [Vider la mémoire cache de votre navigateur](#depannage).
6. **Redémarrer l'apapreil**.
:::

:::onglet[Linux]
1. Cliquer **WiFi** (en haut à droite)
2. Cliquer **Paramètres**
3. Cliquer **Réseau**
4. Activer **Serveur mandataire** ou **Proxy**
5. Cliquer **Désactiver**, Fermer la fenêtre
6. [Vider la mémoire cache de votre navigateur](#depannage).
7. **Redémarrer l'apapreil**.
:::
::::::
