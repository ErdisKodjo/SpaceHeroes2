# Addendum — Mécanique CML enrichie (checklist Rouge/Jaune/Vert)

*Complète la partie 3.10 du Document de conception du jeu. À lire avec le Plan de travail 24h et les Perspectives et améliorations.*

**Source** : Wessen, R. R., Borden, C., Ziemer, J., Kwok, J. (2013). *Space Mission Concept Development Using Concept Maturity Levels*. Jet Propulsion Laboratory, California Institute of Technology (document `13-3547_A1b`). C'est la ressource NASA n°3 du défi (« Concept Maturity Levels »), dans sa version complète — le document de conception n'en avait repris que les niveaux 1 à 4 et la logique générale de jauge.

## 1. Ce que l'article apporte de nouveau par rapport à ce qui était déjà utilisé

| Déjà dans le document de conception | Ajouté par cet addendum |
|---|---|
| CML 1 à 4, une question par niveau, une jauge qui monte | La vraie méthode NASA derrière la jauge : une **checklist de critères**, chacun coté Rouge/Jaune/Vert, avec un **seuil de 80% de vert** pour considérer le niveau atteint |
| ASTRA comme conseillère/analyste | Le rôle précis d'**évaluateur indépendant** : la NASA déconseille explicitement l'auto-évaluation (« dangereux », scores trop optimistes) — ASTRA doit valider la checklist, le joueur ne coche jamais lui-même |
| MDL comme modèle du multijoueur | La distinction JPL entre **A-Team** (CML 1-3, exploration libre, petite équipe) et **Team X** (CML 4, point design, en général 3 séances sur une semaine) — un parallèle supplémentaire qui confirme la structure déjà choisie et suggère un format « 3 séances » pour les missions les plus avancées |
| — | La matrice complète de l'article a **24 lignes** (Science, Technique, Management, Coût, Autre) — trop détaillée pour le jeu telle quelle, mais utile comme réservoir de critères réalistes pour construire la checklist jeu ci-dessous |

## 2. La checklist CML du jeu (20 critères, 5 par niveau)

Remplace la simple barre de progression par une mini-checklist visible à l'écran, avec une pastille rouge/jaune/verte par critère. Un niveau est validé quand **4 critères sur 5 sont verts** (80%, comme dans l'outil NASA réel).

### CML 1 — Idée (Briefing / Office Hours)
1. Objectif scientifique formulé en une phrase
2. Ce qui rend la mission unique est identifié
3. Fenêtre de lancement approximative choisie
4. Classe de budget visée (ex. CubeSat, flagship…)
5. Premier croquis du vaisseau, même sommaire

### CML 2 — Faisabilité (fin du Briefing / Concept Development)
1. Besoins scientifiques détaillés en exigences de premier niveau
2. Masse, puissance et budget estimés en ordre de grandeur
3. Risques majeurs identifiés
4. Au moins un lanceur candidat listé
5. Technologies nécessaires identifiées (même non choisies)

### CML 3 — Comparaison d'options (L'Atelier / Trade Studies)
1. Au moins 2 architectures comparées (ex. 2 lanceurs, 2 instruments)
2. Effet de chaque option sur science/coût/risque documenté
3. Marges techniques (masse, puissance) estimées pour chaque option
4. Sensibilité du design aux principaux paramètres de risque évaluée
5. Option retenue justifiée face aux autres

### CML 4 — Conception précise (Validation de l'Atelier / Point Design)
1. Liste d'équipements complète
2. Coût estimé avec marge de réserve
3. Marges techniques validées par rapport au seuil retenu
4. Plan de vérification (essais) défini
5. Risques classés avec une piste de réduction pour les principaux

## 3. Le rôle d'ASTRA comme évaluateur indépendant

L'article est explicite : laisser une équipe s'auto-évaluer produit des scores trop optimistes, un évaluateur indépendant doit discuter brièvement avec l'équipe. Dans le jeu :

- **ASTRA ne laisse jamais le joueur cocher lui-même un critère.** Elle pose une question courte liée au critère (« Quel est ton objectif scientifique en une phrase ? ») et colore la case en fonction de la réponse/de l'état réel des données de la mission, jamais sur simple déclaration du joueur.
- Nuance pédagogique reprise du papier : l'outil ne mesure que la *complétude*, pas la *qualité*. ASTRA peut dire : « Tous tes critères sont verts, mais est-ce vraiment la meilleure option ? » — une réplique type à ajouter à sa banque de texte (section ASTRA du plan 24h).

## 4. A-Team / Team X : confirmation et enrichissement du multijoueur

| JPL réel | Portée | Dans le jeu |
|---|---|---|
| A-Team | CML 1-3, idéation libre, petite équipe diverse | Solo : Briefing + Atelier. Multijoueur : Office Hours + Concept Development + Trade Studies |
| Team X | CML 4, point design, **généralement 3 séances collaboratives sur une semaine** | Multijoueur : Point Design / Revue de conception. **Suggestion** : formaliser les missions de rang 5 (les plus avancées des filières) et les manches d'Opération Phénix autour d'une structure explicite en **3 séances/manches**, comme c'est déjà le cas pour « Premier laboratoire martien » (Conception/Essais/Expédition) — à généraliser aux autres missions de rang 5 par cohérence avec la vraie pratique JPL |

## 5. Intégration dans les documents existants

- **Plan de travail 24h** : la tâche « jauge CML » de la piste Moteur (P1) devient « construire la checklist CML 20 critères (R/J/V, seuil 80%) » — effort comparable (c'est une liste de données + une règle de seuil, pas une mécanique nouvelle)
- **Perspectives et améliorations** : la matrice complète à 24 lignes de l'article reste une extension possible pour un mode « Directeur de mission expert » ou un usage pédagogique avancé (lycée/université), à ajouter en V4 (voir ce document)
- **Page Ressources et crédits** : citer précisément *Wessen, Borden, Ziemer & Kwok (2013), JPL/Caltech* pour la ressource CML, plutôt qu'une mention générique
