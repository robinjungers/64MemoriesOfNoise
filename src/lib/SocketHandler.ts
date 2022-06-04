type NewSnippetCallback = ( id : number, time : number, flatness : Uint8Array ) => void;

const AUTO_TIMEOUT = 1000;

export default class SocketHandler {
  private ws : WebSocket | null;
  private onNewSnippet : NewSnippetCallback;

  constructor( onNewSnippet : NewSnippetCallback ) {
    this.ws = null;
    this.onNewSnippet = onNewSnippet;

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

  private async onMessage( event : MessageEvent<ArrayBuffer> ) {
    const snippetInfo = new Uint32Array( event.data.slice( 0, 8 ) );
    const snippetId = snippetInfo[0];
    const snippetTime = snippetInfo[1];
    const snippetFlatness = new Uint8Array( event.data.slice( 8 ) );

    console.debug( 'SocketHandler - Received [ID=%d, Time=%d, Flatness=%d bytes]',
      snippetId,
      snippetTime,
      snippetFlatness.length,
    );

    this.onNewSnippet(
      snippetId,
      snippetTime,
      snippetFlatness,
    );
  }

  sendAudioFlatness( audioFlatness : Uint8Array ) {
    if ( this.ws ) {
      this.ws.send( audioFlatness );
    } else {
      console.warn( 'SocketHandler - WS not open' );
    }
  }
}