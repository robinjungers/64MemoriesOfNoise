import './common.css';
import './index.css';
import Canvas from './lib/Canvas';
import Snippet from './lib/Snippet';
import SocketHandler from './lib/SocketHandler';

class App {
  private snippets : Map<number, Snippet>;
  private canvas : Canvas;
  private socket : SocketHandler;

  constructor() {
    this.snippets = new Map<number, Snippet>();
    this.canvas = new Canvas( document.querySelector( '#app' ) as HTMLDivElement );
    this.socket = new SocketHandler( this.onNewSnippet.bind( this ) );
  }

  private onNewSnippet( id : number, time : number, flatness : Uint8Array ) {
    const snippet = new Snippet( id, time, flatness );

    this.snippets.set( id, snippet );
    this.canvas.addSnippet( snippet );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  const app = new App();
} );