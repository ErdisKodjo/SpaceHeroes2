# Plan4 — Ce qui n'est pas fait
## SpaceHeroes2, au 15 novembre 2026

Plan3 décrit la version jouable. Ce fichier recense uniquement ce qui manque, dans l'ordre où on peut le construire. Une étape ne démarre pas avant l'étape dont elle dépend dans le même lot. Un lot ne démarre pas avant le lot indiqué dans sa ligne Dépend.

Les cases de Plan2 ne sont pas une source : plusieurs y sont encore vides alors que le code existe (QG, atelier, CML, essais, opérations, sauvegarde, bilan, chapitres 2 à 5, huit tables GMAT, i18n, splash, tutoriel, découpage Three.js). Le README dit qu'un moteur multijoueur est codé : aucun fichier de `src/` ne le contient.

Dépendances déjà présentes, à ne pas réinstaller : Node et Vite 5, Three.js 0.160, jsPDF 4, GMAT R2026a dans `F:\SPACE HEROES\gmat-win-R2026a`. GMAT ne s'appelle pas depuis le navigateur.

---

## Déjà en place, pour ne pas le replanifier

Cinq missions, QG, rôle, briefing, atelier à 12 points, jetons, essais, lancement, opérations, bilan PDF, sauvegarde, français / anglais, difficulté, mode Campagne / Défi / Découverte, compétence de rôle, portes CML, huit tables `gmat_r2026a`.

Réglages déjà lus par le jeu : langue, tutoriel, événements aléatoires, musique d'ambiance, plein écran, réduction de mouvement, contrastes, daltonisme, taille de police, bouton SON / MUET.

---

## Lot A — Réglages affichés, pas encore lus

Dépend : rien. Aucun paquet à ajouter. Chaque étape se vérifie dans les paramètres, puis dans une partie.

| Étape | Ce que le joueur doit sentir | Où brancher | Dépendance dans le lot |
|---|---|---|---|
| A1 | Le curseur Volume général baisse musique, effets et voix ensemble | `src/audio/sfx.js`, `src/audio/music.js`. Aujourd'hui seul `ambientVolume` est lu, et le gain maître est fixé à 0,7 | — |
| A2 | Le curseur Effets sonores baisse le compte à rebours, le grondement et la radio, pas la musique | mêmes fichiers. Les gains d'effets sont fixes | A1, pour ne pas avoir deux gains maîtres |
| A3 | Voix ASTRA coupée laisse le texte, et retire la synthèse | `createGameAudio`. `voiceEnabled` n'est pas lu. Le volume parlé est fixé à 0,95 | A1 |
| A4 | Sous-titres coupés masquent le texte d'ASTRA quand la voix joue | widget ASTRA. `subtitles` n'est pas lu | A3 |
| A5 | Vitesse de lecture lente espace les répliques | file d'attente d'ASTRA. `readingSpeed` n'est pas lu | A4 |
| A6 | La vitesse ×1 / ×100 / ×1000 des paramètres devient la vitesse d'orbite au décollage | `src/vis/scene.js` force 1000. Le HUD sait déjà changer l'échelle | — |
| A7 | Qualité graphique basse réduit le ratio de pixels du rendu Three.js | `applyDocumentSettings` ne lit pas `graphicsQuality` | — |

Mettre à jour `docs/guide_user.md` à la fin du lot : il dit encore que la difficulté et le mode de jeu ne changent pas la mission. C'est faux depuis Plan3.

---

## Lot B — Trous dans une mission déjà jouable

Dépend : rien de neuf. GMAT est déjà installé pour B3 et B4. Pas de chapitre nouveau.

| Étape | Ce que le joueur doit sentir | Limite actuelle | Dépendance dans le lot |
|---|---|---|---|
| B1 | Un clic sur le CubeSat en orbite ouvre une fiche de la pièce | Commentaire seul dans `src/vis/scene.js`, pas de raycaster | — |
| B2 | Le directeur qui rate le CML 4 peut revenir à l'atelier au lieu de rester bloqué sur les essais | `niveauxDirecteur` ferme la sortie des essais sans retour | — |
| B3 | Le chapitre Lune arrive vraiment près de la Lune, ou l'écran dit clairement que 66 400 km n'est pas une capture | `transfert_lune.json` le dit dans `note`. `deltaVInjectionKmS` n'est pas affiché par `resolveGmat`. Une capture demande une autre date ou une correction en route, à propager dans GMAT, pas à inventer | — |
| B4 | Les 4 corrections par an de L1 viennent d'une propagation, ou le jeu les nomme comme hypothèse | `point_lagrange.json` : hypothèse opérationnelle. Le correcteur d'exemple GMAT est trop grossier | — |
| B5 | La fenêtre de décembre 2026 et le Δv lunaire apparaissent dans la légende d'orbite, pas seulement dans les textes | `fenetreLancementMois` et `deltaVInjectionKmS` ne passent pas par `resolveGmat` | B3 pour le Δv |

La trainée d'orbite basse reste un texte d'atelier. Elle ne raccourcit pas les 12 semaines du chapitre. La surface reste 0,01 m² : changer de châssis ne change que la masse.

---

## Lot C — Contenu absent

Dépend : le moteur de chapitre actuel. Aucun nouveau paquet. Les tables polaire, haute et géostationnaire existent déjà et ne justifient pas un chapitre tant que ce lot n'est pas ouvert.

| Étape | Livrable | Dépendance dans le lot |
|---|---|---|
| C1 | Décider si polaire, haute et GEO deviennent les chapitres 6, 7 et 8, ou si on s'arrête à 5 | — |
| C2 | Un fichier `chapitre_0N.json` par mission retenue : contraintes, six épisodes, événement, textes FR et EN, lien `gmat` | C1 |
| C3 | Carte du QG, verrou de campagne, répliques ASTRA, trois décisions du bilan | C2 |
| C4 | Bibliothèque « Dans la vraie vie » : les phrases NASA du bilan deviennent des fiches ouvrables | — |
| C5 | Carte du système solaire cliquable au QG, qui ouvre le chapitre déjà débloqué | C3 |

Hors de ce lot, et sans données dans `src/data` : chapitres 6 à 12 du plan 24 h, filières rang 2 à 5, scénarios hors filière, Opération Phénix, Opération Horizon, mission habitée, constellations, assistance gravitationnelle, rendez-vous, évitement. Ce sont des campagnes entières, pas des cases restantes du jeu actuel.

---

## Lot D — Multijoueur

Dépend : Lot A terminé n'est pas requis. Dépend du jeu solo stable. Dépendances absentes :

- Pas de fichier moteur dans `src/`.
- Pas de serveur dans le dépôt.
- Pas de paquet WebSocket dans `package.json` (`ws` ou équivalent).
- Pas d'hébergement. Le jeu est une PWA statique : un serveur temps réel est un nouveau processus, pas une page Vite.

| Étape | Livrable | Dépendance |
|---|---|---|
| D1 | Choisir le transport : WebSocket avec un petit serveur Node, ou WebRTC sans serveur de jeu | — |
| D2 | Ajouter le paquet choisi et un script `server` qui ne tourne pas dans le navigateur du joueur | D1. Paquet absent |
| D3 | Partie à 4 : un rôle par joueur, ASTRA ne tient plus les trois autres | D2 |
| D4 | Le veto du directeur et les jauges partent du serveur, pas du `localStorage` de chaque navigateur | D3 |
| D5 | Bilan commun : score, vetos, moments de tension | D4 |

La voix WebRTC reste après D5. Elle n'est pas nécessaire pour jouer.

---

## Lot E — Qualité

Dépend : rien pour démarrer. Le lanceur de tests est Vitest. Le workflow est `.github/workflows/verifier.yml`.

| Étape | Livrable | Dépendance |
|---|---|---|
| E1 | Ajouter Vitest en dépendance de développement | Paquet absent |
| E2 | Tests du moteur sans navigateur : portes CML, difficulté, mode de jeu, coût d'atelier, jetons | E1 |
| E3 | Un workflow qui lance `npm test` et `npm run build` à chaque push | E2. GitHub Actions absent |
| E4 | Aligner `docs/guide_user.md` et la section « version jouable » du document de conception sur Plan3 | — |

---

## Ordre recommandé

1. Lot A, étapes A1 à A7. Le joueur voit tout de suite que les curseurs font quelque chose.
2. Lot B, B1 et B2. B3 et B4 seulement si on rouvre GMAT. B5 après B3.
3. Lot E1 et E2 dès que A et B bougent le moteur, pour ne pas rejouer les régressions à la main.
4. Lot C seulement après un choix explicite d'ajouter des chapitres.
5. Lot D en dernier. Il demande un serveur qui n'existe pas.

Lot suivant à coder si on reprend « la suite » sans autre consigne : **D5, le bilan commun**. Score, vetos et moments de tension partagés.

## Fait le 15 novembre 2026

Lot A. Le volume général, les effets, la voix, les sous-titres, la vitesse de lecture, la vitesse d'orbite au décollage et la qualité graphique sont lus. Le guide joueur le dit.

B1. Un clic sur le CubeSat en orbite ouvre la fiche de la face touchée : moteur, structure, énergie, antenne ou instrument, avec la pièce choisie à l'atelier.

B2. Si la confirmation des essais est refusée parce qu'un CML bloque la sortie, le bouton « Revenir à l'atelier » ramène à la conception. ASTRA le dit. Le coût d'atelier est remplacé, pas ajouté une seconde fois.

B3. L'écran du chapitre Lune dit que le plus près, 66 400 km, n'est pas une capture. La légende d'orbite, le bandeau, la carte du QG, le lancement, les opérations et le bilan le disent. Aucune capture n'a été inventée.

B4. Les 4 corrections par an de L1 sont nommées comme une hypothèse opérationnelle, dans la légende d'orbite, le bilan, le lancement et la carte du QG. Elles ne viennent pas du correcteur d'exemple.

B5. La légende d'orbite et le bilan montrent le départ de début décembre 2026 pour Mars, et l'injection lunaire de 3,12 km/s. Ces deux chiffres étaient déjà dans les tables.

E1. Vitest 2 est une dépendance de développement. `npm test` lance `vitest run`. Les tests du moteur viennent à l'étape E2.

E2. `src/engine/moteur.test.js` couvre les portes CML, la difficulté, le mode de jeu, le remplacement du coût d'atelier et les jetons. Le lanceur est Node, pas le navigateur.

E3. `.github/workflows/verifier.yml` lance `npm test` puis `npm run build` à chaque push et sur chaque pull request, avec Node 22.

E4. Le guide joueur et la section « version jouable » disent la même chose que Plan3 : difficulté, mode de jeu, rôle, porte CML, fiche du CubeSat, et les légendes GMAT de la Lune, de Mars et de L1.

C1. La polaire, la haute et la géostationnaire deviennent les chapitres 6, 7 et 8.

C2, premier fichier. Le chapitre 6, *Les deux pôles*, est jouable : 500 km, 90°, 94,5 min, station Svalbard.

C2, deuxième fichier. Le chapitre 7, *Un tour par jour*, est jouable : 35 786 km, 28°, 1 436 min. Pour le départ propagé, Canberra voit 790 min. Kourou et Goldstone ne voient pas ce plan.

C2, troisième fichier. Le chapitre 8, *Le point fixe*, est jouable : 35 786 km, inclinaison 0,01°, 1 436 min. Pour le départ propagé, Canberra seul, 1 440 min sans coupure. Les quatre autres stations du jeu restent à 0. Ce n'est pas vrai de toute longitude géostationnaire.

C4. Au bilan, « Dans la vraie vie » liste la mission de référence et les missions proches comme des fiches. Un clic ouvre le résumé. Un second clic sur la même fiche la referme.

C5. Le QG montre un schéma du système solaire : Soleil, L1, cinq orbites autour de la Terre, Lune, Mars. Un lieu ouvert lance le même chapitre que la carte. Un lieu fermé ne se lance pas.

D1. Le transport du multijoueur est un WebSocket avec un serveur Node.

D2. `ws` est une dépendance. `npm run server` lance `server/index.js` sur le port 8787. Ce processus n'est pas importé par la page Vite.

D3. **Partie à 4** au QG ouvre une table. Quatre postes, un joueur chacun. Un poste déjà pris est refusé. ASTRA ne prend pas les sièges vides. Le premier joueur lance quand la table est complète.

D4. Une fois la table lancée, les six jauges et la réserve de veto sont celles du serveur. Le directeur dépense cette réserve, pas les jetons du navigateur. Le veto ne retire pas de durée. La partie à 4 n'est pas sauvegardée dans `localStorage`. En solo, les jauges et les jetons restent locaux.
