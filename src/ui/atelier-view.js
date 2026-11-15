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

function getEmoji(famille) {
  return icon(FAMILLE_ICONS[famille.key] ?? 'wrench', 14);
}

function isUnlocked(composant, chapterId = 'chapitre_01') {
  const deb = String(composant.deblocage ?? 'au_depart')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (deb === 'au_depart' || deb === 'depart') return true;
  const reqNum = parseInt(deb.replace(/\D/g, ''), 10);
  if (!reqNum) return true;
  const curNum = parseInt(String(chapterId).replace(/\D/g, ''), 10) || 1;
  return curNum >= reqNum;
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

export function createAtelierView(container, { resources, astra, chapterId = 'chapitre_01', onValider } = {}) {
  // Sélections courantes : familleKey → id composant
  const selections = {};
  FAMILLES.forEach(f => { selections[f.key] = null; });

  let ongletActif = FAMILLES[0].key;

  // ─── calculs ──────────────────────────────────────────────────────────────

  function totalMasse() {
    return FAMILLES.reduce((sum, f) => {
      const comp = getComposants(f).find(c => compCle(c) === selections[f.key]);
      return sum + (comp?.masse ?? 0);
    }, 0);
  }

  function totalBudget() {
    return FAMILLES.reduce((sum, f) => {
      const comp = getComposants(f).find(c => compCle(c) === selections[f.key]);
      return sum + (comp?.coutK ?? 0);
    }, 0);
  }

  function pctMasse() {
    const max = resources?.max?.masse ?? 4;
    return Math.min(100, (totalMasse() / max) * 100);
  }

  function pctBudget() {
    const max = (resources?.max?.budget ?? 5) * 100; // budget en k€ approx
    return Math.min(100, (totalBudget() / max) * 100);
  }

  function toutesSelectionnees() {
    return FAMILLES.every(f => selections[f.key] !== null);
  }

  function statut() {
    const masse  = totalMasse();
    const maxM   = resources?.max?.masse ?? 4;
    if (masse > maxM)  return { ok: false, msg: t(`Masse dépassée : ${formatMasse(masse)} / ${formatMasse(maxM)}`, `Mass exceeded: ${formatMasse(masse)} / ${formatMasse(maxM)}`) };
    if (!toutesSelectionnees()) return { ok: false, msg: t('Sélectionne un composant dans chaque famille.', 'Pick one component in each family.') };
    return { ok: true, msg: t('Conception valide. Prête pour les essais.', 'Design valid. Ready for the tests.') };
  }

  // ─── rendu ────────────────────────────────────────────────────────────────

  function render() {
    const masse   = totalMasse();
    const budget  = totalBudget();
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
      const unlocked  = isUnlocked(comp, chapterId);
      const selected  = selections[ongletActif] === cle;
      const masseTxt  = formatMasse(comp.masse);
      const coutTxt   = Number.isFinite(comp.coutK) ? `${comp.coutK} k€` : '—';
      const details   = [masseTxt, coutTxt];
      if (comp.puissanceW !== undefined) details.push(`${comp.puissanceW} W`);
      if (comp.debitKbps  !== undefined) details.push(`${comp.debitKbps} kbps`);
      if (comp.debitMbps  !== undefined) details.push(`${comp.debitMbps} Mbps`);

      return `
        <button type="button"
          class="sh-atelier-comp ${selected ? 'is-selected' : ''} ${!unlocked ? 'is-locked' : ''}"
          data-comp="${cle}" data-famille="${ongletActif}"
          ${!unlocked ? 'aria-disabled="true"' : ''}
          title="${!unlocked ? unlockLabel(comp.deblocage) : compDesc(cle, comp.description)}">
          <div class="sh-atelier-comp-top">
            <span class="sh-atelier-comp-nom">${compName(cle, comp.nom)}</span>
            ${!unlocked ? `<span class="sh-atelier-comp-lock">${icon('lock', 13)}</span>` : ''}
            ${selected  ? `<span class="sh-atelier-comp-sel">${icon('check', 13)}</span>`  : ''}
          </div>
          <div class="sh-atelier-comp-details">${details.join(' · ')}</div>
          <div class="sh-atelier-comp-desc">${compDesc(cle, comp.description)}</div>
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <div class="sh-atelier">
        <!-- En-tête -->
        <div class="sh-atelier-header">
          <div class="sh-atelier-kicker">${t('Atelier · CubeSat 1U', 'Workshop · 1U CubeSat')}</div>
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
                <span>${budget} k€</span>
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
        </div>

        <!-- Pied : message ASTRA + bouton valider -->
        <div class="sh-atelier-footer">
          <div class="sh-atelier-status ${st.ok ? 'is-ok' : 'is-warn'}">
            ${st.ok ? icon('check', 15) : icon('warning', 15)} ${st.msg}
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
    container.querySelectorAll('.sh-atelier-comp:not(.is-locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const famille  = btn.dataset.famille;
        const compId   = btn.dataset.comp;
        const wasSelected = selections[famille] === compId;

        // Désélectionner si déjà sélectionné, sinon sélectionner
        selections[famille] = wasSelected ? null : compId;

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

      // Consommer les ressources
      FAMILLES.forEach(f => {
        const comp = getComposants(f).find(c => compCle(c) === selections[f.key]);
        if (!comp) return;
        resources?.consume('masse',  comp.masse  ?? 0);
        resources?.consume('budget', (comp.coutK ?? 0) / 100); // normalise en unités budget
        if (comp.puissanceW) resources?.consume('puissance', comp.puissanceW / 10);
      });

      astra?.sayRandomFrom('succes');
      onValider?.({ selections: { ...selections } });
    });
  }

  render();

  return {
    getSelections: () => ({ ...selections }),
    refresh: render
  };
}
