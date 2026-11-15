# Space Heroes — Document complet du module : préparation, interfaces et déroulé d'une mission

> **Document unique de référence** décrivant l'ensemble de l'expérience joueur dans *Space Heroes* : de l'arrivée au QG jusqu'au bilan post-mission, incluant l'architecture des interfaces asymétriques (HUD) par rôle et le script des validations CML menées par l'IA ASTRA. Il est conçu pour un **jeu interactif en 3D** où chaque choix a une conséquence visible et immédiate.
>
> Mise à jour du 15 novembre 2026 : la section suivante décrit ce que la version jouable fait vraiment. Le reste du document garde la vision (HUD par rôle, multijoueur, difficultés avancées). Là où les deux divergent, la version jouable prime.

---

## Version jouable — ce qui est en place

Une mission suit toujours le même fil, lu dans le JSON du chapitre :

**QG → rôle → briefing → atelier (5 familles) → trois essais → lancement → opérations → bilan.**

Le chapitre 1 (*Le premier signal*, CubeSat, orbite basse, masse plafonnée à 4 kg) sert de référence. Les chapitres 2 à 5 reprennent le même enchaînement.

### Déroulé réel

- **QG.** Cinq missions au choix, bouton Continuer si une sauvegarde existe, changement de rôle, message d'accueil d'ASTRA. Le tableau de bord mural, la bibliothèque « Dans la vraie vie » et la carte cliquable du système solaire restent de la conception.
- **Rôle.** Quatre postes (DM, IV, ISB, RSN). En solo, ASTRA tient les trois autres. Le multijoueur en ligne n'est pas dans cette version.
- **Briefing.** Objectif, ce qui rend la mission unique, fenêtre, classe de budget, croquis. ASTRA évalue le CML 1.
- **Atelier.** Un composant par famille : moteur, structure, énergie, communications, instrument. Le CubeSat 3D se construit au fur et à mesure. La masse totale est surveillée avant validation.
- **Essais.** Trois épreuves seulement : **vibrations**, **isolation thermique**, **compatibilité électrique**. Il n'y a pas de test vide séparé, et rien ne se fabrique sur cet écran.
- **Lancement.** Compte à rebours et décollage 3D. Si le CML demandé n'est pas à 80 % de vert, ASTRA le **signale**. Le compte à rebours **n'est pas verrouillé**. Le bilan en tient compte.
- **Opérations.** Contact radio vers une station au sol, puis déploiement dans l'ordre **communications → énergie → instrument**, transmission des données, et parfois une anomalie.
- **Bilan.** Score, ressources, trois décisions, médaille, phrase NASA, citation d'ASTRA. Bouton **Exporter le PDF** : fichier `SpaceHeroes_{titre}_{AAAA-MM-JJ}.pdf`, bandeau sombre, logo, corps blanc.

### ASTRA

- Les répliques ont un texte français et un texte anglais (`texte` / `texteEn`). La langue est choisie au moment où elle parle. Une chaîne anglaise manquante reste en français.
- Elle ne dit plus qu'il faut fabriquer avant de tester, ni que le lancement est bloqué.
- À l'écran, le texte suit la langue du jeu. À voix haute, le navigateur utilise une voix `fr-FR` ou `en-US` selon la même langue. Sans voix anglaise installée dans Windows, la phrase anglaise ne peut pas être lue correctement.

### Paramètres, langue, accessibilité

- Français par défaut. L'anglais traduit l'interface visible (QG, paramètres, épisodes, atelier, CML, essais, opérations, bilan, info-bulles, boutons, HUD, télémétrie). Le choix survit au rechargement.
- Les options cliquables restent un **brouillon** jusqu'à **Enregistrer**. Le bouton n'est actif que si quelque chose a changé. Annuler, fermer, cliquer le fond ou Échap jette le brouillon.
- Police, contraste, daltonisme, réduction des animations et plein écran ne s'appliquent qu'à l'enregistrement.
- Effacer, exporter et importer les données s'appliquent tout de suite.
- Les quatre difficultés (Cadet, Ingénieur, Directeur de mission, Bac à sable) sont proposées dans les paramètres. Le moteur de mission **n'applique pas encore** la pré-validation CML du mode Cadet.

### Identité visuelle et premier écran

- Logo circulaire officiel (casque, étoile, « SPACE HEROES ») sur l'écran de chargement : fondu, léger zoom, halo. Si les animations sont réduites, le logo est fixe. L'écran part dès que le chargement est fini.
- Le même logo sert de favicon, d'icône Apple et d'icônes PWA (192 et 512). Le cache du service worker est `space-heroes-v2`.

### Bande-son

Musique originale synthétisée dans le navigateur, sans fichier audio, une boucle par écran. Le bouton SON / MUET coupe musique, effets et voix. Le curseur **Musique d'ambiance** est un volume global par-dessus les volumes de la carte. Au décollage, la musique baisse sous le grondement, puis revient.

| Scène | BPM | Volume | Ambiance | Suite |
| --- | --- | --- | --- | --- |
| Hub | 102 | 0,55 | Motivation calme | Toutes les scènes |
| Briefing | 76 | 0,55 | Concentration émerveillée | Atelier, Essais |
| Atelier | 112 | 0,90 | Créativité précise | Essais, Lancement |
| Essais | 124 | 0,85 | Tension contrôlée | Lancement |
| Lancement | 128 | 1,05 | Adrénaline maximale | Opérations |
| Opérations | 96 | 0,75 | Concentration spatiale | Bilan |
| Bilan | 88 | 0,70 | Satisfaction réfléchie | Hub, chapitre suivant |

Le changement de scène tombe sur le temps suivant, pour ne pas couper la mesure. Le retour au QG est immédiat.

---

## 🎯 Principe fondateur : « Tu vois ce que tu choisis »

Dans *Space Heroes*, **la 3D n'est pas un décor : c'est le terrain de jeu**. Chaque choix du joueur se traduit immédiatement par une transformation visible de son vaisseau, de sa trajectoire ou de son environnement. Le moteur 3D s'appuie sur une **bascule fluide entre deux échelles** : la **Vue Vaisseau** (assemblage, déploiement, anomalies matérielles) et la **Vue Orbitale / Système solaire** (trajectoires, fenêtres de tir, météo spatiale).

| Choix du joueur                                   | Échelle 3D            | Conséquence visible en temps réel                                                                                 |
| ------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tu ajoutes un instrument lourd                    | Vaisseau & Orbitale   | Le vaisseau s'alourdit → la courbe de trajectoire se dégrade ($\Delta v$ insuffisant) → ASTRA alerte en rouge     |
| Tu choisis des panneaux solaires au lieu d'un RTG | Vaisseau              | Le vaisseau déploie des ailes, mais la jauge d'énergie chute loin du Soleil (Jupiter = panneaux inefficaces)      |
| Tu sélectionnes un moteur ionique                 | Orbitale              | La poussée bleutée est faible mais continue → la trajectoire montre une spirale lente au lieu d'une courbe rapide |
| Tu négliges le blindage antiradiations            | Vaisseau              | En approchant de Jupiter, l'écran se teinte de rouge (tempête solaire) et les instruments clignotent en panne     |
| Tu économises sur les communications              | Orbitale              | Le faisceau de liaison se coupe à distance → la jauge « Données » chute, tu perds le contrôle à distance          |
| Tu valides une checklist CML bâclée               | Vaisseau (Pas de tir) | ASTRA signale le niveau manquant. Le compte à rebours reste disponible ; le bilan compte le manque               |

**Rien n'est caché : tout se lit dans la scène 3D et les jauges.**

---

## 🏛️ Étape 0 — Accueil au QG de Mission

Avant toute mission, le joueur arrive dans le **QG de Mission** avec ASTRA comme guide permanente. C'est le hub central d'où partent tous les types de missions.

### Contenu du QG

- **Carte murale interactive** du système solaire avec des marqueurs sur chaque destination (Lune, Mars, Jupiter, etc.) — cliquer sur un marqueur ouvre la mission correspondante.
- **Tableau de bord du joueur** : progression globale, médailles obtenues, filières débloquées, statistiques (temps total, décisions prises, succès/échecs).
- **Salle de briefing** : avant chaque mission, un court dialogue avec ASTRA contextualise l'enjeu (ex : *« Cette mission s'inspire de la vraie mission Artemis I, voici ce que tu dois savoir… »*).
- **Bibliothèque de fiches « Dans la vraie vie »** : accessibles depuis le hub, elles expliquent les concepts scientifiques avant de les rencontrer en jeu.

### Paramètres de démarrage

- **Choix de la difficulté** : 4 niveaux — **Cadet, Ingénieur, Directeur de mission, Bac à sable** — qui modulent les marges techniques, les événements imprévus et le niveau d'assistance d'ASTRA sur la checklist CML.
- **Fiches pédagogiques** : bouton *« Pourquoi ? »* sur chaque élément, glossaire illustré, mini-tutoriels.
- **Accessibilité intégrée** : sous-titres, contrastes élevés, tailles de police modulables, mode daltonien pour les jauges et pastilles colorées, réduction des animations. Ces réglages visuels, comme la langue et le volume d'ambiance, ne s'appliquent qu'après **Enregistrer**.

---

## 👥 Étape 1 — Sélection du rôle et de l'équipe

### Mode solo

Le joueur choisit son **rôle** parmi les 4 spécialités du jeu (ASTRA assure les rôles complémentaires). Chaque rôle dispose d'**informations réservées** et d'une **compétence spécifique** :

| Rôle                                        | Informations réservées                                | Compétence clé                                                       |
| ------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| **Directeur de mission (DM)**               | Budget global, arbitrages stratégiques                | Droit de veto (jetons limités), gestion de la réserve de contingence |
| **Ingénieur véhicule (IV)**                 | Fiabilité réelle des composants, limites structurales | Optimisation masse / puissance / $\Delta v$                          |
| **Ingénieur systèmes de bord (ISB)**        | État détaillé énergie / communication / thermique     | Gestion des marges techniques et bascule des modes                   |
| **Responsable science et navigation (RSN)** | Objectifs scientifiques, fenêtres de visée            | Maximisation de la valeur des données collectées                     |

### Mode multijoueur (4 joueurs max, en ligne)

- **Salle d'attente virtuelle** avec avatars et chat texte (voix WebRTC prévue en V2).
- **Briefing de rôle individuel** : chaque joueur ne voit que les données propres à son poste (architecture serveur autoritaire anti-triche, conformément aux *Perspectives* §3.1).
- **Mini-tutoriel de négociation** : ASTRA explique la gestion des jetons de priorité, des jetons de veto et la résolution de dilemmes.
- **Scénario « à blanc »** de 2 min pour tester la coordination avant la vraie mission.
- **Profils de joueur** : chaque participant peut afficher son style (prudent, audacieux, scientifique, pragmatique) — ASTRA adapte ses conseils en conséquence.

---

## 🖥️ Architecture des Interfaces Utilisateur (HUD) par Rôle

Pour renforcer l'asymétrie d'information et l'immersion 3D, l'écran de chaque joueur partage une **base commune** (70 % de l'écran dédié à la scène 3D centrale) mais affiche des **modules de télémétrie dédiés** sur les panneaux latéraux.

```text
+-----------------------------------------------------------------------------------+
| [ASTRA : Flux audio/texte & Alertes]   [PHASE / SEGMENT]   [TEMPS / FENÊTRE TIR]  |
+-----------------------+-----------------------------------+-----------------------+
|                       |                                   |                       |
|   PANNEAU GAUCHE      |                                   |    PANNEAU DROIT      |
|   (Données réservées  |        SCÈNE 3D INTERACTIVE       |    (Actions &         |
|    au Rôle actif)     |    (Bascule Vaisseau / Orbite)    |     Compétences clés) |
|                       |                                   |                       |
+-----------------------+-----------------------------------+-----------------------+
| [JAUGES GLOBALES PARTAGÉES]      [BOUTON VETO (Jetons)]      [BASCULE CAMÉRA 3D]  |
+-----------------------------------------------------------------------------------+
```

### 1. HUD — Directeur de mission (DM)

* **Focus visuel 3D** : Vue globale avec surbrillance des jalons de mission et des zones de risque financier.
* **Panneau Gauche (Données réservées)** :
  * Jauge de **Budget total** et courbe de dépenses en temps réel.
  * **Réserve de contingence** (fonds bloqués pour les imprévus).
  * Indice de **Confiance des agences / sponsors** (impacté par les retards et incidents).
* **Panneau Droit (Actions clés)** :
  * Bouton **Débloquer la réserve** (injecte du budget d'urgence en Atelier ou en vol).
  * **Arbitrage de priorité** : permet d'imposer un objectif (Coût vs Science vs Sécurité) qui modifie les seuils de validation CML.
  * **Super-Veto** : 2 jetons permettant d'annuler un choix d'équipement ou de forcer une pause stratégique.

### 2. HUD — Ingénieur véhicule (IV)

* **Focus visuel 3D** : Vue éclatée du vaisseau, vecteurs de poussée, centre de gravité et cône de trajectoire orbitale ($\Delta v$).
* **Panneau Gauche (Données réservées)** :
  * **Bilan de masse détaillé** (structure, ergols, charge utile) et marge par rapport à la capacité du lanceur.
  * **Taux de fiabilité réel** de chaque composant (ex. : *Moteur cryogénique : 94 % de fiabilité, risque de fuite thermique*).
  * Courbe de **$\Delta v$ disponible vs $\Delta v$ requis**.
* **Panneau Droit (Actions clés)** :
  * **Allègement structural** : redistribue les points de matériaux (Al-Li, Titane, Composite) pour gagner de la masse.
  * **Calculateur de transfert** : simule en 3D l'impact d'une manœuvre (Hohmann, assistance gravitationnelle) sur les ergols.
  * **Mode Sécurité Mécanique** : bride la poussée moteur en cas de vibration ou d'anomalie détectée.

### 3. HUD — Ingénieur systèmes de bord (ISB)

* **Focus visuel 3D** : Calque thermique sur la coque (bleu froid à rouge surchauffe), faisceaux des antennes vers la Terre et flux d'énergie.
* **Panneau Gauche (Données réservées)** :
  * **Bilan électrique en temps réel** (production solaire/RTG vs consommation des instruments, état de charge des batteries).
  * **Télémétrie thermique** (température interne des baies électroniques en °C) et niveau d'exposition aux radiations (rad).
  * **Qualité du signal radio** (bande passante en bits/s et temps de latence Terre-vaisseau).
* **Panneau Droit (Actions clés)** :
  * **Routage d'énergie** : coupe temporairement un instrument gourmand pour recharger les batteries ou alimenter les radiateurs.
  * **Pointage d'antenne / Déploiement MLI** : oriente manuellement l'antenne parabolique ou active les boucliers thermiques lors d'une tempête solaire.
  * **Redémarrage à froid (Reboot)** : purge un sous-système buggé par les radiations (prend 30 secondes).

### 4. HUD — Responsable science et navigation (RSN)

* **Focus visuel 3D** : Cônes de visée des capteurs projetés sur la planète cible, zones d'intérêt scientifique en surbrillance.
* **Panneau Gauche (Données réservées)** :
  * **Score scientifique cumulé** et quota minimum requis pour valider la mission.
  * **Mémoire de bord** (capacité de stockage des données avant transmission vers la Terre).
  * **Cartographie des opportunités** : fenêtres de survol idéales (ex. : passage au-dessus d'un cratère glacé).
* **Panneau Droit (Actions clés)** :
  * **Déclenchement des instruments** (Caméra haute résolution, Spectromètre, Radar) au moment optimal du survol.
  * **Compression des données** : réduit la taille des fichiers scientifiques pour soulager la liaison radio (au prix d'une légère perte de qualité).
  * **Requête de correction d'orbite** : place un marqueur de cible sur la trajectoire 3D pour demander une manœuvre à l'IV.

---

## 🔧 Étape 2 — Phase de préparation technique (Atelier + CML)

### 2.1 Briefing de mission

- Consulter et valider les paramètres orbitaux : **orbite visée, fenêtre de lancement, delta-v requis** (données GMAT réelles ou formules orbitales — voir *Plan 24h* §3.5).
- Formuler l'**objectif scientifique en une phrase** (premier critère CML 1).
- ASTRA pose des questions courtes pour valider la compréhension des contraintes.

### 2.2 Conception dans l'Atelier

Le joueur parcourt le catalogue des **5 familles de composants** :

| Famille                          | Technologies disponibles                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 🚀 **Moteurs**                   | Chimique, Cryogénique, Ionique                                                                                                |
| 🛡️ **Matériaux et structures**  | Alliage d'aluminium, Al-Li, Titane, Composite carbone, Bouclier ablatif, MLI (isolation multicouche), Blindage antiradiations |
| ⚡ **Sources d'énergie**          | Panneaux solaires, Batteries, Générateur radio-isotopique (RTG)                                                               |
| 📡 **Antennes**                  | Faible gain, Parabolique, À balayage                                                                                          |
| 🔬 **Instruments scientifiques** | Caméra, Spectromètre, Radar                                                                                                   |

**Mécanique commune** :

- **12 points à répartir sur 4 axes** par famille, avec impact affiché en direct sur le devis.
- **Jetons d'Atelier** à dépenser pour débloquer des technologies avancées.
- **Trois essais après l'atelier**, et seulement ensuite : vibrations, isolation thermique, compatibilité électrique. Pas de test vide, pas d'étape de fabrication sur cet écran.
- **Équilibrage du devis de mission** : le joueur doit respecter **4 contraintes de conception** (**Budget en €**, **Masse totale en kg**, **Bilan de puissance en W**, **Durée de mission en mois**) qui conditionnent directement les **4 jauges dynamiques en vol** (**Carburant / $\Delta v$**, **Énergie stockée**, **Volume de données**, **Qualité de liaison**).

### 2.3 Checklist CML — validation par ASTRA (mécanique clé)

ASTRA joue le rôle d'**évaluateur indépendant** (conforme à la méthodologie NASA JPL *Wessen, Borden, Ziemer & Kwok, 2013* — l'auto-évaluation étant jugée trop optimiste et risquée).

**Règles** :

- **20 critères répartis sur 4 niveaux** (CML 1 → CML 4), soit 5 critères par niveau.
- Chaque critère est coté **Rouge / Jaune / Vert**.
- Un niveau est validé dès que **4 critères sur 5 sont verts (seuil 80 %)**.
- **Le joueur ne coche jamais lui-même** : ASTRA l'interroge et colore la pastille selon l'état réel de la conception.
- **Adaptation à la difficulté (prévue, pas encore appliquée par le moteur)** : en mode *Cadet*, les niveaux CML 1 et 2 seraient pré-validés par ASTRA ; en mode *Directeur de mission*, les 4 niveaux devraient être intégralement validés. Dans la version jouable, le réglage est enregistré, mais tous les chapitres suivent la même grille.

#### Grille des 20 critères CML

* **CML 1 — Idée (Briefing / Office Hours)**
  1. Objectif scientifique formulé en une phrase
  2. Ce qui rend la mission unique est identifié
  3. Fenêtre de lancement approximative choisie
  4. Classe de budget visée (CubeSat, flagship…)
  5. Premier croquis du vaisseau, même sommaire
* **CML 2 — Faisabilité (Concept Development)**
  6. Besoins scientifiques détaillés en exigences de premier niveau
  7. Masse, puissance et budget estimés en ordre de grandeur
  8. Risques majeurs identifiés
  9. Au moins un lanceur candidat listé
  10. Technologies nécessaires identifiées
* **CML 3 — Comparaison d'options (Trade Studies)**
  11. Au moins 2 architectures comparées
  12. Effet de chaque option sur science / coût / risque documenté
  13. Marges techniques estimées pour chaque option
  14. Sensibilité du design aux principaux paramètres de risque évaluée
  15. Option retenue justifiée face aux autres
* **CML 4 — Conception précise (Point Design)**
  16. Liste d'équipements complète
  17. Coût estimé avec marge de réserve
  18. Marges techniques validées par rapport au seuil retenu
  19. Plan de vérification (essais) défini
  20. Risques classés avec une piste de réduction

---

## 🤖 Script et Dialogues Types d'ASTRA (Validation CML)

Lors des revues de conception, ASTRA apparaît en hologramme au-dessus du vaisseau 3D. Ses répliques s'adaptent aux données réelles de la télémétrie du joueur.

### Scénario A — Validation CML 1 (Objectif scientifique)

> **ASTRA** : *« Avant de souder le moindre boulon, dis-moi en une phrase : quelle question scientifique précise cette sonde va-t-elle résoudre ? »*

* **Réponse floue du joueur** (*« Explorer la Lune et prendre des photos »*) :
  * **Pastille : 🔴 ROUGE**
  * **ASTRA** : *« Trop vague, Commandant. "Explorer" n'est pas un objectif mesurable. Précise la cible et l'instrument : par exemple, cartographier la glace d'eau au pôle Sud lunaire par spectrométrie. »*
* **Réponse ciblée mais incomplète** (*« Chercher de l'eau sur la Lune avec un radar »*) :
  * **Pastille : 🟡 JAUNE**
  * **ASTRA** : *« C'est mieux, nous avons la méthode et la cible. Il manque juste la zone géographique ou la résolution visée pour calibrer l'orbite. Je valide sous réserve. »*
* **Réponse rigoureuse** (*« Détecter la présence d'hydrogène dans les cratères ombragés du pôle Sud lunaire à l'aide d'un spectromètre à neutrons »*) :
  * **Pastille : 🟢 VERT**
  * **ASTRA** : *« Clair, mesurable et directement lié à l'instrumentation. Le critère CML 1.1 est validé. »*

### Scénario B — Validation CML 3 (Trade Studies / Comparaison d'options)

> **ASTRA** : *« Je vois que tu as sélectionné des panneaux solaires pour cette mission vers Jupiter. As-tu comparé cette architecture avec une alternative ? »*

* **Le joueur n'a testé qu'une seule configuration dans l'Atelier** :
  * **Pastille : 🔴 ROUGE**
  * **ASTRA** : *« Négatif. En ingénierie spatiale, une option unique n'est pas un choix, c'est un pari. Sauvegarde ton devis actuel, teste un générateur RTG dans l'Atelier et compare les deux bilans de masse et de puissance. »*
* **Le joueur a comparé 2 architectures, mais ignore le risque** :
  * **Pastille : 🟡 JAUNE**
  * **ASTRA** : *« Tu as bien comparé le solaire et le nucléaire. Toutefois, regarde la courbe d'éclairement à 5 UA : tes panneaux perdent 96 % de leur rendement. Documente ce risque si tu veux maintenir ce choix. »*
* **Le joueur a comparé 2 architectures et justifié le compromis** :
  * **Pastille : 🟢 VERT**
  * **ASTRA** : *« Comparaison documentée : le RTG alourdit le vaisseau de 45 kg mais garantit 300 W constants en orbite jovienne. Ton arbitrage est solide. »*

### Scénario C — Validation CML 4 (Marges techniques et feu vert lancement)

> **ASTRA** : *« Revue finale avant transfert sur le pas de tir. Vérifions tes marges de sécurité sur le $\Delta v$ et le budget. »*

* **Masse à la limite absolue du lanceur (0 % de marge)** :
  * **Pastille : 🔴 ROUGE**
  * **ASTRA** : *« Alerte rouge. Ta masse totale est de 1 499 kg pour un lanceur limité à 1 500 kg. La moindre variation thermique ou correction de trajectoire condamnera la mission. Allège la structure ou change de lanceur. »*
* **Critères tous verts, mais design sous-optimal (Réplique signature)** :
  * **Pastille : 🟢 VERT (Seuil 80 % atteint)**
  * **ASTRA** : *« Tous tes critères sont verts, le dossier est complet et le lancement est autorisé. Mais pose-toi la question : avec 35 % de budget inutilisé, n'aurais-tu pas pu embarquer un second instrument scientifique ? »*

---

## 🚀 Étape 3 — Lancement et Opérations (les 4 segments)

Une fois la checklist validée, la mission se déroule en **4 segments** :

### 🚀 Segment 1 — Lancement

- Choix du lanceur candidat (parmi ceux listés dès CML 2).
- Simulation du décollage en 3D et vérification des marges techniques.
- Si le CML requis n'est pas à 80 % de vert, ASTRA le dit. Le compte à rebours n'est pas interrompu.

### 🛰️ Segment 2 — Spatial (orbite / transit)

- **Communications** : établir le contact avec une station au sol (Madrid, Goldstone, Canberra ou Kourou).
- **Déploiement** dans l'ordre communications, énergie, puis instrument scientifique (visible en 3D : antenne, panneaux, instrument). Une séquence inversée est signalée.
- **Pilotage des jauges dynamiques en temps réel** : carburant ($\Delta v$), énergie stockée, volume de données, liaison radio et budget résiduel.
- Navigation et corrections de trajectoire (assistance gravitationnelle pour Jupiter, poussée continue pour moteur ionique…).

### 🌍 Segment 3 — Sol / Opérations scientifiques

- Activation des instruments (caméra, spectromètre, radar) — chaque capteur pointe vers sa cible en 3D.
- Collecte, compression et transmission des données scientifiques.
- Gestion de la **météorologie spatiale** (tempêtes solaires — chapitre 11).
- **Événements imprévus** : pannes matérielles, débris, manœuvres d'évitement (filière Sauvetage).

### 👥 Segment 4 — Utilisateurs / Retombées

- Distribution des données aux équipes scientifiques au sol.
- Valorisation scientifique (publications, découvertes majeures).
- Comparaison avec de **vraies missions NASA / ESA** (ex : *« Ton score équivaut à 85 % de la mission Lunar Reconnaissance Orbiter »*).

---

## 📊 Étape 4 — Bilan post-mission

- **Rapport post-mission** : score global, ressources, **3 décisions clés**, médaille, phrase NASA et citation d'ASTRA. Export PDF `SpaceHeroes_{titre}_{date}.pdf`.
- **Médailles et badges spéciaux** selon la performance et les contraintes relevées.
- **Fiche « Dans la vraie vie »** : comparaison détaillée avec la mission historique qui a inspiré le scénario.
- **Débriefing multijoueur** (si applicable) : replay des moments de tension, compromis et vetos utilisés.
- **Jetons d'Atelier gagnés** pour débloquer des technologies avancées (cryogénique, ionique, RTG).
- **ASTRA conclut** avec une analyse personnalisée (succès / échec / axe de progression).

---

## 🔄 Les 3 boucles de feedback 3D & L'effet papillon orbital

### Les 3 boucles de rétroaction

1. **Boucle Atelier (conception)** : `Choix de composant → Vaisseau 3D se transforme → Devis (Masse/Puissance/Budget) réagit → ASTRA commente → Ajustement`
2. **Boucle Checklist CML (validation)** : `ASTRA pose une question → Réponse du joueur → Pastille R/J/V s'allume → Seuil 80 % atteint ou non → ASTRA signale le manque, le lancement reste possible`
3. **Boucle Opérations (mission en cours)** : `Événement (débris, tempête, panne) → Scène 3D réagit → Joueur prend une décision → Conséquence immédiate sur le vaisseau / trajectoire / jauges`

### Exemple concret — Chapitre 4 « Cap sur la Lune »

| Décision                                                    | Conséquence immédiate                     | Conséquence en chaîne                                                                             |
| ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Choisir un moteur cryogénique plutôt que chimique           | Masse d'ergols réduite, $\Delta v$ accru  | Plus de marge de masse pour un instrument scientifique → score science augmenté                   |
| Négliger le contrôle thermique (MLI)                        | Économie de masse et de budget            | Sur la face éclairée de la Lune (+120 °C), l'électronique surchauffe → panne critique en 3D       |
| Oublier le bouclier ablatif (mission retour d'échantillons) | Gain de masse au décollage                | À la rentrée atmosphérique terrestre, le bouclier fond → **game over en 3D** (vaisseau qui brûle) |
| Valider CML 3 sans comparer 2 architectures                 | ASTRA signale le niveau incomplet         | Le compte à rebours reste ouvert ; le manque est compté au bilan                                   |
| Choisir une orbite polaire                                  | Couverture complète de la surface lunaire | Consommation en carburant plus élevée → nécessite une réserve de $\Delta v$ supérieure            |

---

## 👥 Multijoueur : les choix sont partagés, les conséquences aussi

En mode 4 joueurs, **chaque rôle observe des manifestations différentes** pour une même décision :

| Rôle                                  | Ce qu'il voit dans son interface et en 3D                  | Ce qu'il décide                                   |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| **Directeur de mission**              | Le budget qui fond et les alertes de planning              | Arbitrer entre ambition scientifique et coût      |
| **Ingénieur véhicule**                | Le vaisseau qui s'alourdit, la trajectoire qui se dégrade  | Choisir les matériaux, structures et moteurs      |
| **Ingénieur systèmes de bord**        | Les jauges énergie / thermique / liaison qui clignotent    | Gérer la puissance, l'orientation et les liaisons |
| **Responsable science et navigation** | Les instruments qui pointent, les données qui s'accumulent | Sélectionner les cibles et prioriser les mesures  |

**Un veto en temps réel encadré** : chaque joueur dispose d'un nombre limité de **jetons de veto** par segment. En cas de désaccord critique, il peut déclencher un veto → **la scène 3D se fige pendant 60 secondes maximum** pour négocier un compromis (arbitré par le serveur autoritaire — *Perspectives* §3.2).

---

## 🎓 La 3D comme outil pédagogique & Rejouabilité

### Modélisation scientifique réelle

- **La trajectoire** : calculée avec les vraies formules orbitales (GMAT) — orbite de transfert de Hohmann, assistance gravitationnelle ou spirale ionique.
- **Le vaisseau** : assemblé à partir des 5 familles réelles avec des masses, puissances et coûts cohérents.
- **L'environnement** : la distance au Soleil modifie le rendement des panneaux solaires, les ceintures de Van Allen augmentent les radiations et la météo spatiale affecte les capteurs.
- **Les événements** : débris, tempêtes solaires, pannes — inspirés de faits réels (collision Iridium-Cosmos, tempête solaire de Carrington).

### Rejouabilité et maîtrise

- **Fins multiples** : succès total, succès partiel, échec formateur.
- **Arbre de décisions visible** : écran interactif post-mission (*« si tu avais choisi X au lieu de Y, voici ce qui se serait passé »*).
- **Badges de maîtrise** : ex. *« Maître de l'orbite polaire »* (orbite polaire + budget serré).
- **Modes de jeu** : **Mode Défi** (masse max -20 %, fenêtre de temps -30 %) et **Mode Découverte** (exploration sans pression de score).

---

## 📌 Synthèse pédagogique — Ce que le joueur retient

Au terme d'une session dans *Space Heroes*, le joueur a expérimenté concrètement les trois piliers de l'ingénierie spatiale :

1. **L'interdépendance des systèmes** : toute amélioration d'un sous-système (science, blindage) se paie ailleurs (masse, $\Delta v$, budget).
2. **La rigueur de la conception (CML)** : un lancement réussi repose sur une validation méthodique et critique, jamais sur l'improvisation.
3. **La gestion de l'incertitude** : les marges techniques prévues au sol sont l'unique assurance-vie du vaisseau face aux aléas de l'espace.

**L'émotion passe par les yeux, l'apprentissage par les conséquences.**

---

## 🔗 Références et documents liés

- *Document de conception du jeu* (47 p.) — conception initiale
- *Plan de travail Space Heroes 24h* — répartition des pistes, planning, checklist intégrale
- *Addendum CML Checklist Space Heroes* — détail des 20 critères, rôle d'ASTRA comme évaluateur indépendant
- *Perspectives et améliorations* — fluidité, complétude, multijoueur en ligne, roadmap V1→V5
- **Source CML** : Wessen, R. R., Borden, C., Ziemer, J., Kwok, J. (2013). *Space Mission Concept Development Using Concept Maturity Levels*. Jet Propulsion Laboratory, California Institute of Technology (document `13-3547_A1b`).