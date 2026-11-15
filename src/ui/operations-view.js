// Épisode Opérations — pilotage de la mission en orbite (Sprint 3).
//
// Séquence :
//   1. Premier contact radio   — pointer l'antenne vers une station au sol
//   2. Déploiement instruments — activer les instruments dans la bonne séquence
//   3. Collecte de données     — gérer les ressources en temps réel
//   4. Événement imprévu       — répondre à une anomalie aléatoire
//
// Chaque étape dispatche des événements pour la scène 3D (orbit.js).

import { evenementAutorise } from '../engine/difficulte.js';
import { appliquerEffet, planOperations } from '../engine/operations-plan.js';
import { competencePour } from '../engine/role-competence.js';
import { playerStore } from '../engine/player.js';
import { icon } from '../ui/icons.js';
import { t } from '../i18n.js';
import { eventText } from '../i18n/content.js';

function delaiTexte(ms) {
  if (ms >= 60000) {
    const min = Math.round(ms / 60000);
    return t(`${min} min`, `${min} min`);
  }
  if (ms >= 1000) {
    const sec = (ms / 1000).toFixed(1);
    return t(`${sec} s`, `${sec} s`);
  }
  return t(`${Math.max(1, Math.round(ms))} ms`, `${Math.max(1, Math.round(ms))} ms`);
}

// ─── Vue principale ────────────────────────────────────────────────────────

export function createOperationsView(container, { resources, astra, lien, chapter, onValider } = {}) {
  const plan = planOperations(chapter);
  const competence = competencePour(playerStore.roleId);
  let etape = 0;           // 0 contact | 1 instruments | 2 collecte | 3 evenement | 4 bilan
  let stationSelectee = null;
  let collecteProgress = 0;
  let evenement = null;
  let evenementResolu = null;
  let scoreOps  = 0;       // 0–100

  const sequence = plan.sequence;
  let ordreJoueur = [];

  // ── Étape 0 : Premier contact radio ──────────────────────────────────────

  function renderContact() {
    container.innerHTML = `
      <div class="sh-ops">
        <div class="sh-ops-kicker">${t('Opérations · Étape 1 / 4', 'Operations · Step 1 / 4')}</div>
        <h2 class="sh-ops-titre">${icon('signal', 18)} ${t('Premier contact radio', 'First radio contact')}</h2>
        <p class="sh-ops-desc">
          ${plan.lointain
            ? t('Le délai radio est la contrainte. Choisis le complexe qui a la cible en vue.', 'Radio delay is the constraint. Choose the complex that has the target in view.')
            : t('Le passage est court. Choisis la station qui voit le satellite sous le meilleur angle.', 'The pass is short. Choose the station that sees the spacecraft at the best angle.')}
        </p>

        <div class="sh-ops-stations">
          ${plan.stations.map(s => `
            <button type="button"
              class="sh-ops-station ${stationSelectee === s.id ? 'is-selected' : ''}"
              data-station="${s.id}">
              <span class="sh-ops-station-flag">${icon('compass', 16)}</span>
              <span class="sh-ops-station-nom">${s.nom}</span>
              <span class="sh-ops-station-coord">${s.lat > 0 ? '+' : ''}${s.lat}° · ${s.lon > 0 ? '+' : ''}${s.lon}°</span>
            </button>
          `).join('')}
        </div>

        <div class="sh-ops-hint">
          ${lienPhrase()}
        </div>

        <button type="button" id="sh-ops-next"
          class="sh-ops-btn" ${!stationSelectee ? 'disabled' : ''}>
          ${t('ÉTABLIR LE CONTACT →', 'MAKE CONTACT →')}
        </button>
      </div>
    `;

    container.querySelectorAll('.sh-ops-station').forEach(btn => {
      btn.addEventListener('click', () => {
        stationSelectee = btn.dataset.station;
        // Dispatcher vers la scène 3D
        window.dispatchEvent(new CustomEvent('station-selectee', {
          detail: { stationId: stationSelectee }
        }));
        renderContact();
      });
    });

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      if (!stationSelectee) return;
      scoreOps += stationSelectee === plan.stationCorrecte ? 25 : 10;
      astra?.say('operations_contact');
      etape = 1;
      render();
    });
  }

  // ── Étape 1 : Déploiement des instruments ────────────────────────────────

  function renderInstruments() {
    const tousActives = ordreJoueur.length === sequence.length;
    const ordreLibelle = sequence.map((etapeSeq) => t(etapeSeq.label, etapeSeq.labelEn)).join(' → ');

    container.innerHTML = `
      <div class="sh-ops">
        <div class="sh-ops-kicker">${t('Opérations · Étape 2 / 4', 'Operations · Step 2 / 4')}</div>
        <h2 class="sh-ops-titre">${icon('satellite', 18)} ${t('Déploiement des instruments', 'Instrument deployment')}</h2>
        <p class="sh-ops-desc">
          ${t('Active les systèmes dans le bon ordre :', 'Power the systems up in this order:')}
          <strong>${sequence.map((etapeSeq) => t(etapeSeq.label, etapeSeq.labelEn)).join(' → ')}</strong>.
        </p>

        <div class="sh-ops-instruments">
          ${sequence.map(ins => {
            const posJoueur = ordreJoueur.indexOf(ins.id) + 1;
            const isActive  = ordreJoueur.includes(ins.id);
            return `
              <button type="button"
                class="sh-ops-instr ${isActive ? 'is-active' : ''}"
                data-ordre="${ins.id}"
                ${isActive ? 'disabled' : ''}>
                <span class="sh-ops-instr-emoji">${icon(ins.iconName, 18)}</span>
                <span class="sh-ops-instr-label">${t(ins.label, ins.labelEn)}</span>
                ${isActive ? `<span class="sh-ops-instr-num">#${posJoueur}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        ${tousActives ? `
          <div class="sh-ops-eval ${ordreCorrect() ? 'is-ok' : 'is-warn'}">
            ${ordreCorrect()
              ? `${icon('check', 14)} ${t('Séquence correcte. Tous les systèmes sont opérationnels.', 'Correct sequence. All systems are up.')}`
              : `${icon('warning', 14)} ${t(`Séquence incorrecte. L'ordre attendu était : ${ordreLibelle}.`, `Wrong sequence. The expected order was: ${ordreLibelle}.`)}`}
          </div>
        ` : ''}

        <button type="button" id="sh-ops-next"
          class="sh-ops-btn" ${!tousActives ? 'disabled' : ''}>
          ${t('CONFIRMER LE DÉPLOIEMENT →', 'CONFIRM DEPLOYMENT →')}
        </button>
      </div>
    `;

    container.querySelectorAll('.sh-ops-instr:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const ordre = btn.dataset.ordre;
        ordreJoueur.push(ordre);
        window.dispatchEvent(new CustomEvent('instrument-active', {
          detail: { ordre, label: ordre }
        }));
        renderInstruments();
      });
    });

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      if (ordreCorrect()) scoreOps += 25;
      else scoreOps += 10; // points partiels
      etape = 2;
      render();
    });
  }

  function ordreCorrect() {
    return ordreJoueur.join(',') === sequence.map((etapeSeq) => etapeSeq.id).join(',');
  }

  // ── Étape 2 : Collecte de données ────────────────────────────────────────

  function renderCollecte() {
    // Ressources temps réel
    const donneesMax   = resources?.max?.donnees       ?? 5;
    const donneesUsed  = resources?.used?.donnees      ?? 0;
    const commMax      = resources?.max?.communications ?? 5;
    const commUsed     = resources?.used?.communications ?? 0;
    const donneesRest  = Math.max(0, donneesMax - donneesUsed);
    const commRest     = Math.max(0, commMax - commUsed);
    const pctDonnees   = Math.round((collecteProgress / 100) * 100);

    container.innerHTML = `
      <div class="sh-ops">
        <div class="sh-ops-kicker">${t('Opérations · Étape 3 / 4', 'Operations · Step 3 / 4')}</div>
        <h2 class="sh-ops-titre">${icon('chart', 18)} ${t('Collecte de données', 'Data collection')}</h2>
        <p class="sh-ops-desc">
          ${plan.lointain
            ? t('Chaque échange part avant la réponse. Surveille les ressources, puis transmets.', 'Each exchange leaves before the reply. Watch the resources, then transmit.')
            : t('Transmets pendant que la fenêtre de contact est ouverte.', 'Transmit while the contact window is open.')}
        </p>

        <div class="sh-ops-ressources">
          <div class="sh-ops-res">
            <span class="sh-ops-res-label">${t('Données restantes', 'Data remaining')}</span>
            <span class="sh-ops-res-val ${donneesRest < 1 ? 'is-crit' : ''}">${donneesRest.toFixed(1)} / ${donneesMax}</span>
          </div>
          <div class="sh-ops-res">
            <span class="sh-ops-res-label">${t('Communications restantes', 'Links remaining')}</span>
            <span class="sh-ops-res-val ${commRest < 1 ? 'is-crit' : ''}">${commRest.toFixed(1)} / ${commMax}</span>
          </div>
        </div>

        <div class="sh-ops-collecte-track">
          <div class="sh-ops-collecte-label">
            <span>${t('Transmission', 'Downlink')}</span>
            <span>${pctDonnees} %</span>
          </div>
          <div class="sh-ops-collecte-bar-track">
            <div class="sh-ops-collecte-bar-fill" style="width:${pctDonnees}%"></div>
          </div>
        </div>

        <div class="sh-ops-actions">
          <button type="button" id="sh-ops-transmettre" class="sh-ops-btn-secondary"
            ${collecteProgress >= 100 ? 'disabled' : ''}>
            ${icon('signal', 14)} ${t('TRANSMETTRE', 'TRANSMIT')} (${t(`${100 - Math.floor(collecteProgress)} % restants`, `${100 - Math.floor(collecteProgress)}% left`)})
          </button>
          <button type="button" id="sh-ops-next" class="sh-ops-btn"
            ${collecteProgress < 100 ? 'disabled' : ''}>
            ${t('DONNÉES TRANSMISES →', 'DATA DOWNLINKED →')}
          </button>
        </div>
      </div>
    `;

    container.querySelector('#sh-ops-transmettre')?.addEventListener('click', () => {
      collecteProgress = Math.min(100, collecteProgress + (competence.compression ? 30 : 20));
      resources?.consume('donnees',        0.5);
      resources?.consume('communications', 0.4);
      const pasDuree = Math.max(0.5, (resources?.max?.duree ?? 12) * 0.08);
      resources?.consume('duree', pasDuree);
      window.dispatchEvent(new CustomEvent('ressources-change'));
      window.dispatchEvent(new CustomEvent('donnees-transmises', {
        detail: { pct: collecteProgress }
      }));
      renderCollecte();
    });

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      if (collecteProgress < 100) return;
      scoreOps += 25;
      evenement = evenementAutorise() ? plan.evenement : null;
      etape = evenement?.options?.length ? 3 : 4;
      render();
    });
  }

  // ── Étape 3 : Événement imprévu ───────────────────────────────────────────

  function renderEvenement() {
    if (!evenement) { etape = 4; render(); return; }

    let reponduIdx = null;

    function resoudreVeto() {
      if (reponduIdx !== null) return;
      reponduIdx = -1;
      container.querySelectorAll('.sh-ops-ev-opt').forEach(b => { b.disabled = true; });
      const fb = container.querySelector('#sh-ops-ev-fb');
      fb.textContent = t(
        'Veto du directeur. La réserve du serveur encaisse l\'aléa, sans perdre de durée.',
        'Director veto. The server reserve absorbs the contingency, with no duration lost.'
      );
      fb.className = 'sh-ops-ev-feedback is-ok';
      evenementResolu = true;
      scoreOps += 25;
      astra?.sayRandomFrom('succes');
      const suivant = container.querySelector('#sh-ops-next');
      if (suivant) suivant.style.display = '';
      const bouton = container.querySelector('#sh-ops-veto');
      if (bouton) bouton.disabled = true;
    }

    if (resources?.canal) {
      vetoEcoute = resoudreVeto;
      window.addEventListener('table-veto', vetoEcoute);
    }

    const coutSem = Math.abs(evenement.effet?.duree || 0);
    const calcul = competence.calcul && coutSem
      ? `<p class="sh-ops-hint">${t(
        `Calculateur : cet aléa coûte ${coutSem} sem. de durée.`,
        `Calculator: this contingency costs ${coutSem} wk of duration.`
      )}</p>`
      : '';
    const jetons = playerStore.jetons;
    const prixVeto = competence.prixVeto || 2;
    const reserve = resources?.canal ? (resources.reserveVeto ?? 0) : jetons;
    const vetoFerme = resources?.canal
      ? reserve < prixVeto || resources.vetoUtilise
      : jetons < prixVeto;
    const veto = competence.veto
      ? `<button type="button" id="sh-ops-veto" class="sh-ops-btn-secondary" ${vetoFerme ? 'disabled' : ''}>
          ${t(`VETO · ${prixVeto} jetons`, `VETO · ${prixVeto} tokens`)} · ${reserve}
        </button>`
      : '';

    container.innerHTML = `
      <div class="sh-ops sh-ops--evenement">
        <div class="sh-ops-kicker">${icon('warning', 14)} ${t('ÉVÉNEMENT IMPRÉVU', 'UNPLANNED EVENT')}</div>
        <h2 class="sh-ops-titre">${icon(evenement.iconName, 18)} ${t('Aléa de mission', 'Mission contingency')}</h2>
        <p class="sh-ops-desc">${eventText(chapter)}</p>
        ${calcul}
        ${veto}

        <div class="sh-ops-ev-options">
          ${evenement.options.map((opt, i) => `
            <button type="button" class="sh-ops-ev-opt" data-idx="${i}">
              ${t(opt.label, opt.labelEn)}
            </button>
          `).join('')}
        </div>

        <div class="sh-ops-ev-feedback" id="sh-ops-ev-fb"></div>

        <button type="button" id="sh-ops-next" class="sh-ops-btn" style="display:none">
          ${t('CONTINUER →', 'CONTINUE →')}
        </button>
      </div>
    `;

    container.querySelectorAll('.sh-ops-ev-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (reponduIdx !== null) return;
        reponduIdx = parseInt(btn.dataset.idx, 10);
        const opt  = evenement.options[reponduIdx];

        container.querySelectorAll('.sh-ops-ev-opt').forEach(b => b.disabled = true);
        btn.classList.add(opt.correct ? 'is-correct' : 'is-wrong');

        const fb = container.querySelector('#sh-ops-ev-fb');
        fb.textContent = t(opt.explication, opt.explicationEn);
        fb.className   = `sh-ops-ev-feedback ${opt.correct ? 'is-ok' : 'is-err'}`;

        evenementResolu = opt.correct;
        const supplement = opt.correct || competence.reboot
          ? 0
          : (resources?.max?.duree ?? 12) * 0.1;
        appliquerEffet(resources, evenement.effet, { supplement });
        if (!opt.correct && competence.reboot) {
          fb.textContent += t(
            ' Reboot : le surcoût de durée est annulé.',
            ' Reboot: the extra duration cost is cancelled.'
          );
        }
        window.dispatchEvent(new CustomEvent('ressources-change'));
        if (opt.correct) {
          scoreOps += 25;
          astra?.sayRandomFrom('succes');
        } else {
          astra?.sayRandomFrom('alerte');
        }

        container.querySelector('#sh-ops-next').style.display = '';
      });
    });

    container.querySelector('#sh-ops-veto')?.addEventListener('click', () => {
      if (reponduIdx !== null) return;
      if (resources?.canal) {
        resources.canal.veto();
        return;
      }
      if (!playerStore.depenserJetons(prixVeto)) return;
      reponduIdx = -1;
      container.querySelectorAll('.sh-ops-ev-opt').forEach(b => { b.disabled = true; });
      const fb = container.querySelector('#sh-ops-ev-fb');
      fb.textContent = t(
        'Veto du directeur. La réserve encaisse l\'aléa, sans perdre de durée.',
        'Director veto. The reserve absorbs the contingency, with no duration lost.'
      );
      fb.className = 'sh-ops-ev-feedback is-ok';
      evenementResolu = true;
      scoreOps += 25;
      astra?.sayRandomFrom('succes');
      container.querySelector('#sh-ops-next').style.display = '';
      container.querySelector('#sh-ops-veto').disabled = true;
    });

    if (resources?.canal && resources.vetoUtilise) resoudreVeto();

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      etape = 4;
      render();
    });
  }

  // ── Étape 4 : Bilan des opérations ───────────────────────────────────────

  function renderBilan() {
    const grade = scoreOps >= 80 ? { label: t('Excellent', 'Excellent'),    cls: 'is-ok',  iconName: 'trophy'  }
                : scoreOps >= 50 ? { label: t('Satisfaisant', 'Satisfactory'), cls: 'is-mid', iconName: 'medal'   }
                :                  { label: t('Difficile', 'Rough'),    cls: 'is-err', iconName: 'warning' };

    container.innerHTML = `
      <div class="sh-ops sh-ops--bilan">
        <div class="sh-ops-kicker">${t('Bilan des opérations', 'Operations debrief')}</div>
        <div class="sh-ops-bilan-score ${grade.cls}">
          ${icon(grade.iconName, 20)} ${t('Score opérations', 'Operations score')} : <strong>${scoreOps} / 100</strong>
        </div>
        <div class="sh-ops-bilan-grade">${grade.label}</div>
        <ul class="sh-ops-bilan-liste">
          <li>${icon(stationSelectee === plan.stationCorrecte ? 'check' : 'warning', 13)} ${t('Contact radio', 'Radio contact')} : ${stationSelectee ? (plan.stations.find(s => s.id === stationSelectee)?.nom ?? '') : t('Non établi', 'Not established')}</li>
          <li>${icon(ordreCorrect() ? 'check' : 'warning', 13)} ${t('Déploiement', 'Deployment')} : ${ordreCorrect() ? t('Séquence correcte', 'Correct sequence') : t('Séquence incorrecte', 'Wrong sequence')}</li>
          <li>${icon(collecteProgress >= 100 ? 'check' : 'warning', 13)} ${t('Données transmises', 'Data downlinked')} : ${collecteProgress >= 100 ? '100 %' : `${Math.floor(collecteProgress)} %`}</li>
          <li>${icon(evenement ? (evenementResolu ? 'check' : 'warning') : 'info', 13)} ${t('Aléa du chapitre', 'Chapter contingency')} : ${evenement ? (evenementResolu ? t('Tenue', 'Held') : t('Aggravé', 'Made worse')) : t('Aucun événement', 'No event')}</li>
        </ul>
        <button type="button" id="sh-ops-terminer" class="sh-ops-btn">
          ${t('CLORE LA MISSION → BILAN FINAL', 'CLOSE THE MISSION → FINAL DEBRIEF')}
        </button>
      </div>
    `;

    container.querySelector('#sh-ops-terminer')?.addEventListener('click', () => {
      onValider?.({ scoreOps });
    });
  }

  function lienPhrase() {
    const delay = delaiTexte(lien?.delayMs ?? 0);
    const fenetre = lien?.contactMin
      ? t(` Fenêtre de contact : ${lien.contactMin} min.`, ` Contact window: ${lien.contactMin} min.`)
      : '';
    return t(`Délai radio aller-retour : ${delay}.${fenetre}`, `Round-trip radio delay: ${delay}.${fenetre}`);
  }

  // ── Routeur principal ─────────────────────────────────────────────────────

  let vetoEcoute = null;

  function render() {
    if (vetoEcoute) window.removeEventListener('table-veto', vetoEcoute);
    vetoEcoute = null;
    if      (etape === 0) renderContact();
    else if (etape === 1) renderInstruments();
    else if (etape === 2) renderCollecte();
    else if (etape === 3) renderEvenement();
    else                  renderBilan();
  }

  render();
  return { getScore: () => scoreOps };
}
