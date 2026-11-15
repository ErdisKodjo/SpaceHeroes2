# Plan3 — Exécution en cours
## SpaceHeroes2, au 15 novembre 2026

Plan1 (scène 3D) est terminé. Plan2 reste le backlog premium d'origine : ses cases ne reflètent plus le code. Ce fichier décrit ce qui a été exécuté jusqu'au 15 novembre 2026. La suite est dans Plan4.

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
| Porte CML | On ne quitte pas l'épisode tant que le niveau visé n'a pas 80 % de critères verts | `EpisodeRunner.next`, briefing |
| Compétence de rôle | Veto à 2 jetons, calculateur de durée, reboot, compression des données | `src/engine/role-competence.js`, opérations |
| Jetons d'atelier | Une pièce verrouillée s'achète avant son chapitre. 12 points : le plafond bloque, la légèreté change la masse, la consommation change la puissance, la résistance élargit la zone de vibrations | `src/engine/jetons.js`, `src/engine/repartition.js`, atelier, essais |
| Difficulté | Cadet : plafonds ×1,15, CML 1 et 2 déjà verts, pas d'aléa. Directeur : plafonds ×0,85, aléa forcé, CML 3 à la sortie de l'atelier et CML 4 à la sortie des essais. Bac à sable : la porte CML ne retient pas | `src/engine/difficulte.js` |
| Mode de jeu | Campagne : le chapitre suivant s'ouvre avec un score. Défi : masse ×0,80, durée ×0,70. Découverte : tous les chapitres sont ouverts, le score n'est pas gardé | `src/engine/mode-jeu.js` |

Les cinq chapitres, le hub, les réglages, la sauvegarde, le bilan et le français / anglais sont en place. Les huit tables GMAT sont des sorties R2026a. Aucune n'est plus en `placeholder_formule`. La polaire, la haute et la géostationnaire ne sont pas des chapitres.

---

## Encore ouvert, dans cet ordre

1. **Encore hors de ce plan :** multijoueur, GEO / polaire / haute comme chapitres. Leurs tables sont des sorties GMAT, pas des missions.

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
| Fenêtres de contact (Kourou, Svalbard, Goldstone, Canberra, Madrid) | `output\sh-contacts.script`, `output\sh-orbites-extra.script` | Fait pour les orbites du jeu, et pour la polaire, la haute et la géostationnaire |
| Transfert Terre-Lune, durée et Δv | `output\sh-lune-final.script` | Fait : 3,12 km/s, 6,2 jours, approche 66 400 km. Pas une capture |
| Orbite basse martienne et fenêtre de lancement | `output\sh-mars-orbite.script`, `output\sh-mars-fenetre.script` | Fait : 113,3 min, départ début décembre 2026, opposition le 20 février 2027, 40 min aller-retour au plus loin |
| Halo L1 et le coût de le tenir | `output\sh-l1.script` | Distance et période faites (1 466 670 km, 173 jours). Les 4 corrections par an ne viennent pas du correcteur d'exemple |
| Vie orbitale selon la masse et la surface | `output\sh-vie-leo.script`, `output\sh-vie-leo-long.script` | Fait pour l'orbite basse : en 120 jours, −52 km à 1,33 kg et −23 km à 4 kg. À 400 jours le plus léger a perdu 262 km et vole encore |

Contacts, transfert lunaire, halo L1 et Mars sont des sorties GMAT du 15 novembre 2026. La polaire tourne en 94,5 min ; Svalbard la voit environ 15 fois par jour, 8,2 min. La géostationnaire et la haute inclinée tournent en 1 436,0 min. Avec le plan de départ propagé, Canberra seul garde la géostationnaire en vue, et la haute à 28° reste visible 569 min par jour depuis Svalbard.

### À ne pas brancher

- Pas d'appel à `GmatConsole` ni à `gmatpy` pendant une partie. Une propagation tient en 0,1 s pour l'orbite basse, un ciblage lunaire ou un halo ne tient pas dans un clic.
- Pas de remplacement de la scène Three.js par OpenFrames (`README_OpenFramesInterface.txt`). OpenFrames est un visualiseur GMAT, pas le jeu.
- Pas d'optimisation de poussée (CSALT, SNOPT, fmincon). Les plugins nécessaires ne se chargent pas ici, et le joueur n'optimise pas une trajectoire : il choisit une pièce.
- Pas de recalcul GMAT de la période d'orbite basse. L'écart mesuré est d'environ 0,1 % sur une révolution. Le remplacer n'apprend rien au joueur.

### Format de livraison

Chaque script écrit un rapport texte. Un petit script Python, lancé à côté de GMAT, recopie les grandeurs dans le JSON existant et passe `statut` de `placeholder_formule` à `gmat_r2026a`. `resolveGmat()` ne change pas. Le champ `note` cite le script et la date.
