import './common.css';
import './index.css';
import AnimClock from './lib/AnimClock';
import AudioSynth from './lib/AudioSynth';
import Canvas from './lib/Canvas';
import Snippet from './lib/Snippet';
import SocketHandler from './lib/SocketHandler';

class App {
  private animClock : AnimClock;
  private canvas : Canvas;
  private socket : SocketHandler;

  constructor() {
    this.animClock = new AnimClock( this.onUpdate.bind( this ) );
    
    window.addEventListener( 'click', () => {
      AudioSynth().init();
    } );
    
    this.socket = new SocketHandler(
      this.onNewBeat.bind( this ),
      this.onNewSnippet.bind( this ),
    );

    const canvasContainer = document.querySelector( '#app' ) as HTMLDivElement;
    this.canvas = new Canvas( this.socket.snippets, canvasContainer );
  }

  private onUpdate( time : number ) {
    this.canvas.draw( time );
  }

  private onNewBeat( snippet : Snippet ) {
    this.animClock.triggerShiver( snippet );
  }

  private onNewSnippet( snippet : Snippet ) {
    this.canvas.addSnippet( snippet );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  new App();
} );