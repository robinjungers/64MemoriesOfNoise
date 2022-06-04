class AudioShusher extends AudioWorkletProcessor {
    constructor() {
        super();
    }
  
    process( inputList, outputList, parameters ) {
        const input = inputList[0];
        const output = outputList[0];
        const channelCount = Math.min( input.length, output.length );

        for ( let i = 0; i < channelCount; ++ i ) {
            output[i].set( input[i] );
        }

        return true;
    }
};
  
registerProcessor( 'audio-shusher', AudioShusher );