# Soumission NASA Space Apps — mode d'emploi

Ce dossier prépare la page de projet. Il ne remplace pas le site officiel : les textes se collent là-bas, dans les champs prévus.

Source des règles : `docs/SOUMISSION PROJET_APPORTS DES MENTORS_CRITERES DE SELECTION PAR LES JURES.pdf`.

## 1. Règles qui ne se négocient pas

1. La page, la démonstration et le lien public sont en **anglais**. Les blocs « Texte à coller » le sont. Les instructions, elles, restent en français.
2. Ne collez pas les titres, les tableaux, ni les lignes qui commencent par « Instruction ». Seul le texte sous **Texte à coller** part sur le site.
3. La fenêtre se ferme le **dimanche 15 novembre 2026 à 23 h 59, heure locale**. Une page incomplète ou tardive n'est pas lue.
4. On peut enregistrer, corriger et renvoyer plusieurs fois. **Seule la dernière version soumise** est examinée.
5. Tous les membres de l'équipe sont inscrits sur le site **avant** l'envoi.
6. Le lien public pointe vers la branche qui contient le jeu jouable : `https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4`.

## 2. Ordre de remplissage

Faites les champs dans cet ordre. Chacun a son fichier.

| Ordre | Champ sur le site | Fichier | Ce que vous copiez |
| --- | --- | --- | --- |
| 1 | High-Level Summary | `01-high-level-summary.md` | Les trois paragraphes sous « Texte à coller » |
| 2 | Project Demo | `02-project-demo-7-slides.md` | Les sept diapositives. Pas de vidéo de 30 secondes dans ce dossier. |
| 3 | Final Project Link | celui-ci | `https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4` |
| 4 | Project Details | `03-project-details.md` | Le texte sous « Texte à coller » |
| 5 | Use of AI and/or NASA data | `04-nasa-data-and-ai.md` | Le texte sous « Texte à coller » |
| 6 | References | `05-references.md` | La liste sous « Texte à coller » |

Avant de quitter un champ : relisez-le à voix haute. Si une phrase oblige à expliquer un sigle, le sigle est déjà développé dans le texte.

## 3. Ouvrir le jeu devant un juge

Le dépôt ne lance pas le jeu tout seul. Sur une machine où Node.js est installé :

```
git clone https://github.com/ErdisKodjo/SpaceHeroes2.git
cd SpaceHeroes2
git checkout dev4
npm install
npm run dev
```

Le terminal affiche une adresse locale, en général `http://127.0.0.1:5173/`. Le chapitre 1 est ouvert. Les chapitres suivants s'ouvrent en mode Découverte, dans les paramètres.

`npm test` lance la suite automatique. Elle ne remplace pas une partie.

La partie à quatre est un second programme, `npm run server`, sur le port 8787. Le solo n'en a pas besoin. Ne le promettez pas si la salle n'a pas deux machines.

## 4. Ce que le texte a le droit de dire

Les trajectoires affichées viennent de GMAT R2026a, exécuté pour ce projet le 15 novembre 2026. Le navigateur montre ces résultats. Il ne lance pas GMAT.

Le planétaire, s'il est ouvert depuis le QG, utilise les éléments publiés du JPL pour 1800–2050. La Lune part de la nouvelle lune du 8 janvier 2008 et avance d'un mois sidéral publié.

Les 4 corrections par an autour de L1 sont une **hypothèse**. Le texte le dit. Ne les présentez pas comme une mesure.

DAS, le Trajectory Browser, PyCubed et SPENVIS sont **cités**. Aucune mission réelle du jeu n'a été conçue avec eux. Les chiffres de la Lune et de Mars restent ceux de GMAT.

ASTRA lit des répliques écrites. Le jeu livré n'appelle pas de modèle génératif.

## 5. Ce qu'il ne faut pas dire

- Que le navigateur calcule lui-même l'orbite avec GMAT.
- Que DAS a mesuré l'arrêt à 200 km.
- Que la capture lunaire sort du Trajectory Browser.
- Que le châssis du joueur est une carte PyCubed.
- Que les 4 corrections par an de L1 sont un résultat GMAT.
- Qu'un hébergement public du jeu existe. Le lien public est le dépôt GitHub.
- Un nom d'équipier qui n'est pas inscrit sur la page.

Le centre de lancement détaillé et les noms de couches atmosphériques ne sont pas dans ces textes : ils ne sont pas encore sur la branche `dev4`.

## 6. Les cinq notes du jury

Chaque champ sert au moins une note. Au pitch, ne sacrifiez pas la validité pour l'effet.

| Critère | Question du jury | Où c'est répondu |
| --- | --- | --- |
| Impact | Le projet traite-t-il un vrai problème, avec une portée ? | Résumé, diapositive 1 |
| Créativité | L'approche est-elle originale ? | Résumé, diapositives 2 et 3 |
| Validité | La solution est-elle solide ? | Détails, champ NASA, diapositive 4 |
| Pertinence | Le projet répond-il au défi choisi ? | Résumé, diapositive 1 |
| Présentation | L'idée est-elle claire ? | Les sept diapositives, lues sans écran surchargé |

Le pitch local a lieu le 15 novembre. Les projets retenus deviennent Global Nominees, puis peuvent passer en finalistes en novembre, puis devant le jury exécutif en décembre. Les prix locaux ne sont pas les prix mondiaux.

## 7. Liste finale, dans l'ordre

- [ ] Les six champs sont remplis, en anglais.
- [ ] Le lien ouvre la branche `dev4`, pas une branche vide.
- [ ] Un coéquipier a ouvert le lien sur un autre navigateur.
- [ ] Les membres sont inscrits.
- [ ] Aucune phrase de la section 5 n'est restée dans un champ.
- [ ] La démonstration tient en sept diapositives, ou vous avez décidé autrement et le champ le dit.
- [ ] Vous avez cliqué sur soumettre, pas seulement sur enregistrer.
- [ ] Vous avez rouvert la page et vérifié que la dernière version est bien celle qui s'affiche.
