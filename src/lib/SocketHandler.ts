import EventEmitter from 'events';

const MESSAGE_TYPE_SNIPPET = 0;
const MESSAGE_TYPE_BEAT = 1;
const AUTO_TIMEOUT = 1000;

export default class SocketHandler extends EventEmitter {
  private ws : WebSocket | null = null;

  constructor() {
    super();

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
    const info = new Uint32Array( data );
    const id = info[0];

    console.debug( 'SocketHandler - Beat [ID=%f]', id );

    this.emit( 'beat', id );
  }

  private onMessageSnippet( data : ArrayBuffer ) {
    const info = new Uint32Array( data.slice( 0, 8 ) );
    const id = info[0];
    const time = info[1];
    const flatness = new Uint8Array( data.slice( 8 ) );

    console.debug( 'SocketHandler - Snippet [ID=%d, Time=%d, Flatness=%d bytes]',
      id,
      time,
      flatness.length,
    );

    this.emit( 'new', id, time, flatness );
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