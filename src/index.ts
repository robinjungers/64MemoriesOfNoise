import './common.css';
import './index.css';
import AnimClock from './lib/AnimClock';
import Canvas from './lib/Canvas';
import Snippet from './lib/Snippet';
import SocketHandler from './lib/SocketHandler';
import { lerp } from './lib/utils';

const SHIVER_DURATION = 4e3;

class App {
  private animClock : AnimClock;
  private canvas : Canvas;
  private socket : SocketHandler;

  constructor() {
    this.animClock = new AnimClock( this.onUpdate.bind( this ) );
    this.canvas = new Canvas( document.querySelector( '#app' ) as HTMLDivElement );
    this.socket = new SocketHandler(
      this.onNewBeat.bind( this ),
      this.onNewSnippet.bind( this ),
    );
  }

  private onUpdate( time : number, shiverPosition : number ) {
    // this.socket.snippets.forEach( ( snippet : Snippet ) => {
    //   const time 
    // } );

    this.canvas.draw( time );
  }

  private onNewBeat() {
    this.animClock.triggerShiver( SHIVER_DURATION );
  }

  private onNewSnippet( snippet : Snippet ) {
    this.canvas.addSnippet( snippet );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  new App();
} );