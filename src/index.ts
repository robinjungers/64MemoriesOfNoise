import './common.css';
import './index.css';
import Canvas from './lib/Canvas';
import SocketHandler from './lib/SocketHandler';

class Snippet {
  public id : number;
  public time : number;
  public flatness : Uint8Array;

  constructor( id : number, time : number, flatness : Uint8Array ) {
    this.id = id;
    this.time = time;
    this.flatness = flatness;
  }

  get displayTime() {
    return new Date( this.time * 1000 );
  }
}

class App {
  private socket : SocketHandler;
  private snippets : Map<number, Snippet>;
  private canvas : Canvas;

  constructor() {
    this.snippets = new Map<number, Snippet>();
    this.socket = new SocketHandler( this.onNewSnippet.bind( this ) );
    this.canvas = new Canvas( document.querySelector( '#app' ) as HTMLDivElement );
  }

  private onNewSnippet( id : number, time : number, flatness : Uint8Array ) {
    const snippet = new Snippet( id, time, flatness );

    this.snippets.set( id, snippet );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  const app = new App();
} );