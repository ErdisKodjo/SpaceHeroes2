# Plan4 — État au 15 novembre 2026
## SpaceHeroes2

Les lots A à E et la voix de la table sont faits. Rien d'autre n'est en file : une suite demande un nouveau choix.

Plan3 décrit la version jouable solo. Ce fichier dit ce qui a été ajouté ensuite, et ce qui a été laissé dehors.

Dépendances déjà présentes, à ne pas réinstaller : Node et Vite 5, Three.js 0.160, jsPDF 4, Vitest 2, `ws` 8, GMAT R2026a dans `F:\SPACE HEROES\gmat-win-R2026a`. GMAT ne s'appelle pas depuis le navigateur. Le serveur de table est un second processus, `npm run server`, sur `127.0.0.1:8787`.

---

## En une page

| Lot | État |
|---|---|
| A — Réglages | Fait. Volume, effets, voix, sous-titres, lecture, vitesse d'orbite, qualité graphique. |
| B — Trous d'une mission | Fait. Fiche du CubeSat, retour à l'atelier, légendes Lune / Mars / L1. Trois limites restent, listées plus bas. |
| C — Contenu | Fait. Chapitres 6, 7 et 8, fiches « Dans la vraie vie », schéma du système solaire au QG. |
| D — Table à 4 | Fait. WebSocket, quatre postes, jauges et veto du serveur, bilan commun, voix WebRTC. |
| E — Qualité | Fait. Vitest, tests du moteur, jauges, table et voix, workflow `npm test` puis `npm run build`. |

---

## Reste, sans étape ouverte

Ces points ne sont pas des cases à coder. Ils disent ce que les lots ont choisi de ne pas construire.

- La traînée d'orbite basse reste un texte d'atelier. Elle ne raccourcit pas les 12 semaines du chapitre. La surface reste 0,01 m² : changer de châssis ne change que la masse.
- Le chapitre Lune s'approche à 66 400 km. Ce n'est pas une capture. Aucune capture, aucun nouveau Δv lunaire.
- Les 4 corrections par an de L1 restent une hypothèse opérationnelle. Elles ne viennent pas du correcteur d'exemple GMAT.
- Le serveur de table écoute `127.0.0.1`. Il n'y a pas d'hébergement public. La page Vite ne l'importe pas.
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

B3. L'écran du chapitre Lune dit que le plus près, 66 400 km, n'est pas une capture. La légende d'orbite, le bandeau, la carte du QG, le lancement, les opérations et le bilan le disent. Aucune capture n'a été inventée.

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
