import * as TWEEN from '@tweenjs/tween.js';

type UpdateCallback = ( time : number, shiverPosition : number ) => void;

export default class AnimClock {
  private shiverTween : TWEEN.Tween<AnimClock> | null = null;
  private shiverPosition : number = 0.0;
  private onUpdate? : UpdateCallback;

  constructor( onUpdate? : UpdateCallback ) {
    this.onUpdate = onUpdate;

    window.requestAnimationFrame( this.update.bind( this ) );
  }

  triggerShiver( duration : number ) {
    this.shiverTween?.stop();
    this.shiverPosition = 0.0;
    this.shiverTween = new TWEEN.Tween<AnimClock>( this );
    this.shiverTween.to( { shiverPosition : 1.0 }, duration );
    this.shiverTween.easing( TWEEN.Easing.Linear.None );
    this.shiverTween.start();
  }

  private update( time : number ) {
    window.requestAnimationFrame( this.update.bind( this ) );

    TWEEN.update( time );

    this.onUpdate?.( time, this.shiverPosition );
  }
}