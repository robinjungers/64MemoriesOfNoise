import AudioRecorder from './AudioRecorder.js';
import Recorder from './AudioRecorder.js';

export default class App {
    public ctx : AudioContext | null = null;
    public recorder : AudioRecorder | null = null;
    public master : GainNode | null = null;
    public channel : GainNode | null = null;
    public shusher : AudioWorkletNode | null = null;
    public player : AudioWorkletNode | null = null;
    public stream : MediaStream | null = null;
    public streamSource : MediaStreamAudioSourceNode | null = null;

    constructor() {
    }

    set muted( mute : boolean ) {
        if ( this.master ) {
            this.master.gain.value = mute ? 0.0 : 1.0;
        }
    }

    async init() {
        this.ctx = new AudioContext( {
            sampleRate : 44100,
        } );

        await this.ctx.resume();

        this.master = this.ctx.createGain();
        this.master.gain.value = 1.0;
        this.master.connect( this.ctx.destination );

        this.recorder = new Recorder( this.ctx );

        await this.ctx.audioWorklet.addModule( new URL( './AudioShusher.worklet.ts', import.meta.url ) );
        this.shusher = new AudioWorkletNode( this.ctx, 'audio-shusher' );
        this.shusher.connect( this.recorder.input );

        this.stream = await navigator.mediaDevices.getUserMedia ( { audio : true, video : false } );
        this.streamSource = this.ctx.createMediaStreamSource( this.stream );
        this.streamSource.connect( this.shusher );

        // Player
        await this.ctx.audioWorklet.addModule( new URL( './AudioPlayer.worklet.ts', import.meta.url ) );
        this.player = new AudioWorkletNode( this.ctx, 'audio-player', {
            numberOfInputs : 10,
            numberOfOutputs : 1,
        } );
        this.player.connect( this.master );

        for ( let i = 0; i < this.player.numberOfInputs; ++ i ) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = Math.random() * 0.5 + 0.5;
            osc.connect( this.player, 0, i );
            osc.start();
        }
    }

    destroy() {

    }
}