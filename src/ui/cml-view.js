import { icon, statusDot } from './icons.js';
import { t } from '../i18n.js';
import { cmlCriterion, cmlTalk } from '../i18n/content.js';
// Affiche les 20 critères regroupés par niveau (1-4).
// ASTRA interroge le joueur critère par critère ; le joueur ne coche jamais lui-même.

// Dialogues ASTRA typés par critère (Rouge / Jaune / Vert)
const CML_DIALOGUES = {
  cml1_objectif: {
    question: 'Quelle question scientifique précise cette mission va-t-elle résoudre ? (une phrase)',
    rouge:  'Trop vague. Précise la cible, la méthode et l\'instrument.',
    jaune:  'Bien orienté, mais il manque la zone géographique ou la résolution visée.',
    vert:   'Clair, mesurable, lié à l\'instrumentation. Critère validé.'
  },
  cml1_unique: {
    question: 'En quoi cette mission est-elle unique par rapport à ce qui existe déjà ?',
    rouge:  'Aucune différenciation identifiée. Consulte la bibliothèque NASA.',
    jaune:  'Différenciation partielle. Argumente mieux face aux missions existantes.',
    vert:   'Unicité clairement identifiée et documentée.'
  },
  cml1_fenetre: {
    question: 'Quelle est la fenêtre de lancement approximative ?',
    rouge:  'Aucune fenêtre définie. Consulte les contraintes orbitales.',
    jaune:  'Fenêtre approximative. Affine avec les données GMAT.',
    vert:   'Fenêtre de lancement définie et cohérente avec l\'orbite cible.'
  },
  cml1_classe_budget: {
    question: 'Dans quelle classe de budget se situe cette mission ?',
    rouge:  'Classe de budget non définie. Commence par estimer la masse totale.',
    jaune:  'Classe identifiée mais sans justification chiffrée.',
    vert:   'Classe de budget définie avec ordre de grandeur cohérent.'
  },
  cml1_croquis: {
    question: 'As-tu un premier croquis du vaisseau, même sommaire ?',
    rouge:  'Aucun croquis. Visualise ta mission avant de continuer.',
    jaune:  'Croquis très sommaire. Ajoute au moins les sous-systèmes principaux.',
    vert:   'Croquis présent avec les familles de composants identifiées.'
  },
  cml2_exigences: {
    question: 'Les besoins scientifiques sont-ils traduits en exigences de premier niveau ?',
    rouge:  'Pas d\'exigences. Pars de ton objectif scientifique et décompose-le.',
    jaune:  'Exigences partielles. Il manque les critères de succès mesurables.',
    vert:   'Exigences de premier niveau définies et traçables vers l\'objectif.'
  },
  cml2_ordres_grandeur: {
    question: 'As-tu estimé la masse, la puissance et le budget en ordre de grandeur ?',
    rouge:  'Aucune estimation. Commence par la masse — c\'est le premier goulot.',
    jaune:  'Une ou deux estimations manquent. Complète avant de passer à l\'Atelier.',
    vert:   'Masse, puissance et budget estimés avec une cohérence acceptable.'
  },
  cml2_risques: {
    question: 'Les risques majeurs de cette mission ont-ils été identifiés ?',
    rouge:  'Aucun risque listé. L\'espace est hostile — anticipe.',
    jaune:  'Quelques risques identifiés mais non quantifiés.',
    vert:   'Risques majeurs listés avec leur impact potentiel.'
  },
  cml2_lanceur: {
    question: 'As-tu listé au moins un lanceur candidat ?',
    rouge:  'Aucun lanceur. Vérifie la compatibilité masse/volume avec l\'orbite visée.',
    jaune:  'Lanceur identifié mais sans vérification de compatibilité.',
    vert:   'Lanceur candidat compatible avec la masse et l\'orbite. Validé.'
  },
  cml2_technologies: {
    question: 'Les technologies nécessaires ont-elles été identifiées ?',
    rouge:  'Technologies non listées. Reviens à l\'Atelier et analyse chaque famille.',
    jaune:  'Technologies partiellement identifiées.',
    vert:   'Technologies nécessaires identifiées, disponibilité vérifiée.'
  },
  cml3_comparaison: {
    question: 'As-tu comparé au moins deux architectures différentes dans l\'Atelier ?',
    rouge:  'Une seule configuration testée. Une option unique n\'est pas un choix, c\'est un pari.',
    jaune:  'Deux configurations testées mais sans documentation comparative.',
    vert:   'Deux architectures comparées et documentées.'
  },
  cml3_effet_options: {
    question: 'L\'effet de chaque option sur la science, le coût et le risque est-il documenté ?',
    rouge:  'Aucune documentation. Sans comparaison, le jury ne peut pas évaluer ton choix.',
    jaune:  'Effet partiel documenté. Il manque au moins un axe (science, coût ou risque).',
    vert:   'Impact de chaque option documenté sur les trois axes.'
  },
  cml3_marges: {
    question: 'Les marges techniques sont-elles estimées pour chaque option ?',
    rouge:  'Aucune marge. Sans marge, le premier imprévu condamne la mission.',
    jaune:  'Marges estimées pour une option seulement.',
    vert:   'Marges techniques estimées pour chaque option comparée.'
  },
  cml3_sensibilite: {
    question: 'La sensibilité du design aux principaux risques a-t-elle été évaluée ?',
    rouge:  'Sensibilité non évaluée.',
    jaune:  'Évaluation partielle. Couvre au moins la masse et l\'énergie.',
    vert:   'Sensibilité aux risques majeurs évaluée et documentée.'
  },
  cml3_option_retenue: {
    question: 'L\'option retenue est-elle justifiée face aux autres ?',
    rouge:  'Aucune justification. Argumente ton choix.',
    jaune:  'Justification partielle. Ajoute les compromis acceptés.',
    vert:   'Option retenue justifiée avec les compromis explicitement documentés.'
  },
  cml4_equipements: {
    question: 'La liste d\'équipements est-elle complète ?',
    rouge:  'Liste incomplète. Vérifie que chaque sous-système est couvert.',
    jaune:  'Liste quasi-complète. Quelques composants restent à confirmer.',
    vert:   'Liste d\'équipements complète et cohérente avec le budget.'
  },
  cml4_cout: {
    question: 'Le coût est-il estimé avec une marge de réserve ?',
    rouge:  'Aucune réserve. La NASA recommande au minimum 20 % de réserve.',
    jaune:  'Réserve insuffisante (< 10 %). Augmente la marge.',
    vert:   'Coût estimé avec une réserve d\'au moins 20 %.'
  },
  cml4_marges_validees: {
    question: 'Les marges techniques sont-elles validées par rapport au seuil retenu ?',
    rouge:  'Marges non validées.',
    jaune:  'Marges validées sur certains axes seulement.',
    vert:   'Marges techniques validées sur tous les axes critiques.'
  },
  cml4_verification: {
    question: 'Le plan de vérification (essais) est-il défini ?',
    rouge:  'Aucun plan d\'essais. Sans vérification, le lancement est interdit.',
    jaune:  'Plan partiel. Définis au moins les essais vibrations et thermique.',
    vert:   'Plan de vérification complet avec les trois types d\'essais.'
  },
  cml4_risques_classes: {
    question: 'Les risques sont-ils classés avec une piste de réduction ?',
    rouge:  'Risques non classés.',
    jaune:  'Classement partiel sans piste de réduction.',
    vert:   'Risques classés par probabilité/impact avec piste de réduction pour chacun.'
  }
};

const NIVEAUX = [
  { id: 1, label: 'CML 1', titre: 'Idée', titreEn: 'Idea' },
  { id: 2, label: 'CML 2', titre: 'Faisabilité', titreEn: 'Feasibility' },
  { id: 3, label: 'CML 3', titre: 'Études de compromis', titreEn: 'Trade studies' },
  { id: 4, label: 'CML 4', titre: 'Conception précise', titreEn: 'Detailed design' },
];

function statutBadge(statut) {
  return statusDot(statut);
}

export function createCmlView(container, { cml, astra, onNiveauValide } = {}) {
  let critereCourantId = null;
  let reponseEnCours   = false;

  // ─── rendu principal ──────────────────────────────────────────────────────

  function render() {
    const niveaux = cml.snapshot();

    const niveauxHTML = niveaux.map(niv => {
      const percent = Math.round(niv.ratioVert * 100);
      const valide  = niv.valide;

      const criteres = niv.criteres.map(c => `
        <div class="cml-critere ${critereCourantId === c.id ? 'is-active' : ''}"
          data-id="${c.id}">
          ${statutBadge(c.statut)}
          <span class="cml-critere-texte">${cmlCriterion(c.id, c.texte)}</span>
          <button type="button" class="cml-btn-eval"
            data-id="${c.id}"
            title="${t('Faire évaluer par ASTRA', 'Ask ASTRA to evaluate')}">
            ${icon('telescope', 13)} ${t('ÉVALUER', 'EVALUATE')}
          </button>
        </div>
      `).join('');

      return `
        <div class="cml-niveau ${valide ? 'is-valide' : ''}">
          <div class="cml-niveau-header">
            <span class="cml-niveau-label">${niv.level === 1 ? '🔴' : niv.level === 2 ? '🟠' : niv.level === 3 ? '🟡' : '🟢'} ${NIVEAUX[niv.level-1].label} — ${t(NIVEAUX[niv.level-1].titre, NIVEAUX[niv.level-1].titreEn)}</span>
            <span class="cml-niveau-pct ${valide ? 'is-ok' : ''}">${percent}% ${valide ? '✓' : ''}</span>
          </div>
          <div class="cml-niveau-bar-track">
            <div class="cml-niveau-bar-fill ${valide ? 'is-valide' : percent >= 60 ? 'is-mid' : ''}"
              style="width:${percent}%"></div>
          </div>
          <div class="cml-criteres">${criteres}</div>
        </div>
      `;
    }).join('');

    // Panneau de dialogue ASTRA pour l'évaluation en cours
    const dialogueHTML = critereCourantId ? (() => {
      const dial  = CML_DIALOGUES[critereCourantId] ?? {};
      const statC = cml.snapshot().flatMap(n => n.criteres).find(c => c.id === critereCourantId);
      return `
        <div class="cml-dialogue">
          <div class="cml-dialogue-question">
            <span class="cml-dialogue-astra">ASTRA</span>
            ${cmlTalk(critereCourantId, 'question', dial.question ?? '…')}
          </div>
          <div class="cml-dialogue-actions">
            <button type="button" class="cml-rep" data-rep="rouge">${t('❌ Pas encore', '❌ Not yet')}</button>
            <button type="button" class="cml-rep" data-rep="jaune">${t('⚠️ Partiellement', '⚠️ Partly')}</button>
            <button type="button" class="cml-rep" data-rep="vert">${t('✅ Oui, c\'est fait', '✅ Yes, done')}</button>
          </div>
          ${statC?.statut !== 'rouge' ? `
            <div class="cml-dialogue-feedback">
              ${statC?.statut === 'vert'  ? cmlTalk(critereCourantId, 'vert', dial.vert ?? '') : ''}
              ${statC?.statut === 'jaune' ? cmlTalk(critereCourantId, 'jaune', dial.jaune ?? '') : ''}
            </div>` : ''}
        </div>
      `;
    })() : '';

    container.innerHTML = `
      <div class="sh-cml">
        <div class="sh-cml-header">
          <div class="sh-cml-kicker">${t('Validation CML — Checklist mission', 'CML review — Mission checklist')}</div>
          <p class="sh-cml-sub">${t('ASTRA évalue chaque critère. 80 % de critères verts = niveau validé.', 'ASTRA scores each criterion. 80% green criteria = level validated.')}</p>
        </div>
        <div class="sh-cml-body">
          <div class="sh-cml-niveaux">${niveauxHTML}</div>
          ${dialogueHTML}
        </div>
      </div>
    `;

    bindEvents();
  }

  // ─── événements ───────────────────────────────────────────────────────────

  function bindEvents() {
    // Boutons ÉVALUER
    container.querySelectorAll('.cml-btn-eval').forEach(btn => {
      btn.addEventListener('click', () => {
        critereCourantId = btn.dataset.id;
        render();
        // ASTRA annonce la question
        const dial = CML_DIALOGUES[critereCourantId];
        if (dial) astra?.sayCustom(cmlTalk(critereCourantId, 'question', dial.question), 'info');
      });
    });

    // Réponses du joueur
    container.querySelectorAll('.cml-rep').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!critereCourantId || reponseEnCours) return;
        reponseEnCours = true;

        const deja = new Set(cml.snapshot().filter((n) => n.valide).map((n) => n.level));
        const rep    = btn.dataset.rep; // 'rouge' | 'jaune' | 'vert'
        const dial   = CML_DIALOGUES[critereCourantId] ?? {};

        // ASTRA évalue de façon indépendante — c'est elle qui pose le statut
        astra?.evaluerCritereCml(critereCourantId, () => rep === 'vert');
        // Pour jaune : on force manuellement (evaluerCritereCml ne connaît que vert/rouge)
        if (rep === 'jaune') cml.setStatus(critereCourantId, 'jaune');

        const texte = cmlTalk(
          critereCourantId,
          rep,
          dial[rep] ?? (rep === 'vert'
            ? t('Critère validé.', 'Criterion validated.')
            : t('Critère à retravailler.', 'Criterion needs more work.'))
        );
        let announced = false;
        cml.snapshot().forEach((niv) => {
          if (niv.valide && !deja.has(niv.level)) {
            astra?.say(`cml_niveau${niv.level}_valide`);
            announced = true;
            onNiveauValide?.(niv.level);
          }
        });
        if (!announced) astra?.sayCustom(texte, rep === 'vert' ? 'succes' : 'alerte');

        // Refermer le dialogue après un court délai
        setTimeout(() => {
          critereCourantId = null;
          reponseEnCours   = false;
          render();
        }, 1200);
      });
    });

    // Clic sur un critère pour l'activer directement
    container.querySelectorAll('.cml-critere').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('cml-btn-eval')) return;
        critereCourantId = el.dataset.id;
        render();
      });
    });
  }

  render();
  return { refresh: render };
}
