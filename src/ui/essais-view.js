// Épisode Essais — 3 épreuves de validation avant le lancement (Sprint 2).
// Résultat : fiabilité 0–100 % stockée et transmise via onValider({ fiabilite }).
//
// Épreuve 1 — Vibrations : maintenir la jauge dans la zone verte 3 s sur 5 s.
// Épreuve 2 — Thermique  : choisir le bon matériau d'isolation parmi 3 options.
// Épreuve 3 — Électrique : reconnaître la bonne combinaison de composants compatibles.

import { icon } from './icons.js';
import { t } from '../i18n.js';

const EPREUVES = [
  {
    id: 'vibrations',
    iconName: 'vibration',
    titre: 'Test vibrations',
    titreEn: 'Vibration test',
    description: 'Maintiens la jauge dans la zone verte pendant 3 secondes.',
    descriptionEn: 'Hold the gauge in the green band for 3 seconds.',
    points: 34
  },
  {
    id: 'thermique',
    iconName: 'thermal',
    titre: 'Test thermique',
    titreEn: 'Thermal test',
    description: 'Choisis le bon matériau d\'isolation pour l\'environnement spatial.',
    descriptionEn: 'Choose the right insulation for the space environment.',
    points: 33
  },
  {
    id: 'electrique',
    iconName: 'electric',
    titre: 'Test électrique',
    titreEn: 'Electrical test',
    description: 'Identifie la combinaison de composants sans conflit de tension.',
    descriptionEn: 'Find the component combination with no voltage conflict.',
    points: 33
  }
];

// ─── Épreuve 1 : Vibrations (mini-jeu de jauge) ─────────────────────────────

function epreuveVibrations(onResult) {
  let value    = 50;         // position actuelle 0–100
  let inZone   = 0;          // secondes cumulées dans la zone verte
  let total    = 0;          // secondes écoulées
  const TARGET = 3;          // secondes dans la zone pour réussir
  const DUREE  = 6;          // durée totale de l'épreuve
  let raf      = null;
  let lastT    = null;
  let done     = false;

  const root = document.createElement('div');
  root.className = 'sh-essai-vibrations';
  root.innerHTML = `
    <div class="sh-vib-instruction">${t('Clique rapidement et régulièrement pour maintenir la jauge dans la zone verte.', 'Click quickly and steadily to keep the gauge in the green band.')}</div>
    <div class="sh-vib-track">
      <div class="sh-vib-zone"></div>
      <div class="sh-vib-cursor" id="sh-vib-cursor"></div>
    </div>
    <div class="sh-vib-temps">
      <span id="sh-vib-inzone">${t('Dans la zone', 'In the band')} : <b>0.0 s</b> / ${TARGET} s</span>
      <span id="sh-vib-total">${t('Temps', 'Time')} : <b>0.0 s</b> / ${DUREE} s</span>
    </div>
    <button type="button" class="sh-essai-clic" id="sh-vib-clic">${t('MAINTENIR !', 'HOLD!')}</button>
  `;

  function loop(ts) {
    if (!lastT) lastT = ts;
    const dt = Math.min((ts - lastT) / 1000, 0.1);
    lastT = ts;
    total += dt;

    // La jauge descend naturellement
    value = Math.max(0, value - 18 * dt);

    const cursor  = root.querySelector('#sh-vib-cursor');
    const inzoneEl = root.querySelector('#sh-vib-inzone b');
    const totalEl  = root.querySelector('#sh-vib-total b');

    if (cursor) cursor.style.left = `${value}%`;

    // Zone verte = 35–65
    const inGreen = value >= 35 && value <= 65;
    if (inGreen) inZone += dt;

    if (inzoneEl) inzoneEl.textContent = `${inZone.toFixed(1)} s`;
    if (totalEl)  totalEl.textContent  = `${total.toFixed(1)} s`;

    if (!done && (total >= DUREE || inZone >= TARGET)) {
      done = true;
      const succes = inZone >= TARGET;
      showResult(root, succes, succes ? t('Jauge stabilisée ✓', 'Gauge stabilised ✓') : t('Instabilité détectée ✗', 'Instability detected ✗'));
      onResult(succes);
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  root.querySelector('#sh-vib-clic').addEventListener('click', () => {
    if (done) return;
    value = Math.min(100, value + 22);
    if (!lastT) raf = requestAnimationFrame(loop);
  });

  return root;
}

// ─── Épreuve 2 : Thermique (QCM) ────────────────────────────────────────────

const THERMO_OPTIONS = [
  { id: 'mli',      label: 'Couverture MLI multi-couches',           labelEn: 'Multi-layer MLI blanket', correct: true,  explication: 'Correct. Le MLI est le standard pour l\'isolation thermique spatiale.', explicationEn: 'Correct. MLI is the standard for spacecraft thermal insulation.' },
  { id: 'mousse',   label: 'Mousse polyuréthane',                     labelEn: 'Polyurethane foam', correct: false, explication: 'Incorrect. Le polyuréthane dégazze dans le vide et se dégrade sous les UV.', explicationEn: 'Wrong. Polyurethane outgasses in vacuum and breaks down under UV.' },
  { id: 'aerogel',  label: 'Aérogel de silice (non spatial)',         labelEn: 'Silica aerogel (not space-rated)', correct: false, explication: 'Incorrect. L\'aérogel non spatial est fragile et non qualifié pour le vol.', explicationEn: 'Wrong. Non-space aerogel is fragile and not qualified for flight.' }
];

function epreuveThermique(onResult) {
  const root = document.createElement('div');
  root.className = 'sh-essai-qcm';
  root.innerHTML = `
    <div class="sh-qcm-question">
      ${t('Ton CubeSat va subir des cycles thermiques de −120 °C à +120 °C en orbite.', 'Your CubeSat will see thermal cycles from −120 °C to +120 °C in orbit.')}<br>
      <strong>${t('Quel matériau d\'isolation choisis-tu pour la coque ?', 'Which insulation do you choose for the shell?')}</strong>
    </div>
    <div class="sh-qcm-options">
      ${THERMO_OPTIONS.map(o => `
        <button type="button" class="sh-qcm-opt" data-id="${o.id}">
          ${t(o.label, o.labelEn)}
        </button>
      `).join('')}
    </div>
    <div class="sh-qcm-feedback" id="sh-thermo-fb"></div>
  `;

  root.querySelectorAll('.sh-qcm-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.sh-qcm-opt').forEach(b => b.disabled = true);
      const opt = THERMO_OPTIONS.find(o => o.id === btn.dataset.id);
      btn.classList.add(opt.correct ? 'is-correct' : 'is-wrong');
      const fb = root.querySelector('#sh-thermo-fb');
      fb.textContent  = t(opt.explication, opt.explicationEn);
      fb.className    = `sh-qcm-feedback ${opt.correct ? 'is-ok' : 'is-err'}`;
      setTimeout(() => {
        showResult(root, opt.correct, opt.correct ? t('Isolation validée ✓', 'Insulation validated ✓') : t('Mauvais matériau ✗', 'Wrong material ✗'));
        onResult(opt.correct);
      }, 1400);
    });
  });

  return root;
}

// ─── Épreuve 3 : Électrique (combinaison de composants) ─────────────────────

const ELECTRO_COMBOS = [
  {
    label: 'Batterie Li-ion 3.7 V + Panneau GaAs 5 V + Régulateur 5→3.7 V',
    labelEn: 'Li-ion battery 3.7 V + GaAs array 5 V + 5→3.7 V regulator',
    correct: true,
    explication: 'Correct. Le régulateur abaisse la tension du panneau pour charger la batterie sans surcharge.',
    explicationEn: 'Correct. The regulator drops the array voltage so the battery charges without overvoltage.'
  },
  {
    label: 'Batterie Li-ion 3.7 V + Panneau GaAs 5 V (connexion directe)',
    labelEn: 'Li-ion battery 3.7 V + GaAs array 5 V (direct connection)',
    correct: false,
    explication: 'Incorrect. Sans régulateur, la surtension du panneau endommage la batterie Li-ion.',
    explicationEn: 'Wrong. Without a regulator, the array overvoltage damages the Li-ion battery.'
  },
  {
    label: 'Batterie NiMH 1.2 V + Panneau Si 3 V + Régulateur boost 3→5 V',
    labelEn: 'NiMH battery 1.2 V + Si array 3 V + 3→5 V boost regulator',
    correct: false,
    explication: 'Incorrect. Cette architecture n\'alimente pas l\'instrument scientifique (5 V requis).',
    explicationEn: 'Wrong. This architecture does not feed the science instrument (5 V required).'
  }
];

function epreuveElectrique(onResult) {
  const shuffled = [...ELECTRO_COMBOS].sort(() => Math.random() - 0.5);
  const root = document.createElement('div');
  root.className = 'sh-essai-qcm';
  root.innerHTML = `
    <div class="sh-qcm-question">
      ${t('L\'instrument scientifique nécessite une alimentation stable à 5 V.', 'The science instrument needs a stable 5 V supply.')}<br>
      <strong>${t('Quelle combinaison est électriquement compatible ?', 'Which combination is electrically compatible?')}</strong>
    </div>
    <div class="sh-qcm-options">
      ${shuffled.map((o, i) => `
        <button type="button" class="sh-qcm-opt" data-idx="${i}">
          ${t(o.label, o.labelEn)}
        </button>
      `).join('')}
    </div>
    <div class="sh-qcm-feedback" id="sh-elec-fb"></div>
  `;

  root.querySelectorAll('.sh-qcm-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.sh-qcm-opt').forEach(b => b.disabled = true);
      const opt = shuffled[parseInt(btn.dataset.idx, 10)];
      btn.classList.add(opt.correct ? 'is-correct' : 'is-wrong');
      const fb = root.querySelector('#sh-elec-fb');
      fb.textContent = t(opt.explication, opt.explicationEn);
      fb.className   = `sh-qcm-feedback ${opt.correct ? 'is-ok' : 'is-err'}`;
      setTimeout(() => {
        showResult(root, opt.correct, opt.correct ? t('Câblage validé ✓', 'Wiring validated ✓') : t('Conflit de tension ✗', 'Voltage conflict ✗'));
        onResult(opt.correct);
      }, 1400);
    });
  });

  return root;
}

// ─── Helpers visuels ────────────────────────────────────────────────────────

function showResult(root, succes, msg) {
  const existing = root.querySelector('.sh-essai-result');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `sh-essai-result ${succes ? 'is-ok' : 'is-err'}`;
  el.textContent = msg;
  root.appendChild(el);
}

// ─── Orchestrateur ──────────────────────────────────────────────────────────

export function createEssaisView(container, { astra, onValider } = {}) {
  let epreuveIndex = 0;
  const resultats  = [];   // true/false par épreuve

  function fiabilite() {
    const pts = resultats.reduce((sum, ok, i) => sum + (ok ? EPREUVES[i].points : 0), 0);
    return pts;
  }

  function render() {
    const ep = EPREUVES[epreuveIndex];
    if (!ep) {
      // Toutes les épreuves terminées
      const pct  = fiabilite();
      const ok   = pct >= 50;
      container.innerHTML = `
        <div class="sh-essais-bilan">
          <div class="sh-essais-bilan-titre">${t('Bilan des essais', 'Test results')}</div>
          <div class="sh-essais-bilan-score ${ok ? 'is-ok' : 'is-err'}">
            ${t('Fiabilité', 'Reliability')} : <strong>${pct} %</strong>
          </div>
          <div class="sh-essais-bilan-detail">
            ${EPREUVES.map((e, i) => `
              <div class="sh-essais-bilan-ligne">
                ${resultats[i] ? '✅' : '❌'} ${t(e.titre, e.titreEn)}
                <span class="sh-essais-pts">${resultats[i] ? '+'+e.points : '0'} pts</span>
              </div>
            `).join('')}
          </div>
          <p class="sh-essais-astra">
            ${ok
              ? t('Tous les systèmes sont verts. Le lancement peut être autorisé.', 'All systems are green. Launch can be authorised.')
              : t('Des défauts ont été détectés. Le lancement est risqué — mais possible.', 'Faults were found. Launch is risky — but still possible.')}
          </p>
          <button type="button" class="sh-essais-valider" id="sh-essais-valider">
            ${t('CONFIRMER ET PASSER AU LANCEMENT →', 'CONFIRM AND GO TO LAUNCH →')}
          </button>
        </div>
      `;
      container.querySelector('#sh-essais-valider').addEventListener('click', () => {
        onValider?.({ fiabilite: pct });
      });
      return;
    }

    // Afficher l'épreuve courante
    const total = EPREUVES.length;
    container.innerHTML = `
      <div class="sh-essais">
        <div class="sh-essais-header">
          <div class="sh-essais-kicker">${t('Essais', 'Tests')} · ${epreuveIndex + 1} / ${total}</div>
          <div class="sh-essais-progres">
            ${EPREUVES.map((e, i) => `
              <span class="sh-essais-step ${i < epreuveIndex ? 'is-done' : i === epreuveIndex ? 'is-active' : ''}">
                ${i < epreuveIndex ? icon('check', 14) : icon(e.iconName, 18)}
              </span>
            `).join('')}
          </div>
          <h2 class="sh-essais-titre">${icon(ep.iconName, 20)} ${t(ep.titre, ep.titreEn)}</h2>
          <p class="sh-essais-desc">${t(ep.description, ep.descriptionEn)}</p>
        </div>
        <div class="sh-essais-epreuve" id="sh-essais-epreuve"></div>
      </div>
    `;

    const epreuveEl = container.querySelector('#sh-essais-epreuve');

    function onEpreuveResult(succes) {
      resultats.push(succes);
      astra?.[succes ? 'sayRandomFrom' : 'sayRandomFrom']?.(succes ? 'succes' : 'alerte');
      setTimeout(() => {
        epreuveIndex++;
        render();
      }, 2000);
    }

    if (ep.id === 'vibrations') epreuveEl.appendChild(epreuveVibrations(onEpreuveResult));
    if (ep.id === 'thermique')  epreuveEl.appendChild(epreuveThermique(onEpreuveResult));
    if (ep.id === 'electrique') epreuveEl.appendChild(epreuveElectrique(onEpreuveResult));
  }

  render();
  return { getFiabilite: fiabilite };
}
