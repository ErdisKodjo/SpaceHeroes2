// Audio arcade (Web Audio) : pas de fichiers, donc PWA hors-ligne.
// Effets, voix ASTRA, et bande-son originale par écran (src/audio/music.js).

import { settingsStore } from '../engine/settings-store.js';
import { createMusic } from './music.js';

const MUTE_KEY = 'sh-mute';

function loadMute() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function createGameAudio() {
  let ctx = null;
  let master = null;
  let rumbleGain = null;
  let rumbleOsc = null;
  let muted = loadMute();
  let pendingLine = null;
  let lastSpoken = '';
  let fileVoix = [];
  let voixEnCours = false;
  let music = null;
  let pendingScene = 'hub';

  function niveau(key, fallback) {
    const n = Number(settingsStore.get(key));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(1, n));
  }

  function applySettings() {
    if (master) {
      const cible = muted ? 0 : niveau('volume', 0.7);
      master.gain.setTargetAtTime(cible, now(), 0.05);
    }
    music?.setVolume(niveau('ambientVolume', 0.4));
    if (rumbleGain) rumbleGain.gain.value = 0.08 * niveau('sfxVolume', 1);
    if (settingsStore.get('voiceEnabled') === false) window.speechSynthesis?.cancel();
  }

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : niveau('volume', 0.7);
    master.connect(ctx.destination);
    music = createMusic(ctx, master);
    music.setMuted(muted);
    music.setVolume(niveau('ambientVolume', 0.4));
    music.setScene(pendingScene);
    music.start();
    return ctx;
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  function envGain(duration, peak = 0.2, attack = 0.01) {
    const g = ctx.createGain();
    const crete = Math.max(0.0001, peak * niveau('sfxVolume', 1));
    g.gain.setValueAtTime(0.0001, now());
    g.gain.exponentialRampToValueAtTime(crete, now() + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now() + duration);
    g.connect(master);
    return g;
  }

  function tone(freq, duration, type = 'sine', peak = 0.12) {
    if (!ensure() || muted) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(envGain(duration, peak));
    osc.start();
    osc.stop(now() + duration + 0.02);
  }

  function noiseBurst(duration, peak, hpHz = 800) {
    if (!ensure() || muted) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpHz;
    src.connect(hp);
    hp.connect(envGain(duration, peak, 0.005));
    src.start();
  }

  function setMuted(value) {
    muted = value;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore quota */
    }
    if (master) master.gain.setTargetAtTime(muted ? 0 : niveau('volume', 0.7), now(), 0.05);
    music?.setMuted(muted);
    if (muted) window.speechSynthesis?.cancel();
  }

  function speechLanguage() {
    return settingsStore.get('language') === 'en' ? 'en' : 'fr';
  }

  function pickVoice(synth, language) {
    const want = language === 'en' ? 'en' : 'fr';
    return synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(want)) || null;
  }

  function parler(texte) {
    const synth = window.speechSynthesis;
    if (!synth || !texte || muted || settingsStore.get('voiceEnabled') === false) return;
    const lente = settingsStore.get('readingSpeed') === 'lente';
    const language = speechLanguage();
    const start = () => {
      if (muted || pendingLine !== texte || settingsStore.get('voiceEnabled') === false) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(texte);
      utter.lang = language === 'en' ? 'en-US' : 'fr-FR';
      utter.rate = lente ? 0.82 : 1.04;
      utter.pitch = 1.12;
      utter.volume = Math.max(0.05, 0.95 * niveau('volume', 0.7));
      const voice = pickVoice(synth, language);
      if (voice) utter.voice = voice;
      voixEnCours = true;
      utter.onend = () => {
        voixEnCours = false;
        if (settingsStore.get('readingSpeed') !== 'lente') return;
        const suite = fileVoix.shift();
        if (suite) setTimeout(() => speak(suite), 700);
      };
      synth.speak(utter);
      if (!voice && synth.getVoices().length === 0) {
        const retry = () => {
          synth.removeEventListener('voiceschanged', retry);
          lastSpoken = '';
          start();
        };
        synth.addEventListener('voiceschanged', retry);
      }
    };
    start();
  }

  function speak(texte) {
    pendingLine = texte;
    if (!texte || muted || settingsStore.get('voiceEnabled') === false) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (texte === lastSpoken && synth.speaking) return;
    const lente = settingsStore.get('readingSpeed') === 'lente';
    if (lente && voixEnCours) {
      fileVoix = [texte];
      return;
    }
    fileVoix = [];
    lastSpoken = texte;
    parler(texte);
  }

  return {
    get muted() {
      return muted;
    },
    setMuted,
    toggle() {
      setMuted(!muted);
      return muted;
    },
    unlock() {
      const ac = ensure();
      ac?.resume();
      lastSpoken = '';
      if (pendingLine) speak(pendingLine);
    },
    radio(texte) {
      ensure();
      noiseBurst(0.18, 0.08, 900);
      tone(1240, 0.07, 'square', 0.04);
      speak(texte);
    },
    countdown(n) {
      const freq = n <= 3 ? 880 : 620;
      tone(freq, n <= 3 ? 0.12 : 0.08, 'square', n <= 3 ? 0.16 : 0.1);
      if (n <= 3) tone(freq * 2, 0.06, 'sine', 0.05);
    },
    liftoff() {
      ensure();
      music?.duck(0.45);
      if (!ctx || muted) return;
      noiseBurst(1.4, 0.22, 120);
      tone(90, 0.8, 'sawtooth', 0.12);
      if (rumbleOsc) return;
      rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'sawtooth';
      rumbleOsc.frequency.value = 48;
      rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.08 * niveau('sfxVolume', 1);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 140;
      rumbleOsc.connect(lp);
      lp.connect(rumbleGain);
      rumbleGain.connect(master);
      rumbleOsc.start();
    },
    stopRumble() {
      if (!rumbleGain || !ctx) return;
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now() + 1.6);
      rumbleOsc?.stop(now() + 1.7);
      rumbleOsc = null;
      rumbleGain = null;
    },
    success() {
      music?.duck(1);
      this.stopRumble();
      tone(523, 0.18, 'sine', 0.12);
      setTimeout(() => tone(784, 0.22, 'sine', 0.12), 120);
      setTimeout(() => tone(1046, 0.35, 'sine', 0.1), 260);
    },
    setScene(name) {
      pendingScene = name || 'hub';
      music?.setScene(pendingScene);
    },
    setAmbient(value) {
      music?.setVolume(value);
    },
    applySettings,
    dispose() {
      window.speechSynthesis?.cancel();
      ctx?.close();
      ctx = null;
    }
  };
}
