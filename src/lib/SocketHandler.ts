import Snippet from './Snippet';
import { lerpi } from './utils';

type NewBeatCallback = ( snippet : Snippet ) => void;
type NewSnippetCallback = ( snippet : Snippet, isUpdate : boolean ) => void;

const MESSAGE_TYPE_SNIPPET = 0;
const MESSAGE_TYPE_BEAT = 1;
const AUTO_TIMEOUT = 1000;

export default class SocketHandler {
  private ws : WebSocket | null;
  private onNewBeat? : NewBeatCallback;
  private onNewSnippet? : NewSnippetCallback;
  public snippets : Snippet[];
  public snippetMinTime : number = 0.0;
  public snippetMaxTime : number = 1.0;

  constructor(
    onNewBeat? : NewBeatCallback,
    onNewSnippet? : NewSnippetCallback,
  ) {
    this.ws = null;
    this.onNewBeat = onNewBeat;
    this.onNewSnippet = onNewSnippet;
    this.snippets = [];

    this.open();
  }

  private open() {
    this.ws = new WebSocket( 'ws://localhost:3001' );
    this.ws.binaryType = 'arraybuffer';
    this.ws.addEventListener( 'open', this.onOpen.bind( this ) );
    this.ws.addEventListener( 'close', this.onClose.bind( this ) );
    this.ws.addEventListener( 'message', this.onMessage.bind( this ) );
  }

  private onOpen() {
    console.debug( 'SocketHandler - Open' );
  }

  private onClose() {
    console.debug( 'SocketHandler - Closed' );

    setTimeout( this.open.bind( this ), AUTO_TIMEOUT );
  }

  private onMessageBeat( data : ArrayBuffer ) {
    const info = new Float64Array( data );
    const position = info[0];
    const index = lerpi( position, 0.0, 1.0, 0, this.snippets.length );
    const snippet = this.snippets[index];

    console.debug( 'SocketHandler - Beat [Position=%f]', position );

    this.onNewBeat?.( snippet );
  }

  private onMessageSnippet( data : ArrayBuffer ) {
    const info = new Uint32Array( data.slice( 0, 8 ) );
    const flatness = new Uint8Array( data.slice( 8 ) );
    const snippet = new Snippet( info[0], info[1], flatness );

    console.debug( 'SocketHandler - Snippet [ID=%d, Time=%d, Flatness=%d bytes]',
      snippet.id,
      snippet.time,
      snippet.flatness.length,
    );

    const existed = !!this.snippets.find( other => other.id === snippet.id );

    this.snippets.push( snippet );
    this.snippetMinTime = Math.min( this.snippetMinTime, snippet.time );
    this.snippetMaxTime = Math.max( this.snippetMaxTime, snippet.time );

    this.onNewSnippet?.( snippet, existed );
  }

  private async onMessage( event : MessageEvent<ArrayBuffer> ) {
    const messageType = new Uint8Array( event.data )[0];
    const messageData = event.data.slice( 1 );

    switch ( messageType ) {
      case MESSAGE_TYPE_BEAT :
      this.onMessageBeat( messageData );
      break;

      case MESSAGE_TYPE_SNIPPET :
      this.onMessageSnippet( messageData );
      break;
    }
  }

  sendAudioFlatness( audioFlatness : Uint8Array ) {
    if ( this.ws ) {
      this.ws.send( audioFlatness );
    } else {
      console.warn( 'SocketHandler - WS not open' );
    }
  }
}