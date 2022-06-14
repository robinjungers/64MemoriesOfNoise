import EventEmitter from 'events';
import { packUint8Array } from './utils';

const MESSAGE_TYPE_SNIPPET = 0;
const MESSAGE_TYPE_BEAT = 1;
const AUTO_TIMEOUT = 1000;
const ENDPOINT_PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;
const ENDPOINT_URL = `ws://${window.location.hostname}:${ENDPOINT_PORT}/`;

export default class SocketHandler extends EventEmitter {
  private ws : WebSocket | null = null;

  constructor() {
    super();

    this.open();
  }

  private open() {
    this.ws = new WebSocket( ENDPOINT_URL );
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
    const location = new Float64Array( data.slice( 8, 24 ) );
    const flatness = new Uint8Array( data.slice( 24 ) );

    console.debug( 'SocketHandler - Snippet [ID=%d, Time=%d, Latitude=%f, Longitude=%f, Flatness=%d bytes]',
      info[0],
      info[1],
      location[0],
      location[1],
      flatness.length,
    );

    this.emit( 'new', info[0], info[1], location[0], location[1], flatness );
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

  sendRecording( latitude : number, longitude : number, flatness : Uint8Array ) {
    if ( !this.ws ) {
      console.warn( 'SocketHandler - WS not open' );
      return;
    }

    const data = packUint8Array( [
      new Float64Array( [latitude, longitude] ),
      flatness,
    ] );

    this.ws.send( data );
  }
}