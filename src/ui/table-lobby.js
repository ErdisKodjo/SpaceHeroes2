// Salon d'une partie à 4. Les postes vides restent vides : ASTRA ne les prend pas.

import { playerStore } from '../engine/player.js';
import { definirEquipage } from '../net/equipage.js';
import { adresseTable, couperTable, definirServeur, envoyerTable, ouvrirTable, suivreTable } from '../net/partie.js';
import { mettrePaires, recevoirVoix, couperVoix } from '../net/voix.js';
import { monterVoix } from './voix-barre.js';
import { pick, t } from '../i18n.js';
import { roleText } from '../i18n/content.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const RAISONS = {
  complet: ['La table est complète.', 'The table is full.'],
  pris: ['Ce poste est déjà pris.', 'That seat is already taken.'],
  incomplete: ['Les quatre postes ne sont pas tenus.', 'The four seats are not filled.'],
  hote: ['Seul le premier joueur lance la mission.', 'Only the first player launches the mission.'],
  role: ['Ce poste n\'existe pas.', 'That seat does not exist.'],
  chapitre: ['Ce chapitre n\'est pas sur la table.', 'That chapter is not on the table.']
};

export function createTableLobby({ chapters = [], onDepart } = {}) {
  const roles = playerStore.getRoles();
  const overlay = document.createElement('div');
  overlay.id = 'sh-table-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', t('Partie à 4', 'Party of 4'));
  document.body.appendChild(overlay);

  let socket = null;
  let barre = null;
  let oublier = () => {};
  let moi = null;
  let etat = { joueurs: [], places: 4, prete: false, hote: null };
  let erreur = t('Connexion au serveur…', 'Connecting to the server…');
  let parti = false;
  let locales = [];
  let partagees = [];
  let serveurSaisi = '';

  function pageDe(ip) {
    const lieu = globalThis.location;
    const port = lieu?.port ? `:${lieu.port}` : '';
    const proto = lieu?.protocol === 'https:' ? 'https:' : 'http:';
    return `${proto}//${ip}${port}/`;
  }

  function htmlListe(ips) {
    return ips.map((ip) => `<span class="sh-table-adresse">${esc(pageDe(ip))}</span>`).join('');
  }

  function htmlAdresses() {
    const meme = locales.length
      ? `<p class="sh-table-adresses">${t('Sur le même réseau, les autres joueurs ouvrent :', 'On the same network, other players open:')}${htmlListe(locales)}</p>`
      : '';
    const ailleurs = partagees.length
      ? `<p class="sh-table-adresses">${t('Depuis un autre réseau, les autres joueurs ouvrent :', 'From another network, other players open:')}${htmlListe(partagees)}</p>`
      : `<p class="sh-table-adresses">${t('Cette machine n\'a pas d\'adresse joignable depuis un autre réseau.', 'This machine has no address reachable from another network.')}</p>`;
    return `${meme}${ailleurs}
      <form class="sh-table-serveur" id="sh-table-serveur-form">
        <label for="sh-table-serveur">${t('Serveur déjà joignable', 'Server already reachable')}</label>
        <input id="sh-table-serveur" value="${esc(serveurSaisi)}" placeholder="adresse:8787" autocomplete="off">
        <button type="submit">${t('Rejoindre', 'Join')}</button>
      </form>`;
  }

  function occupant(roleId) {
    return etat.joueurs.find((j) => j.roleId === roleId) || null;
  }

  function render() {
    const ouverts = chapters.filter((ch) => !ch.locked);
    const hote = moi && moi === etat.hote;
    const raison = RAISONS[erreur] ? t(RAISONS[erreur][0], RAISONS[erreur][1]) : erreur;
    overlay.innerHTML = `
      <div class="sh-table-panel">
        <header class="sh-table-header">
          <h1>${t('Partie à 4', 'Party of 4')}</h1>
          <p>${t('Chaque poste est tenu par un joueur. Un siège vide le reste : ASTRA ne le prend pas.', 'Each seat is held by a player. An empty seat stays empty: ASTRA does not take it.')}</p>
        </header>
        <p class="sh-table-statut">${esc(raison)}</p>
        ${htmlAdresses()}
        <div class="sh-table-roles">
          ${roles.map((role) => {
            const qui = occupant(role.id);
            const mien = qui?.id === moi;
            const pris = Boolean(qui) && !mien;
            return `
              <button type="button" class="sh-table-role ${mien ? 'is-mien' : ''}"
                data-role="${role.id}"
                style="--role-color:${role.couleur}"
                ${pris || !moi ? 'disabled' : ''}>
                <span class="sh-table-sigle">${esc(role.sigle)}</span>
                <span class="sh-table-nom">${esc(roleText(role, 'nom'))}</span>
                <span class="sh-table-qui">${qui ? esc(qui.nom) : t('Poste libre', 'Open seat')}</span>
              </button>
            `;
          }).join('')}
        </div>
        ${hote ? `
          <div class="sh-table-lancer">
            <label for="sh-table-chapitre">${t('Chapitre', 'Chapter')}</label>
            <select id="sh-table-chapitre">
              ${ouverts.map((ch) => `<option value="${esc(ch.id)}">${esc(ch.num)} · ${esc(pick(ch, 'titre'))}</option>`).join('')}
            </select>
            <button type="button" id="sh-table-lancer" ${etat.prete ? '' : 'disabled'}>
              ${t('Lancer la mission', 'Launch the mission')}
            </button>
          </div>
        ` : `<p class="sh-table-attente">${moi ? t('Le premier joueur lance quand les quatre postes sont tenus.', 'The first player launches once the four seats are held.') : ''}</p>`}
        <button type="button" class="sh-table-fermer" id="sh-table-fermer">${t('Fermer', 'Close')}</button>
      </div>
    `;
    bind();
  }

  function bind() {
    overlay.querySelector('#sh-table-fermer').addEventListener('click', fermer);
    overlay.querySelectorAll('.sh-table-role:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const roleId = btn.dataset.role;
        const mien = occupant(roleId)?.id === moi;
        envoyer(mien ? { type: 'liberer' } : { type: 'prendre', roleId });
      });
    });
    overlay.querySelector('#sh-table-lancer')?.addEventListener('click', () => {
      const chapterId = overlay.querySelector('#sh-table-chapitre')?.value;
      envoyer({ type: 'lancer', chapterId });
    });
    overlay.querySelector('#sh-table-serveur')?.addEventListener('input', (event) => {
      serveurSaisi = event.target.value;
    });
    overlay.querySelector('#sh-table-serveur-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const cible = definirServeur(serveurSaisi);
      if (!cible) {
        erreur = t('Cette adresse de serveur est illisible.', 'That server address cannot be read.');
        render();
        return;
      }
      serveurSaisi = cible;
      relier();
    });
  }

  function envoyer(message) {
    envoyerTable(message);
  }

  function partir(chapterId) {
    if (parti) return;
    parti = true;
    const moiJoueur = etat.joueurs.find((j) => j.id === moi);
    const rolesParId = new Map(roles.map((role) => [role.id, role]));
    definirEquipage({
      prete: true,
      joueurs: etat.joueurs.filter((j) => j.roleId).map((j) => ({
        nom: j.nom,
        sigle: rolesParId.get(j.roleId)?.sigle || j.roleId
      }))
    });
    if (moiJoueur?.roleId) playerStore.setRole(moiJoueur.roleId);
    const nom = moiJoueur?.nom || playerStore.nom;
    playerStore.setNom(nom);
    oublier();
    overlay.remove();
    onDepart?.({ chapterId, roleId: moiJoueur?.roleId, nom });
  }

  function fermer() {
    if (parti) return;
    oublier();
    barre?.dispose();
    couperVoix();
    couperTable();
    overlay.remove();
  }

  async function lireAdresses() {
    try {
      const url = new URL(adresseTable());
      url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
      url.pathname = '/sante';
      url.search = '';
      const res = await fetch(url);
      const data = await res.json();
      locales = Array.isArray(data.locales) ? data.locales.filter((ip) => typeof ip === 'string') : [];
      partagees = Array.isArray(data.partagees) ? data.partagees.filter((ip) => typeof ip === 'string') : [];
    } catch {
      locales = [];
      partagees = [];
    }
    if (!parti) render();
  }

  function relier() {
    oublier();
    barre?.dispose();
    barre = null;
    couperVoix();
    couperTable();
    moi = null;
    erreur = t('Connexion au serveur…', 'Connecting to the server…');
    socket = ouvrirTable();
    lireAdresses();
    oublier = suivreTable(recevoir);
    if (socket.readyState === 1) envoyer({ type: 'rejoindre', nom: playerStore.nom });
    socket.addEventListener('open', () => {
      erreur = '';
      envoyer({ type: 'rejoindre', nom: playerStore.nom });
    });
    socket.addEventListener('close', () => {
      if (parti) return;
      if (!moi) erreur = t('Le serveur ne répond pas. Lancez npm run server.', 'The server is not answering. Run npm run server.');
      moi = null;
      render();
    });
    render();
  }

  function recevoir(message) {
    if (message.type === 'toi') {
      moi = message.id;
      barre = monterVoix();
    }
    if (message.type === 'etat' || message.type === 'depart') {
      const joueurs = message.etat?.joueurs || etat.joueurs;
      if (message.type === 'etat') {
        etat = message.etat;
        erreur = '';
      }
      if (moi && joueurs) mettrePaires(moi, joueurs);
    }
    if (message.type === 'voix') {
      recevoirVoix(message);
      return;
    }
    if (message.type === 'refus') erreur = message.raison || '';
    if (message.type === 'depart') {
      etat = message.etat || etat;
      partir(message.chapterId);
      return;
    }
    render();
  }

  relier();
  return { dispose: fermer };
}
