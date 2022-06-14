import './common.css';
import './index.css';
import AnimClock from './lib/AnimClock';
import AudioSynth from './lib/AudioSynth';
import Canvas from './lib/Canvas';
import Snippet from './lib/Snippet';
import SnippetList from './lib/SnippetList';
import SocketHandler from './lib/SocketHandler';

class App {
  private animClock : AnimClock;
  private canvas : Canvas;
  private audioSynth : AudioSynth;
  private socketHandler : SocketHandler;
  private snippets : SnippetList = new SnippetList( 64 );

  constructor() {
    this.animClock = new AnimClock( this.onClockUpdate.bind( this ) );

    this.audioSynth = new AudioSynth();
    this.audioSynth.initOnClick();
    
    this.socketHandler = new SocketHandler();
    this.socketHandler.on( 'beat', this.onSocketBeat.bind( this ) );
    this.socketHandler.on( 'new', this.onSocketNew.bind( this ) );

    const canvasContainer = document.querySelector( '#app' ) as HTMLDivElement;
    this.canvas = new Canvas( this.snippets, canvasContainer );
  }

  private onSocketBeat( id : number ) {
    const snippet = this.snippets.getSnippetById( id );

    if ( snippet ) {
      this.animClock.triggerShiver( this.audioSynth, snippet );
    }
  }

  private onSocketNew( id : number, time : number, latitude : number, longitude : number, flatness : Uint8Array ) {
    const snippet = new Snippet( id, time, latitude, longitude, flatness );

    this.snippets.addSnippet( snippet );
  }

  private onClockUpdate( time : number ) {
    this.canvas.draw( time );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  new App();
} );