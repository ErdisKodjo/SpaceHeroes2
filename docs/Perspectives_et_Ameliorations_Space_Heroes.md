# Space Heroes — Perspectives et améliorations (après le prototype)

*Document complémentaire au plan de travail 24h. Objectif : faire évoluer le prototype vers un jeu fluide, complet, et surtout jouable en ligne à plusieurs, entre joueurs distants — ce que le document de conception initial ne couvre pas (le mode multijoueur y est pensé pour un écran partagé/local, pas pour un vrai réseau). Voir aussi `Addendum_CML_Checklist_Space_Heroes.md` pour la mécanique CML enrichie et son extension possible.*

## 1. Fluidité (performance)

Le prototype 24h vise « ça marche » ; cette section vise « ça tourne bien », sur PC comme sur mobile d'entrée de gamme.

| Axe | Amélioration | Pourquoi |
|---|---|---|
| Rendu 3D | LOD (niveau de détail) sur les modèles de vaisseaux et corps célestes, instancing pour les objets répétés (débris, étoiles), textures compressées (KTX2/Basis) | Le document prévoit déjà « 2D d'abord, 3D ensuite » (§3.12) — une fois la 3D en place, c'est elle qui coûtera le plus cher en performance mobile |
| Calculs | Déporter les calculs de propagation orbitale et de score dans un Web Worker plutôt que sur le thread principal | Évite les saccades de l'interface pendant qu'une mission longue (jusqu'à 75 min pour Opération Horizon) tourne en fond |
| Chargement | Chargement progressif par chapitre/mission (lazy loading), pas tout le contenu des 12 chapitres + 15 missions d'un coup | Le jeu complet représente ~47 contenus distincts ; charger tout au démarrage serait lent, surtout sur mobile |
| Interface | Éviter les re-rendus inutiles des 6 jauges (ne recalculer que ce qui change), séparer logique de jeu et rendu | Le tableau de bord est affiché en permanence (§3.8) — il doit rester fluide même pendant un événement multijoueur à 4 rôles simultanés |
| PWA | Mise en cache des assets déjà vus (service worker), mode hors-ligne partiel pour le solo | Permet de rejouer un chapitre déjà téléchargé sans réseau, utile en contexte de connexion instable |

## 2. Complétude (contenu et accessibilité)

Reprend et détaille les pistes déjà identifiées en §8 du document de conception, avec un ordre de priorité.

| Amélioration | Détail |
|---|---|
| Déblocage complet de l'Atelier | Les 5 familles avec toutes leurs technologies (y compris celles débloquées tardivement : cryogénique, ionique, générateur radio-isotopique), le Hangar d'équipe, le partage de pièces entre joueurs |
| Éditeur de missions | Les joueurs créent et partagent leurs propres scénarios — nécessite d'abord un cadre de règles strict pour éviter les pièces ou missions déséquilibrées (mentionné comme hors périmètre initial, §8) |
| Données réelles NASA | Remplacer les tables GMAT simplifiées par des données d'orbites et d'instruments réels via les API publiques NASA (Open Data), pour renforcer le réalisme pédagogique |
| Accessibilité | Sous-titres pour les répliques d'ASTRA, contraste réglable, tailles de police, mode daltonien pour les jauges colorées (vert/orange/rouge) |
| Multilingue | Voix et textes d'ASTRA en plusieurs langues (français, anglais, langues locales du Togo, comme prévu en §8) |
| Mode classe | Tableau de suivi pour enseignants, utile pour la diffusion pédagogique après le hackathon |
| Saisons thématiques | Contenu additionnel périodique (mission Lune, mission Mars, mission Soleil) pour la rétention à long terme |
| VR | Piste du défi 2023 « Visualize a Space Mission Using VR » — à envisager seulement une fois la version web stable |
| Matrice CML complète (24 lignes) | La ressource NASA source (Wessen, Borden, Ziemer & Kwok, 2013, JPL) détaille une matrice bien plus riche que les 20 critères du prototype (science, technique, management, coût, « autre » : protection planétaire, conformité export, etc. — voir `Addendum_CML_Checklist_Space_Heroes.md`). À réserver à un **mode « Directeur de mission expert »** ou à un usage pédagogique avancé (lycée/université), pas au prototype |

## 3. Jouable en ligne : ce qui change vraiment

**Point important** : dans le document de conception actuel, le multijoueur suppose que les 4 joueurs sont réunis autour du même écran ou dans la même session locale, avec une répartition d'informations cachées par rôle (§6.2). Pour que ce soit jouable **en ligne, entre joueurs à distance**, il faut une vraie architecture réseau — ce n'est pas qu'une question d'interface, c'est un changement d'architecture technique.

### 3.1 Architecture recommandée

| Composant | Choix recommandé | Pourquoi |
|---|---|---|
| Transport temps réel | **WebSocket** (ou WebRTC si on veut aussi la voix intégrée) | Compatible navigateur, cohérent avec le choix Three.js/PWA déjà fait ; pas besoin d'installation |
| Serveur de salle | Un serveur **autoritaire** (Node.js par ex.) qui détient l'état réel de la mission | Essentiel : comme chaque rôle a des informations réservées (budget caché du DM, fiabilité réelle connue de l'IV, etc.), **le client ne doit jamais recevoir les secrets des autres rôles**. Un calcul fait uniquement côté client permettrait à un joueur de tricher en lisant le code source dans son navigateur. |
| Base de données | Pour comptes joueurs, Hangar persistant, classement du Défi du jour, historique des filières coopératives | Le document prévoit déjà des éléments persistants entre sessions (Hangar, jetons d'Atelier, filières à équipe stable, §4.3 et §6.7) — cela n'a de sens en ligne qu'avec un stockage serveur |
| Codes de salle | Système simple de code à 4-6 caractères pour rejoindre une partie entre amis | Évite un matchmaking complexe pour la V1 — suffisant pour le mode coopératif/compétitif entre amis |

### 3.2 Ce qu'il faut ajouter au moteur du jeu

- **Séparation stricte état-client / état-serveur** : chaque client ne reçoit que ce que son rôle est censé voir (reprend directement la logique « information réservée » déjà prévue en conception, §6.2 — il s'agit de l'implémenter correctement côté réseau et pas seulement côté interface)
- **Résolution des vetos et votes en temps réel** : le délai de 60 secondes pour un veto (§6.2) doit être géré par une temporisation serveur, pas client, pour être fiable à plusieurs
- **Reconnexion** : une mission peut durer jusqu'à 75 minutes (Opération Horizon) — il faut gérer la perte de connexion d'un joueur sans annuler la partie (reprise de session, timeout avant de libérer le rôle)
- **Chat** : le document mentionne que « le jeu encourage la discussion vocale ou par messages » (§6.2) sans le détailler — à ajouter explicitement : chat texte en V1, voix (WebRTC) en V2
- **Classement mondial du Défi du jour** (§6.8) : nécessite un backend avec base de données et une tâche planifiée qui génère la mission du jour pour tous les joueurs en même temps

### 3.3 Ce qui reste local / ne change pas

- Le mode solo (12 chapitres) reste entièrement côté client, pas de besoin réseau
- L'Atelier de conception libre peut rester local avec juste une synchronisation ponctuelle vers le serveur pour la sauvegarde et le partage de pièces

## 4. Roadmap suggérée (après le prototype du hackathon)

| Vague | Contenu | Prérequis |
|---|---|---|
| **V1 — Stabilisation** | Fluidité (section 1), correction des bugs du prototype, tests multi-appareils | Prototype 24h terminé |
| **V2 — Multijoueur en ligne (amis)** | Architecture réseau (section 3.1-3.2) avec codes de salle, pour les 3 filières coopératives + scénarios hors filière | V1 stable |
| **V3 — Complétude** | Déblocage complet de l'Atelier, Hangar d'équipe, Opération Phénix persistante entre sessions, accessibilité, multilingue | V2 stable |
| **V4 — Communauté** | Défi du jour avec classement mondial, éditeur de missions, données NASA réelles, saisons thématiques, matrice CML complète en mode expert | V3 stable, base de données en place |
| **V5 — Extensions** | Mode classe, VR | Selon retours et moyens disponibles |

## 5. Risques spécifiques à l'ajout du mode en ligne

| Risque | Parade |
|---|---|
| Triche via lecture du code client (secrets de rôle visibles) | Autorité serveur stricte dès la V2, jamais de calcul de secret côté client |
| Coût d'hébergement d'un serveur temps réel permanent | Démarrer avec un hébergement léger (ex. petite instance serverless/WebSocket géré), dimensionner seulement après V2 |
| Complexité de la reconnexion pendant une mission longue | Prioriser d'abord les missions courtes (rang 1-2 des filières, 20-30 min) pour le lancement de la V2, avant les missions longues (Opération Horizon, Phénix) |
