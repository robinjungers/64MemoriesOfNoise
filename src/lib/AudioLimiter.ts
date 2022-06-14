export default class AudioLimiter {
  public node : AudioWorkletNode;

  constructor( ctx : AudioContext, overdrive : number ) {
    this.node = new AudioWorkletNode( ctx, 'audio-limiter' );

    const params = ( this.node.parameters as Map<string, AudioParam> );
    params.get( 'overdrive' )!.value = overdrive;
  }
}