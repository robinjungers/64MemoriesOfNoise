import EventEmitter from 'events';

export default class GeoLoc extends EventEmitter {
  public latitude : number = 0;
  public longitude : number = 0;
  private isReady : boolean = false;

  constructor() {
    super();

    navigator.geolocation.watchPosition(
      this.onGeoPosition.bind( this ),
      this.onGeoError.bind( this ),
    );
  }

  async waitForFirstLoc() {
    return new Promise<void>( ( resolve : () => void ) => {
      if ( this.isReady ) {
        resolve();
      } else {
        this.once( 'change', () => {
          resolve();
        } );
      }
    } );
  }

  private onGeoPosition( position : GeolocationPosition ) {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    console.debug( 'GeoLoc - Coordinates', this.latitude, this.longitude );

    this.emit( 'change' );

    this.isReady = true;
  }

  private onGeoError( error : GeolocationPositionError ) {
    console.error( error );
  }
}