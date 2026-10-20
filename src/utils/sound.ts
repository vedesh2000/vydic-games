// Procedural Web Audio API Synthesizer for Temple Chimes, Sitar Plucks, and Mangala Aarti Bells

class SacredSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('divya_smarana_muted');
      if (saved !== null) {
        this.isMuted = JSON.parse(saved);
      }
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('divya_smarana_muted', JSON.stringify(muted));
    } catch {
      // ignore storage errors
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playTileFlip();
    }
    return this.isMuted;
  }

  // Crisp sitar/veena pluck when flipping a tile
  public playTileFlip(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Pentatonic Raga Mohanam note (D5 -> E5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Resonant Temple Bell (Ghanta) + Harmonic Fifth on matching a Deity Pair
  public playMatch(combo: number = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Scale up pitch gently with combo in Raga Hamsadhwani / Mohanam intervals
    const scaleMultipliers = [1, 1.125, 1.25, 1.5, 1.667, 2.0];
    const mult = scaleMultipliers[Math.min(combo - 1, scaleMultipliers.length - 1)];
    const baseFreq = 523.25 * mult; // C5 root scaled

    const partials = [1, 1.5, 2.0, 2.756];
    partials.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      const amp = idx === 0 ? 0.18 : 0.08 / idx;
      const duration = idx === 0 ? 0.65 : 0.45 / idx;

      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    });
  }

  // Auspicious Golden Kalasha / Om Center Tile Chime
  public playBlessingTile(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);

      gain.gain.setValueAtTime(0.14, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.52);
    });
  }

  // Gentle soft mridangam low tap on mismatch
  public playMismatch(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(195, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Celebratory Mangala Aarti Arpeggio on Victory
  public playVictory(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Raga Mohanam ascending: Sa Ri Ga Pa Dha Sa
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startTime = now + i * 0.09;
      const duration = i === notes.length - 1 ? 0.9 : 0.35;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }
}

export const soundEngine = new SacredSoundEngine();
