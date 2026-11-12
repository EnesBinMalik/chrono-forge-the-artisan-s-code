/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Workshop Foley Acoustics & Mechanical Symphony
 * Lead Architect: Enes Öztürk
 *
 * 100% Procedural Web Audio API sound synthesis.
 * Zero external MP3/WAV files. Real anvil harmonics, steam release valves,
 * clockwork escapement ticks, ratchet winding, and live cello/contrabass strings.
 */

export class ArtisanFoleyEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private celloGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private celloOsc1: OscillatorNode | null = null;
  private celloOsc2: OscillatorNode | null = null;
  private celloFilter: BiquadFilterNode | null = null;
  private baseTension: number = 0;

  constructor() {
    // Lazy initialization on first user interaction
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initSymphonicStringDrone();
      this.isInitialized = true;
    } catch {
      console.warn('Web Audio not supported or blocked');
    }
  }

  private resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Continuous deep cello / contrabass artisan drone that swells with combat intensity
   */
  private initSymphonicStringDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.celloGain = this.ctx.createGain();
    this.celloGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    // Contrabass root (D1 = 36.7 Hz) and Cello fifth (A1 = 55 Hz)
    this.celloOsc1 = this.ctx.createOscillator();
    this.celloOsc1.type = 'sawtooth';
    this.celloOsc1.frequency.setValueAtTime(36.71, this.ctx.currentTime);

    this.celloOsc2 = this.ctx.createOscillator();
    this.celloOsc2.type = 'triangle';
    this.celloOsc2.frequency.setValueAtTime(55.0, this.ctx.currentTime);

    // Resonant low-pass filter to emulate warm wooden body of a cello
    this.celloFilter = this.ctx.createBiquadFilter();
    this.celloFilter.type = 'lowpass';
    this.celloFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.celloFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Vibrato LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.5, this.ctx.currentTime); // 4.5 Hz natural string vibrato
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(1.2, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.celloOsc1.frequency);
    lfoGain.connect(this.celloOsc2.frequency);
    lfo.start();

    this.celloOsc1.connect(this.celloFilter);
    this.celloOsc2.connect(this.celloFilter);
    this.celloFilter.connect(this.celloGain);
    this.celloGain.connect(this.masterGain);

    this.celloOsc1.start();
    this.celloOsc2.start();
  }

  /**
   * Sets dynamic music tension according to combo count & overdrive
   */
  public setTension(combo: number, isOverdrive: boolean) {
    if (!this.ctx || !this.celloGain || !this.celloFilter) return;
    this.baseTension = Math.min(1.0, combo * 0.12 + (isOverdrive ? 0.4 : 0));

    const now = this.ctx.currentTime;
    const targetGain = 0.08 + this.baseTension * 0.18;
    const targetFreq = 180 + this.baseTension * 550;

    this.celloGain.gain.cancelScheduledValues(now);
    this.celloGain.gain.linearRampToValueAtTime(targetGain, now + 0.3);

    this.celloFilter.frequency.cancelScheduledValues(now);
    this.celloFilter.frequency.linearRampToValueAtTime(targetFreq, now + 0.3);
  }

  /**
   * Anvil strike of The Logic Maul (Heavy Kinetic Hammer)
   * High metallic transient with harmonic ring & physical decay
   */
  public playAnvilStrike(logicGate: 'AND' | 'XOR' | 'NOT' | 'NAND' = 'AND') {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Pitch variation per logic gate
    const gatePitches = {
      AND: 440, // Pure A4 forge ring
      XOR: 587.33, // D5 harmonic dissonance
      NOT: 329.63, // E4 inverted lower ring
      NAND: 523.25, // C5 full punch strike
    };
    const fundamental = gatePitches[logicGate] || 440;

    // 1. Initial metallic impact thud (low end punch)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(110, now);
    thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
    thudGain.gain.setValueAtTime(1.0, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.2);

    // 2. Anvil high metallic ringing (non-harmonic bell modes: 1.0, 2.76, 5.4)
    const modes = [1.0, 2.76, 5.4, 8.9];
    modes.forEach((multiplier, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * multiplier, now);

      const amp = 0.4 / (i + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (0.4 + i * 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });

    // 3. Physical spark sizzle (high-pass noise burst)
    this.playSparkBurst(now);
  }

  /**
   * Oscillating Titanium Blade high-frequency buzz & metal slice
   */
  public playSawSlice() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const sawOsc = this.ctx.createOscillator();
    sawOsc.type = 'sawtooth';
    sawOsc.frequency.setValueAtTime(880, now);
    sawOsc.frequency.linearRampToValueAtTime(1420, now + 0.08);
    sawOsc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(6.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    sawOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    sawOsc.start(now);
    sawOsc.stop(now + 0.28);
  }

  /**
   * Mainspring Ratchet Winding Click
   */
  public playRatchetClick(pitchMult: number = 1.0) {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 * pitchMult, now);
    osc.frequency.exponentialRampToValueAtTime(400 * pitchMult, now + 0.03);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * High-pressure Steam Exhaust Valve Release
   */
  public playSteamRelease() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Filtered white noise
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.4);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Escapement clockwork tick
   */
  public playClockTick(isTock: boolean = false) {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTock ? 780 : 1040, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Glass shattering sound (Vacuum Tube broken)
   */
  public playGlassShatter() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + Math.random() * 2800, now + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 600, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 / (i + 1), now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.02);
      osc.stop(now + 0.4);
    }
  }

  /**
   * Physical Punch Card Stamp Click
   */
  public playPunchCardStamp() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playSparkBurst(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const foley = new ArtisanFoleyEngine();
