# Plan2.md — Plan d'exécution Premium
## Space Heroes → Jeu vidéo complet

> Basé sur l'audit du 14 novembre 2026 et le document de conception complet.
> Le Plan1.md (3D) est 100% terminé. Ce plan couvre tout ce qui reste pour un jeu premium.
> Chaque tâche est marquée [ ] à cocher au fur et à mesure.

---

## Priorités globales

| Couleur | Signification |
|---|---|
| 🔴 | Bloquant gameplay — sans ça le jeu n'est pas jouable |
| 🟠 | Important — profondeur et rejouabilité |
| 🟡 | Qualité — différence entre bon et premium |
| 🔵 | Bonus jury NASA — pour impressionner |

---

## Principe fondateur : « Tu vois ce que tu choisis »

Dans *Space Heroes*, **la 3D n'est pas un décor : c'est le terrain de jeu**. Chaque choix du joueur se traduit immédiatement par une transformation visible de son vaisseau, de sa trajectoire ou de son environnement.

| Choix du joueur | Conséquence visible en temps réel |
|---|---|
| Ajout d'un instrument lourd | Trajectoire qui se dégrade, ASTRA alerte en rouge |
| Panneaux solaires au lieu d'un RTG | Énergie qui chute loin du Soleil (Jupiter = inefficace) |
| Moteur ionique | Spirale lente visible en 3D au lieu d'une courbe rapide |
| Pas de blindage antiradiations | Écran teinté rouge, instruments en panne à Jupiter |
| Économie sur les communications | Faisceau coupé, jauge données chute |
| Checklist CML bâclée | ASTRA refuse le lancement, compte à rebours figé |

---

## SPRINT 0 — QG de Mission + Sélection du personnage
*La porte d'entrée du jeu. Sans ça, le joueur arrive directement dans une mission sans contexte.*

### T0.1 🔴 — QG de Mission (hub central)

**Objectif :** écran d'accueil qui sert de hub entre toutes les missions.

**Contenu :**
- **Carte du système solaire interactive** : marqueurs cliquables sur chaque destination (Lune, Mars, Jupiter, L1…) → ouvre le chapitre correspondant
- **Tableau de bord joueur** : progression globale, médailles obtenues, technologies débloquées, statistiques (temps, décisions, succès/échecs)
- **Salle de briefing ASTRA** : avant chaque mission, court dialogue contextuel (*"Cette mission s'inspire d'Artemis I, voici ce que tu dois savoir…"*)
- **Bibliothèque pédagogique** : fiches "Dans la vraie vie" accessibles depuis le hub
- **Boutons de navigation** : Nouvelle Partie, Continuer (si sauvegarde), ⚙️ Paramètres, Crédits

**Fichiers à créer :** `src/ui/hub.js`, `src/ui/hub.css`

---

### T0.2 🔴 — Sélection et configuration du personnage

**Objectif :** avant chaque mission, le joueur choisit son rôle. Ce choix donne accès à des informations réservées et une compétence exclusive qui influence le gameplay.

**Les 4 rôles (solo : ASTRA gère les 3 autres) :**

| Rôle | Informations réservées | Compétence clé |
|---|---|---|
| **Directeur de mission** | Budget global, arbitrages stratégiques | Super-veto (2 jetons), déblocage de réserve d'urgence |
| **Ingénieur véhicule** | Fiabilité réelle des composants, limites structurales | Optimisation masse / Δv, calculateur de transfert |
| **Ingénieur systèmes de bord** | État énergie / thermique / communication en détail | Routage d'énergie, pointage antenne, reboot système |
| **Responsable science** | Objectifs scientifiques, fenêtres de visée | Déclenchement instruments, compression données |

**Écran de sélection :**
- 4 cartes de rôle avec illustration + description courte
- Statistiques de partie précédente affichées par rôle (meilleur score, temps moyen)
- Nom du joueur (saisie libre ou généré : "Commandant Dupont")

**HUD adaptatif selon le rôle choisi :**
```
+──────────────────────────────────────────────────────────+
│ [ASTRA : flux audio + alertes]  [PHASE]  [TEMPS/FENÊTRE] │
+─────────────────+──────────────────────+─────────────────+
│  PANNEAU GAUCHE │                      │  PANNEAU DROIT  │
│  (Données       │   SCÈNE 3D (70%)     │  (Actions &     │
│   réservées     │  Vaisseau / Orbite   │   Compétences   │
│   au rôle)      │                      │   du rôle)      │
+─────────────────+──────────────────────+─────────────────+
│ [JAUGES GLOBALES PARTAGÉES]  [VETO]  [BASCULE CAMÉRA 3D] │
+──────────────────────────────────────────────────────────+
```

**Fichiers à créer :** `src/ui/role-select.js`, `src/engine/player.js`
**Données :** `src/data/roles.json` (4 rôles avec stats et compétences)

---

### T0.3 🔴 — Écran Paramètres

**Objectif :** écran dédié accessible depuis le QG (bouton ⚙️) et depuis le menu pause en cours de mission. Regroupe **tous** les réglages du jeu en un seul endroit.

**Section 1 — Mode de jeu**

| Option | Valeurs | Effet |
|---|---|---|
| **Difficulté** | Cadet / Ingénieur / Directeur / Bac à sable | Modifie les marges CML, la fréquence des imprévus, l'assistance ASTRA |
| **Mode de jeu** | Campagne / Défi / Découverte | Campagne = progression normale ; Défi = contraintes renforcées (-20% masse, -30% temps) ; Découverte = exploration sans pression de score |
| **Tutoriel** | Activé / Désactivé | Active ou coupe les tooltips guidés en cours de partie |
| **Événements aléatoires** | Activés / Désactivés | Coupe les imprévus (pannes, débris, tempêtes) pour un run calme |
| **Vitesse de simulation** | ×1 / ×100 / ×1000 | Vitesse par défaut de l'orbite (modifiable aussi via HUD) |

**Détail des 4 niveaux de difficulté :**
- **Cadet** : marges larges, CML 1-2 pré-validés par ASTRA, assistance maximale, 0 événement imprévu
- **Ingénieur** : marges standard, CML 1-3 validés, quelques événements imprévus
- **Directeur de mission** : 4 niveaux CML intégraux, événements imprévus fréquents, marges réduites
- **Bac à sable** : exploration libre, aucune contrainte de score, toutes les technologies débloquées

**Section 2 — Audio**

| Option | Valeurs |
|---|---|
| **Volume général** | Curseur 0–100% |
| **Effets sonores** | Curseur 0–100% (compte à rebours, rumble, radio) |
| **Voix ASTRA** | Activée / Désactivée |
| **Musique d'ambiance** | Curseur 0–100% |

**Section 3 — Affichage**

| Option | Valeurs |
|---|---|
| **Qualité graphique** | Basse / Moyenne / Haute / Ultra (résolution renderer, ombres, antialiasing) |
| **Mode plein écran** | Activé / Désactivé |
| **Réduction de mouvement** | Activée / Désactivée (respecte aussi `prefers-reduced-motion`) |
| **Mode daltonien** | Désactivé / Deutéranopie / Protanopie / Tritanopie (remplace les couleurs des jauges CML) |
| **Contrastes élevés** | Activé / Désactivé (renforce les couleurs HUD pour environnements lumineux) |
| **Taille de police** | Normale / Grande / Très grande |

**Section 4 — Accessibilité**

| Option | Valeurs |
|---|---|
| **Sous-titres ASTRA** | Activés / Désactivés |
| **Vitesse de lecture** | Normale / Lente (délai entre les répliques ASTRA) |
| **Navigation clavier** | Toujours activée |

**Section 5 — Langue**

| Option | Valeurs |
|---|---|
| **Langue** | Français / English |

**Section 6 — Données**

| Option | Action |
|---|---|
| **Effacer la sauvegarde** | Bouton avec confirmation (supprime le `localStorage`) |
| **Exporter la progression** | Télécharge un fichier JSON de sauvegarde |
| **Importer une sauvegarde** | Charge un fichier JSON exporté |

**Persistance :** toutes les options sont sauvegardées dans `localStorage` sous la clé `sh-settings`.

**Fichiers à créer :** `src/ui/settings.js`, `src/engine/settings-store.js`
**Données :** `src/data/settings-defaults.json` (valeurs par défaut de chaque option)

---

## SPRINT 1 — Fixes rapides (< 2h au total)
*Petits bugs qui cassent des fonctionnalités déjà codées.*

### T1.1 🔴 — Dispatcher `astra-message` depuis `astra.js`
**Problème :** `main.js` écoute `astra-message` pour déclencher l'audio radio ASTRA, mais `AstraEngine.say()` ne dispatche jamais cet événement → la voix ASTRA est muette.

**Fix :** dans `src/engine/astra.js`, à la fin de `say()` :
```js
window.dispatchEvent(new CustomEvent('astra-message', { detail: entry }));
```
**Fichier :** `src/engine/astra.js`

---

### T1.2 🔴 — Dispatcher `vis-announcer` depuis `launch.js`
**Problème :** `main.js` écoute `vis-announcer` pour les sons du compte à rebours et du décollage, mais `launch.js` ne dispatche que son overlay interne → le countdown audio ne sonne pas.

**Fix :** dans `src/vis/launch.js`, dans `updateLaunch()` :
```js
// Compte à rebours
window.dispatchEvent(new CustomEvent('vis-announcer', { detail: { text: `T-${n}`, variant: '' } }));
// Décollage
window.dispatchEvent(new CustomEvent('vis-announcer', { detail: { text: 'DÉCOLLAGE', variant: 'is-liftoff' } }));
// Orbite
window.dispatchEvent(new CustomEvent('vis-announcer', { detail: { text: 'ORBITE', variant: 'is-success' } }));
```
**Fichier :** `src/vis/launch.js`

---

### T1.3 🟡 — Brancher `flashWarning()` sur les alertes ASTRA
**Fix :** dans `main.js` :
```js
window.addEventListener('astra-message', ({ detail }) => {
  if (detail?.categorie === 'alerte') vue3d.flashWarning();
  if (detail?.categorie === 'succes') vue3d.celebrate?.();
});
```
**Fichier :** `src/main.js`

---

### T1.4 🟡 — Code splitting Vite (Three.js > 500 KB)
**Fix :** dans `vite.config.js` :
```js
build: {
  rollupOptions: {
    output: { manualChunks: { three: ['three'] } }
  }
}
```
**Fichier :** `vite.config.js`

---

## SPRINT 2 — Phase de préparation technique (Atelier + CML)
*Le cœur du gameplay avant le lancement.*

### T2.1 🔴 — Briefing de mission interactif

**Objectif :** avant l'Atelier, le joueur formule sa mission avec ASTRA. C'est ici que les critères CML 1 sont validés.

**Ce que le joueur fait :**
- Consulte les **paramètres orbitaux** : orbite visée, fenêtre de lancement, Δv requis (données GMAT)
- Formule l'**objectif scientifique en une phrase** (critère CML 1.1)
- ASTRA valide en direct avec le système R/J/V :

> *"Avant de souder le moindre boulon, dis-moi en une phrase : quelle question scientifique précise cette sonde va-t-elle résoudre ?"*

| Réponse du joueur | Pastille | Réaction ASTRA |
|---|---|---|
| Vague : "Explorer la Lune" | 🔴 Rouge | *"Trop vague. Précise la cible et l'instrument."* |
| Partielle : "Chercher de l'eau avec un radar" | 🟡 Jaune | *"Il manque la zone géographique ou la résolution."* |
| Rigoureuse : "Détecter H₂ dans les cratères ombragés du pôle Sud lunaire par spectromètre" | 🟢 Vert | *"Clair, mesurable, lié à l'instrumentation. Critère CML 1.1 validé."* |

**Fichier à modifier :** `src/ui/episode-view.js` (rendre le briefing interactif)

---

### T2.2 🔴 — UI Atelier interactive (5 familles de composants)

**Objectif :** le joueur assemble son vaisseau. Chaque choix est visible en 3D immédiatement.

**Les 5 familles :**

| Famille | Technologies disponibles |
|---|---|
| 🚀 Moteurs | Chimique, Cryogénique (ch5), Ionique (ch9) |
| 🛡️ Structures | Chassis alu, Al-Li, Titane, Carbone, MLI, Blindage radiation |
| ⚡ Énergie | Panneaux solaires GaAs/Si, Batteries Li-ion, RTG (ch4) |
| 📡 Communications | Antenne UHF, X-band, Laser optique (ch5) |
| 🔬 Instruments | Capteur T°, Caméra, Spectromètre, Magnétomètre, Radar |

**Mécanique :**
- 12 points à répartir sur 4 axes par famille, avec impact affiché en direct
- Jetons d'Atelier à dépenser pour débloquer des technologies avancées
- 4 contraintes de conception : Budget (€), Masse (kg), Puissance (W), Durée (mois)
- Le CubeSat 3D se transforme à chaque sélection (event `composant-ajoute`)

**Maquette :**
```
┌─────────────────────────────────────────────┐
│  ATELIER  —  CubeSat 1U                     │
│  Masse : 2.4 / 4.0 kg  ████░  Budget : OK  │
├─────────┬──────────┬────────┬───────────────┤
│ Moteurs │Structure │ Énergie│ Comms │Instrum│
├─────────┴──────────┴────────┴───────┴───────┤
│  [ ] Chassis alu     0.4 kg   10 k€         │
│  [x] Chassis titane  0.3 kg   18 k€   ✓    │
│  [ ] Chassis CFRP    0.25 kg  28 k€         │
├─────────────────────────────────────────────┤
│  ASTRA : "Avec ce châssis tu as 0.3 kg de  │
│  marge pour un instrument. Que choisiras-tu?"│
├─────────────────────────────────────────────┤
│           [ VALIDER L'ATELIER ]              │
└─────────────────────────────────────────────┘
```

**Fichiers à créer :**
- `src/ui/atelier-view.js`
- `src/data/ateliers/structure.json`
- `src/data/ateliers/energie.json`
- `src/data/ateliers/communications.json`
- `src/data/ateliers/instrument.json`

**Données structure.json :**
- Chassis aluminium 6061 : 0.4 kg, 10k€
- Chassis Al-Li : 0.32 kg, 14k€
- Chassis titane : 0.3 kg, 18k€
- Chassis CFRP carbone : 0.25 kg, 28k€
- Isolation thermique MLI : 0.05 kg, 5k€
- Blindage antiradiations : 0.12 kg, 15k€

**Données energie.json :**
- Panneaux GaAs 1U : 0.08 kg, 8W, 12k€
- Panneaux Si 2U : 0.14 kg, 15W, 8k€
- Batterie Li-ion 20Wh : 0.22 kg, 7k€
- RTG (déblocage ch4) : 0.5 kg, 5W continu, 95k€

**Données communications.json :**
- Antenne UHF patch : 0.04 kg, 9.6 kbps, 4k€
- Antenne X-band : 0.09 kg, 100 Mbps, 22k€
- Laser optique (déblocage ch5) : 0.12 kg, 1 Gbps, 55k€

**Données instrument.json :**
- Capteur température : 0.02 kg, 0.1W, 2k€
- Caméra visible 5MP : 0.08 kg, 2W, 15k€
- Spectromètre UV : 0.15 kg, 4W, 28k€
- Magnétomètre : 0.06 kg, 0.5W, 10k€
- Radar altimètre : 0.22 kg, 8W, 42k€

---

### T2.3 🔴 — Checklist CML complète (20 critères, validation ASTRA)

**Règles :**
- 20 critères sur 4 niveaux (5 par niveau), cotés Rouge / Jaune / Vert
- Niveau validé à 80% de critères verts (4/5)
- **Le joueur ne coche jamais lui-même** : ASTRA interroge et colore la pastille
- Mode Cadet : niveaux 1-2 pré-validés. Mode Directeur : 4 niveaux intégraux

**Grille des 20 critères :**

*CML 1 — Idée :* objectif scientifique, unicité de la mission, fenêtre de lancement, classe de budget, croquis du vaisseau

*CML 2 — Faisabilité :* exigences de premier niveau, estimations masse/puissance/budget, risques majeurs, lanceur candidat, technologies nécessaires

*CML 3 — Trade Studies :* 2 architectures comparées, effet de chaque option documenté, marges estimées, sensibilité aux risques, option retenue justifiée

*CML 4 — Conception précise :* liste équipements complète, coût avec marge de réserve, marges validées, plan de vérification, risques classés

**Scénario CML 3 — ASTRA sur les trade studies :**
> *"Je vois que tu as sélectionné des panneaux solaires pour Jupiter. As-tu comparé avec un RTG ?"*
- Pas de comparaison → 🔴 *"Une option unique n'est pas un choix, c'est un pari."*
- Comparaison sans risque documenté → 🟡 *"Tes panneaux perdent 96% de rendement à 5 UA. Documente ce risque."*
- Comparaison + justification → 🟢 *"Le RTG alourdit de 45 kg mais garantit 300W constants. Arbitrage solide."*

**Fichier à modifier :** `src/engine/cml.js` + `src/ui/cml-view.js` (nouveau)

---

### T2.4 🔴 — Épisode Essais interactif (banc d'essai 3D)

**Objectif :** 3 épreuves de validation avant le lancement. Résultat = fiabilité du CubeSat (0–100%).

**Les 3 épreuves :**
1. **Test vibrations** : maintenir une jauge dans la zone verte pendant 5s (slider rythmé)
2. **Test thermique** : choisir le bon matériau d'isolation parmi 3 options
3. **Test électrique** : vérifier la compatibilité de 3 composants (câblage sans erreur)

**Connexion 3D :** le moteur s'allume visuellement, le panneau se déploie, l'instrument pointe pendant le banc d'essai.

**Résultat :** fiabilité stockée → influence `qualiteDecisions` dans le score final.

**Fichier à créer :** `src/ui/essais-view.js`

---

## SPRINT 3 — Lancement et Opérations

### T3.1 🔴 — Épisode Opérations interactif (4 segments post-lancement)

**Segment 2 — Spatial (orbite / transit)**

Le joueur pilote les premières heures de mission :
1. **Communications** : établir le contact avec les stations au sol visibles sur le globe 3D
   - Le contact est possible seulement quand le CubeSat passe au-dessus de la station
   - Délais radio simulés (3s aller-retour Lune, 20 min Mars)
   - Mini-jeu de synchronisation de fréquence pour le premier contact
2. **Déploiement des instruments** : visible en 3D (panneaux qui s'ouvrent, antenne qui s'oriente)
3. **Gestion des jauges dynamiques** en temps réel : carburant (Δv), énergie, données, liaison radio
4. **Corrections de trajectoire** : marqueur cible sur la trajectoire 3D pour demander une manœuvre

**Segment 3 — Opérations scientifiques**

- Activation des instruments au moment optimal du survol
- Collecte, compression et transmission des données
- **Météorologie spatiale** : tempêtes solaires, ceintures de Van Allen (augmentent les radiations)
- **Événements imprévus** : pannes matérielles, débris, manœuvres d'évitement

**HUD par rôle pendant les opérations :**

*Ingénieur véhicule :* bilan de masse détaillé, taux de fiabilité des composants, courbe Δv disponible vs requis → actions : allègement structural, calculateur de transfert, mode sécurité mécanique

*Ingénieur systèmes de bord :* bilan électrique temps réel, télémétrie thermique (°C), qualité du signal radio → actions : routage d'énergie, pointage antenne, reboot système (30s)

*Responsable science :* score scientifique cumulé, mémoire de bord, fenêtres de survol idéales → actions : déclenchement instruments, compression données, requête correction d'orbite

**Fichier à créer :** `src/ui/operations-view.js`

---

### T3.2 🔴 — Sauvegarde automatique

**Ce qu'on sauvegarde dans `localStorage` :**
- Rôle choisi, chapitre en cours, index d'épisode
- État des ressources (used par ressource)
- Statut CML (rouge/jaune/vert par critère)
- Composants choisis dans l'Atelier
- Score partiel, fiabilité des essais

**Fichier à créer :** `src/engine/save.js`
```js
export function sauvegarder(snapshot) { ... }
export function charger() { ... }   // null si aucune sauvegarde
export function effacer() { ... }
```

---

## SPRINT 4 — Bilan et Rejouabilité

### T4.1 🔴 — Écran Bilan post-mission

**Contenu :**
1. Score animé (compteur 0 → score final, style NASA)
2. Médaille : or (≥85) / argent (≥70) / bronze (≥50) / aucune
3. Résumé des 6 ressources (graphique radar)
4. **3 décisions clés** mises en avant avec leur conséquence
5. **Fiche "Dans la vraie vie"** : comparaison avec une mission NASA réelle
   - Ex : *"Ton score équivaut à 85% de la mission Lunar Reconnaissance Orbiter"*
6. **Arbre de décisions** : *"Si tu avais choisi X au lieu de Y, voici ce qui se serait passé"*
7. Jetons d'Atelier gagnés → technologies avancées débloquées
8. ASTRA conclut avec une analyse personnalisée
9. Boutons : "Rejouer" et "Mission suivante"

**Badges de maîtrise :**
- "Maître de l'orbite polaire" (orbite polaire + budget serré)
- "Économe spatial" (masse < 60% de la limite)
- "Scientifique rigoureux" (CML 4 validé complet)

**Fichier à créer :** `src/ui/bilan-view.js`
**Données :** `src/data/missions_reelles.json` (~20 missions NASA avec paramètres comparables)

---

### T4.2 🟠 — Chapitres 2 à 5

**Chapitre 2 — "L'œil du cyclone"**
- Mission : satellite météo en orbite héliosynchrone
- Nouveauté : orbite polaire, instrument optique, contrainte de couverture

**Chapitre 3 — "Retour sur la Lune"**
- Mission : orbiteur lunaire de cartographie
- Nouveauté : transfert Hohmann, gravité lunaire, délai communication 3s

**Chapitre 4 — "Signal de Mars"**
- Mission : sonde en orbite martienne
- Nouveauté : fenêtre de lancement tous les 26 mois, RTG, délai radio 20 min

**Chapitre 5 — "Le Gardien"**
- Mission : satellite au point de Lagrange L1 (surveillance solaire)
- Nouveauté : halo orbit, perturbations gravitationnelles, correction de trajectoire

**Fichiers à créer :**
- `src/data/chapters/chapitre_02.json` à `chapitre_05.json`
- `src/data/gmat/orbite_heliosynchrone.json`
- `src/data/gmat/transfert_lune.json`
- `src/data/gmat/orbite_mars.json`
- `src/data/gmat/point_lagrange.json`
- Nouvelles répliques ASTRA dans `dialogues.json`

---

### T4.3 🟠 — 7 tables GMAT manquantes

Fichiers à créer dans `src/data/gmat/` (même format que `orbite_basse.json`) :
- `orbite_haute.json` — GEO (35 786 km, période 24h)
- `orbite_polaire.json` — inclinaison 90°, 500 km
- `orbite_heliosynchrone.json` — 98,7°, 700 km, passage 10h30 local
- `orbite_geostationnaire.json` — 0° inclinaison, 35 786 km
- `transfert_lune.json` — Hohmann Terre → Lune, 3,5 jours
- `orbite_mars.json` — orbite basse martienne 300 km, période 118 min
- `point_lagrange.json` — L1 soleil-Terre, 1,5M km, halo orbit

---

## SPRINT 5 — Expérience premium

### T5.1 🟡 — Splash screen + chargement

- Logo "Space Heroes" centré sur fond noir
- Barre de progression liée au chargement des 4 textures NASA
- Transition fluide vers le QG de Mission

**Fichiers à créer :** `src/ui/splash.js`

---

### T5.2 🟡 — Célébration visuelle sur succès

- `scene.celebrate()` : burst de 200 particules dorées depuis la position du CubeSat
- Texte flottant "MISSION ACCOMPLIE"
- Transition vers le Bilan après 3s
- Connexion : événement `orbite-atteinte` → `scene.celebrate()`

**Fichier à modifier :** `src/vis/scene.js`

---

### T5.3 🟡 — Tutoriel guidé

**4 étapes (1ère partie uniquement) :**
1. Démarrage : flèche sur les jauges → *"Ces 6 ressources définissent ta mission"*
2. Atelier : surbrillance des onglets → *"Chaque pièce que tu ajoutes apparaît sur le vaisseau"*
3. Lancement : *"Vérifie tout avant de cliquer Lancer — ASTRA t'arrêtera si les marges sont trop serrées"*
4. Orbite atteinte : *"Tu peux explorer la vue 3D avec la souris"*

> L'option d'activation/désactivation du tutoriel se trouve dans **Paramètres → Mode de jeu** (T0.3).

**Fichier à créer :** `src/ui/tooltip.js`

---

### T5.4 🟡 — Raycasting CubeSat (clic → infos)

Cliquer sur le CubeSat en orbite ouvre une popup :
- Niveau batterie (%), force du signal (dBm), température interne (°C)
- Prochaine fenêtre de contact avec une station au sol

**Fichier à modifier :** `src/vis/controls.js`

---

## SPRINT 6 — Bonus jury NASA

### T6.1 🔵 — Multijoueur coopératif (4 rôles, en ligne)

**Architecture :** salle d'attente virtuelle → briefing individuel par rôle → mission coopérative

**Mécaniques :**
- Chaque joueur voit **uniquement** les données de son rôle (asymétrie d'information)
- **Jetons de veto** : nombre limité par segment, déclenchable en temps réel
  - La scène 3D se fige 60 secondes pour négocier un compromis
- **Scénario "à blanc"** de 2 min avant la vraie mission pour tester la coordination
- Débriefing multijoueur post-mission : replay des moments de tension, vetos utilisés

**Technologie :** WebSocket (serveur Node simple) ou WebRTC peer-to-peer
**Fichier à créer :** `src/engine/multiplayer.js`

---

### T6.2 🔵 — Accessibilité WCAG AA

> Les options daltonien, contrastes élevés, taille de police, sous-titres et réduction de mouvement sont configurables dans **Paramètres → Affichage / Accessibilité** (T0.3). Ce sprint couvre uniquement l'implémentation technique côté code.

- Corriger le contraste `.muted` (#8aa0b8 → #a0b8cc, ratio 4.6:1)
- `aria-live="polite"` sur le HUD orbital
- Navigation clavier complète pour l'Atelier (Tab + Entrée)
- Appliquer les filtres CSS daltonien selon l'option choisie dans les Paramètres
- Appliquer les classes CSS contrastes élevés / grande police selon les Paramètres

---

### T6.3 🔵 — Internationalisation FR/EN

> Le sélecteur de langue est dans **Paramètres → Langue** (T0.3). Ce sprint couvre l'implémentation du moteur i18n et la traduction du contenu.

- `src/data/i18n/fr.json` + `src/data/i18n/en.json` — toutes les chaînes du jeu
- `src/engine/i18n.js` : `t('cle')` retourne la chaîne dans la langue active
- Branchement sur `settings-store.js` : changement de langue → rechargement instantané des chaînes

---

## Récapitulatif des fichiers à créer

| Fichier | Sprint | Priorité |
|---|---|---|
| `src/ui/hub.js` + `hub.css` | S0 | 🔴 |
| `src/ui/role-select.js` | S0 | 🔴 |
| `src/engine/player.js` | S0 | 🔴 |
| `src/data/roles.json` | S0 | 🔴 |
| `src/ui/settings.js` | S0 | 🔴 |
| `src/engine/settings-store.js` | S0 | 🔴 |
| `src/data/settings-defaults.json` | S0 | 🔴 |
| `src/engine/astra.js` ← fix dispatch | S1 | 🔴 |
| `src/vis/launch.js` ← fix dispatch | S1 | 🔴 |
| `src/main.js` ← fix flashWarning | S1 | 🟡 |
| `vite.config.js` ← code splitting | S1 | 🟡 |
| `src/ui/atelier-view.js` | S2 | 🔴 |
| `src/ui/cml-view.js` | S2 | 🔴 |
| `src/ui/essais-view.js` | S2 | 🔴 |
| `src/data/ateliers/structure.json` | S2 | 🔴 |
| `src/data/ateliers/energie.json` | S2 | 🔴 |
| `src/data/ateliers/communications.json` | S2 | 🔴 |
| `src/data/ateliers/instrument.json` | S2 | 🔴 |
| `src/ui/operations-view.js` | S3 | 🔴 |
| `src/engine/save.js` | S3 | 🔴 |
| `src/ui/bilan-view.js` | S4 | 🔴 |
| `src/data/missions_reelles.json` | S4 | 🟠 |
| `src/data/chapters/chapitre_02.json` | S4 | 🟠 |
| `src/data/chapters/chapitre_03.json` | S4 | 🟠 |
| `src/data/chapters/chapitre_04.json` | S4 | 🟠 |
| `src/data/chapters/chapitre_05.json` | S4 | 🟠 |
| `src/data/gmat/orbite_heliosynchrone.json` | S4 | 🟠 |
| `src/data/gmat/transfert_lune.json` | S4 | 🟠 |
| `src/data/gmat/orbite_mars.json` | S4 | 🟠 |
| `src/data/gmat/point_lagrange.json` | S4 | 🟠 |
| `src/ui/splash.js` | S5 | 🟡 |
| `src/ui/tooltip.js` | S5 | 🟡 |
| `src/engine/multiplayer.js` | S6 | 🔵 |
| `src/data/i18n/fr.json` + `en.json` | S6 | 🔵 |
| `src/engine/i18n.js` | S6 | 🔵 |

---

## Checklist d'exécution

### Sprint 0 — QG + Personnage + Paramètres
- [ ] T0.1 — QG de Mission (hub + carte système solaire)
- [ ] T0.2 — Sélection du rôle (4 rôles, HUD adaptatif)
- [ ] T0.3 — Écran Paramètres (Mode de jeu, Audio, Affichage, Accessibilité, Langue, Données)

### Sprint 1 — Fixes rapides
- [ ] T1.1 — Dispatcher `astra-message` dans `astra.js`
- [ ] T1.2 — Dispatcher `vis-announcer` dans `launch.js`
- [ ] T1.3 — Brancher `flashWarning()` + `celebrate()` dans `main.js`
- [ ] T1.4 — Code splitting Vite dans `vite.config.js`

### Sprint 2 — Préparation technique
- [ ] T2.1 — Briefing interactif + validation ASTRA en direct
- [ ] T2.2 — UI Atelier interactive (5 familles + 4 JSON)
- [ ] T2.3 — CML complet (20 critères, dialogues ASTRA)
- [ ] T2.4 — Épisode Essais interactif (3 épreuves)

### Sprint 3 — Opérations
- [ ] T3.1 — Épisode Opérations (communications, instruments, météo spatiale, événements)
- [ ] T3.2 — Sauvegarde `localStorage`

### Sprint 4 — Bilan + Contenu
- [ ] T4.1 — Écran Bilan (score + médaille + arbre de décisions + mission NASA réelle)
- [ ] T4.2 — Chapitres 2 à 5
- [ ] T4.3 — 7 tables GMAT manquantes

### Sprint 5 — Expérience premium
- [ ] T5.1 — Splash screen
- [ ] T5.2 — Célébration visuelle
- [ ] T5.3 — Tutoriel guidé
- [ ] T5.4 — Raycasting CubeSat

### Sprint 6 — Bonus jury
- [ ] T6.1 — Multijoueur coopératif (4 rôles)
- [ ] T6.2 — Accessibilité WCAG AA
- [ ] T6.3 — Internationalisation FR/EN

---

## Estimation totale

| Sprint | Contenu | Effort |
|---|---|---|
| Sprint 0 | QG + Personnage + Paramètres | ~8h |
| Sprint 1 | Fixes rapides | ~2h |
| Sprint 2 | Préparation technique (Atelier + CML + Essais) | ~22h |
| Sprint 3 | Opérations + Sauvegarde | ~12h |
| Sprint 4 | Bilan + Chapitres 2-5 + GMAT | ~16h |
| Sprint 5 | Expérience premium | ~8h |
| Sprint 6 | Bonus jury | ~15h |
| **Total** | | **~83h** |

> **Pour le hackathon (MVP premium) :** Sprint 0 + Sprint 1 + Sprint 2 + T3.1 + T4.1 + T5.1 + T5.2 = **~54h** → jeu complet et impressionnant.
