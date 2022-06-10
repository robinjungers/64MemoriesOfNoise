import './common.css';
import './dir.css';
import Snippet from './lib/Snippet';
import SocketHandler from './lib/SocketHandler';

function formatTimeNumber( num : number ) : string {
  return num.toString().padStart( 2, '0' );
}

function formatTime( time : Date ) : string {
  const d = [
    formatTimeNumber( time.getFullYear() ),
    formatTimeNumber( time.getMonth() ),
    formatTimeNumber( time.getDate() ),
  ].join( '.' );

  const t = [
    formatTimeNumber( time.getHours() ),
    formatTimeNumber( time.getMinutes() ),
    formatTimeNumber( time.getSeconds() ),
  ].join( ':' );

  return `${d} ${t}`;
}

function formatSize( size : number ) : string {
  const s = size.toString().padStart( 4, '0' );

  return `${s}b`;
}

function formatData( data : Uint8Array ) : string {
  return Array.from( data, ( value : number ) => {
    return value.toString( 16 ).padStart( 2, '0' );
  } ).join( '' );
}

class App {
  private container : HTMLOListElement;
  private socket : SocketHandler;

  constructor() {
    this.container = document.querySelector( '#records' ) as HTMLOListElement;
    this.socket = new SocketHandler(
      this.onNewBeat.bind( this ),
      this.onNewSnippet.bind( this ),
    );
  }

  private onNewBeat() {

  }

  private onNewSnippet( snippet : Snippet ) {
    const timeElement = document.createElement( 'span' );
    timeElement.classList.add( 'detail', 'detail-time' );
    timeElement.innerText = formatTime( snippet.displayTime );

    const sizeElement = document.createElement( 'span' );
    sizeElement.classList.add( 'detail', 'detail-size' );
    sizeElement.innerText = formatSize( snippet.flatness.length );

    const itemElement = document.createElement( 'li' );
    itemElement.classList.add( 'details' );
    itemElement.appendChild( timeElement );
    itemElement.appendChild( sizeElement );

    this.container.append( itemElement )
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  new App();
} );