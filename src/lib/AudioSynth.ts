import { createStereoDelay } from "./audioUtils";

class AudioSynth {
  private ctx : AudioContext;
  private master? : GainNode;
  private bgOsc? : OscillatorNode;
  private clickEnv? : GainNode;
  private clickOsc? : AudioWorkletNode;
  private wobEnv? : GainNode;
  private wobOsc? : OscillatorNode;

  constructor() {
    this.ctx = new AudioContext( {
      sampleRate : 44100,
    } );

    this.buildGraph();
  }

  private async buildGraph() {
    await Promise.all( [
      this.ctx.audioWorklet.addModule( new URL( './AudioLimiter.worklet.ts', import.meta.url ) ),
      this.ctx.audioWorklet.addModule( new URL( './AudioNoise.worklet.ts', import.meta.url ) ),
    ] );

    this.master = this.ctx.createGain();
    this.master.gain.value = 1.0;
    this.master.connect( this.ctx.destination );

    const bgChannel = this.ctx.createGain();
    bgChannel.gain.value = 0.8;
    bgChannel.connect( this.master );

    const bgLowpass = this.ctx.createBiquadFilter();
    bgLowpass.type = 'lowpass';
    bgLowpass.frequency.value = 40;
    bgLowpass.connect( bgChannel );

    const bgLimiter = new AudioWorkletNode( this.ctx, 'audio-limiter' );
    // @ts-ignore
    bgLimiter.parameters.get( 'overdrive' ).value = 100.0;
    bgLimiter.connect( bgLowpass );
    
    this.bgOsc = this.ctx.createOscillator();
    this.bgOsc.type = 'triangle';
    this.bgOsc.frequency.value = 30;
    this.bgOsc.connect( bgLimiter );
    this.bgOsc.start();

    const clickChannel = this.ctx.createGain();
    clickChannel.gain.value = 0.7;
    clickChannel.connect( this.master );

    const clickLowpass = this.ctx.createBiquadFilter();
    clickLowpass.type = 'lowpass';
    clickLowpass.frequency.value = 2000;
    createStereoDelay( this.ctx, -0.1, clickLowpass, clickChannel );

    const clickLimiter = new AudioWorkletNode( this.ctx, 'audio-limiter' );
    // @ts-ignore
    clickLimiter.parameters.get( 'overdrive' ).value = 10.0;
    clickLimiter.connect( clickLowpass );

    this.clickEnv = this.ctx.createGain();
    this.clickEnv.gain.value = 0.0;
    this.clickEnv.connect( clickLimiter );

    this.clickOsc = new AudioWorkletNode( this.ctx, 'audio-noise' );
    this.clickOsc.connect( this.clickEnv );

    const wobChannel = this.ctx.createGain();
    wobChannel.gain.value = 0.6;
    wobChannel.connect( this.master );

    const wobLimiter1 = new AudioWorkletNode( this.ctx, 'audio-limiter' );
    // @ts-ignore
    wobLimiter1.parameters.get( 'overdrive' ).value = 40.0;
    createStereoDelay( this.ctx, 0.01, wobLimiter1, wobChannel );

    const wobLowpass1 = this.ctx.createBiquadFilter();
    wobLowpass1.type = 'lowpass';
    wobLowpass1.frequency.value = 20;
    wobLowpass1.connect( wobLimiter1 );

    const wobLowpass2 = this.ctx.createBiquadFilter();
    wobLowpass2.type = 'lowpass';
    wobLowpass2.frequency.value = 100;
    wobLowpass2.connect( wobChannel );

    const wobHipass = this.ctx.createBiquadFilter();
    wobHipass.type = 'highpass';
    wobHipass.frequency.value = 5000;
    createStereoDelay( this.ctx, -0.2, wobHipass, wobChannel );

    const wobLimiter = new AudioWorkletNode( this.ctx, 'audio-limiter' );
    // @ts-ignore
    wobLimiter.parameters.get( 'overdrive' ).value = 20.0;
    wobLimiter.connect( wobLowpass1 );
    wobLimiter.connect( wobLowpass2 );
    wobLimiter.connect( wobHipass );

    this.wobEnv = this.ctx.createGain();
    this.wobEnv.gain.value = 0.0;
    this.wobEnv.connect( wobLimiter );

    this.wobOsc = this.ctx.createOscillator();
    this.wobOsc.type = 'triangle';
    this.wobOsc.frequency.value = 10;
    this.wobOsc.connect( this.wobEnv );
    this.wobOsc.start();
  }

  init() {
    this.ctx.resume();
  }

  triggerClick() {
    if ( this.clickEnv ) {
      const t = this.ctx.currentTime;
      this.clickEnv.gain.cancelScheduledValues( t );
      this.clickEnv.gain.setValueAtTime( 1.0, t + 0.000 );
      this.clickEnv.gain.setValueAtTime( 0.0, t + 0.001 );
    }
  }

  triggerWob() {
    if ( this.wobEnv ) {
      const d = 0.001;
      const t = this.ctx.currentTime;
      this.wobEnv.gain.cancelScheduledValues( t );
      this.wobEnv.gain.setTargetAtTime( 1.0, t + 0.00, d );
      this.wobEnv.gain.setTargetAtTime( 0.0, t + 0.01, d );
    }
  }
}

let synthInstance : AudioSynth | null = null;

export default function AudioSynthInstance() : AudioSynth {
  if ( !synthInstance ) {
    synthInstance = new AudioSynth();
  }

  return synthInstance;
}