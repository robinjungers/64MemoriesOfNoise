class AudioLimiter extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  
  static get parameterDescriptors () {
    return [{
      name : 'overdrive',
      defaultValue : 10.0,
      minValue : 1.0,
      maxValue : 100.0,
      automationRate : 'a-rate',
    }];
  }
  
  process( inputList, outputList, parameters ) {
    const input = inputList[0];
    const output = outputList[0];
    const channelCount = Math.min( input.length, output.length );
    const overdrive = parameters['overdrive'];
    
    for ( let i = 0; i < channelCount; ++ i ) {
      const channelIn = input[i];
      const channelOut = output[i];
      
      for ( let j = 0; j < channelIn.length; ++ j ) {
        const f = overdrive.length > 1 ? overdrive[j] : overdrive[0];

        channelOut[j] = Math.tanh( f * channelIn[j] );
      }
    }
    
    return true;
  }
};

registerProcessor( 'audio-limiter', AudioLimiter );