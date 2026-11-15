// Statut CML déduit de l'état de la partie.
// Le joueur demande le jugement ; il ne choisit pas la couleur.

import { t } from '../i18n.js';

function v(fr, en) {
  return { statut: 'vert', texte: t(fr, en) };
}
function j(fr, en) {
  return { statut: 'jaune', texte: t(fr, en) };
}
function r(fr, en) {
  return { statut: 'rouge', texte: t(fr, en) };
}

function compte(selections) {
  return Object.values(selections || {}).filter(Boolean).length;
}

export function jugerCritere(id, state) {
  const chapter = state?.chapter || {};
  const resources = state?.resources;
  const sel = state?.selections || {};
  const n = compte(sel);
  const complet = n >= 5;
  const ratio = (key) => (resources ? resources.ratio(key) : 0);
  const depasse = (key) => (resources ? resources.isOverLimit(key) : false);
  const tient = complet && !depasse('masse') && !depasse('budget') && !depasse('puissance');
  const fiab = state?.fiabilite;

  switch (id) {
    case 'cml1_objectif':
      return (chapter.mission || '').trim().length > 12
        ? v('L\'objectif scientifique est écrit dans le dossier de mission.', 'The science objective is written in the mission file.')
        : r('L\'objectif scientifique n\'est pas formulé.', 'The science objective is not stated.');
    case 'cml1_unique':
      return chapter.notionCle
        ? v(`Ce qui distingue la mission : ${chapter.notionCle}.`, `What sets the mission apart: ${chapter.notionCle}.`)
        : r('Rien n\'indique ce qui rend la mission unique.', 'Nothing states what makes the mission unique.');
    case 'cml1_fenetre':
      return chapter.gmat
        ? v('La trajectoire du chapitre fixe la fenêtre.', 'The chapter trajectory sets the window.')
        : r('Aucune trajectoire n\'est associée à ce chapitre.', 'This chapter has no trajectory.');
    case 'cml1_classe_budget':
      return chapter.contraintes?.budget
        ? v('La classe de budget est le plafond du chapitre.', 'The budget class is the chapter ceiling.')
        : r('Aucun plafond de budget.', 'No budget ceiling.');
    case 'cml1_croquis':
      return n >= 1
        ? v('Au moins une pièce est posée sur le vaisseau.', 'At least one part is on the spacecraft.')
        : r('L\'atelier est encore vide.', 'The workshop is still empty.');
    case 'cml2_exigences':
      return sel.instrument
        ? v('L\'instrument trace l\'exigence scientifique.', 'The instrument traces the science requirement.')
        : r('Aucun instrument : l\'exigence n\'a pas de moyen.', 'No instrument: the requirement has no means.');
    case 'cml2_ordres_grandeur':
      if (!complet) return r('Il manque des pièces pour estimer masse, puissance et budget.', 'Parts are missing, so mass, power and budget cannot be estimated.');
      if (tient) return v('Masse, puissance et budget tiennent dans les plafonds.', 'Mass, power and budget fit the ceilings.');
      return j('L\'ordre de grandeur est connu, et au moins un plafond est dépassé.', 'The order of magnitude is known, and at least one ceiling is exceeded.');
    case 'cml2_risques':
      return chapter.evenementAleatoire
        ? v('Le dossier nomme un aléa de mission.', 'The file names a mission contingency.')
        : r('Aucun aléa n\'est identifié.', 'No contingency is identified.');
    case 'cml2_lanceur':
      if (!complet) return r('Sans vaisseau complet, aucun lanceur ne peut être vérifié.', 'Without a complete spacecraft, no launcher can be checked.');
      return depasse('masse')
        ? r('La masse dépasse ce que le plafond du chapitre autorise.', 'Mass exceeds what the chapter ceiling allows.')
        : v('La masse tient : un lanceur de cette classe reste candidat.', 'Mass fits: a launcher of this class is still a candidate.');
    case 'cml2_technologies':
      if (complet) return v('Les cinq familles ont une technologie retenue.', 'All five families have a chosen technology.');
      if (n >= 2) return j(`${n} familles sur 5 sont choisies.`, `${n} of 5 families are chosen.`);
      return r('Les technologies ne sont pas identifiées.', 'The technologies are not identified.');
    case 'cml3_comparaison':
      return state?.aCompare
        ? v('Deux options ont été ouvertes dans une même famille.', 'Two options were opened in the same family.')
        : r('Une seule option a été regardée dans chaque famille.', 'Only one option was looked at in each family.');
    case 'cml3_effet_options':
      return state?.aCompare && complet
        ? v('Le changement d\'option a un coût visible sur les jauges.', 'Changing an option has a cost visible on the gauges.')
        : r('Il faut comparer deux options d\'une même famille.', 'Two options in the same family have to be compared.');
    case 'cml3_marges':
      if (!complet) return r('Pas de marges sans conception complète.', 'No margins without a complete design.');
      if (ratio('masse') <= 0.85 && ratio('budget') <= 0.85) {
        return v('Masse et budget gardent au moins 15 % de marge.', 'Mass and budget keep at least 15% of margin.');
      }
      return j('La marge passe sous 15 % sur la masse ou le budget.', 'Margin drops under 15% on mass or budget.');
    case 'cml3_sensibilite':
      return sel.energie && !depasse('puissance')
        ? v('La puissance tient avec la source d\'énergie choisie.', 'Power holds with the chosen energy source.')
        : r('La sensibilité énergétique n\'est pas tenue.', 'The power sensitivity does not hold.');
    case 'cml3_option_retenue':
      return complet
        ? v('Une option est retenue dans chaque famille.', 'One option is retained in each family.')
        : r('La conception n\'est pas figée.', 'The design is not locked.');
    case 'cml4_equipements':
      return complet
        ? v('La liste couvre moteur, structure, énergie, liaison et instrument.', 'The list covers propulsion, structure, power, link and instrument.')
        : r('La liste d\'équipements est incomplète.', 'The equipment list is incomplete.');
    case 'cml4_cout':
      if (!complet) return r('Le coût ne peut pas être réservé sans conception complète.', 'Cost cannot be reserved without a complete design.');
      if (ratio('budget') <= 0.8) return v('Il reste au moins 20 % de réserve budgétaire.', 'At least 20% of budget reserve remains.');
      return j('La réserve budgétaire est sous 20 %.', 'The budget reserve is under 20%.');
    case 'cml4_marges_validees':
      return tient
        ? v('Masse, budget et puissance restent sous leur plafond.', 'Mass, budget and power stay under their ceilings.')
        : r('Une marge technique est dépassée.', 'A technical margin is exceeded.');
    case 'cml4_verification':
      if (fiab == null) return r('Les trois essais n\'ont pas été joués.', 'The three tests have not been run.');
      if (fiab >= 80) return v(`Fiabilité ${fiab} %. Le plan d'essais tient.`, `Reliability ${fiab}%. The test plan holds.`);
      if (fiab >= 50) return j(`Fiabilité ${fiab} %. Le plan d'essais est partiel.`, `Reliability ${fiab}%. The test plan is partial.`);
      return r(`Fiabilité ${fiab} %. La vérification échoue.`, `Reliability ${fiab}%. Verification fails.`);
    case 'cml4_risques_classes':
      if (fiab == null) return r('Le banc d\'essai n\'a pas encore classé le matériel.', 'The test bench has not ranked the hardware yet.');
      return fiab >= 50
        ? v('Les essais classent le risque matériel.', 'The tests rank the hardware risk.')
        : r('Le banc d\'essai ne dégage pas de piste de réduction.', 'The test bench does not show a way to reduce the risk.');
    default:
      return r('Critère sans preuve.', 'Criterion with no evidence.');
  }
}

const PAR_PHASE = {
  briefing: ['cml1_objectif', 'cml1_unique', 'cml1_fenetre', 'cml1_classe_budget'],
  atelier: [
    'cml1_croquis',
    'cml2_exigences', 'cml2_ordres_grandeur', 'cml2_risques', 'cml2_lanceur', 'cml2_technologies',
    'cml3_comparaison', 'cml3_effet_options', 'cml3_marges', 'cml3_sensibilite', 'cml3_option_retenue',
    'cml4_equipements', 'cml4_cout', 'cml4_marges_validees'
  ],
  essais: ['cml4_verification', 'cml4_risques_classes']
};

export function appliquerPhase(astra, phase, state) {
  const ids = PAR_PHASE[phase] || [];
  for (const id of ids) {
    const verdict = jugerCritere(id, state);
    astra?.evaluerCritereCml(id, verdict.statut);
  }
}
