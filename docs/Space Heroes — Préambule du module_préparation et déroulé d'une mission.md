# Space Heroes — Préambule du module : préparation et déroulé d'une mission

> **Document unique** qui décrit l'ensemble de l'expérience joueur, de l'arrivée au QG jusqu'au bilan post-mission. Il s'appuie sur le *Document de conception du jeu*, l'*Addendum CML* et les *Perspectives et améliorations*. Il est conçu pour un **jeu interactif en 3D** où chaque choix a une conséquence visible et immédiate.

---

## 🎯 Principe fondateur : « Tu vois ce que tu choisis »

Dans Space Heroes, **la 3D n'est pas un décor : c'est le terrain de jeu**. Chaque choix du joueur se traduit immédiatement par une transformation visible de son vaisseau, de sa trajectoire ou de son environnement. Il n'y a pas de « choix sans conséquence » : chaque décision laisse une trace, et le joueur voit en temps réel l'effet de ses arbitrages.

| Choix du joueur                                   | Conséquence visible en 3D                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tu ajoutes un instrument lourd                    | Le vaisseau s'alourdit → la trajectoire se dégrade (delta-v insuffisant) → ASTRA alerte en rouge              |
| Tu choisis des panneaux solaires au lieu d'un RTG | Le vaisseau déploie des ailes, mais perd en puissance loin du Soleil (Jupiter = panneaux inefficaces)         |
| Tu sélectionnes un moteur ionique                 | La poussée est faible mais continue → la trajectoire 3D montre une spirale lente au lieu d'une courbe rapide  |
| Tu négliges le blindage antiradiations            | En approchant de Jupiter, l'écran se teinte de rouge (tempête solaire) et les instruments clignotent en panne |
| Tu économises sur les communications              | Le signal se coupe à distance → la jauge « Données » chute, tu perds le contrôle à distance                   |
| Tu valides une checklist CML bâclée               | ASTRA refuse le lancement → le compte à rebours se fige, le vaisseau reste au sol                             |

**Rien n'est caché : tout se lit dans la scène 3D et les jauges.**

---

## 🏛️ Étape 0 — Accueil au QG de Mission

Avant toute mission, le joueur arrive dans le **QG de Mission** avec ASTRA comme guide permanente. C'est le hub central d'où partent tous les types de missions.

### Contenu du QG

- **Carte murale interactive** du système solaire avec des marqueurs sur chaque destination (Lune, Mars, Jupiter, etc.) — cliquer sur un marqueur ouvre la mission correspondante.
- **Tableau de bord du joueur** : progression globale, médailles obtenues, filières débloquées, statistiques (temps total, décisions prises, succès/échecs).
- **Salle de briefing** : avant chaque mission, un court dialogue avec ASTRA qui contextualise (ex : *« Cette mission s'inspire de la vraie mission Artemis I, voici ce que tu dois savoir… »*).
- **Bibliothèque de fiches « Dans la vraie vie »** : accessibles depuis le hub, elles expliquent les concepts scientifiques avant de les rencontrer en jeu.

### Paramètres de démarrage

- **Choix de la difficulté** : 4 niveaux — **Cadet, Ingénieur, Directeur de mission, Bac à sable** — ASTRA explique les différences.
- **Fiches pédagogiques** : bouton *« Pourquoi ? »* sur chaque élément, glossaire illustré, mini-tutoriels.
- **Accessibilité intégrée** : sous-titres, contrastes, tailles de police, mode daltonien pour les jauges colorées.

---

## 👥 Étape 1 — Sélection du rôle et de l'équipe

### Mode solo

Le joueur choisit son **rôle** parmi les 4 rôles du jeu (ou joue avec ASTRA qui tient les rôles manquants). Chaque rôle a des **informations réservées** et des **compétences spécifiques** :

| Rôle                                        | Informations réservées                 | Compétence clé                             |
| ------------------------------------------- | -------------------------------------- | ------------------------------------------ |
| **Directeur de mission (DM)**               | Budget global, arbitrages stratégiques | Veto, gestion de la réserve de contingence |
| **Ingénieur véhicule (IV)**                 | Fiabilité réelle des composants        | Optimisation masse/puissance               |
| **Ingénieur systèmes de bord (ISB)**        | État énergie/communication/thermique   | Gestion des marges techniques              |
| **Responsable science et navigation (RSN)** | Objectifs scientifiques, cibles        | Maximisation de la valeur des données      |

### Mode multijoueur (4 joueurs max, en ligne)

- **Salle d'attente virtuelle** avec avatars, chat texte (voix WebRTC en V2).
- **Briefing de rôle individuel** : chaque joueur ne voit que ce que son rôle est censé voir (architecture serveur autoritaire — anti-triche, conformément aux *Perspectives* §3.1).
- **Mini-tutoriel de négociation** : ASTRA explique les jetons de priorité, les vetos, les dilemmes.
- **Scénario « à blanc »** de 2 min pour tester la communication avant la vraie mission.
- **Profils de joueur** : chaque joueur peut choisir un style (prudent, audacieux, scientifique, pragmatique) — ASTRA adapte ses conseils en conséquence.

---

## 🔧 Étape 2 — Phase de préparation technique (Atelier + CML)

### 2.1 Briefing de mission

- Consulter et valider les paramètres : **orbite visée, fenêtre de lancement, delta-v** (données GMAT réelles ou formules orbitales — voir *Plan 24h* §3.5).
- Identifier l'**objectif scientifique en une phrase** (premier critère CML 1).
- ASTRA pose des questions courtes pour valider la compréhension.

### 2.2 Conception dans l'Atelier

Le joueur parcourt le catalogue des **5 familles de composants** :

| Famille                          | Technologies disponibles                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 🚀 **Moteurs**                   | Chimique, Cryogénique, Ionique                                                                        |
| 🛡️ **Matériaux et structures**  | Alliage d'aluminium, Al-Li, Titane, Composite carbone, Bouclier ablatif, MLI, Blindage antiradiations |
| ⚡ **Sources d'énergie**          | Panneaux solaires, Batteries, Générateur radio-isotopique (RTG)                                       |
| 📡 **Antennes**                  | Faible gain, Parabolique, À balayage                                                                  |
| 🔬 **Instruments scientifiques** | Caméra, Spectromètre, Radar                                                                           |

**Mécanique commune** :

- **12 points à répartir sur 4 axes** par famille, coût affiché en direct.
- **Jetons d'Atelier** à dépenser pour débloquer des technologies avancées.
- **Test ASTRA + banc d'essai** : validation technique en 3D avant de passer à la suite (le moteur s'allume, le panneau se déploie, l'instrument pointe).
- **Constituer la liste d'emport** dans les limites des **6 ressources** : **Budget (€), Masse (kg), Puissance (W), Données (bits/s), Communications (liaison), Durée (mois)**.

### 2.3 Checklist CML — validation par ASTRA (mécanique clé)

ASTRA joue le rôle d'**évaluateur indépendant** (conforme à la ressource NASA JPL *Wessen, Borden, Ziemer & Kwok, 2013* — l'auto-évaluation est « dangereuse » et trop optimiste).

**Règles** :

- **20 critères répartis sur 4 niveaux** (CML 1 → CML 4), 5 critères par niveau.
- Chaque critère est coté **Rouge / Jaune / Vert**.
- Un niveau est validé quand **4 critères sur 5 sont verts (seuil 80%)**.
- **Le joueur ne coche jamais lui-même** : ASTRA pose une question courte et colore la case selon l'état réel des données de la mission.

#### CML 1 — Idée (Briefing / Office Hours)

- [ ] Objectif scientifique formulé en une phrase
- [ ] Ce qui rend la mission unique est identifié
- [ ] Fenêtre de lancement approximative choisie
- [ ] Classe de budget visée (CubeSat, flagship…)
- [ ] Premier croquis du vaisseau, même sommaire

#### CML 2 — Faisabilité (Concept Development)

- [ ] Besoins scientifiques détaillés en exigences de premier niveau
- [ ] Masse, puissance et budget estimés en ordre de grandeur
- [ ] Risques majeurs identifiés
- [ ] Au moins un lanceur candidat listé
- [ ] Technologies nécessaires identifiées

#### CML 3 — Comparaison d'options (Trade Studies)

- [ ] Au moins 2 architectures comparées
- [ ] Effet de chaque option sur science/coût/risque documenté
- [ ] Marges techniques estimées pour chaque option
- [ ] Sensibilité du design aux principaux paramètres de risque évaluée
- [ ] Option retenue justifiée face aux autres

#### CML 4 — Conception précise (Point Design)

- [ ] Liste d'équipements complète
- [ ] Coût estimé avec marge de réserve
- [ ] Marges techniques validées par rapport au seuil retenu
- [ ] Plan de vérification (essais) défini
- [ ] Risques classés avec une piste de réduction

**Réplique type d'ASTRA** : *« Tous tes critères sont verts, mais est-ce vraiment la meilleure option ? »* — l'outil mesure la complétude, pas la qualité.

---

## 🚀 Étape 3 — Lancement et Opérations (les 4 segments)

Une fois la checklist validée, la mission se déroule en **4 segments** :

### 🚀 Segment 1 — Lancement

- Choix du lanceur candidat (au moins un listé dès CML 2).
- Simulation du décollage en 3D, vérification des marges techniques.
- Si un paramètre est hors tolérance, ASTRA interrompt le compte à rebours.

### 🛰️ Segment 2 — Spatial (orbite / transit)

- **Communications** : établir le contact avec les stations au sol, gérer les délais radio selon la distance (ex : ~3 min Terre-Lune, ~20 min Terre-Mars).
- **Déploiement des instruments** et mise en configuration opérationnelle (visible en 3D : panneaux qui se déploient, antennes qui s'orientent).
- **Gestion des 6 ressources en temps réel** : énergie, carburant/delta-v, données, liaison, masse, budget résiduel.
- Navigation et corrections de trajectoire (assistance gravitationnelle pour Jupiter, poussée faible pour ionique…).

### 🌍 Segment 3 — Sol / Opérations scientifiques

- Utilisation des instruments (caméra, spectromètre, radar) — chaque instrument pointe vers sa cible en 3D.
- Collecte et compression des données scientifiques.
- Gestion de la **météorologie spatiale** (tempêtes solaires — chapitre 11).
- **Événements imprévus** : pannes, débris, collisions (filière Sauvetage).

### 👥 Segment 4 — Utilisateurs / Retombées

- Distribution des données aux utilisateurs finaux.
- Valorisation scientifique (publications, découvertes).
- Comparaison avec de **vraies missions NASA** (ex : *« Ton score équivaut à 85% de la mission Lunar Reconnaissance Orbiter »*).

---

## 📊 Étape 4 — Bilan post-mission

- **Rapport post-mission** : score global, graphique d'évolution des 6 ressources, **3 décisions clés** mises en avant.
- **Médailles et badges spéciaux** selon performance.
- **Fiche « Dans la vraie vie »** : comparaison détaillée avec la mission réelle qui a inspiré le scénario.
- **Débriefing multijoueur** (si applicable) : replay des moments de tension, compromis, vetos utilisés.
- **Jetons d'Atelier gagnés** pour débloquer des technologies avancées (cryogénique, ionique, RTG).
- **ASTRA conclut** avec une réplique contextuelle (succès / échec / apprentissage).

---

## 🔄 Les 3 boucles de feedback 3D

### Boucle 1 — Atelier (conception)
