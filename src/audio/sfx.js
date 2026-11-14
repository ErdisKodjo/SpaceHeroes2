// Audio arcade (Web Audio) : pas de fichiers, donc PWA hors-ligne.
// Compte a rebours, rumble de decollage, radio ASTRA (+ voix synthetique si dispo).

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
  let ambientGain = null;
  let rumbleGain = null;
  let rumbleOsc = null;
  let muted = loadMute();
  let pendingLine = null;
  let lastSpoken = '';

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(ctx.destination);
    startAmbient();
    return ctx;
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  function envGain(duration, peak = 0.2, attack = 0.01) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now());
    g.gain.exponentialRampToValueAtTime(peak, now() + attack);
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

  function startAmbient() {
    if (!ctx || ambientGain) return;
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.035;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 52;
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 78;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    osc.connect(lp);
    osc2.connect(lp);
    lp.connect(ambientGain);
    ambientGain.connect(master);
    osc.start();
    osc2.start();
  }

  function setMuted(value) {
    muted = value;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore quota */
    }
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.7, now(), 0.05);
    if (muted) window.speechSynthesis?.cancel();
  }

  function speak(texte) {
    pendingLine = texte;
    if (!texte || muted) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (texte === lastSpoken && synth.speaking) return;
    lastSpoken = texte;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(texte);
    utter.lang = 'fr-FR';
    utter.rate = 1.04;
    utter.pitch = 1.12;
    utter.volume = 0.95;
    const voices = synth.getVoices();
    const fr = voices.find((v) => v.lang?.startsWith('fr'));
    if (fr) utter.voice = fr;
    synth.speak(utter);
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
      if (!ensure() || muted) return;
      noiseBurst(1.4, 0.22, 120);
      tone(90, 0.8, 'sawtooth', 0.12);
      if (rumbleOsc) return;
      rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'sawtooth';
      rumbleOsc.frequency.value = 48;
      rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.08;
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
      this.stopRumble();
      tone(523, 0.18, 'sine', 0.12);
      setTimeout(() => tone(784, 0.22, 'sine', 0.12), 120);
      setTimeout(() => tone(1046, 0.35, 'sine', 0.1), 260);
    },
    dispose() {
      window.speechSynthesis?.cancel();
      ctx?.close();
      ctx = null;
    }
  };
}
