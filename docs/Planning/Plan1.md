# Plan d'implémentation 3D — SpaceHeroes2
## Transformer le placeholder en expérience immersive

---

## Vision finale

Un jeu de mission spatiale où chaque décision du joueur se reflète **visuellement en temps réel** dans une scène 3D : le CubeSat prend forme composant par composant, décolle avec une véritable animation de lancement, orbite autour de la Terre avec une trajectoire réelle, et renvoie des données visibles depuis l'espace.

---

## Architecture 3D cible

```
src/
  vis/
    scene.js              ← remplacer le placeholder (chef d'orchestre)
    earth.js              ← Terre avec texture NASA + atmosphère
    cubesat.js            ← modèle CubeSat composable en temps réel
    launch.js             ← animation de décollage (fusée + feu + fumée)
    orbit.js              ← trajectoire orbitale (Kepler simplifié)
    particles.js          ← étoiles, traînée moteur, éclairs d'antenne
    controls.js           ← OrbitControls + zoom/pan pour l'utilisateur
    hud.js                ← textes 3D et indicateurs dans la scène
```

---

## Les 5 phases d'implémentation

---

### Phase 1 — Environnement spatial de base
**Durée estimée : 2–3h**

**Ce qu'on crée :**
- Fond étoilé procédural (5 000 étoiles aléatoires avec scintillement)
- Terre en 3D avec texture NASA (jour/nuit avec shader simple)
- Atmosphère lumineuse (halo bleu autour de la Terre)
- Lumière solaire directionnelle + lumière ambiante faible

**Fichiers à créer :**
- `src/vis/earth.js` — Terre + atmosphère
- `src/vis/particles.js` — champ d'étoiles

**Librairies nécessaires :**
```json
"three": "^0.160.0"  ← déjà installé ✓
```
Textures NASA gratuites : https://visibleearth.nasa.gov

**Résultat visuel :** La Terre tourne doucement dans l'espace, étoiles en fond.

---

### Phase 2 — CubeSat composable (atelier → 3D)
**Durée estimée : 3–4h**

**Le principe :** quand le joueur choisit un composant dans l'Atelier (moteur, panneau solaire, antenne, instrument), le CubeSat 3D se **construit en direct** dans la scène.

**Ce qu'on crée :**
- Modèle CubeSat de base : cube 10×10×10cm en THREE.BoxGeometry avec matériau métallique (MeshStandardMaterial)
- Composants additifs :
  - Panneaux solaires → BoxGeometry plats dépliables avec animation
  - Antenne → cylindres fins avec animation d'ouverture
  - Instrument scientifique → cube supplémentaire en saillie
- Animation d'ajout de composant : scale 0 → 1 avec easing

**Connexion au moteur existant :**
```javascript
// Dans atelier.js, émettre un événement quand un composant est ajouté :
dispatchEvent(new CustomEvent('composant-ajoute', { detail: { type: 'antenne' } }))

// Dans scene.js, écouter et mettre à jour le modèle 3D :
window.addEventListener('composant-ajoute', (e) => cubesat.addComponent(e.detail.type))
```

**Résultat visuel :** Le CubeSat se construit devant les yeux du joueur.

---

### Phase 3 — Animation de lancement
**Durée estimée : 3–4h**

**Déclencheur :** l'épisode `lancement` dans `chapitre_01.json`

**Séquence d'animation :**
1. **T-10s** : caméra zoom arrière, vue du pas de tir (plan large)
2. **T-5s** : particules de fumée blanche au sol (THREE.Points)
3. **T-0s** : flamme orange/jaune sous la fusée (ShaderMaterial simple)
4. **T+2s** : la fusée monte, laisser une traînée de fumée
5. **T+10s** : séparation du CubeSat, la fusée disparaît
6. **T+15s** : le CubeSat entre en orbite, caméra suit

**Particules (fumée + flamme) :**
```javascript
// Système de particules simple avec THREE.Points
// positions aléatoires autour du bas du lanceur
// opacity qui diminue avec le temps
```

**Résultat visuel :** Vrai compte à rebours avec décollage spectaculaire.

---

### Phase 4 — Orbite dynamique
**Durée estimée : 2–3h**

**Ce qu'on crée :**
- Trajectoire orbitale (ellipse) tracée en pointillés lumineux
- CubeSat qui se déplace sur cette trajectoire en temps réel
- Vitesse ajustable (×1 temps réel / ×1000 accéléré)
- Affichage des paramètres en HUD 3D : altitude, vitesse, période

**Physique simplifiée (pas besoin de GMAT) :**
```javascript
// Orbite de Kepler basique
// altitude LEO = 400–600km → paramètre récupéré depuis contraintes.json
const a = RAYON_TERRE + altitude; // demi-grand axe
const T = 2 * Math.PI * Math.sqrt(a**3 / GM); // période
// Position sur l'ellipse à chaque frame
x = a * Math.cos(theta);
z = b * Math.sin(theta);
```

**Lien avec les données existantes :**
- `src/data/gmat/orbite_basse.json` → paramètres orbitaux réels
- `contraintes.duree` → durée totale de la mission

**Résultat visuel :** Le CubeSat tourne autour de la Terre sur sa vraie orbite.

---

### Phase 5 — Interactivité et feedback
**Durée estimée : 2–3h**

**Ce qu'on crée :**
- **OrbitControls** : le joueur peut tourner la caméra, zoomer avec la souris
- **Raycasting** : cliquer sur le CubeSat affiche ses infos (état batterie, signal)
- **Feedback visuel sur les alertes** :
  - Budget dépassé → le CubeSat clignote en rouge
  - Communications en danger → l'antenne pulse en orange
  - Mission réussie → explosion de particules dorées + texte 3D "ORBITE ATTEINTE !"
- **Transition d'épisode** : chaque changement d'épisode (`briefing → atelier → lancement...`) déclenche une animation de caméra différente

**Connexion ASTRA :**
```javascript
// Quand ASTRA dit "alerte_1", la scène réagit visuellement
window.addEventListener('astra-message', ({ detail }) => {
  if (detail.categorie === 'alerte') scene.flashWarning()
  if (detail.categorie === 'succes') scene.celebrate()
  if (detail.categorie === 'echec') scene.showFailure()
})
```

---

## Résumé des dépendances à installer

```bash
npm install three
# OrbitControls est inclus dans three/examples — pas besoin d'install séparé
```

Optionnel pour l'audio :
```bash
npm install howler   # audio (compteur, alarmes, musique spatiale)
```

---

## Ordre d'implémentation recommandé

| Priorité | Phase | Impact visuel | Complexité |
|----------|-------|---------------|------------|
| 1 | Phase 1 — Environnement | ⭐⭐⭐⭐ Très fort | Faible |
| 2 | Phase 3 — Lancement | ⭐⭐⭐⭐⭐ Maximal | Moyenne |
| 3 | Phase 4 — Orbite | ⭐⭐⭐⭐ Très fort | Moyenne |
| 4 | Phase 2 — CubeSat composable | ⭐⭐⭐ Fort | Moyenne |
| 5 | Phase 5 — Interactivité | ⭐⭐⭐⭐ Très fort | Faible |

---

## Ce que ça donnera au final

1. Le joueur arrive → **Terre en 3D + étoiles** (Phase 1)
2. Il assemble son CubeSat → **il voit chaque pièce s'assembler** (Phase 2)
3. Il clique "Lancer" → **compte à rebours + décollage réaliste** (Phase 3)
4. Le CubeSat entre en orbite → **il le voit tourner autour de la Terre** (Phase 4)
5. Il interagit → **clics, alertes visuelles, célébration finale** (Phase 5)

**Résultat : une démo NASA Hackathon qui en met plein les yeux en ~15h de code.**
