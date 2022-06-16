import './common.css';
import './dir.css';
import { shiverDuration } from './lib/AnimShiver';
import Snippet from './lib/Snippet';
import SnippetList from './lib/SnippetList';
import SocketHandler from './lib/SocketHandler';
import { coordsToDMS } from './lib/utils';

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

class App {
  private container : HTMLOListElement;
  private socketHandler : SocketHandler = new SocketHandler();
  private snippets : SnippetList = new SnippetList( 64 );

  constructor() {
    this.container = document.querySelector( '#records' ) as HTMLOListElement;
    
    this.socketHandler.on( 'beat', this.onSocketBeat.bind( this ) );
    this.socketHandler.on( 'new', this.onSocketNew.bind( this ) );

    this.snippets.on( 'changed', this.onChanged.bind( this ) );
  }

  private onSocketBeat( id : number ) {
    const sel = `#snippet-${id}`;
    const element = document.querySelector( sel );

    if ( element ) {
      element.classList.toggle( 'active', true );

      setTimeout( () => {
        element.classList.toggle( 'active', false );
      }, shiverDuration );
    }
  }

  private onSocketNew( id : number, time : number, latitude : number, longitude : number, flatness : Uint8Array ) {
    const snippet = new Snippet( id, time, latitude, longitude, flatness );

    this.snippets.addSnippet( snippet );
  }

  private onChanged( orderedSnippets : Snippet[] ) {
    this.container.innerHTML = '';

    orderedSnippets.forEach( ( snippet : Snippet ) => {
      const timeElement = document.createElement( 'span' );
      timeElement.classList.add( 'detail', 'detail-time' );
      timeElement.innerText = formatTime( snippet.displayTime );

      const locationElement = document.createElement( 'span' );
      locationElement.classList.add( 'detail', 'detail-location' );
      locationElement.innerText = coordsToDMS( snippet.latitude, snippet.longitude );

      const sizeElement = document.createElement( 'span' );
      sizeElement.classList.add( 'detail', 'detail-size' );
      sizeElement.innerText = formatSize( snippet.flatness.length );

      const itemElement = document.createElement( 'li' );
      itemElement.id = `snippet-${snippet.id}`;
      itemElement.classList.add( 'details' );
      itemElement.appendChild( timeElement );
      itemElement.appendChild( locationElement );
      itemElement.appendChild( sizeElement );

      this.container.append( itemElement )
    } );
  }
}

window.addEventListener( 'DOMContentLoaded', () => {
  new App();
} );