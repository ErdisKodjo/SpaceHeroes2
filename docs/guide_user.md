# Space Heroes — Guide d'utilisation

Guide du jeu tel qu'il se joue dans le navigateur. Une mission va du QG au bilan. ASTRA commente chaque étape. La scène 3D montre la Terre, puis le CubeSat, puis le décollage.

## Lancer le jeu

1. Ouvrir un terminal dans le dossier du projet.
2. La première fois : `npm install`.
3. Ensuite : `npm run dev`.
4. Ouvrir l'adresse indiquée par Vite, en général `http://127.0.0.1:5173/`.

`npm run server` lance un second processus, sur `ws://127.0.0.1:8787`. Il ne fait pas partie de la page Vite. **Partie à 4**, au QG, s'y connecte. **Ouvrir le micro** relie les voix des joueurs directement entre leurs navigateurs. Le serveur ne transporte que la signalisation, pas le son. Sans micro autorisé, la partie continue.

Le premier écran est le logo circulaire Space Heroes, avec une phrase de chargement. Il disparaît quand les textures sont prêtes. Un clic dans la page est nécessaire pour entendre la musique, les effets et la voix : le navigateur bloque le son tant qu'on n'a pas cliqué.

Le bouton en haut à droite affiche **SON** quand le son est ouvert, **MUET** quand il est coupé. Il coupe la musique, les effets et la voix d'ASTRA en même temps.

## Le QG

Le QG est l'accueil. La Terre tourne derrière le panneau.

- Le message d'ASTRA salue le commandant par son nom.
- **Continuer** n'apparaît que s'il existe une partie en cours. Il reprend le chapitre et l'épisode sauvegardés.
- Les huit cartes sont les missions. Seul le chapitre 1 est ouvert au départ. Un chapitre suivant s'ouvre quand le précédent a un score au bilan. En Découverte, les huit sont ouvertes.
- La carte du système solaire suit le même verrou. Soleil, L1, Terre et ses cinq orbites, Lune, Mars : un schéma, pas une échelle. Un lieu ouvert lance le chapitre. Un lieu fermé reste inactif.
- Une carte terminée affiche le meilleur score et une médaille.
- **Changer de rôle** ouvre le choix du poste et du nom, sans lancer de mission.
- L'engrenage ouvre les paramètres.

Cliquer une carte ouverte demande d'abord de confirmer le rôle, puis la mission commence. La partie s'enregistre toute seule à chaque épisode. Le mode démo par adresse (`?demo=`) ne sauvegarde pas.

## Choisir un rôle

Quatre postes. En solo, ASTRA tient les trois autres, et le veto dépense les jetons enregistrés dans le navigateur. **Partie à 4** ouvre une table sur le serveur : un joueur par poste, un poste ne se partage pas, et un siège vide reste vide. Le premier joueur lance le chapitre quand les quatre postes sont tenus. Les six jauges et la réserve de veto viennent alors du serveur. La partie à 4 n'est pas écrite dans la sauvegarde du navigateur.

| Sigle | Poste | Ce que la carte annonce |
| --- | --- | --- |
| DM | Directeur de mission | Budgets, veto, réserve d'urgence |
| IV | Ingénieur véhicule | Masse, structure, propulsion. Rôle proposé au départ |
| ISB | Ingénieur systèmes de bord | Énergie, thermique, communications |
| RSN | Responsable science | Instruments et données |

Le nom du commandant accepte 24 caractères. Vide, il redevient « Commandant ». **Confirmer et lancer la mission** entre dans le briefing.

Le rôle est affiché sur le QG. Au départ d'une mission, il change un plafond : le directeur a 15 % de budget en plus, l'ingénieur véhicule paie la masse 10 % moins cher, l'ingénieur systèmes a 10 % de puissance en plus, le responsable science a 20 % de données en plus. En opérations, chacun a un geste : veto à 2 jetons, affichage du coût en durée, annulation du surcoût de durée, ou transmission à +30 % au lieu de +20 %.

## Le fil d'une mission

Chaque chapitre enchaîne six épisodes. Le bandeau indique le numéro, par exemple « Épisode 2 / 6 · Atelier ».

1. **Briefing** — poser l'objectif. ASTRA ouvre la checklist CML.
2. **Atelier** — un composant dans chacune des cinq familles.
3. **Essais** — vibrations, thermique, électrique.
4. **Lancement** — compte à rebours et décollage.
5. **Opérations** — contact, déploiement, transmission, parfois une anomalie.
6. **Bilan** — score, décisions, PDF.

**Continuer** passe à l'épisode suivant, sauf dans l'atelier, les essais et les opérations, où il faut d'abord valider l'écran. Pendant le décollage, le bouton affiche « Séquence en cours… » et ne se clique pas.

Les six jauges restent visibles : budget, masse, puissance, données, communications, durée. Dépasser une jauge coûte des points au bilan. Sur le chapitre 1, la masse est plafonnée à 4 kg.

### Briefing et checklist CML

ASTRA évalue 20 critères, 5 par niveau. Le joueur ne coche pas la pastille lui-même.

1. Choisir un critère et cliquer **Évaluer**.
2. Répondre **Pas encore**, **Partiellement** ou **Oui, c'est fait**.
3. ASTRA pose la pastille en rouge, jaune ou vert et dit pourquoi.

Un niveau est validé à **80 % de vert**, soit 4 critères sur 5.

| Niveau | Nom | Moment visé |
| --- | --- | --- |
| CML 1 | Idée | Briefing |
| CML 2 | Faisabilité | Atelier, puis exigé avant les essais et le lancement |
| CML 3 | Études de compromis | Jugé à l'atelier. Le directeur ne quitte pas l'atelier sans lui |
| CML 4 | Conception précise | Jugé aux essais. Le directeur ne quitte pas les essais sans lui |

Si le niveau demandé n'est pas validé, ASTRA le dit et l'épisode ne change pas. Le Cadet arrive avec les CML 1 et 2 déjà verts. Le bac à sable n'est pas retenu par cette porte. Le directeur qui rate le CML 4 peut revenir à l'atelier. Une fois sur l'écran de lancement, le compte à rebours part. Le manque de CML est compté au bilan.

### Atelier

Cinq familles, un composant chacune : moteur, structure, énergie, communications, instrument. Cliquer un composant le sélectionne. Cliquer une seconde fois le retire. Une pièce encore réservée à un chapitre ultérieur s'achète en jetons : le prix est le numéro du chapitre. Chaque famille reçoit 12 points sur ses axes. Le plafond de la pièce bloque un axe. La légèreté change la masse, la consommation change la puissance, la résistance élargit la bande verte des vibrations.

**Valider l'atelier** n'est accepté que lorsque les cinq familles ont un choix. Le message « Sélectionne un composant dans chaque famille » apparaît sinon.

### Essais

Trois épreuves, dans l'ordre. La fiabilité (0 à 100) part au bilan.

- **Vibrations.** La jauge descend toute seule. Le bouton **Maintenir** la remonte. La garder dans la bande verte pendant 3 secondes, sur une épreuve de 6 secondes. La bande dépend de la résistance choisie à l'atelier. Des clics trop rares laissent la jauge tomber. Des clics trop rapprochés la font sortir par le haut.
- **Thermique.** Trois isolants. Celui qui convient dépend de la trajectoire : isolation près de la Terre, blindage vers Mars et L1. L'explication s'affiche après le choix.
- **Électrique.** Trois combinaisons. Une seule est compatible en tension. L'explication s'affiche après le choix.

### Lancement

Le bouton **Lancer** démarre le compte à rebours. La caméra devient cinématique : la souris et le clavier ne dirigent plus la vue. La musique baisse sous le grondement, puis revient une fois la trajectoire affichée. La légende donne les chiffres GMAT du chapitre : pour la Lune, injection 3,12 km/s et plus près à 66 400 km, sans capture ; pour Mars, un tour en 113,3 min et un départ début décembre 2026 ; pour L1, 1,5 million de km, un halo de 173 jours, et 4 corrections par an nommées comme une hypothèse.

### Opérations

Quatre temps.

1. **Premier contact.** Choisir une station : Kourou, Svalbard, Madrid, Goldstone ou Canberra. La bonne station dépend du chapitre.
2. **Déploiement.** L'ordre correct est communications, puis énergie, puis instrument scientifique. Un autre ordre est signalé.
3. **Transmission.** Surveiller les jauges et cliquer **Transmettre** pendant que la fenêtre de contact est ouverte.
4. **Anomalie**, si les événements aléatoires sont activés dans les paramètres. Plusieurs réponses peuvent être justes. ASTRA explique le choix.

### Bilan

L'écran montre le score sur 100, la médaille, le détail du score, les ressources, trois décisions, une comparaison avec une mission réelle, les badges et les jetons d'atelier. Sous « Dans la vraie vie », chaque mission citée est une fiche : nom, agence et année. Un clic ouvre le résumé, un second clic sur la même fiche le referme. En partie à 4, le rapport ajoute le bilan commun : le score de chaque poste, le veto, et chaque moment où une jauge passe 80 % ou dépasse le plafond.

| Score | Médaille | Jetons d'atelier |
| --- | --- | --- |
| 85 et plus | Or | 4 |
| 70 à 84 | Argent | 3 |
| 50 à 69 | Bronze | 2 |
| Moins de 50 | Aucune | 1 |

Les boutons :

- **Rejouer** recommence le même chapitre.
- **Mission suivante** ouvre le chapitre d'après quand il existe. Sinon le bouton dit **Retour au QG**.
- **Exporter le PDF** télécharge `SpaceHeroes_{titre}_{AAAA-MM-JJ}.pdf`.
- **QG de mission** revient à l'accueil. Le score est déjà enregistré, ce qui débloque la carte suivante.

## La vue 3D

Sous le QG, la Terre tourne seule. En mission, on peut l'explorer, sauf pendant le décollage.

| Action | Effet |
| --- | --- |
| Clic gauche et glisser | Tourner autour de la Terre |
| Molette | Zoomer |
| W A S D ou les flèches | Déplacer le point de vue |
| Q, + ou Page haut | Zoomer |
| E, − ou Page bas | Dézoomer |
| Clic sur le CubeSat en orbite | Fiche de la face visée : moteur, structure, énergie, antenne ou instrument, avec la pièce choisie à l'atelier |

La fiche se ferme avec la croix. Elle reste affichée tant qu'on ne la ferme pas.

Le tutoriel guidé, activé par défaut, pose quatre bulles une seule fois : les six jauges, l'atelier, le lancement, puis la vue 3D après l'orbite. **Compris** ou la croix les range. Elles ne reviennent pas.

## Le son

Une musique originale joue en boucle, une par écran. Le curseur **Volume général** baisse la musique, les effets et la voix ensemble. Le curseur **Musique d'ambiance** ne change que la bande-son. Les deux s'appliquent après **Enregistrer**.

| Écran | Tempo | Ambiance |
| --- | --- | --- |
| QG | 102 | Calme, motivante |
| Briefing | 76 | Nappes, sans batterie |
| Atelier | 112 | Plus rythmée |
| Essais | 124 | Plus tendue |
| Lancement | 128 | La plus forte. Elle baisse au décollage |
| Opérations | 96 | Plus posée |
| Bilan | 88 | Plus chaude |

ASTRA lit ses répliques à voix haute dans la langue du jeu. En français, Windows utilise Hortense, Julie ou Paul. En anglais, il lui faut une voix `en-US` (David, Mark ou Zira). Sans cette voix, la phrase anglaise ne se prononce pas correctement. Après l'installation d'une voix, fermer complètement le navigateur et le rouvrir.

## Paramètres

L'engrenage du QG ouvre les paramètres. Tout ce qui est dans le panneau, sauf les trois boutons de données, reste un brouillon.

- **Enregistrer** n'est cliquable que si une option a changé. Il applique le brouillon.
- **Annuler**, la croix, un clic sur le fond sombre ou Échap jettent le brouillon. L'écran revient aux valeurs déjà enregistrées.
- **Effacer la sauvegarde**, **Exporter la progression** et **Importer une sauvegarde** agissent tout de suite, sans passer par Enregistrer. L'import attend un fichier `.json`.

La langue par défaut est le français. **English** traduit les textes visibles. Une phrase sans traduction anglaise reste en français. Le changement se voit après Enregistrer, y compris au rechargement de la page.

Réglages qui changent l'écran ou la partie dès l'enregistrement :

| Réglage | Effet |
| --- | --- |
| Tutoriel guidé | Affiche ou cache les bulles d'aide |
| Événements aléatoires | Autorise ou retire l'anomalie en opérations. Le Cadet n'en a pas, le Directeur en a toujours |
| Difficulté | Cadet élargit les plafonds et prépare le CML 1 et 2. Directeur les resserre et exige les CML 3 et 4. Bac à sable n'est pas retenu par la porte CML |
| Mode de jeu | Campagne ouvre le chapitre suivant avec un score. Défi réduit la masse et la durée. Découverte ouvre tout et ne classe pas le parcours |
| Volume général | Baisse la musique, les effets et la voix ensemble |
| Effets sonores | Baisse le compte à rebours, le grondement et la radio |
| Musique d'ambiance | Volume de la bande-son seule |
| Voix ASTRA | Coupe la synthèse. Le texte reste |
| Sous-titres ASTRA | Masque le texte quand la voix est allumée |
| Vitesse de lecture | Lente ralentit la voix et laisse un silence entre deux répliques |
| Vitesse de simulation | ×1, ×100 ou ×1000 au moment où l'orbite s'affiche. Le HUD peut encore la changer |
| Qualité graphique | Basse, moyenne, haute ou ultra règle la netteté du rendu 3D |
| Plein écran | Passe le navigateur en plein écran |
| Réduction de mouvement | Coupe les animations, dont le logo du chargement et le compteur du bilan |
| Contrastes élevés | Renforce les contrastes |
| Mode daltonien | Filtre deutéranopie, protanopie ou tritanopie |
| Taille de police | Normale, grande ou très grande |

Le son et la voix se coupent aussi avec le bouton **SON / MUET**.

## Adresses de démonstration

Ces adresses sautent le logo de chargement et le QG. Elles ne créent pas de sauvegarde et n'enregistrent pas le score.

| Adresse | Où l'on arrive |
| --- | --- |
| `http://127.0.0.1:5173/?demo=1` | Chapitre 1, au briefing |
| `http://127.0.0.1:5173/?demo=lancement` | Au décollage. Le compte à rebours part au bout de 4 secondes |
| `http://127.0.0.1:5173/?demo=bilan` | Au rapport, avec un CubeSat d'exemple |

Sans `?demo=`, le jeu ouvre le QG.

## Reprendre, effacer, rejouer

- Fermer l'onglet en cours de mission laisse une sauvegarde. Au retour, **Continuer** reprend l'épisode.
- Terminer le bilan enregistre le meilleur score et efface la partie en cours. Les chapitres déjà débloqués restent débloqués.
- **Effacer la sauvegarde** dans les paramètres retire la partie en cours. Le profil (nom, rôle, meilleurs scores) se gère à part : il n'est pas effacé par ce bouton.
- **Rejouer** sur le bilan recommence le chapitre depuis le briefing.
