import './common.css';
import './ear.css';
import AudioAnalyzer from './lib/AudioAnalyzer';
import Graph from './lib/Graph';
import SocketHandler from './lib/SocketHandler';
import { floatsToBytes } from './lib/utils';
import AudioRecorder from './lib/AudioRecorder';
import GeoLoc from './lib/GeoLoc';

class App {
  private socket : SocketHandler = new SocketHandler();
  private analyzer : AudioAnalyzer = new AudioAnalyzer();
  private recorder : AudioRecorder = new AudioRecorder();
  private graph : Graph;
  private isRecording : boolean = false;
  private geoLoc : GeoLoc = new GeoLoc();
  private audioFlatness : Uint8Array | null = null;

  constructor() {
    this.graph = new Graph( document.querySelector( '#graph' ) as HTMLCanvasElement );
    this.graph.resize( 300, 100, window.devicePixelRatio );

    const appContainer = document.querySelector( '#app' ) as HTMLButtonElement;
    const recordButton = document.querySelector( '#record' ) as HTMLButtonElement;
    const submitButton = document.querySelector( '#submit' ) as HTMLButtonElement;

    Promise.all( [
      this.recorder.request(),
      this.geoLoc.waitForFirstLoc(),
    ] ).then( () => {
      appContainer.classList.add( 'ready' );
    } );
    
    recordButton.addEventListener( 'click', async () => {
      if ( this.isRecording ) {
        await this.stopRecording();
        appContainer.classList.toggle( 'recording', false );
      } else {
        await this.startRecording();
        appContainer.classList.toggle( 'recording', true );
      }
    } );

    submitButton.addEventListener( 'click', () => {
      if ( this.audioFlatness ) {
        this.socket.sendRecording(
          this.geoLoc.latitude,
          this.geoLoc.longitude,
          this.audioFlatness,
        );

        this.graph.clear();
      }
    } );
  }

  async startRecording() {
    await this.recorder.init();

    this.recorder.start();
      
    this.isRecording = true;
  }

  async stopRecording() {
    if ( !this.isRecording ) {
      return;
    }

    const audioBuffer = await this.recorder.stop();
    const audioData = audioBuffer?.getChannelData( 0 );
    
    if ( audioData ) {
      const audioFlatnessF = await this.analyzer.computeFlatness( audioData );
      const audioFlatness = floatsToBytes( audioFlatnessF, 0.0, 1.0 );

      this.audioFlatness = audioFlatness;
      this.graph.draw( audioFlatnessF );
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
  new App();
} );