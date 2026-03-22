/**
 * Harici ses dosyası olmadan kısa "dikkat" tonu (Web Audio API).
 * Tarayıcılar genelde ilk kullanıcı etkileşiminden sonra ses çalmaya izin verir.
 */
export function playWaiterAlertSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return;
    }
    const ctx = new Ctx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const ding = (freq, when, dur, vol = 0.14) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + when;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    };

    ding(784, 0, 0.11);
    ding(988, 0.12, 0.13);
    ding(1174, 0.28, 0.16);

    window.setTimeout(() => {
      try {
        ctx.close();
      } catch {
        /* ignore */
      }
    }, 800);
  } catch {
    /* sessiz */
  }
}
