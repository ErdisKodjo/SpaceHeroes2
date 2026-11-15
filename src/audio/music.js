// Bande-son originale, synthétisée dans le navigateur.
// Aucun enregistrement commercial : le jeu reste hors-ligne et libre de droits.
// Une boucle par écran, du QG jusqu'au bilan.

import { TEMPOS } from './tempos.js';

const STEPS = 32;

const SCENES = TEMPOS;

function midi(note) {
  return 440 * (2 ** ((note - 69) / 12));
}

export function createMusic(ctx, destination) {
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(destination);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  let sceneName = 'hub';
  let queued = null;
  let volume = 0.4;
  let muted = false;
  let duck = 1;
  let step = 0;
  let nextTime = 0;
  let timer = 0;
  let running = false;

  function scene() {
    return SCENES[sceneName] || SCENES.hub;
  }

  function isPad() {
    return sceneName === 'briefing' || sceneName === 'bilan';
  }

  function targetGain() {
    if (muted) return 0;
    return volume * 0.55 * scene().level * duck;
  }

  function glide(seconds = 0.08) {
    const now = ctx.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setTargetAtTime(Math.max(0.0001, targetGain()), now, seconds);
  }

  function commitScene(name) {
    if (!SCENES[name] || name === sceneName) {
      queued = null;
      return;
    }
    sceneName = name;
    queued = null;
    glide(0.35);
  }

  function env(time, dur, peak, type, freq, dest = bus) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.02);
    return osc;
  }

  function playKick(time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(148, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.09);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  function playHat(time, dur = 0.035, peak = 0.045) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(time);
    src.stop(time + dur);
  }

  function playClap(time) {
    playHat(time, 0.12, 0.08);
    env(time, 0.12, 0.12, 'triangle', 980);
  }

  function playBass(time, note) {
    const pad = isPad();
    env(time, pad ? 0.95 : 0.28, pad ? 0.11 : 0.16, 'sine', midi(note));
  }

  function playLead(time, note) {
    const pad = isPad();
    env(time, pad ? 1.15 : 0.2, pad ? 0.055 : 0.075, 'triangle', midi(note));
  }

  function play(time) {
    // La nouvelle scène attend le temps suivant, pour ne pas couper la mesure.
    if (queued && step % 4 === 0) commitScene(queued);
    const current = scene();
    const i = step % STEPS;
    if (current.kick[i]) playKick(time);
    if (current.clap[i]) playClap(time);
    if (current.hat[i]) playHat(time, sceneName === 'lancement' ? 0.07 : 0.035, sceneName === 'lancement' ? 0.055 : 0.045);
    if (current.bass[i]) playBass(time, current.bass[i]);
    if (current.lead[i]) playLead(time, current.lead[i]);
    step = (step + 1) % STEPS;
  }

  function pump() {
    if (!running) return;
    const slice = 60 / scene().bpm / 4;
    if (muted || volume <= 0) {
      nextTime = 0;
      timer = window.setTimeout(pump, 200);
      return;
    }
    if (!nextTime || nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.06;
    while (nextTime < ctx.currentTime + 0.12) {
      play(nextTime);
      nextTime += slice;
    }
    timer = window.setTimeout(pump, 25);
  }

  return {
    start() {
      if (running) {
        glide();
        return;
      }
      running = true;
      glide();
      pump();
    },
    setScene(name) {
      const next = SCENES[name] ? name : 'hub';
      if (next === sceneName) {
        queued = null;
        return;
      }
      // Le QG et un lecteur encore arrêté partent tout de suite.
      // Les autres scènes suivent la carte : le changement tombe sur le temps.
      if (!running || next === 'hub' || step % 4 === 0) commitScene(next);
      else queued = next;
    },
    setVolume(value) {
      volume = Math.max(0, Math.min(1, Number(value) || 0));
      glide();
    },
    setMuted(value) {
      muted = Boolean(value);
      glide();
    },
    duck(amount) {
      duck = amount;
      glide();
    }
  };
}
