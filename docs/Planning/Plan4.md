# Plan4 — État au 15 novembre 2026
## SpaceHeroes2

Les lots A à E et la voix de la table sont faits. Rien d'autre n'est en file : une suite demande un nouveau choix.

Plan3 décrit la version jouable solo. Ce fichier dit ce qui a été ajouté ensuite, et ce qui a été laissé dehors.

Dépendances déjà présentes, à ne pas réinstaller : Node et Vite 5, Three.js 0.160, jsPDF 4, Vitest 2, `ws` 8, GMAT R2026a dans `F:\SPACE HEROES\gmat-win-R2026a`. GMAT ne s'appelle pas depuis le navigateur. Le serveur de table est un second processus, `npm run server`, sur le port 8787, joignable depuis le réseau local.

---

## En une page

| Lot | État |
|---|---|
| A — Réglages | Fait. Volume, effets, voix, sous-titres, lecture, vitesse d'orbite, qualité graphique. |
| B — Trous d'une mission | Fait. Fiche du CubeSat, retour à l'atelier, légendes Lune / Mars / L1, traînée des 12 semaines sur quatre faces CDS. La correction de L1 reste une hypothèse. |
| C — Contenu | Fait. Chapitres 6, 7 et 8, fiches « Dans la vraie vie », schéma du système solaire au QG. |
| D — Table à 4 | Fait. WebSocket, quatre postes, jauges et veto du serveur, bilan commun, voix WebRTC, salon joignable sur le réseau local. |
| E — Qualité | Fait. Vitest, tests du moteur, jauges, table et voix, workflow `npm test` puis `npm run build`. |

---

## Reste, sans étape ouverte

Ces points ne sont pas des cases à coder. Ils disent ce que les lots ont choisi de ne pas construire.

- Les 4 corrections par an de L1 restent une hypothèse opérationnelle. Elles ne viennent pas du correcteur d'exemple GMAT.
- Il n'y a pas d'hébergement public. Si la machine n'a pas d'adresse joignable depuis un autre réseau, le salon le dit. Il peut rejoindre un serveur qui l'est déjà. La page Vite ne l'importe pas.
- La voix n'a pas de serveur TURN. Deux joueurs derrière des réseaux fermés peuvent ne pas s'entendre. Le micro refusé laisse la partie jouable. Le serveur ne transporte pas le son.
- Hors du jeu actuel : la suite des chapitres du plan 24 h, les filières rang 2 à 5, les scénarios hors filière, Opération Phénix, Opération Horizon, la mission habitée, les constellations, l'assistance gravitationnelle, le rendez-vous, l'évitement.

---

## Déjà en place avant ces lots

Cinq missions, QG, rôle, briefing, atelier à 12 points, jetons, essais, lancement, opérations, bilan PDF, sauvegarde, français / anglais, difficulté, mode Campagne / Défi / Découverte, compétence de rôle, portes CML, huit tables `gmat_r2026a`.

Réglages déjà lus par le jeu : langue, tutoriel, événements aléatoires, musique d'ambiance, plein écran, réduction de mouvement, contrastes, daltonisme, taille de police, bouton SON / MUET.

---

## Fait le 15 novembre 2026

Lot A. Le volume général, les effets, la voix, les sous-titres, la vitesse de lecture, la vitesse d'orbite au décollage et la qualité graphique sont lus. Le guide joueur le dit.

B1. Un clic sur le CubeSat en orbite ouvre la fiche de la face touchée : moteur, structure, énergie, antenne ou instrument, avec la pièce choisie à l'atelier.

B2. Si la confirmation des essais est refusée parce qu'un CML bloque la sortie, le bouton « Revenir à l'atelier » ramène à la conception. ASTRA le dit. Le coût d'atelier est remplacé, pas ajouté une seconde fois.

B3. L'écran du chapitre Lune a d'abord dit que le plus près, 66 400 km, n'était pas une capture. Une propagation ultérieure, départ le 1 janvier 2026 à 00:00, nœud 355°, trouve une périlune à 50 km. Le freinage de 0,87 km/s capture l'orbiteur. Ces deux chiffres viennent de GMAT.

B4. Les 4 corrections par an de L1 sont nommées comme une hypothèse opérationnelle, dans la légende d'orbite, le bilan, le lancement et la carte du QG. Elles ne viennent pas du correcteur d'exemple.

B5. La légende d'orbite et le bilan montrent le départ de début décembre 2026 pour Mars, et l'injection lunaire de 3,12 km/s. Ces deux chiffres étaient déjà dans les tables.

E1. Vitest 2 est une dépendance de développement. `npm test` lance `vitest run`.

E2. `src/engine/moteur.test.js` couvre les portes CML, la difficulté, le mode de jeu, le remplacement du coût d'atelier et les jetons. Le lanceur est Node, pas le navigateur.

E3. `.github/workflows/verifier.yml` lance `npm test` puis `npm run build` à chaque push et sur chaque pull request, avec Node 22.

E4. Le guide joueur et la section « version jouable » disent la même chose que Plan3 : difficulté, mode de jeu, rôle, porte CML, fiche du CubeSat, et les légendes GMAT de la Lune, de Mars et de L1.

C1. La polaire, la haute et la géostationnaire deviennent les chapitres 6, 7 et 8.

C2. Le chapitre 6, *Les deux pôles*, est jouable : 500 km, 90°, 94,5 min, station Svalbard. Le chapitre 7, *Un tour par jour*, est jouable : 35 786 km, 28°, 1 436 min. Pour le départ propagé, Canberra voit 790 min. Kourou et Goldstone ne voient pas ce plan. Le chapitre 8, *Le point fixe*, est jouable : 35 786 km, inclinaison 0,01°, 1 436 min. Pour le départ propagé, Canberra seul, 1 440 min sans coupure. Les quatre autres stations du jeu restent à 0. Ce n'est pas vrai de toute longitude géostationnaire.

C4. Au bilan, « Dans la vraie vie » liste la mission de référence et les missions proches comme des fiches. Un clic ouvre le résumé. Un second clic sur la même fiche la referme.

C5. Le QG montre un schéma du système solaire : Soleil, L1, cinq orbites autour de la Terre, Lune, Mars. Un lieu ouvert lance le même chapitre que la carte. Un lieu fermé ne se lance pas.

D1. Le transport du multijoueur est un WebSocket avec un serveur Node.

D2. `ws` est une dépendance. `npm run server` lance `server/index.js` sur le port 8787. Ce processus n'est pas importé par la page Vite.

D3. **Partie à 4** au QG ouvre une table. Quatre postes, un joueur chacun. Un poste déjà pris est refusé. ASTRA ne prend pas les sièges vides. Le premier joueur lance quand la table est complète.

D4. Une fois la table lancée, les six jauges et la réserve de veto sont celles du serveur. Le directeur dépense cette réserve, pas les jetons du navigateur. Le veto ne retire pas de durée. La partie à 4 n'est pas sauvegardée dans `localStorage`. En solo, les jauges et les jetons restent locaux.

D5. Le bilan d'une partie à 4 ajoute un rapport commun : le score envoyé par chaque poste, l'usage du veto, et les moments où une jauge passe 80 % ou dépasse son plafond. Le même poste ne compte qu'une fois. Ce rapport n'écrit pas le score dans le navigateur.

Voix. **Ouvrir le micro** ouvre un maillage WebRTC entre les joueurs de la table. Le serveur transmet l'offre, la réponse et les candidats, puis le son va d'un navigateur à l'autre. La partie reste jouable si le micro est refusé.

Réseau. Le serveur écoute le réseau local, plus seulement cette machine. Le salon se branche sur le nom de la page, ou sur `?serveur=` si le serveur est ailleurs, et il affiche l'adresse que les autres joueurs ouvrent. Il n'y a pas d'hébergement public.

Hors réseau. Le salon sépare les adresses du même réseau de celles qu'un autre réseau peut ouvrir. Une adresse de partage d'opérateur n'est pas proposée. Sans adresse joignable, le salon le dit et propose de rejoindre un serveur qui l'est déjà. Aucun hébergement public n'a été ajouté.

Capture lunaire. Le départ du 1 janvier 2026 à 00:00, nœud 355°, injection 3,12 km/s, atteint une périlune à 50 km. Le freinage de 0,87 km/s capture l'orbiteur. Huit jours et sept dixièmes plus tard, l'altitude propagée est 37 km.

Vues. Après l'orbite, trois boutons cadrent la trajectoire déjà calculée : Ensemble, Satellite, Lune. Lune n'apparaît que sur le transfert. La sphère est au bout de l'ellipse, et son rayon est 1 788 km moins les 50 km de périlune.

Outils. Les fiches nomment un outil public sans lui attribuer la mission : Debris Assessment Software pour la fin de vie en orbite basse, Trajectory Browser pour Mars et à côté des chiffres GMAT pour la Lune. L'atelier cite PyCubed. Le blindage cite SPENVIS.

Planétaire. Le schéma en ligne du QG reste la vue ouverte. Le bouton Planétaire la remplace, et Schéma la ramène. Terre et Mars suivent les éléments képlériens JPL pour 1800–2050, tournés par Rz(−Ω) Rx(−I) Rz(−ω). La Lune part de la nouvelle lune du 8 janvier 2008 et avance du mois sidéral de 27,32166 jours. Le dessin écarte la Lune et L1, qui seraient sur la Terre à l'échelle des demi-grands axes. La date avance d'un jour toutes les 0,8 s, et reste celle du jour si les animations sont réduites. Les cinq orbites autour de la Terre restent des boutons.

Traînée. En orbite basse, les 12 semaines perdent une part des 350 km qui séparent le départ d'une orbite circulaire à 200 km. Cette part est la perte de demi-grand axe propagée sur 84 jours. Quatre faces du CDS sont dans la table : 0,0100 m² (extrémité 1U, aluminium), 0,01702 m² (côté 1,5U, Al-Li), 0,0227 m² (côté 2U, titane), 0,03405 m² (côté 3U, CFRP). Les masses des pièces ne changent pas. À 1,33 kg, ces faces perdent 43,1 km, 65,5 km, 85,5 km et 137,6 km. La face 3U à 1,33 kg atteint 200 km au jour 114,8. Les autres lignes tiennent 120 jours. Hors de 1,33 à 4 kg, la perte est prolongée en 1/masse. Entre 2,22 et 4 kg, la perte à 84 jours n'est pas monotone : l'excentricité 0,035 est lue à un jour fixe.
