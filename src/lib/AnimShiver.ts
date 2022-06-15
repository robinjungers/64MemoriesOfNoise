import * as TWEEN from '@tweenjs/tween.js';
import { inRange } from 'lodash';
import AudioSynth from './AudioSynth';
import Snippet from './Snippet';
import { lerp, lerpi } from './utils';

export const shiverDuration = 5e3;

export default class AnimShiver {
  private snippet : Snippet;
  private audioSynth : AudioSynth;
  private position : number = 0.0;
  private positionTween : TWEEN.Tween<AnimShiver>;

  constructor(
    audioSynth : AudioSynth,
    snippet : Snippet,
    onComplete : () => void
  ) {
    this.audioSynth = audioSynth;
    this.snippet = snippet;
    
    this.positionTween = new TWEEN.Tween<AnimShiver>( this );
    this.positionTween.to( { position : 1.0 }, shiverDuration );
    this.positionTween.easing( TWEEN.Easing.Linear.None );
    this.positionTween.onComplete( () => onComplete() );
    this.positionTween.onUpdate( this.onPositionUpdate.bind( this ) );
  }

  private onPositionUpdate() {
    const flatnessIndex = lerpi( this.position, 0.0, 1.0, 0, this.snippet.flatness.length - 1 );
    const flatnessValue = this.snippet.flatness[flatnessIndex];

    if ( inRange( flatnessValue, 0, 20 ) ) {
      this.audioSynth.triggerClick();
    }
    
    if ( inRange( flatnessValue, 20, 40 ) ) {
      this.audioSynth.triggerWob();
    }

    this.snippet.uniforms.shiverPosition.value = this.position;
    this.snippet.uniforms.shiverFade.value =
      ( this.position <= 0.1 ) ? lerp( this.position, 0.0, 0.1, 0.0, 1.0 ) :
      ( this.position >= 0.9 ) ? lerp( this.position, 0.9, 1.0, 1.0, 0.0 ) :
      1.0;
  }


  start() {
    this.positionTween.start();
  }

  stop() {
    this.positionTween.stop();
  }
}