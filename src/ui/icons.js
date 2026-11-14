// Bibliothèque d'icônes SVG inline — Space Heroes (Sprint 5).
// Usage : icon('satellite', 20) → chaîne HTML <svg …>…</svg>
// Toutes les icônes sont dessinées sur une grille 24×24, style "line" (stroke),
// couleur héritée (currentColor), remplissage transparent par défaut.
// Quelques icônes de statut utilisent un fill pour les pastilles colorées.

const PATHS = {
  // ── Navigation / UI ────────────────────────────────────────────────────
  settings:   'M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.8c-.14-.24-.42-.32-.67-.24l-2.73 1.1c-.57-.44-1.18-.8-1.86-1.08l-.42-2.9A.5.5 0 0 0 14 3h-4c-.27 0-.5.21-.5.47l-.42 2.9c-.68.28-1.3.64-1.87 1.08L4.47 6.35c-.25-.08-.53 0-.67.24l-2.2 3.8c-.14.24-.08.54.13.7l2.32 1.82C4.03 11.26 4 11.61 4 12s.03.74.07 1.08L1.76 14.9c-.22.16-.27.46-.13.7l2.2 3.8c.14.24.42.32.67.24l2.73-1.1c.57.44 1.18.8 1.86 1.08l.42 2.9c.04.26.27.47.49.47h4c.26 0 .5-.21.5-.47l.42-2.9c.68-.28 1.3-.64 1.86-1.08l2.73 1.1c.25.08.53 0 .67-.24l2.2-3.8c.14-.24.08-.54-.13-.7z',
  close:      'M18 6 6 18M6 6l12 12',
  chevron:    'M9 18l6-6-6-6',
  arrowRight: 'M5 12h14m-7-7 7 7-7 7',
  lock:       'M5 11V7a7 7 0 0 1 14 0v4M3 11h18v11H3zM12 15v4',
  check:      'M20 6 9 17l-5-5',
  warning:    'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  info:       'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 9v5m0-8h.01',
  save:       'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  play:       'M5 3l14 9-14 9z',
  refresh:    'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  sound:      'M11 5 6 9H2v6h4l5 4V5zm10.07.93a16 16 0 0 1 0 12.14M15.54 8.46a5 5 0 0 1 0 7.07',
  mute:       'M11 5 6 9H2v6h4l5 4V5zm17 0-18 18',
  export:     'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  import:     'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  trash:      'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  user:       'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  language:   'M2 11l9-9 9 9v8a2 2 0 0 1-2 2h-5v-6H9v6H4a2 2 0 0 1-2-2zM9 3H3v5l6 6',

  // ── Mission / Espace ────────────────────────────────────────────────────
  satellite:  'M2 8l4-4 10 10-4 4L2 8zm14-6 2 2-2.5 2.5M6 18l-2 2 2 2 2-2m3-10 2 2M15 7l2 2',
  rocket:     'M4.5 16.5c-1.5 1.5-1.5 4 0 5.5 1.5 1.5 4 1.5 5.5 0l10-10a4.95 4.95 0 0 0-7-7L3 15M14 6l4 4',
  orbit:      'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M4 4a12.4 12.4 0 0 0 0 16M20 4a12.4 12.4 0 0 1 0 16',
  planet:     'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  moon:       'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sun:        'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 0 0 0 12 6 6 0 0 0 0-12z',
  signal:     'M2 12h2M6 8.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6 3.5M4 6a10 10 0 0 1 8-4 10 10 0 0 1 8 4M12 12h.01',
  telescope:  'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  compass:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.24-1.76-5.66 5.66-1.42 4.24 4.24-1.42 5.66-5.66',
  flag:       'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',

  // ── Composants / Atelier ────────────────────────────────────────────────
  bolt:       'M13 2 3 14h9l-1 8 10-12h-9z',
  cpu:        'M9 2H5a2 2 0 0 0-2 2v4M9 2h6M9 2v2M15 2h4a2 2 0 0 1 2 2v4M15 2v2M22 8v6M22 14v4a2 2 0 0 1-2 2h-4M22 14h-2M14 22H8M14 22v-2M8 22H4a2 2 0 0 1-2-2v-4M8 22v-2M2 14V8M2 8H4M4 8v8H20V8H4zm4 4h8M12 8v8',
  wrench:     'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  layers:     'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  thermometer:'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z',
  battery:    'M23 7h-1a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9h1V7zM7 11h10',
  solar:      'M12 3V1M12 23v-2M4.22 4.22l-1.42-1.42M19.78 4.22l1.42-1.42M4.22 19.78 2.8 21.2M19.78 19.78l1.42 1.42M2 12H1M23 12h-1M5 12a7 7 0 1 0 14 0A7 7 0 0 0 5 12z',
  antenna:    'M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07',
  microscope: 'M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 10h2M12 6V2M12 2h4M11 6h4',

  // ── Gameplay / Score ────────────────────────────────────────────────────
  medal:      'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89 7 23l5-3 5 3-1.21-9.11',
  trophy:     'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18v5zM4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z',
  target:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  chart:      'M18 20V10M12 20V4M6 20v-6',
  badge:      'M3.85 8.62a4 4 0 0 1 4.78-4.78 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.75zm4.65 1.38L12 14l3.5-4',
  scroll:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',

  // ── Rôles ────────────────────────────────────────────────────────────────
  director:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 1 2 2 4-4',
  engineer:   'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  systems:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4l3 3',
  science:    'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v10l3 3 3-3V3M9 17H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4',

  // ── Épreuves essais ──────────────────────────────────────────────────────
  vibration:  'M2 12h4l3-9 4 18 3-9h8',
  thermal:    'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z',
  electric:   'M13 2 3 14h9l-1 8 10-12h-9z',

  // ── Statuts CML ──────────────────────────────────────────────────────────
  dot_green:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  dot_yellow: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  dot_red:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',

  // ── Destinations chapitres ────────────────────────────────────────────────
  earth_low:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  storm:      'M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01',
  moon_dest:  'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  mars_dest:  'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M7.5 7.5l9 9M16.5 7.5l-9 9',
  lagrange:   'M12 2v20M2 7l10 5 10-5M2 17l10-5 10 5',
};

/**
 * Retourne un <svg> inline avec l'icône demandée.
 * @param {string} name  - clé dans PATHS
 * @param {number} size  - taille en px (défaut 18)
 * @param {string} cls   - classes CSS supplémentaires
 * @param {string} label - aria-label (optionnel, sinon aria-hidden)
 * @param {string} fill  - 'none' (défaut) ou couleur pour les icônes de statut
 */
export function icon(name, size = 18, { cls = '', label = '', fill = 'none' } = {}) {
  const d = PATHS[name];
  if (!d) return '';
  const aria = label
    ? `role="img" aria-label="${label}"`
    : 'aria-hidden="true" focusable="false"';
  const isFill = fill !== 'none';
  return `<svg ${aria} class="sh-icon${cls ? ' ' + cls : ''}"
    width="${size}" height="${size}" viewBox="0 0 24 24"
    fill="${isFill ? fill : 'none'}"
    stroke="${isFill ? 'none' : 'currentColor'}"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="${d}"/></svg>`;
}

/** Pastille de statut CML colorée. */
export function statusDot(statut) {
  const colors = { vert: '#3ddc84', jaune: '#ffb347', rouge: '#ff4d6d' };
  const color = colors[statut] || colors.rouge;
  return icon('dot_green', 10, { fill: color, cls: `cml-dot is-${statut}` });
}

/** Icône de médaille selon le score. */
export function medalIcon(score) {
  if (score === null || score === undefined) return icon('medal', 22, { cls: 'is-aucune' });
  if (score >= 85) return icon('trophy', 22, { cls: 'is-or',     label: 'Médaille d\'or' });
  if (score >= 70) return icon('medal',  22, { cls: 'is-argent', label: 'Médaille d\'argent' });
  if (score >= 50) return icon('medal',  22, { cls: 'is-bronze', label: 'Médaille de bronze' });
  return '';
}
