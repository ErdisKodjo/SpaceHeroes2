# Space Heroes — Jeu de conception de mission spatiale

**NASA Space Apps Challenge 2026**

Jeu interactif en navigateur où les joueurs conçoivent des missions spatiales (CubeSats, orbiteurs, atterrisseurs) en respectant des contraintes techniques réalistes. Conçu avec Three.js pour une visualisation 3D de la Terre, du vaisseau et des trajectoires orbitales.

- **Documentation utilisateur** : `docs/guide_user.md`
- **Document de conception** : `docs/space_heroes_document_de_conception_complet.md`
- **Plan de travail 24h** : `docs/Plan_de_travail_Space_Heroes_24h.md`
- **Addendum CML** : `docs/Addendum_CML_Checklist_Space_Heroes.md`

---

## Principe

**Un seul moteur générique, le contenu est de la donnée**. Le moteur (`src/engine/`) ne connaît aucun chapitre ni mission par leur nom — il lit des fichiers JSON (`src/data/`) qui décrivent épisodes, pièces d'Atelier, critères CML, répliques d'ASTRA, tables GMAT. Ajouter un chapitre ou une mission = ajouter un fichier de données, pas écrire du code.

### Architecture

- **Moteur générique** (`src/engine/`) : logique de jeu commune à toutes les missions
- **Données** (`src/data/`) : chapitres, ateliers, GMAT, dialogues, missions
- **UI** (`src/ui/`) : interface utilisateur (hub, dashboard, atelier, bilan...)
- **Visualisation 3D** (`src/vis/`) : scène Three.js avec Terre, vaisseau, orbite
- **Audio** (`src/audio/`) : musique originale synthétisée et effets sonores

**Stack** : Vite + JavaScript (ES modules) + Three.js, en PWA — tourne dans un navigateur, desktop et mobile, sans installation.

---

## Arborescence

```
SpaceHeroes2/
├── index.html                  Page d'entrée
├── package.json
├── public/
│   ├── manifest.json           Manifeste PWA
│   ├── service-worker.js       Cache hors-ligne
│   └── textures/               Textures Terre (atmosphère, nuages, etc.)
├── src/
│   ├── main.js                 Point d'entrée, assemble le moteur et l'UI
│   ├── engine/                 Moteur générique
│   │   ├── resources.js        6 ressources + règles d'interaction
│   │   ├── segments.js         4 segments de mission
│   │   ├── cml.js              Checklist CML (20 critères R/J/V, seuil 80%)
│   │   ├── astra.js            Moteur de dialogue ASTRA
│   │   ├── episode.js          Moteur générique d'épisode/chapitre
│   │   ├── atelier.js          Moteur de fabrication de pièces (12 points / 4 axes)
│   │   ├── score.js            Score de mission + rapport post-mission
│   │   ├── bilan.js            Évaluation finale de mission
│   │   ├── player.js           Profil joueur (nom, rôle, scores)
│   │   ├── save.js             Sauvegarde/charger
│   │   └── settings-store.js   Préférences utilisateur
│   ├── data/                   Contenu réel (JSON)
│   │   ├── chapters/           5 chapitres (chapitre_01 à 05)
│   │   ├── ateliers/           5 familles (moteurs, structure, énergie, comm, instrument)
│   │   ├── gmat/               8 types de scénarios orbitaux
│   │   ├── astra/              Répliques ASTRA par contexte
│   │   ├── cml/                20 critères de checklist
│   │   ├── missions_reelles.json  Comparaisons avec vraies missions
│   │   └── roles.json          Rôles possibles
│   ├── ui/                     Interface utilisateur (15 fichiers)
│   ├── vis/                    Visualisation 3D (10 fichiers)
│   ├── audio/                  Musique et effets (4 fichiers)
│   ├── i18n/                   Internationalisation (fr/en)
│   └── logo.png                Logo officiel
├── docs/                       Documentation
│   ├── guide_user.md           Guide d'utilisation du joueur
│   ├── space_heroes_document_de_conception_complet.md
│   ├── Plan_de_travail_Space_Heroes_24h.md
│   ├── Addendum_CML_Checklist_Space_Heroes.md
│   └── Perspectives_et_Ameliorations_Space_Heroes.md
└── scripts/                    Scripts de build (icones, logo)
```

---

## Ce qui est déjà codé

### Moteur générique (terminé)
- ✅ 6 ressources (Budget, Masse, Puissance, Données, Communications, Durée)
- ✅ 4 segments de mission (Lancement, Spatial, Sol, Utilisateurs)
- ✅ Checklist CML (20 critères R/J/V, seuil 80% par niveau)
- ✅ Moteur de dialogue ASTRA (évaluatrice indépendante du CML)
- ✅ Moteur d'épisode/chapitre générique
- ✅ Moteur d'Atelier (12 points / 4 axes, calcul de coût)
- ✅ Moteur de score/rapport post-mission
- ✅ Sauvegarde/charger automatique
- ✅ Profil joueur (nom, rôle, scores, jetons)

### Contenu (terminé)
- ✅ **5 chapitres** complets (Briefing → Atelier → Essais → Lancement → Opérations → Bilan)
- ✅ **5 familles d'Atelier** (Moteurs, Structure, Énergie, Communications, Instruments)
- ✅ **8 types de scénarios orbitaux GMAT** (orbite basse, polaire, géostationnaire, Terre-Lune, Lagrange L2, Terre-Mars, ionique, Jupiter)

### UI (terminé)
- ✅ Hub QG avec carte du système solaire
- ✅ Choix de rôle (DM, IV, ISB, RSN)
- ✅ Dashboard à 6 jauges
- ✅ Atelier avec visualisation 3D du CubeSat
- ✅ Essais (vibrations, thermique, électrique)
- ✅ Lancement avec compte à rebours
- ✅ Opérations (contact radio, déploiement, transmission)
- ✅ Bilan avec score, médaille, PDF exportable
- ✅ ASTRA widget (cercle qui pulse + bulle de dialogue)

### Visualisation 3D (terminée)
- ✅ Scène avec Terre (jour/nuit, nuages, atmosphère, lumières villes)
- ✅ Séquence de lancement (vaisseau, panache, effets sonores)
- ✅ HUD orbital (time scale x1/x1000, telemetry)
- ✅ Contrôles interactifs (Drag · WASD · molette)
- ✅ Particle effects (célébration orbite atteinte)
- ✅ CubeSat 3D avec déploiement

### Audio (terminé)
- ✅ Musique synthétisée originale (une boucle par écran, 7 tempos)
- ✅ Effets sonores (radio, countdown, liftoff, success)
- ✅ Voix ASTRA (speech synthesis, fr/en)
- ✅ Contrôle son (muet / volume ambience)

### Internationalisation (terminée)
- ✅ Français / Anglais (tous les textes visibles traduits)
- ✅ Voix ASTRA adaptative (fr-FR ou en-US selon la langue)

### Accessibilité (terminée)
- ✅ Réduction de mouvement
- ✅ Contrastes élevés
- ✅ Mode daltonien (deutéranopie, protanopie, tritanopie)
- ✅ Taille de police modulable
- ✅ Sous-titres

---

## Comment lancer

```bash
# Installer les dépendances (une fois)
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview le build
npm run preview
```

Le jeu s'ouvre sur `http://127.0.0.1:5173/`

### Modes de démonstration

| Adresse | Où l'on arrive |
| --- | --- |
| `?demo=1` | Chapitre 1, au briefing |
| `?demo=lancement` | Au décollage (compte à rebours automatique) |
| `?demo=bilan` | Au rapport (CubeSat d'exemple) |

---

## Ce qui reste à faire

### Fonctionnalités complémentaires (non critiques pour la version actuelle)

- **Piste 6 — Multijoueur en ligne** : moteur multijoueur générique est codé mais pas encore branché à un serveur WebSocket
- **12 chapitres supplémentaires** (ch.6 à 12) : le moteur est prêt, les données JSON sont à créer
- **Pistes orbitales avancées** : assistance gravitationnelle, rendez-vous orbital, évitement
- **Mission habitée** : modules avec équipage, EVAs
- **Filière observation avancée** : constellations, interferométrie
- **Filière exploration** : stations lunaires, bases martiennes
- **Opération Phénix** : campagne multimanche
- **Fiches « Dans la vraie vie »** : bibliothèque pédagogique cliquable
- **Carte du système solaire interactive** : navigation vers les missions

### Améliorations techniques

- Tests unitaires (moteur, atelier, score)
- CI/CD automatique (build, test, deploy)
- Performance mobile (fallback 2D pour certaines animations)
- Accessibilité complète (keynav, screen readers)

---

## Ressources

**Design and Develop Science Missions** (NASA) — base du concept  
**GMAT** (Generic Mission Analysis Toolkit) — calculs orbitaux  
**CML** (Concept Maturity Levels) — checklist de maturité  
**Mission Viz** — visualisation orbitale  
**CubeSat 101** — contraintes réelles

---

## Licence

Projet de recherche/éducatif — NASA Space Apps Challenge 2026

---

## Auteur

Conçu pour le NASA Space Apps Challenge 2026 avec une équipe de 4-6 personnes en 24h.
