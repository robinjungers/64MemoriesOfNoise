import { noop } from "lodash";
import AudioLimiter from "./AudioLimiter";
import { createStereoDelay } from "./audioUtils";

export default class AudioSynth {
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
      latencyHint : 'interactive',
    } );

    this.buildGraphAndStart();
  }

  private async buildGraphAndStart() {
    await Promise.all( [
      this.ctx.audioWorklet.addModule( new URL( './AudioLimiter.worklet.js', import.meta.url ) ),
      this.ctx.audioWorklet.addModule( new URL( './AudioNoise.worklet.js', import.meta.url ) ),
    ] );

    this.master = this.ctx.createGain();
    this.master.gain.value = 1.0;
    this.master.connect( this.ctx.destination );

    const bgChannel = this.ctx.createGain();
    bgChannel.gain.value = 0.9;
    bgChannel.connect( this.master );

    const bgLowpass = this.ctx.createBiquadFilter();
    bgLowpass.type = 'lowpass';
    bgLowpass.frequency.value = 80;
    bgLowpass.connect( bgChannel );

    const bgLimiter = new AudioLimiter( this.ctx, 2.5 );
    bgLimiter.node.connect( bgLowpass );
    
    this.bgOsc = this.ctx.createOscillator();
    this.bgOsc.type = 'triangle';
    this.bgOsc.frequency.value = 30;
    this.bgOsc.connect( bgLimiter.node );
    this.bgOsc.start();

    const clickChannel = this.ctx.createGain();
    clickChannel.gain.value = 0.5;
    clickChannel.connect( this.master );

    const clickLowpass = this.ctx.createBiquadFilter();
    clickLowpass.type = 'lowpass';
    clickLowpass.frequency.value = 1000;
    createStereoDelay( this.ctx, -0.01, clickLowpass, clickChannel );

    const clickLimiter = new AudioLimiter( this.ctx, 10.0 );
    clickLimiter.node.connect( clickLowpass );

    this.clickEnv = this.ctx.createGain();
    this.clickEnv.gain.value = 0.0;
    this.clickEnv.connect( clickLimiter.node );

    this.clickOsc = new AudioWorkletNode( this.ctx, 'audio-noise' );
    this.clickOsc.connect( this.clickEnv );

    const wobChannel = this.ctx.createGain();
    wobChannel.gain.value = 0.3;
    wobChannel.connect( this.master );

    const wobLimiter1 = new AudioLimiter( this.ctx, 40.0 );
    createStereoDelay( this.ctx, 0.01, wobLimiter1.node, wobChannel );

    const wobLowpass1 = this.ctx.createBiquadFilter();
    wobLowpass1.type = 'lowpass';
    wobLowpass1.frequency.value = 20;
    wobLowpass1.connect( wobLimiter1.node );

    const wobLowpass2 = this.ctx.createBiquadFilter();
    wobLowpass2.type = 'lowpass';
    wobLowpass2.frequency.value = 100;
    wobLowpass2.connect( wobChannel );

    const wobHipass = this.ctx.createBiquadFilter();
    wobHipass.type = 'highpass';
    wobHipass.frequency.value = 5000;
    createStereoDelay( this.ctx, -0.02, wobHipass, wobChannel );

    const wobLimiter = new AudioLimiter( this.ctx, 20.0 );
    wobLimiter.node.connect( wobLowpass1 );
    wobLimiter.node.connect( wobLowpass2 );
    wobLimiter.node.connect( wobHipass );

    this.wobEnv = this.ctx.createGain();
    this.wobEnv.gain.value = 0.0;
    this.wobEnv.connect( wobLimiter.node );

    this.wobOsc = this.ctx.createOscillator();
    this.wobOsc.type = 'triangle';
    this.wobOsc.frequency.value = 10;
    this.wobOsc.connect( this.wobEnv );
    this.wobOsc.start();

    this.init().catch( noop );
  }

  async init() {
    if ( this.ctx.state === 'suspended' ) {
      await this.ctx.resume();
    }
  }

  initOnClick() {
    window.addEventListener( 'click', () => {
      this.init();
    } );
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
      const d = 0.002;
      const t = this.ctx.currentTime;
      this.wobEnv.gain.cancelScheduledValues( t );
      this.wobEnv.gain.setTargetAtTime( 1.0, t + 0.00, d );
      this.wobEnv.gain.setTargetAtTime( 0.0, t + 0.01, d );
    }
  }
}