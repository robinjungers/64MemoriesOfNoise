import * as TWEEN from '@tweenjs/tween.js';
import { inRange } from 'lodash';
import AudioSynth from './AudioSynth';
import Snippet from './Snippet';
import { lerpi } from './utils';

export const shiverDuration = 5e3;

export default class AnimShiver {
  private tween : TWEEN.Tween<AnimShiver>;
  private snippet : Snippet;
  private position : number = 0.0;

  constructor(
    audioSynth : AudioSynth,
    snippet : Snippet,
    onComplete : () => void
  ) {
    this.snippet = snippet;
    
    this.tween = new TWEEN.Tween<AnimShiver>( this );
    this.tween.to( { position : 1.0 }, shiverDuration );
    this.tween.easing( TWEEN.Easing.Linear.None );
    this.tween.onComplete( () => onComplete() );
    this.tween.onUpdate( () => {
      const flatnessIndex = lerpi( this.position, 0.0, 1.0, 0, this.snippet.flatness.length - 1 );
      const flatnessValue = this.snippet.flatness[flatnessIndex];

      if ( inRange( flatnessValue, 0, 20 ) ) {
        audioSynth.triggerClick();
      }
      
      if ( inRange( flatnessValue, 20, 40 ) ) {
        audioSynth.triggerWob();
      }

      this.snippet.shaderShiverProgress = this.position;
    } );
  }

  start() {
    this.tween.start();
  }
}