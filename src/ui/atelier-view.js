// UI de l'Atelier (Sprint 2).
// Affiche 5 onglets (Moteurs, Structure, Énergie, Comms, Instrument).
// Chaque sélection consomme masse + budget et dispatche 'composant-ajoute'
// pour que le CubeSat 3D se mette à jour en direct.

import moteursData      from '../data/ateliers/moteurs.json';
import structureData    from '../data/ateliers/structure.json';
import energieData      from '../data/ateliers/energie.json';
import commsData        from '../data/ateliers/communications.json';
import instrumentData   from '../data/ateliers/instrument.json';
import { icon } from './icons.js';
import { t } from '../i18n.js';
import { compDesc, compName, familyLabel, unlockLabel } from '../i18n/content.js';
import { coutNet, pieceEffective } from '../engine/atelier-cout.js';
import { prixAnticipe } from '../engine/jetons.js';
import { arret200Jours, masseDansTable, perteSmaKm } from '../engine/trainee.js';
import { trouverPiece } from '../engine/atelier-cout.js';
import {
  axesFamille, facteursRepartition, jugerRepartition, plafondAxe, repartitionDepart
} from '../engine/repartition.js';
import { playerStore } from '../engine/player.js';
import { settingsStore } from '../engine/settings-store.js';

const FAMILLE_ICONS = {
  moteurs:        'rocket',
  structure:      'shield',
  energie:        'solar',
  communications: 'antenna',
  instrument:     'microscope'
};

const FAMILLES = [
  { key: 'moteurs',       data: moteursData,    champ3d: 'moteur'    },
  { key: 'structure',     data: structureData,  champ3d: 'structure' },
  { key: 'energie',       data: energieData,    champ3d: 'energie'   },
  { key: 'communications',data: commsData,       champ3d: 'antenne'   },
  { key: 'instrument',    data: instrumentData, champ3d: 'instrument'},
];

// Champ de ressource surveillé par famille
const RESSOURCE_MAP = {
  moteurs:        { masse: true, budget: true },
  structure:      { masse: true, budget: true },
  energie:        { masse: true, budget: true, puissance: true },
  communications: { masse: true, budget: true, communications: true },
  instrument:     { masse: true, budget: true, donnees: true },
};

// ─── helpers ────────────────────────────────────────────────────────────────

function getComposants(famille) {
  return famille.data.composants ?? famille.data.technologies ?? [];
}

function getLabel(famille) {
  return familyLabel(famille.key, famille.data.label ?? famille.data.nom);
}

const AXES = {
  poussee: ['Poussée', 'Thrust'],
  efficacite: ['Efficacité', 'Efficiency'],
  legerete: ['Légèreté', 'Lightness'],
  fiabilite: ['Fiabilité', 'Reliability'],
  resistance: ['Résistance', 'Strength'],
  thermique: ['Thermique', 'Thermal'],
  radiation: ['Radiation', 'Radiation'],
  production: ['Production', 'Output'],
  stockage: ['Stockage', 'Storage'],
  debit: ['Débit', 'Data rate'],
  portee: ['Portée', 'Range'],
  consommation: ['Consommation', 'Power draw'],
  precision: ['Précision', 'Precision'],
  sensibilite: ['Sensibilité', 'Sensitivity'],
  masse_axe: ['Masse', 'Mass']
};

function axeLabel(axe) {
  const pair = AXES[axe] || [axe, axe];
  return t(pair[0], pair[1]);
}

function getEmoji(famille) {
  return icon(FAMILLE_ICONS[famille.key] ?? 'wrench', 14);
}

function chapitreAtteint(composant, chapterId = 'chapitre_01') {
  const deb = String(composant.deblocage ?? 'au_depart')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (deb === 'au_depart' || deb === 'depart') return true;
  const reqNum = parseInt(deb.replace(/\D/g, ''), 10);
  if (!reqNum) return true;
  const curNum = parseInt(String(chapterId).replace(/\D/g, ''), 10) || 1;
  return curNum >= reqNum;
}

function isUnlocked(composant, chapterId = 'chapitre_01') {
  if (settingsStore.get('difficulty') === 'bac_sable') return true;
  if (chapitreAtteint(composant, chapterId)) return true;
  return playerStore.possedeTech(compCle(composant));
}

function compCle(comp) {
  return comp.id || comp.nom;
}

function formatMasse(kg) {
  const n = Number(kg);
  if (!Number.isFinite(n)) return '—';
  return n >= 0.1 ? `${n.toFixed(2)} kg` : `${(n * 1000).toFixed(0)} g`;
}

// ─── état interne ───────────────────────────────────────────────────────────

export function createAtelierView(container, {
  resources, astra, chapter, chapterId = 'chapitre_01',
  initialSelections = null, initialRepartitions = null, onValider
} = {}) {
  const mission = chapter || { id: chapterId, contraintes: {
    masse: resources?.max?.masse ?? 4,
    budget: resources?.max?.budget ?? 5,
    puissance: resources?.max?.puissance ?? 10,
    donnees: resources?.max?.donnees ?? 5,
    communications: resources?.max?.communications ?? 5
  } };
  // Sélections courantes : familleKey → id composant
  const selections = {};
  const repartitions = {};
  FAMILLES.forEach(f => {
    selections[f.key] = initialSelections?.[f.key] ?? null;
    if (selections[f.key]) {
      repartitions[f.key] = initialRepartitions?.[f.key] || repartitionDepart(f.key, selections[f.key]);
    }
  });
  let aCompare = false;
  let refus = '';

  let ongletActif = FAMILLES[0].key;

  // ─── calculs ──────────────────────────────────────────────────────────────

  function net() {
    return coutNet(resources, mission, selections, repartitions);
  }

  function totalMasse() {
    return net().masse;
  }

  function totalBudgetK() {
    return net().budget * 100;
  }

  function pctMasse() {
    const max = resources?.max?.masse ?? 4;
    return Math.min(100, (totalMasse() / max) * 100);
  }

  function pctBudget() {
    const max = (resources?.max?.budget ?? 5) * 100;
    return Math.min(100, (totalBudgetK() / max) * 100);
  }

  function toutesSelectionnees() {
    return FAMILLES.every(f => selections[f.key] !== null);
  }

  function statut() {
    const masse  = totalMasse();
    const budget = totalBudgetK();
    const maxM   = resources?.max?.masse ?? 4;
    const maxB   = (resources?.max?.budget ?? 5) * 100;
    const power  = net().puissance;
    const maxP   = resources?.max?.puissance ?? 10;
    if (!toutesSelectionnees()) return { ok: false, msg: t('Sélectionne un composant dans chaque famille.', 'Pick one component in each family.') };
    for (const f of FAMILLES) {
      const verdict = jugerRepartition(f.key, selections[f.key], repartitions[f.key]);
      if (!verdict.valide) {
        return { ok: false, msg: t(`${getLabel(f)} : ${verdict.raison}`, `${getLabel(f)}: place all 12 points within the part limits.`) };
      }
    }
    if (masse > maxM)  return { ok: false, msg: t(`Masse dépassée : ${formatMasse(masse)} / ${formatMasse(maxM)}`, `Mass exceeded: ${formatMasse(masse)} / ${formatMasse(maxM)}`) };
    if (budget > maxB) return { ok: false, msg: t(`Budget dépassé : ${Math.round(budget)} / ${Math.round(maxB)} k€`, `Budget exceeded: ${Math.round(budget)} / ${Math.round(maxB)} k€`) };
    if (power > maxP)  return { ok: false, msg: t(`Puissance dépassée : ${power.toFixed(1)} / ${maxP}`, `Power exceeded: ${power.toFixed(1)} / ${maxP}`) };
    return { ok: true, msg: t('Conception valide. Prête pour les essais.', 'Design valid. Ready for the tests.') };
  }

  // ─── rendu ────────────────────────────────────────────────────────────────

  function render() {
    const masse   = totalMasse();
    const budget  = totalBudgetK();
    const maxM    = resources?.max?.masse ?? 4;
    const st      = statut();
    const pM      = pctMasse();
    const pB      = pctBudget();

    const onglets = FAMILLES.map(f => `
      <button type="button"
        class="sh-atelier-tab ${f.key === ongletActif ? 'is-active' : ''}"
        data-tab="${f.key}">
        ${getEmoji(f)} ${getLabel(f)}
        ${selections[f.key] ? '<span class="sh-atelier-check">✓</span>' : ''}
      </button>
    `).join('');

    const famille = FAMILLES.find(f => f.key === ongletActif);
    const comps   = getComposants(famille);

    const lignes = comps.map(comp => {
      const cle       = compCle(comp);
      const unlocked  = isUnlocked(comp, mission.id || chapterId);
      const prix      = unlocked ? 0 : prixAnticipe(comp.deblocage);
      const peutAcheter = !unlocked && playerStore.jetons >= prix && prix > 0;
      const selected  = selections[ongletActif] === cle;
      const eff       = pieceEffective(mission, comp);
      const masseAff  = eff.masse * (resources?.relief?.masse ?? 1);
      const coutAff   = eff.coutK * (resources?.relief?.budget ?? 1);
      const pAff      = eff.puissanceW * (resources?.relief?.puissance ?? 1);
      const masseTxt  = formatMasse(masseAff);
      const coutTxt   = Number.isFinite(coutAff) ? `${Math.round(coutAff)} k€` : '—';
      const details   = [masseTxt, coutTxt];
      if (comp.puissanceW !== undefined) details.push(`${pAff.toFixed(1)} W`);
      if (comp.debitKbps  !== undefined) details.push(`${comp.debitKbps} kbps`);
      if (comp.debitMbps  !== undefined) details.push(`${comp.debitMbps} Mbps`);

      const cadenas = !unlocked
        ? `<span class="sh-atelier-comp-lock">${icon('lock', 13)} ${t(`${prix} jetons`, `${prix} tokens`)}</span>`
        : '';
      const titre = unlocked
        ? compDesc(cle, comp.description)
        : t(`${unlockLabel(comp.deblocage)}. Débloquer maintenant : ${prix} jetons.`, `${unlockLabel(comp.deblocage)}. Unlock now: ${prix} tokens.`);
      return `
        <button type="button"
          class="sh-atelier-comp ${selected ? 'is-selected' : ''} ${!unlocked ? 'is-locked' : ''} ${peutAcheter ? 'is-buyable' : ''}"
          data-comp="${cle}" data-famille="${ongletActif}"
          data-prix="${prix}"
          title="${titre}">
          <div class="sh-atelier-comp-top">
            <span class="sh-atelier-comp-nom">${compName(cle, comp.nom)}</span>
            ${cadenas}
            ${selected  ? `<span class="sh-atelier-comp-sel">${icon('check', 13)}</span>`  : ''}
          </div>
          <div class="sh-atelier-comp-details">${details.join(' · ')}</div>
          <div class="sh-atelier-comp-desc">${compDesc(cle, comp.description)}</div>
        </button>
      `;
    }).join('');

    const choisi = selections[ongletActif];
    const rep = choisi ? (repartitions[ongletActif] || {}) : null;
    const facteur = rep ? facteursRepartition(ongletActif, rep) : null;
    const totalPts = rep ? Object.values(rep).reduce((s, n) => s + n, 0) : 0;
    const axesHtml = !rep ? '' : `
      <div class="sh-axes">
        <div class="sh-axes-titre">${t('12 points', '12 points')} · ${totalPts} / 12</div>
        ${axesFamille(ongletActif).map((axe) => {
          const valeur = rep[axe] ?? 0;
          const cap = plafondAxe(ongletActif, choisi, axe);
          const plus = valeur < cap && totalPts < 12;
          const moins = valeur > 1;
          return `
            <div class="sh-axe">
              <span>${axeLabel(axe)} <em>${t('max', 'max')} ${cap}</em></span>
              <span class="sh-axe-btns">
                <button type="button" class="sh-axe-btn" data-axe="${axe}" data-dir="-1" ${moins ? '' : 'disabled'}>−</button>
                <b>${valeur}</b>
                <button type="button" class="sh-axe-btn" data-axe="${axe}" data-dir="1" ${plus ? '' : 'disabled'}>+</button>
              </span>
            </div>
          `;
        }).join('')}
        <p class="sh-axes-effet">${t(
          `Masse × ${facteur.masse.toFixed(2)} · puissance × ${facteur.puissance.toFixed(2)}`,
          `Mass × ${facteur.masse.toFixed(2)} · power × ${facteur.puissance.toFixed(2)}`
        )}</p>
      </div>
    `;

    const surface = trouverPiece(selections.structure)?.surfaceM2 || 0.01;
    const reliefMasse = resources?.relief?.masse ?? 1;
    const masseTrainee = reliefMasse > 0 ? masse / reliefMasse : masse;
    const perte = mission.gmat === 'orbite_basse' ? perteSmaKm(masseTrainee, surface) : null;
    const semaines = mission.gmat === 'orbite_basse' ? net().duree : 0;
    const arret = perte == null ? null : arret200Jours(masseTrainee, surface);
    const horsTable = perte != null && !masseDansTable(masseTrainee, surface);
    const faceFr = String(surface).replace('.', ',');
    const kmFr = perte == null ? '' : perte.toFixed(1).replace('.', ',');
    const semFr = String(Math.round(semaines * 100) / 100).replace('.', ',');
    const semainesMission = mission.contraintes?.duree || 12;
    const trainee = perte == null ? '' : `
      <p class="sh-atelier-trainee">${t(
        `Traînée, face ${faceFr} m² : −${kmFr} km en 84 jours${horsTable ? ', prolongé en 1/masse hors de 1,33 à 4 kg' : ''}. Les ${semainesMission} semaines perdent ${semFr} sem.${arret == null ? '' : ` 200 km au jour ${arret.toFixed(1).replace('.', ',')}.`} Le Debris Assessment Software sert à juger la fin de vie.`,
        `Drag, face ${surface} m²: −${perte.toFixed(1)} km in 84 days${horsTable ? ', extended as 1/mass outside 1.33–4 kg' : ''}. The ${semainesMission} weeks lose ${Math.round(semaines * 100) / 100} wk.${arret == null ? '' : ` 200 km on day ${arret.toFixed(1)}.` } The Debris Assessment Software is used to judge end of life.`
      )}</p>`;

    container.innerHTML = `
      <div class="sh-atelier">
        <!-- En-tête -->
        <div class="sh-atelier-header">
          <div class="sh-atelier-kicker">${t('Atelier · CubeSat 1U', 'Workshop · 1U CubeSat')} · ${playerStore.jetons} ${t(playerStore.jetons > 1 ? 'jetons' : 'jeton', playerStore.jetons === 1 ? 'token' : 'tokens')}</div>
          <p class="sh-atelier-outil">${t(
            'PyCubed réunit, sur une carte publique, la puissance, le calcul, la communication et le contrôle d\'attitude d\'un CubeSat.',
            'PyCubed puts power, computing, communication and attitude control for a CubeSat on one public board.'
          )}</p>
          <div class="sh-atelier-jauges">
            <div class="sh-atelier-jauge">
              <div class="sh-atelier-jauge-label">
                <span>${t('Masse', 'Mass')}</span>
                <span class="${masse > maxM ? 'is-danger' : ''}">${formatMasse(masse)} / ${formatMasse(maxM)}</span>
              </div>
              <div class="sh-atelier-jauge-track">
                <div class="sh-atelier-jauge-fill ${masse > maxM ? 'is-danger' : ''}"
                  style="width:${pM}%"></div>
              </div>
            </div>
            <div class="sh-atelier-jauge">
              <div class="sh-atelier-jauge-label">
                <span>${t('Budget', 'Budget')}</span>
                <span>${Math.round(budget)} k€</span>
              </div>
              <div class="sh-atelier-jauge-track">
                <div class="sh-atelier-jauge-fill ${pB > 90 ? 'is-warn' : ''}"
                  style="width:${pB}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglets -->
        <div class="sh-atelier-tabs" role="tablist">
          ${onglets}
        </div>

        <!-- Composants -->
        <div class="sh-atelier-comps" role="tabpanel">
          ${lignes}
          ${axesHtml}
        </div>

        <!-- Pied : message ASTRA + bouton valider -->
        <div class="sh-atelier-footer">
          ${trainee}
          <div class="sh-atelier-status ${refus ? 'is-warn' : st.ok ? 'is-ok' : 'is-warn'}">
            ${refus
              ? `${icon('warning', 15)} ${refus}`
              : `${st.ok ? icon('check', 15) : icon('warning', 15)} ${st.msg}`}
          </div>
          <button type="button" id="sh-atelier-valider"
            class="sh-atelier-valider" ${!st.ok ? 'disabled' : ''}>
            ${t('VALIDER L\'ATELIER →', 'VALIDATE WORKSHOP →')}
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Onglets
    container.querySelectorAll('.sh-atelier-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        ongletActif = btn.dataset.tab;
        render();
      });
    });

    // Composants
    container.querySelectorAll('.sh-atelier-comp').forEach(btn => {
      btn.addEventListener('click', () => {
        const famille  = btn.dataset.famille;
        const compId   = btn.dataset.comp;
        const locked   = btn.classList.contains('is-locked');
        if (locked) {
          const prix = Number(btn.dataset.prix) || 0;
          const achat = playerStore.acheterTech(compId, prix);
          if (!achat.ok) {
            refus = t(
              `Il te faut ${prix} jetons pour cette pièce. Tu en as ${playerStore.jetons}.`,
              `This part costs ${prix} tokens. You have ${playerStore.jetons}.`
            );
            render();
            return;
          }
          refus = '';
        }
        refus = '';
        const previous = selections[famille];
        const wasSelected = previous === compId;
        if (previous && previous !== compId) aCompare = true;

        // Désélectionner si déjà sélectionné, sinon sélectionner
        selections[famille] = wasSelected ? null : compId;
        if (wasSelected) delete repartitions[famille];
        else repartitions[famille] = repartitionDepart(famille, compId);

        // Dispatch vers la scène 3D
        if (!wasSelected) {
          const fam3d = FAMILLES.find(f => f.key === famille);
          window.dispatchEvent(new CustomEvent('composant-ajoute', {
            detail: { type: fam3d?.champ3d ?? famille, id: compId }
          }));
          // Réplique ASTRA contextuelle
          astra?.sayRandomFrom('atelier');
        }

        render();
      });
    });

    // Valider
    container.querySelector('#sh-atelier-valider')?.addEventListener('click', () => {
      if (!statut().ok) return;
      astra?.sayRandomFrom('succes');
      onValider?.({ selections: { ...selections }, repartitions: { ...repartitions }, aCompare });
    });

    container.querySelectorAll('.sh-axe-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const famille = ongletActif;
        const id = selections[famille];
        const axe = btn.dataset.axe;
        const dir = Number(btn.dataset.dir);
        const courant = { ...(repartitions[famille] || {}) };
        const valeur = (courant[axe] || 0) + dir;
        const cap = plafondAxe(famille, id, axe);
        const total = Object.values(courant).reduce((s, n) => s + n, 0) + dir;
        if (valeur < 1 || valeur > cap || total > 12) return;
        courant[axe] = valeur;
        repartitions[famille] = courant;
        aCompare = true;
        refus = '';
        render();
      });
    });
  }

  render();

  return {
    getSelections: () => ({ ...selections }),
    refresh: render
  };
}
