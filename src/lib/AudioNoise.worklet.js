class AudioNoise extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  
  process( inputList, outputList ) {
    const output = outputList[0];
    
    for ( let i = 0; i < output.length; ++ i ) {
      const channelOut = output[i];
      
      for ( let j = 0; j < channelOut.length; ++ j ) {
        channelOut[j] = Math.random() * 2.0 - 1.0;
      }
    }
    
    return true;
  }
};

registerProcessor( 'audio-noise', AudioNoise );