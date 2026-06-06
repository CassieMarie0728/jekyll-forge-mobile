/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tactical Typewriter Synthesizer using Web Audio API
 * Generates distinct mechanical typing clicks, spacebars, backspaces, Carriage Return bells,
 * and high-quality ambient soundscapes (Rain & Fireplace Crackle) entirely through code.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Low-level helper to generate a white noise buffer
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

/**
 * 1. Physical Typewriter Key Stroke Click Synthesizer
 */
export function playTypewriterKeySound(volumeMultiplier: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Gain node for overall click volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35 * volumeMultiplier, now + 0.002);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    // Filtered noise source for mechanical friction/thud
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(650 + Math.random() * 200, now);
    noiseFilter.Q.setValueAtTime(4.5, now);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    // Oscillator for the metallic strike resonance
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    // Typewriter metal strikes fall in 1500Hz - 2200Hz band
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400 + Math.random() * 600, now);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.12 * volumeMultiplier, now + 0.001);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    // Start & Stop
    noiseNode.start(now);
    noiseNode.stop(now + 0.1);
    osc.start(now);
    osc.stop(now + 0.03);
  } catch (err) {
    console.warn("Failed to play typewriter click:", err);
  }
}

/**
 * 2. Heavy Spacebar Tap Synthesizer
 */
export function playTypewriterSpacebar(volumeMultiplier: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.28 * volumeMultiplier, now + 0.004);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    // Lower pitched wooden/plastic click
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110 + Math.random() * 30, now);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.15 * volumeMultiplier, now + 0.002);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    // Lowpass click noise helper
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(320, now);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.15);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    console.warn("Failed to play typewriter spacebar:", err);
  }
}

/**
 * 3. Carriage Return Line Bell Synthesizer (Metallic Ding!)
 */
export function playTypewriterBell(volumeMultiplier: number = 0.7) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4 * volumeMultiplier, now + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // long ringing resonance

    // Vintage desk bell has sharp primary at 2300Hz and secondary harmonic at 4600Hz
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(2280, now);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(4560, now);

    // Modulate amplitude slightly to simulate real vibration
    const vGain1 = ctx.createGain();
    vGain1.gain.setValueAtTime(0.3, now);
    vGain1.gain.linearRampToValueAtTime(0.001, now + 1.0);

    const vGain2 = ctx.createGain();
    vGain2.gain.setValueAtTime(0.12, now);
    vGain2.gain.linearRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(vGain1);
    vGain1.connect(masterGain);

    osc2.connect(vGain2);
    vGain2.connect(masterGain);

    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 1.5);
    osc2.start(now);
    osc2.stop(now + 1.0);
  } catch (err) {
    console.warn("Failed to play mechanical bell sound:", err);
  }
}

/**
 * 4. Backspace Click Synthesizer (Lighter sliding tap)
 */
export function playTypewriterBackspace(volumeMultiplier: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now + 0.001);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(1500, now);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    masterGain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.06);
  } catch (err) {
    console.warn("Failed to play typewriter backspace:", err);
  }
}

/**
 * Ambient Synthesizers (Live procedural ambient noise generators)
 * Keeps memory footprint small and requires no remote asset loads.
 */
class ProcAmbientRain {
  private ctx: AudioContext | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private crackleNode: ScriptProcessorNode | null = null;
  private fireGain: GainNode | null = null;

  constructor() {}

  startRain(volume: number) {
    try {
      this.ctx = getAudioContext();
      const now = this.ctx.currentTime;

      if (!this.rainGain) {
        this.rainGain = this.ctx.createGain();
        this.rainGain.connect(this.ctx.destination);
      }
      this.rainGain.gain.setValueAtTime(volume, now);

      if (this.rainSource) return;

      // Filtered white noise generates the ambient sound of rain
      const rawNoise = this.ctx.createBufferSource();
      rawNoise.buffer = getNoiseBuffer(this.ctx);
      rawNoise.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = "peaking";
      rainFilter.frequency.setValueAtTime(1200, now);
      rainFilter.Q.setValueAtTime(1.0, now);
      rainFilter.gain.setValueAtTime(-15, now); // soft, muffled rain hatter

      const rainFilter2 = this.ctx.createBiquadFilter();
      rainFilter2.type = "lowpass";
      rainFilter2.frequency.setValueAtTime(1800, now);

      rawNoise.connect(rainFilter);
      rainFilter.connect(rainFilter2);
      rainFilter2.connect(this.rainGain);

      rawNoise.start(now);
      this.rainSource = rawNoise;
    } catch (e) {
      console.warn("Rain synthesis start error:", e);
    }
  }

  setRainVolume(volume: number) {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  stopRain() {
    try {
      if (this.rainSource) {
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
      }
    } catch (e) {}
  }

  startFireplace(volume: number) {
    try {
      this.ctx = getAudioContext();
      const now = this.ctx.currentTime;

      if (!this.fireGain) {
        this.fireGain = this.ctx.createGain();
        this.fireGain.connect(this.ctx.destination);
      }
      this.fireGain.gain.setValueAtTime(volume, now);

      if (this.crackleNode) return;

      // Base low-frequency hum for fireplace rumble
      const baseRumbler = this.ctx.createBufferSource();
      baseRumbler.buffer = getNoiseBuffer(this.ctx);
      baseRumbler.loop = true;

      const rumbleFilter = this.ctx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(75, now);
      baseRumbler.connect(rumbleFilter);
      rumbleFilter.connect(this.fireGain);
      baseRumbler.start(now);

      // Script processor logic or custom click generator to make wood pops and crackles
      // We synthesize crackling pops using transient high pass clicks
      const bufferSize = 4096;
      this.crackleNode = this.ctx.createScriptProcessor(bufferSize, 0, 1);
      
      this.crackleNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          out[i] = 0;
          // Randomly trigger wood pop crackle impulses
          if (Math.random() < 0.00075) {
            // sharp vertical pop impulse
            out[i] = (Math.random() * 2 - 1) * 0.45;
          } else if (Math.random() < 0.02) {
            // minor crackles
            out[i] = (Math.random() * 2 - 1) * 0.03;
          }
        }
      };

      const crackleFilter = this.ctx.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.setValueAtTime(8000, now);
      crackleFilter.Q.setValueAtTime(1.5, now);

      this.crackleNode.connect(crackleFilter);
      crackleFilter.connect(this.fireGain);

      // Save a reference to baseRumbler so we can stop it later
      (this.crackleNode as any).rumbler = baseRumbler;
    } catch (e) {
      console.warn("Fireplace synthesis load error:", e);
    }
  }

  setFireVolume(volume: number) {
    if (this.fireGain && this.ctx) {
      this.fireGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  stopFireplace() {
    try {
      if (this.crackleNode) {
        this.crackleNode.disconnect();
        if ((this.crackleNode as any).rumbler) {
          (this.crackleNode as any).rumbler.stop();
          (this.crackleNode as any).rumbler.disconnect();
        }
        this.crackleNode = null;
      }
    } catch (e) {}
  }

  cleanupAll() {
    this.stopRain();
    this.stopFireplace();
  }
}

export const procAmbientEngine = new ProcAmbientRain();
