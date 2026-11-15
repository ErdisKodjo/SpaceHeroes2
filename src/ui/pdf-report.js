// Export PDF du bilan de mission. Page claire, bandeau bleu, logo officiel.

import { jsPDF } from 'jspdf';
import { t } from '../i18n.js';
import { missionBlurb } from '../i18n/content.js';

function loadLogo() {
  return fetch('/icon-512.png')
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('logo'))))
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    }))
    .catch(() => null);
}

function slug(value) {
  return String(value || 'mission')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'mission';
}

function stamp(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function downloadBilanPdf(rapport, astraTexte) {
  const logo = await loadLogo();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const now = new Date();
  let page = 1;

  function footer() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 96, 120);
    doc.text('Space Heroes', margin, pageH - 10);
    doc.text(String(page), pageW - margin, pageH - 10, { align: 'right' });
  }

  function header() {
    doc.setFillColor(2, 8, 28);
    doc.rect(0, 0, pageW, 34, 'F');
    if (logo) doc.addImage(logo, 'PNG', margin, 5, 24, 24);
    doc.setTextColor(232, 244, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('SPACE HEROES', margin + 28, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(170, 210, 255);
    doc.text(t('Rapport de mission', 'Mission report'), margin + 28, 21);
    doc.setFontSize(8);
    doc.text(stamp(now), pageW - margin, 14, { align: 'right' });
  }

  function need(y, h) {
    if (y + h <= pageH - 16) return y;
    footer();
    doc.addPage();
    page += 1;
    header();
    return 42;
  }

  function paragraph(text, y, size = 10, color = [18, 28, 48]) {
    const lines = doc.splitTextToSize(String(text || ''), pageW - margin * 2);
    const height = lines.length * (size * 0.42);
    y = need(y, height + 2);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(lines, margin, y);
    return y + height + 2;
  }

  header();
  let y = 44;
  doc.setFont('helvetica', 'bold');
  y = paragraph(rapport.titre || 'Space Heroes', y, 16, [6, 20, 60]);
  doc.setFont('helvetica', 'normal');
  const medal = rapport.medaille || t('sans médaille', 'no medal');
  y = paragraph(`${t('Score', 'Score')} ${rapport.score} / 100 · ${medal}`, y, 11, [20, 40, 80]);
  if (rapport.gmatLigne) y = paragraph(rapport.gmatLigne, y, 9, [70, 86, 110]);

  y += 2;
  doc.setFont('helvetica', 'bold');
  y = paragraph(t('Détail du score', 'Score breakdown'), y, 12);
  doc.setFont('helvetica', 'normal');
  for (const part of rapport.parts || []) {
    y = paragraph(`${part.label} — ${part.points} / ${part.max}`, y, 10);
  }

  y += 2;
  doc.setFont('helvetica', 'bold');
  y = paragraph(t('Ressources consommées', 'Resources used'), y, 12);
  doc.setFont('helvetica', 'normal');
  for (const r of rapport.ressources || []) {
    const used = Number(r.used).toFixed(1);
    y = paragraph(`${r.label} : ${used} / ${r.max}`, y, 10);
  }

  y += 2;
  doc.setFont('helvetica', 'bold');
  y = paragraph(t('Trois décisions', 'Three decisions'), y, 12);
  doc.setFont('helvetica', 'normal');
  for (const d of rapport.decisions || []) {
    doc.setFont('helvetica', 'bold');
    y = paragraph(d.titre, y, 11);
    doc.setFont('helvetica', 'normal');
    y = paragraph(`${d.choix}. ${d.consequence}`, y, 10);
    if (d.siTuAvaisChoisi) {
      const alt = t(
        `Si tu avais choisi ${d.siTuAvaisChoisi}. ${d.alors || ''}`,
        `If you had chosen ${d.siTuAvaisChoisi}. ${d.alors || ''}`
      );
      y = paragraph(alt, y, 9, [50, 64, 88]);
    }
  }

  if (rapport.nasa?.phrase) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    y = paragraph(t('Dans la vraie vie', 'In real life'), y, 12);
    doc.setFont('helvetica', 'normal');
    y = paragraph(rapport.nasa.phrase, y, 10);
    const ref = rapport.nasa.reference;
    if (ref) y = paragraph(`${ref.agence} · ${ref.annee}. ${missionBlurb(ref.id, ref.resume || '')}`, y, 9, [50, 64, 88]);
    for (const proche of rapport.nasa.proches || []) {
      y = paragraph(`${proche.nom} · ${proche.agence} · ${proche.annee}. ${missionBlurb(proche.id, proche.resume || '')}`, y, 9, [50, 64, 88]);
    }
  }

  if (rapport.commun) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    y = paragraph(t('Bilan commun', 'Shared debrief'), y, 12);
    doc.setFont('helvetica', 'normal');
    const veto = rapport.commun.vetoUtilise
      ? t('Le veto a été utilisé.', 'The veto was used.')
      : t('Le veto n\'a pas été utilisé.', 'The veto was not used.');
    y = paragraph(veto, y, 10);
    for (const r of rapport.commun.rapports || []) {
      y = paragraph(`${r.nom} · ${r.score}/100 · ${r.medaille}`, y, 10);
    }
  }

  if (rapport.badges?.length) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    y = paragraph(t('Badges', 'Badges'), y, 12);
    doc.setFont('helvetica', 'normal');
    for (const b of rapport.badges) {
      const mark = b.obtenu ? '●' : '○';
      y = paragraph(`${mark} ${b.nom} — ${b.texte}`, y, 10);
    }
  }

  if (astraTexte) {
    y += 2;
    doc.setFont('helvetica', 'italic');
    y = paragraph(`ASTRA — ${astraTexte}`, y, 10, [20, 48, 90]);
  }

  footer();
  doc.save(`SpaceHeroes_${slug(rapport.titre)}_${stamp(now)}.pdf`);
}
