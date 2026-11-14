// Épisode Opérations — pilotage de la mission en orbite (Sprint 3).
//
// Séquence :
//   1. Premier contact radio   — pointer l'antenne vers une station au sol
//   2. Déploiement instruments — activer les instruments dans la bonne séquence
//   3. Collecte de données     — gérer les ressources en temps réel
//   4. Événement imprévu       — répondre à une anomalie aléatoire
//
// Chaque étape dispatche des événements pour la scène 3D (orbit.js).

import { settingsStore } from '../engine/settings-store.js';
import { icon } from '../ui/icons.js';

// ─── Données : stations au sol ────────────────────────────────────────────

const STATIONS = [
  { id: 'madrid',    nom: 'Madrid (DSN)',    lat: 40.4,   lon: -4.2,   flag: 'ES' },
  { id: 'goldstone', nom: 'Goldstone (DSN)', lat: 35.4,   lon: -116.9, flag: 'US' },
  { id: 'canberra',  nom: 'Canberra (DSN)',  lat: -35.4,  lon: 149.0,  flag: 'AU' },
  { id: 'kourou',    nom: 'Kourou (ESA)',    lat: 5.2,    lon: -52.8,  flag: 'GF' }
];

// ─── Événements imprévus ──────────────────────────────────────────────────

const EVENEMENTS = [
  {
    id: 'panne_batterie',
    iconName: 'battery',
    titre: 'Panne batterie',
    description: 'La batterie principale montre une chute de tension anormale.',
    options: [
      { label: 'Basculer sur la batterie de secours',   correct: true,  explication: 'Bon réflexe. La redondance sauve la mission.' },
      { label: 'Augmenter la puissance des panneaux',   correct: false, explication: 'Impossible en éclipse. Les panneaux ne produisent rien.' },
      { label: 'Éteindre l\'instrument scientifique',   correct: true,  explication: 'Délestage correct : priorité aux systèmes critiques.' }
    ]
  },
  {
    id: 'perte_signal',
    iconName: 'signal',
    titre: 'Perte de signal',
    description: 'Le signal radio vers la Terre s\'est interrompu depuis 4 min.',
    options: [
      { label: 'Réorienter l\'antenne vers la station', correct: true,  explication: 'Correct. Le pointage manuel rétablit la liaison.' },
      { label: 'Augmenter la puissance d\'émission',    correct: false, explication: 'La puissance maximale est déjà atteinte. Le problème est géométrique.' },
      { label: 'Attendre le prochain passage',          correct: false, explication: 'Trop long. 95 min d\'attente feraient dépasser la limite de données.' }
    ]
  },
  {
    id: 'debris',
    iconName: 'warning',
    titre: 'Alerte débris',
    description: 'Un fragment de satellite désorbité approche à moins de 2 km.',
    options: [
      { label: 'Manœuvre d\'évitement (Δv +0.3 m/s)',  correct: true,  explication: 'Manœuvre standard. Le carburant consommé est négligeable.' },
      { label: 'Ne rien faire, probabilité faible',      correct: false, explication: 'La probabilité de collision est de 1/1000, ce qui est trop élevé selon les normes.' },
      { label: 'Mettre le satellite en mode sécurité',  correct: true,  explication: 'Mode sécurité correct en attendant l\'évaluation au sol.' }
    ]
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function randomEvenement() {
  if (!settingsStore.get('randomEvents')) return null;
  return EVENEMENTS[Math.floor(Math.random() * EVENEMENTS.length)];
}

function formatDuree(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

// ─── Vue principale ────────────────────────────────────────────────────────

export function createOperationsView(container, { resources, astra, orbit, onValider } = {}) {
  let etape = 0;           // 0 contact | 1 instruments | 2 collecte | 3 evenement | 4 bilan
  let stationSelectee = null;
  let instrumentsActives = new Set();
  let collecteProgress = 0;
  let collecteRaf = null;
  let evenement = null;
  let scoreOps  = 0;       // 0–100

  const INSTRUMENTS = [
    { id: 'comm',       label: 'Antenne comm',      ordre: 1, iconName: 'antenna'    },
    { id: 'energie',    label: 'Panneaux solaires',  ordre: 2, iconName: 'solar'      },
    { id: 'instrument', label: 'Instrument science', ordre: 3, iconName: 'microscope' }
  ];
  const ORDRE_CORRECT = [1, 2, 3];
  let ordreJoueur = [];

  // ── Étape 0 : Premier contact radio ──────────────────────────────────────

  function renderContact() {
    container.innerHTML = `
      <div class="sh-ops">
        <div class="sh-ops-kicker">Opérations · Étape 1 / 4</div>
        <h2 class="sh-ops-titre">${icon('signal', 18)} Premier contact radio</h2>
        <p class="sh-ops-desc">
          Le CubeSat vient d'entrer en orbite. Choisis la station au sol
          dont l'angle d'élévation est le plus favorable pour établir le contact.
        </p>

        <div class="sh-ops-stations">
          ${STATIONS.map(s => `
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
          💡 Le signal met ~${orbitData().delaiMs} ms aller-retour.
          Tu as ${orbitData().dureeFenetreMin} min de fenêtre de contact.
        </div>

        <button type="button" id="sh-ops-next"
          class="sh-ops-btn" ${!stationSelectee ? 'disabled' : ''}>
          ÉTABLIR LE CONTACT →
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
      scoreOps += 25;
      astra?.say('operations_ch1_intro');
      etape = 1;
      render();
    });
  }

  // ── Étape 1 : Déploiement des instruments ────────────────────────────────

  function renderInstruments() {
    const tousActives = ordreJoueur.length === INSTRUMENTS.length;

    container.innerHTML = `
      <div class="sh-ops">
        <div class="sh-ops-kicker">Opérations · Étape 2 / 4</div>
        <h2 class="sh-ops-titre">${icon('satellite', 18)} Déploiement des instruments</h2>
        <p class="sh-ops-desc">
          Active les systèmes dans le bon ordre :
          <strong>communications → énergie → instrument scientifique</strong>.
        </p>

        <div class="sh-ops-instruments">
          ${INSTRUMENTS.map(ins => {
            const posJoueur = ordreJoueur.indexOf(ins.ordre) + 1;
            const isActive  = ordreJoueur.includes(ins.ordre);
            return `
              <button type="button"
                class="sh-ops-instr ${isActive ? 'is-active' : ''}"
                data-ordre="${ins.ordre}"
                ${isActive ? 'disabled' : ''}>
                <span class="sh-ops-instr-emoji">${icon(ins.iconName, 18)}</span>
                <span class="sh-ops-instr-label">${ins.label}</span>
                ${isActive ? `<span class="sh-ops-instr-num">#${posJoueur}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        ${tousActives ? `
          <div class="sh-ops-eval ${ordreCorrect() ? 'is-ok' : 'is-warn'}">
            ${ordreCorrect()
              ? `${icon('check', 14)} Séquence correcte. Tous les systèmes sont opérationnels.`
              : `${icon('warning', 14)} Séquence incorrecte. Les panneaux auraient dû être déployés avant l'instrument.`}
          </div>
        ` : ''}

        <button type="button" id="sh-ops-next"
          class="sh-ops-btn" ${!tousActives ? 'disabled' : ''}>
          CONFIRMER LE DÉPLOIEMENT →
        </button>
      </div>
    `;

    container.querySelectorAll('.sh-ops-instr:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const ordre = parseInt(btn.dataset.ordre, 10);
        ordreJoueur.push(ordre);
        // Dispatcher vers la scène 3D
        window.dispatchEvent(new CustomEvent('instrument-active', {
          detail: { ordre, label: INSTRUMENTS.find(i => i.ordre === ordre)?.id }
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
    return ordreJoueur.join(',') === ORDRE_CORRECT.join(',');
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
        <div class="sh-ops-kicker">Opérations · Étape 3 / 4</div>
        <h2 class="sh-ops-titre">${icon('chart', 18)} Collecte de données</h2>
        <p class="sh-ops-desc">
          L'instrument transmet ses mesures. Surveille les ressources
          et clique sur <strong>TRANSMETTRE</strong> quand la fenêtre de contact est ouverte.
        </p>

        <div class="sh-ops-ressources">
          <div class="sh-ops-res">
            <span class="sh-ops-res-label">Données restantes</span>
            <span class="sh-ops-res-val ${donneesRest < 1 ? 'is-crit' : ''}">${donneesRest.toFixed(1)} / ${donneesMax}</span>
          </div>
          <div class="sh-ops-res">
            <span class="sh-ops-res-label">Communications restantes</span>
            <span class="sh-ops-res-val ${commRest < 1 ? 'is-crit' : ''}">${commRest.toFixed(1)} / ${commMax}</span>
          </div>
        </div>

        <div class="sh-ops-collecte-track">
          <div class="sh-ops-collecte-label">
            <span>Transmission</span>
            <span>${pctDonnees} %</span>
          </div>
          <div class="sh-ops-collecte-bar-track">
            <div class="sh-ops-collecte-bar-fill" style="width:${pctDonnees}%"></div>
          </div>
        </div>

        <div class="sh-ops-actions">
          <button type="button" id="sh-ops-transmettre" class="sh-ops-btn-secondary"
            ${collecteProgress >= 100 ? 'disabled' : ''}>
            ${icon('signal', 14)} TRANSMETTRE (${100 - Math.floor(collecteProgress)} % restants)
          </button>
          <button type="button" id="sh-ops-next" class="sh-ops-btn"
            ${collecteProgress < 100 ? 'disabled' : ''}>
            DONNÉES TRANSMISES →
          </button>
        </div>
      </div>
    `;

    container.querySelector('#sh-ops-transmettre')?.addEventListener('click', () => {
      collecteProgress = Math.min(100, collecteProgress + 20);
      resources?.consume('donnees',        0.5);
      resources?.consume('communications', 0.4);
      window.dispatchEvent(new CustomEvent('donnees-transmises', {
        detail: { pct: collecteProgress }
      }));
      renderCollecte();
    });

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      if (collecteProgress < 100) return;
      scoreOps += 25;
      evenement = randomEvenement();
      etape = evenement ? 3 : 4;
      render();
    });
  }

  // ── Étape 3 : Événement imprévu ───────────────────────────────────────────

  function renderEvenement() {
    if (!evenement) { etape = 4; render(); return; }

    let reponduIdx = null;

    container.innerHTML = `
      <div class="sh-ops sh-ops--evenement">
        <div class="sh-ops-kicker">${icon('warning', 14)} ÉVÉNEMENT IMPRÉVU</div>
        <h2 class="sh-ops-titre">${icon(evenement.iconName, 18)} ${evenement.titre}</h2>
        <p class="sh-ops-desc">${evenement.description}</p>

        <div class="sh-ops-ev-options">
          ${evenement.options.map((opt, i) => `
            <button type="button" class="sh-ops-ev-opt" data-idx="${i}">
              ${opt.label}
            </button>
          `).join('')}
        </div>

        <div class="sh-ops-ev-feedback" id="sh-ops-ev-fb"></div>

        <button type="button" id="sh-ops-next" class="sh-ops-btn" style="display:none">
          CONTINUER →
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
        fb.textContent = opt.explication;
        fb.className   = `sh-ops-ev-feedback ${opt.correct ? 'is-ok' : 'is-err'}`;

        if (opt.correct) {
          scoreOps += 25;
          astra?.sayRandomFrom('succes');
        } else {
          astra?.sayRandomFrom('alerte');
        }

        container.querySelector('#sh-ops-next').style.display = '';
      });
    });

    container.querySelector('#sh-ops-next')?.addEventListener('click', () => {
      etape = 4;
      render();
    });
  }

  // ── Étape 4 : Bilan des opérations ───────────────────────────────────────

  function renderBilan() {
    const grade = scoreOps >= 80 ? { label: 'Excellent',    cls: 'is-ok',  iconName: 'trophy'  }
                : scoreOps >= 50 ? { label: 'Satisfaisant', cls: 'is-mid', iconName: 'medal'   }
                :                  { label: 'Difficile',    cls: 'is-err', iconName: 'warning' };

    container.innerHTML = `
      <div class="sh-ops sh-ops--bilan">
        <div class="sh-ops-kicker">Bilan des opérations</div>
        <div class="sh-ops-bilan-score ${grade.cls}">
          ${icon(grade.iconName, 20)} Score opérations : <strong>${scoreOps} / 100</strong>
        </div>
        <div class="sh-ops-bilan-grade">${grade.label}</div>
        <ul class="sh-ops-bilan-liste">
          <li>${icon(stationSelectee ? 'check' : 'close', 13)} Contact radio : ${stationSelectee ? (STATIONS.find(s => s.id === stationSelectee)?.nom ?? '') : 'Non établi'}</li>
          <li>${icon(ordreCorrect() ? 'check' : 'warning', 13)} Déploiement : ${ordreCorrect() ? 'Séquence correcte' : 'Séquence incorrecte'}</li>
          <li>${icon(collecteProgress >= 100 ? 'check' : 'warning', 13)} Données transmises : ${collecteProgress >= 100 ? '100 %' : `${Math.floor(collecteProgress)} %`}</li>
          <li>${icon(evenement ? (scoreOps >= 75 ? 'check' : 'warning') : 'info', 13)} Événement imprévu : ${evenement ? (scoreOps >= 75 ? 'Résolu' : 'Résolu partiellement') : 'Aucun événement'}</li>
        </ul>
        <button type="button" id="sh-ops-terminer" class="sh-ops-btn">
          CLORE LA MISSION → BILAN FINAL
        </button>
      </div>
    `;

    container.querySelector('#sh-ops-terminer')?.addEventListener('click', () => {
      onValider?.({ scoreOps });
    });
  }

  // ── Données orbitales pour l'affichage ────────────────────────────────────

  function orbitData() {
    // Valeurs issues de orbite_basse.json
    return {
      delaiMs:          560,
      dureeFenetreMin:  8
    };
  }

  // ── Routeur principal ─────────────────────────────────────────────────────

  function render() {
    if      (etape === 0) renderContact();
    else if (etape === 1) renderInstruments();
    else if (etape === 2) renderCollecte();
    else if (etape === 3) renderEvenement();
    else                  renderBilan();
  }

  render();
  return { getScore: () => scoreOps };
}
