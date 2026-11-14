// Moteur de l'Atelier de conception libre (Document de conception, §4).
// Generique : lit une famille de composants (ex. data/ateliers/moteurs.json) et applique
// la meme mecanique a toutes les familles (12 points / 4 axes, cf. §4.4).

const TOTAL_POINTS = 12;
const MIN_PER_AXIS = 1;
const MAX_PER_AXIS = 6;
const COUT_PAR_POINT_AU_DESSUS_DE_4 = 2;

export class AtelierFamily {
  constructor(familyData) {
    this.familyData = familyData; // { nom, axes: [...], technologies: [...] }
  }

  getTechnologie(nomTechnologie) {
    const tech = this.familyData.technologies.find((t) => t.nom === nomTechnologie);
    if (!tech) throw new Error(`Technologie inconnue : ${nomTechnologie}`);
    return tech;
  }

  // repartition : objet { axe: points }, doit sommer a 12, chaque axe entre 1 et 6,
  // et ne jamais depasser le plafond de la technologie choisie pour cet axe.
  validerRepartition(technologieNom, repartition) {
    const tech = this.getTechnologie(technologieNom);
    const total = Object.values(repartition).reduce((a, b) => a + b, 0);
    if (total !== TOTAL_POINTS) {
      return { valide: false, raison: `Le total doit faire ${TOTAL_POINTS} points (actuel : ${total})` };
    }
    for (const axe of this.familyData.axes) {
      const valeur = repartition[axe] ?? 0;
      if (valeur < MIN_PER_AXIS || valeur > MAX_PER_AXIS) {
        return { valide: false, raison: `${axe} doit etre entre ${MIN_PER_AXIS} et ${MAX_PER_AXIS}` };
      }
      const plafond = tech.plafonds?.[axe];
      if (plafond !== undefined && valeur > plafond) {
        return { valide: false, raison: `${axe} depasse le plafond de ${technologieNom} (${plafond})` };
      }
    }
    return { valide: true };
  }

  calculerCout(technologieNom, repartition) {
    const tech = this.getTechnologie(technologieNom);
    let surcout = 0;
    for (const valeur of Object.values(repartition)) {
      surcout += Math.max(0, valeur - 4) * COUT_PAR_POINT_AU_DESSUS_DE_4;
    }
    return tech.coutBaseJetons + surcout;
  }

  // Fiabilite estimee affichee avant le banc d'essai complet (§4.5) : marge d'erreur de +/-10%.
  fiabiliteEstimee(repartition) {
    const fiabiliteAxe = repartition.fiabilite ?? repartition.resistance ?? 3;
    const base = Math.round((fiabiliteAxe / MAX_PER_AXIS) * 100);
    return { valeur: base, marge: 10 };
  }

  fabriquer(technologieNom, repartition, nom) {
    const validation = this.validerRepartition(technologieNom, repartition);
    if (!validation.valide) throw new Error(validation.raison);
    return {
      nom,
      famille: this.familyData.nom,
      technologie: technologieNom,
      repartition: { ...repartition },
      coutJetons: this.calculerCout(technologieNom, repartition),
      fiabilite: this.fiabiliteEstimee(repartition),
      teste: false
    };
  }
}
