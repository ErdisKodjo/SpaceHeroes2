# Space Heroes — Plan de travail complet (24h, périmètre intégral)

*Document de référence pour l'équipe. Reprend l'intégralité du contenu du Document de conception du jeu (47 p.) — aucune catégorie n'est retirée. Basé sur les ressources NASA du défi (Design and Develop Science Missions, GMAT, CML, MDL, CubeSat 101, Mission Viz, A Learning Game About Telescopes, défi VR 2023, CSA). Voir aussi `Addendum_CML_Checklist_Space_Heroes.md` pour le détail de la mécanique CML enrichie.*

## 0. Principe : comment tenir tout le périmètre en 24h

Avec 24h et une équipe de 4 à 6 personnes, coder à la main les 47 pages du document de conception (12 chapitres, 5 familles de pièces, 15 missions coopératives, 2 scénarios hors filière, 5 manches de campagne, 8 types de scénarios orbitaux) est jouable **seulement si on change la méthode de travail**, pas le périmètre :

- **Un seul moteur générique, construit une fois**, qui lit du contenu sous forme de données (JSON) plutôt qu'un moteur réécrit pour chaque chapitre ou mission.
- **Le contenu n'est pas à inventer, il est déjà écrit** dans le document de conception (histoire, contraintes, événements, chiffres des tableaux de technologies, rôles, déroulés). Le travail de l'équipe devient majoritairement de la **transcription structurée** dans le format de données du moteur, pas de la création.
- **Profondeur minimale viable par élément** : chaque chapitre, chaque mission, chaque famille de pièce doit être présent et jouable, mais pas forcément avec une interface ou une animation riche. La définition du minimum par type d'élément est à la section 4 — c'est ce qui permet de ne rien enlever sans viser l'impossible.
- **Parallélisation maximale** : 5 pistes de travail tournent en même temps dès que le schéma de données commun est figé (H1).

## 1. Répartition de l'équipe (5 pistes, adaptable à 4 ou 6 personnes)

| Piste | Responsabilité | Dépend de |
|---|---|---|
| **P1 — Moteur** | Moteur générique : 6 ressources, 4 segments, jauge CML, moteur de dialogue ASTRA (lecture de répliques depuis des données), moteur de score/rapport, moteur d'épisode/chapitre générique, moteur de mission multijoueur générique | Rien (démarre en premier) |
| **P2 — GMAT & données orbitales** | Apprentissage express GMAT + production des 8 tables de scénarios orbitaux nécessaires à tout le contenu | Rien (démarre en parallèle de P1) |
| **P3 — Contenu solo** | Transcription des 12 chapitres dans le schéma de données (dès qu'il existe, H1) | Schéma posé par P1 |
| **P4 — Contenu Atelier + multijoueur** | Transcription des 5 familles de pièces, des 3 filières (15 missions), des 2 scénarios hors filière, des 5 manches d'Opération Phénix, d'Opération Horizon | Schéma posé par P1 |
| **P5 — Visualisation** | Écran de mission à 4 panneaux + vue 3D, à partir du code existant de `mission-viz-main` | Rien au départ (peut démarrer sur une maquette), branchement aux vraies données à partir de H8 |

**Si l'équipe est de 4** : fusionner P2 et P5 (la même personne alterne GMAT le matin / visualisation l'après-midi, les deux ne sont pas synchrones).
**Si l'équipe est de 6** : ajouter une **piste P6 — Intégration/QA**, active dès H6, qui teste chaque chapitre/mission au fur et à mesure qu'il est transcrit plutôt qu'en bloc à la fin.

## 2. Planning heure par heure

| Heures | P1 — Moteur | P2 — GMAT | P3 — Contenu solo | P4 — Atelier + multijoueur | P5 — Visualisation |
|---|---|---|---|---|---|
| **H0–H1** | Poser le schéma de données JSON commun (chapitre, épisode, pièce, mission, événement) — point de synchro critique pour tous | Tutoriel officiel GMAT "Simple Orbit" (prise en main) | En attente du schéma (H1) | En attente du schéma (H1) | Monter l'environnement Three.js à partir de `mission-viz-main/OntologyDrivenOrrery` |
| **H1–H6** | Construire le moteur : 6 ressources + règles d'interaction, 4 segments, checklist CML (20 critères R/J/V, seuil 80% — voir *Addendum CML*), moteur ASTRA (répliques par contexte + rôle d'évaluatrice indépendante du CML), moteur d'épisode générique | Tables **orbite basse/polaire** et **Terre-Lune** (urgentes : chapitres 1/4/5 + filière Exploration rang 1/2 en dépendent) | Transcrire **chapitres 1 à 4** | Transcrire les **5 familles Atelier** (chiffres déjà tabulés dans le doc, rapide) + missions **rang 1** des 3 filières | Squelette des 4 panneaux (Concept / Trajectoires / Chronologie / Vue 3D), vides pour l'instant |
| **H6–H12** | Intégration continue du contenu qui arrive ; construire le moteur de score/rapport et le moteur de mission multijoueur générique (rôles, veto, événements) | Tables **géostationnaire**, **Point de Lagrange L2**, **Terre-Mars** | Transcrire **chapitres 5 à 9** | Transcrire missions **rang 2 à 4** des 3 filières + les **2 scénarios hors filière** (course au pôle Sud, mission mystère) | Brancher le moteur de ressources sur les panneaux ; carte orbitale animée simple (2D) |
| **H12–H18** | Support/debug moteur en continu ; finaliser le moteur de dilemmes/négociation multijoueur | Tables **poussée faible (ionique)**, **Jupiter**, **rendez-vous orbital et évitement** + vérification croisée par une 2e personne (toutes les tables) | Transcrire **chapitres 10 à 12** | Transcrire missions **rang 5** des 3 filières + **Opération Horizon** + les **5 manches d'Opération Phénix** | Vue 3D (vaisseau + trajectoire orientable), widget visuel ASTRA (cercle qui pulse) |
| **H18–H21** | Intégration générale : chaque chapitre et chaque mission testés un par un avec les vraies données (plus aucun placeholder) | Livrer les tables restantes si retard | Support tests | Support tests | Finaliser le lien entre écran de mission et contenu réel ; rédiger la page **Ressources et crédits** |
| **H21–H23** | QA transverse desktop + mobile ; vérifier qu'aucun des 47 éléments de contenu n'est orphelin (tout doit être accessible depuis le menu) | — | — | — | — |
| **H23–H24** | Pitch, démo, vérification finale | | | | |

## 3. Checklist intégrale — rien n'est enlevé

### 3.1 Fondations communes (partie 3 du document)
- [ ] 6 ressources (Budget, Masse, Puissance, Données, Communications, Durée) + règles d'interaction
- [ ] Gestion du budget en euros (réserve de contingence, dépassement, coûts cachés, revenus bonus)
- [ ] Catalogue des 7 matériaux standard (aluminium, alliage Al-Li, titane, composite carbone, bouclier ablatif, MLI, blindage antiradiations)
- [ ] Deux monnaies (euros de mission / jetons d'Atelier)
- [ ] 4 niveaux de difficulté (Cadet, Ingénieur, Directeur de mission, Bac à sable)
- [ ] Scores, médailles, badges spéciaux, rapport post-mission, comparaison à de vraies missions
- [ ] Valeur éducative : bouton « Pourquoi ? », mini-tutoriels, glossaire illustré, fiches « Dans la vraie vie »
- [ ] Visualisations/interface (vue vaisseau, carte orbitale, tableau de bord, chronologie, écran de lancement)
- [ ] 4 segments de mission (Lancement, Spatial, Sol, Utilisateurs)
- [ ] Jauge de maturité CML (1 à 4) — **mise à jour** : implémentée comme une checklist de 20 critères (5 par niveau), chacun coté Rouge/Jaune/Vert, seuil de 80% pour valider un niveau ; détail complet dans `Addendum_CML_Checklist_Space_Heroes.md`
- [ ] Tables GMAT (voir 3.5)
- [ ] Écran de mission à 4 panneaux (voir 3.6)

### 3.2 Atelier — 5 familles de composants
- [ ] Moteurs (Chimique, Cryogénique, Ionique)
- [ ] Matériaux et structures (Alliage d'aluminium, Titane, Composite de carbone)
- [ ] Sources d'énergie (Panneaux solaires, Batteries, Générateur radio-isotopique)
- [ ] Antennes (faible gain, parabolique, à balayage)
- [ ] Instruments scientifiques (caméra, spectromètre, radar)
- [ ] Mécanique commune : 12 points / 4 axes, jetons d'Atelier, test ASTRA + banc d'essai, Hangar

### 3.3 Mode solo — 12 chapitres (campagne complète)
- [ ] Ch.1 Le premier signal (CubeSat)
- [ ] Ch.2 Les yeux sur la Terre (observation)
- [ ] Ch.3 Le relais du monde (télécommunications)
- [ ] Ch.4 Cap sur la Lune (orbiteur lunaire)
- [ ] Ch.5 Poser un pied (atterrisseur lunaire)
- [ ] Ch.6 Retour vers la Lune (mission habitée)
- [ ] Ch.7 La Planète rouge de loin (orbiteur martien)
- [ ] Ch.8 Roulez sur Mars (rover)
- [ ] Ch.9 Le voyageur de roche (astéroïde)
- [ ] Ch.10 Les océans cachés (Jupiter et Europe)
- [ ] Ch.11 Tempête solaire (mission de crise)
- [ ] Ch.12 Au-delà (grand final)
- [ ] Chaque chapitre : 5 épisodes (Briefing, Atelier, Essais, Lancement, Opérations) + Bilan

### 3.4 Mode multijoueur (4 joueurs max)
- [ ] 4 rôles : Directeur de mission, Ingénieur véhicule, Ingénieur systèmes de bord, Responsable science et navigation (+ fusion de rôles à 2/3 joueurs, mode solo avec ASTRA)
- [ ] Phases de partie (Briefing, Conception, Conflit/négociation, Revue, Simulation, Bilan)
- [ ] Dilemmes de négociation + jetons de priorité
- [ ] **Filière Sauvetage** (5) : Le satellite muet, Collision en orbite, Fuite à bord, Sauvetage du relais, Équipage en détresse
- [ ] **Filière Exploration** (5) : Cap sur la Lune, Poser un atterrisseur, Les glaces du pôle Sud, Le voyageur de roche, Premier laboratoire martien
- [ ] **Filière Observation** (5) : Un œil sur la météo, Alerte récoltes, Surveiller les océans, Constellation anti-incendie, L'observatoire des exoplanètes
- [ ] **Opération Horizon** (grand défi final des 3 filières)
- [ ] **Scénarios hors filières** : La course au pôle Sud (compétitif), Mission mystère (défi du jour)
- [ ] **Opération Phénix** (campagne, 5 manches) : Le CubeSat de la dernière chance, L'œil sur la météo, Retour à la Lune, Crise sur orbite, Le saut vers Mars

### 3.5 GMAT — 8 types de scénarios orbitaux
- [ ] Orbite basse et polaire
- [ ] Orbite géostationnaire
- [ ] Terre-Lune
- [ ] Point de Lagrange L2
- [ ] Terre-Mars
- [ ] Poussée faible (ionique)
- [ ] Jupiter (assistance gravitationnelle)
- [ ] Rendez-vous orbital et évitement

### 3.6 Écran de mission
- [ ] Panneau Concept (fiche de mission, 4 segments)
- [ ] Panneau Trajectoires (carte orbitale animée)
- [ ] Panneau Chronologie (frise des jalons)
- [ ] Panneau Vue 3D (vaisseau + trajectoire orientable)

### 3.7 ASTRA
- [ ] Les 6 rôles (Narratrice, Tutrice, Conseillère, Analyste, Animatrice multijoueur, Testeuse de l'Atelier)
- [ ] Message d'accueil + répliques contextuelles (succès, alerte, échec, Atelier) pour chaque chapitre/mission
- [ ] **Rôle d'évaluatrice indépendante du CML** (ajout) : elle seule valide les critères de la checklist CML (section 3.1), le joueur ne s'auto-évalue jamais — conforme à la mise en garde de la ressource NASA source (auto-évaluation = scores trop optimistes). Détail dans `Addendum_CML_Checklist_Space_Heroes.md`

### 3.8 Livrables transverses
- [ ] Rapport post-mission (score, graphique, 3 décisions clés, comparaison à de vraies missions) — pour chapitres **et** missions multijoueur
- [ ] Page « Ressources et crédits » (liste des 9 ressources NASA + mission-viz) — citer précisément *Wessen, R. R., Borden, C., Ziemer, J., Kwok, J. (2013), JPL/Caltech* pour la ressource Concept Maturity Levels, plutôt qu'une mention générique

## 4. Définition du minimum viable par type d'élément

Pour que « rien n'est enlevé » reste honnête avec 24h réelles, voici ce qui est **obligatoire** par type de contenu (en dessous, ce n'est pas fait ; au-dessus, c'est un bonus si le temps le permet) :

| Type | Minimum obligatoire |
|---|---|
| Chapitre solo | Les 5 épisodes jouables (texte + boutons de choix suffisent, pas besoin d'animation), l'événement aléatoire déclenché, le Bilan avec score. Pas d'exigence de rendu graphique riche. |
| Famille Atelier | Les technologies et leurs plafonds exacts du document, les 4 axes et les 12 points, coût affiché en direct. Un visuel générique par famille suffit (pas besoin d'un rendu détaillé par pièce). |
| Mission multijoueur / manche Phénix | Rôles assignés, ressources de départ affichées, au moins l'événement principal déclenché, condition de victoire vérifiée. L'habillage narratif peut rester textuel. |
| Scénario GMAT | Une table de valeurs numériques correcte dans son ordre de grandeur — si le vrai calcul GMAT n'est pas terminé à temps pour un scénario, la formule orbitale standard correspondante sert de table provisoire, **jamais un scénario laissé vide**. |
| Écran de mission | Les 4 panneaux doivent exister sous une forme ou une autre ; Trajectoires/Vue 3D peuvent être une carte 2D statique avec la trajectoire tracée si la 3D interactive n'est pas prête, mais jamais un panneau absent. |

## 5. Risques et parades

| Risque | Parade |
|---|---|
| GMAT prend trop de temps sur un scénario (équipe débutante) | Formule orbitale standard en table provisoire pour ce scénario, remplacée dès que GMAT est prêt (même format de sortie, remplacement transparent) |
| Le moteur générique (P1) prend plus de 6h | C'est le risque n°1 : si à H6 le moteur n'est pas prêt pour recevoir du contenu, retarder immédiatement les chapitres les plus complexes (10, 11, 12) plutôt que le moteur — le moteur ne doit jamais glisser au-delà de H8 |
| Volume de transcription trop grand pour P3/P4 | Prioriser dans l'ordre d'apparition du planning (H2–H6–H12–H18) ; un chapitre ou une mission non terminée à son créneau passe en fin de file, jamais abandonnée |
| 3D trop lente sur mobile | Fallback 2D pur pour la Vue 3D, acceptable (le document source prévoit déjà « 2D d'abord, 3D ensuite », §3.12) |
| Contenu transcrit mais jamais branché au jeu (« orphelin ») | La QA de H21–H23 vérifie explicitement chaque ligne de la checklist (section 3) comme accessible en jeu, pas seulement présente en fichier de données |

## 6. Points de contrôle horaires

| Heure | Vérification |
|---|---|
| H6 | Le moteur accepte au moins un chapitre de test de bout en bout |
| H12 | Au moins 6 chapitres solo et 1 filière complète transcrits et jouables |
| H18 | Les 12 chapitres, les 5 familles, les 3 filières, les scénarios hors filière et Phénix sont tous transcrits (même si pas encore tous intégrés/visuels) |
| H21 | Plus aucun placeholder GMAT restant sans vraie donnée ou formule validée ; plus aucun contenu orphelin |
| H23 | Build final figé, plus aucune modification de contenu, seulement des corrections de bugs bloquants |
