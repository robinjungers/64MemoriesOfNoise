import * as TWEEN from '@tweenjs/tween.js';
import AnimShiver from './AnimShiver';
import Snippet from './Snippet';

type UpdateCallback = ( time : number ) => void;

export default class AnimClock {
  private shivers : Set<AnimShiver> = new Set<AnimShiver>();
  private onUpdate? : UpdateCallback;

  constructor( onUpdate? : UpdateCallback ) {
    this.onUpdate = onUpdate;

    window.requestAnimationFrame( this.update.bind( this ) );
  }

  triggerShiver( snippet : Snippet ) {
    const shiver = new AnimShiver( snippet, () => {
      this.shivers.delete( shiver );
    } );
    
    shiver.start();

    this.shivers.add( shiver );
  }

  private update( time : number ) {
    window.requestAnimationFrame( this.update.bind( this ) );

    TWEEN.update( time );

    this.onUpdate?.( time );
  }
}