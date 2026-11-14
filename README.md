# Space Heroes — Projet de code

Jeu de conception de mission spatiale (NASA Space Apps Challenge 2026). Ce dossier contient le code du prototype. Les documents de conception et de planification restent à la racine de `F:\SPACE HEROES\` et sont copiés dans `docs/` pour référence rapide.

## Principe d'architecture

Comme décidé dans le plan de travail 24h : **un seul moteur générique, le contenu est de la donnée**. Le moteur (`src/engine/`) ne connaît aucun chapitre ni aucune mission par son nom — il lit des fichiers JSON (`src/data/`) qui décrivent épisodes, pièces d'Atelier, critères CML, répliques d'ASTRA, tables GMAT. Ajouter un chapitre ou une mission = ajouter un fichier de données, pas écrire du code.

Stack : **Vite + JavaScript (ES modules) + Three.js**, en PWA — tourne dans un navigateur, desktop et mobile, sans installation (décision actée avec l'équipe).

## Arborescence

```
SpaceHeroes/
├── index.html                  Page d'entrée
├── package.json
├── vite.config.js
├── public/
│   ├── manifest.json           Manifeste PWA
│   └── service-worker.js       Cache hors-ligne basique
├── src/
│   ├── main.js                 Point d'entrée, assemble le moteur et l'UI
│   ├── engine/                 Moteur générique (ne dépend d'aucun contenu précis)
│   │   ├── resources.js        Les 6 ressources + règles d'interaction (§3.1)
│   │   ├── segments.js         Les 4 segments de mission (§3.9)
│   │   ├── cml.js              Checklist CML 20 critères R/J/V, seuil 80% (voir Addendum CML)
│   │   ├── astra.js            Moteur de dialogue ASTRA (répliques par contexte)
│   │   ├── episode.js          Moteur générique d'épisode/chapitre
│   │   ├── atelier.js          Moteur de fabrication de pièces (12 points / 4 axes)
│   │   └── score.js            Score de mission + rapport post-mission (§3.6)
│   ├── data/                   Le contenu réel, sous forme de données
│   │   ├── chapters/           Un fichier JSON par chapitre (chapitre_01.json, …)
│   │   ├── ateliers/           Un fichier JSON par famille de pièces (moteurs.json, …)
│   │   ├── astra/              Répliques d'ASTRA par contexte
│   │   ├── cml/                Les 20 critères de la checklist CML
│   │   └── gmat/                Tables GMAT simplifiées, une par type de scénario
│   ├── ui/                     Affichage (lit l'état du moteur, ne contient pas de règles de jeu)
│   │   ├── dashboard.js / .css Tableau de bord à 6 jauges
│   │   ├── episode-view.js     Déroulé d'un épisode
│   │   └── astra-widget.js     Widget visuel d'ASTRA (cercle qui pulse + bulle)
│   └── vis/                    Visualisation 3D (écran de mission, §3.12)
│       └── scene.js            Scène Three.js minimale (base à étendre avec mission-viz)
└── docs/                       Copies des documents de planification pour référence
    ├── Plan_de_travail_Space_Heroes_24h.md
    ├── Perspectives_et_Ameliorations_Space_Heroes.md
    └── Addendum_CML_Checklist_Space_Heroes.md
```

## Ce qui est déjà codé (premier jet)

- Le moteur de ressources (6 jauges), le bandeau des 4 segments, la checklist CML (20 critères)
- Le moteur de dialogue ASTRA et son rôle d'évaluatrice indépendante du CML
- Le moteur d'épisode générique, avec le **Chapitre 1 — Le premier signal** comme premier contenu (5 épisodes + Bilan, événement aléatoire, score final)
- Une famille d'Atelier (**Moteurs**, 3 technologies) avec le calcul de coût en jetons
- Une scène Three.js minimale pour le panneau « Vue 3D » (à étoffer avec le code de `mission-viz-main`, pas encore branché)

## Comment lancer

```bash
cd SpaceHeroes
npm install
npm run dev
```

## Ce qui reste à faire (répartition par piste, voir `docs/Plan_de_travail_Space_Heroes_24h.md`)

- **P2 (GMAT)** : remplir `src/data/gmat/` avec les vraies tables pour les 8 types de scénarios (actuellement un seul fichier placeholder)
- **P3 (Contenu solo)** : ajouter les fichiers `src/data/chapters/chapitre_02.json` à `chapitre_12.json`
- **P4 (Atelier + multijoueur)** : ajouter les 4 familles d'Atelier restantes dans `src/data/ateliers/`, et un moteur de mission multijoueur (`src/engine/multiplayer.js`, pas encore créé)
- **P5 (Visualisation)** : connecter `src/vis/scene.js` au vrai code de `mission-viz-main/OntologyDrivenOrrery` pour la carte orbitale et le transfert de trajectoire
