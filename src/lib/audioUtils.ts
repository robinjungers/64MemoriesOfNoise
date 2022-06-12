export function createStereoDelay(
  ctx : AudioContext,
  time : number,
  input : AudioNode,
  output : AudioNode,
) {
  const splitter = ctx.createChannelSplitter( 2 );
  input.connect( splitter );

  const merger = ctx.createChannelMerger( 2 );
  merger.connect( output );

  const delay0 = ctx.createDelay();
  const delay1 = ctx.createDelay();

  if ( time > 0 ) {
    delay0.delayTime.value = time;
    delay1.delayTime.value = 0;
  } else {
    delay0.delayTime.value = 0;
    delay1.delayTime.value = Math.abs( time );
  }

  splitter.connect( delay0, 0 );
  splitter.connect( delay1, 0 );

  delay0.connect( merger, 0, 0 );
  delay1.connect( merger, 0, 1 );
}