# Plan3 — Exécution en cours
## SpaceHeroes2, au 15 novembre 2026

Plan1 (scène 3D) est terminé. Plan2 reste le backlog premium d'origine : ses cases ne reflètent plus le code. Ce fichier est le plan de travail actif.

Principe retenu : chaque chapitre doit se jouer autrement, avec le code déjà branché, avant d'ajouter un nouveau moteur.

---

## Fait

| Étape | Ce que le joueur sent | Code |
|---|---|---|
| Orbite par chapitre | Lune en ellipse, SSO à 98,7°, Mars lente, L1 très loin | `src/engine/gmat.js`, `src/vis/launch.js`, `src/vis/scene.js` |
| Contraintes d'atelier | Masse, budget et puissance peuvent bloquer la validation. Les coûts sont à l'échelle du chapitre | `src/engine/atelier-cout.js` |
| Une seule facture | Revalider l'atelier rembourse l'ancien vecteur puis facture le nouveau | `appliquerCoutAtelier`, sauvegarde v2 |
| CML par preuves | ASTRA tranche. Le joueur ne se note plus | `src/engine/cml-preuves.js` |
| Bonus de rôle | Un facteur, appliqué une fois au départ (masse, budget, puissance ou données) | `src/engine/player.js` |
| Opérations par chapitre | Bonne station, ordre de déploiement proche/lointain, événement du chapitre et son coût au moment du choix | `src/engine/operations-plan.js` |
| Essais lisent l'atelier | Zone verte selon le châssis. MLI près de la Terre, blindage vers Mars et L1. Puissance au-dessus du plafond : l'électrique échoue | `src/engine/essais-plan.js` |

Les cinq chapitres, le hub, les réglages, la sauvegarde, le bilan et le français / anglais sont en place. Cinq tables GMAT sont des sorties R2026a (basse, héliosynchrone, Lune, L1, Mars). La polaire, la haute et la géostationnaire restent en `placeholder_formule`.

---

## Encore ouvert, dans cet ordre

1. **Jetons d'atelier.** Une pièce verrouillée s'achète avant son chapitre. Une pièce retenue se règle en 12 points sur 4 axes : le plafond de la pièce bloque, la légèreté change la masse, la consommation change la puissance, la résistance élargit la zone de vibrations.
2. **Tables GMAT réelles.** Contacts, transfert lunaire, halo L1 et orbite martienne sont faits. Mars : un tour en 113,3 min, départ début décembre 2026, opposition le 20 février 2027, réponse radio 40 min au plus loin. La polaire, la haute et la géostationnaire restent en formule.
3. **Hors de ce plan tant que 1 et 2 ne sont pas faits :** portes CML bloquantes, compétences de rôle au-delà du facteur, multijoueur, GEO / polaire / haute comme chapitres.

---

## GMAT R2026a — ce qui sert, ce qui ne sert pas

Installation : `F:\SPACE HEROES\gmat-win-R2026a`. Build console du 26 mars 2026. Licence Apache 2.0. GMAT a servi sur LRO, LCROSS, ARTEMIS, ACE, SOHO, SDO : les trajectoires des chapitres 3, 4 et 5 sont dans son domaine.

Vérifié le 15 novembre 2026 :

- `bin\GMAT.exe` et `bin\GmatConsole.exe --run script` démarrent. Les éphémérides DE405 se chargent.
- Script `output\sh-leo-check.script` : satellite à 6 928 km, excentricité 0,035, propagé 5 737 s (la période Kepler du placeholder, 95,6 min). Durée de calcul 0,091 s. Altitude de départ 307,4 km, anomalie vraie en fin de propagation 0,44°. La formule du jeu et GMAT disent la même chose à une fraction de degré près sur une orbite basse à deux corps.
- Python 3.12.10 importe `gmatpy` (dossier `bin\gmatpy\_py312`). L'API peut donc produire les JSON hors du navigateur.
- `libMatlabInterface` et `libFminconOptimizer` ne s'ouvrent pas. Les scripts `samples\NeedSNOPT` et `samples\NeedVF13ad` ne sont pas un chemin pour le jeu.

### À utiliser, hors ligne

GMAT ne tourne pas dans le navigateur. Il produit des nombres, le jeu les lit comme aujourd'hui.

| Besoin du chapitre | Échantillon déjà dans l'installation | Ce que la table actuelle ne sait pas faire |
|---|---|---|
| Fenêtres de contact (Kourou, Svalbard, Goldstone, Canberra, Madrid) | `samples\Ex_StationContactLocator.script` | Le jeu met 8 ou 12 min fixes. GMAT donne la durée réelle selon l'altitude et le masque de station |
| Transfert Terre-Lune, durée et Δv | `output\sh-lune-final.script` | Fait : 3,12 km/s, 6,2 jours, approche 66 400 km. Pas une capture |
| Orbite basse martienne et fenêtre de lancement | `output\sh-mars-orbite.script`, `output\sh-mars-fenetre.script` | Fait : 113,3 min, départ début décembre 2026, opposition le 20 février 2027, 40 min aller-retour au plus loin |
| Halo L1 et le coût de le tenir | `output\sh-l1.script` | Distance et période faites (1 466 670 km, 173 jours). Les 4 corrections par an ne viennent pas du correcteur d'exemple |
| Vie orbitale selon la masse et la surface | Force model de `samples\Ex_LEOStationKeeping.script` (traînée Jacchia-Roberts, JGM2) | Aucun lien aujourd'hui entre le châssis choisi et la durée de vie en orbite basse |

Contacts, transfert lunaire, halo L1 et Mars sont des sorties GMAT du 15 novembre 2026. Mars tourne en 113,3 min. Le départ Hohmann, Mars à 44° devant la Terre, tombe début décembre 2026. L'opposition est le 20 février 2027. Au plus loin, le 10 mai 2028, la réponse met 40 min. La polaire, la haute et la géostationnaire restent en formule.

### À ne pas brancher

- Pas d'appel à `GmatConsole` ni à `gmatpy` pendant une partie. Une propagation tient en 0,1 s pour l'orbite basse, un ciblage lunaire ou un halo ne tient pas dans un clic.
- Pas de remplacement de la scène Three.js par OpenFrames (`README_OpenFramesInterface.txt`). OpenFrames est un visualiseur GMAT, pas le jeu.
- Pas d'optimisation de poussée (CSALT, SNOPT, fmincon). Les plugins nécessaires ne se chargent pas ici, et le joueur n'optimise pas une trajectoire : il choisit une pièce.
- Pas de recalcul GMAT de la période d'orbite basse. L'écart mesuré est d'environ 0,1 % sur une révolution. Le remplacer n'apprend rien au joueur.

### Format de livraison

Chaque script écrit un rapport texte. Un petit script Python, lancé à côté de GMAT, recopie les grandeurs dans le JSON existant et passe `statut` de `placeholder_formule` à `gmat_r2026a`. `resolveGmat()` ne change pas. Le champ `note` cite le script et la date.
