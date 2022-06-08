import './common.css';
import './ear.css';
import AudioMixer from './lib/AudioMixer';
import AudioAnalyzer from './lib/AudioAnalyzer';
import Graph from './lib/Graph';
import SocketHandler from './lib/SocketHandler';
import { floatsToBytes } from './lib/utils';

class App {
  private socket : SocketHandler;
  private analyzer : AudioAnalyzer;
  private mixer : AudioMixer;
  private graph1 : Graph;
  private graph2 : Graph;
  private isStarted : boolean = false;
  private isRecording : boolean = false;

  constructor() {
    this.socket = new SocketHandler();
    this.analyzer = new AudioAnalyzer();
    this.mixer = new AudioMixer();

    this.graph1 = new Graph( document.querySelector( '#canvas-1' ) as HTMLCanvasElement );
    this.graph2 = new Graph( document.querySelector( '#canvas-2' ) as HTMLCanvasElement );
    this.graph1.resize( 600, 100, window.devicePixelRatio );
    this.graph2.resize( 600, 100, window.devicePixelRatio );
  }

  async start() {
    await this.mixer.init();
    
    this.isStarted = true;
  }

  async startRecording() {
    if ( !this.isStarted ) {
      return;
    }

    this.mixer.recorder!.start();
      
    this.isRecording = true;
  }

  async stopRecording() {
    if ( !this.isStarted ) {
      return;
    }

    const audioBuffer = await this.mixer.recorder!.stop();
    const audioData = audioBuffer?.getChannelData( 0 );
    
    if ( audioData ) {
      const audioFlatness = await this.analyzer.computeFlatness( audioData );
      const audioFlatnessBytes = floatsToBytes( audioFlatness, 0.0, 1.0 );

      this.socket.sendAudioFlatness( audioFlatnessBytes );

      this.graph1.draw( audioData );
      this.graph2.draw( audioFlatness );
    }
    
    this.isRecording = false;
  }

  async toggleRecording() {
    return ( this.isRecording )
      ? this.stopRecording()
      : this.startRecording();
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  const app = new App();
  
  ( document.querySelector( '#start' ) as HTMLButtonElement ).onclick = () => {
    app.start()
  };
  
  ( document.querySelector( '#record' ) as HTMLButtonElement ).onclick = () => {
    app.toggleRecording();
  };
} );