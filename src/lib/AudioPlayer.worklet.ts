function lerpi( x, a, b, c, d ) {
    return Math.floor( c + ( d - c ) * ( x - a ) / ( b - a ) );
}

class AudioPlayer extends AudioWorkletProcessor {
    constructor() {
        super();

        this.audioChannel0 = null;
        this.audioChannel1 = null;
        this.isLoaded = false;

        this.port.onmessage = event => {
            this.audioChannel0 = event.data.audioChannel0;
            this.audioChannel1 = event.data.audioChannel1;
            this.isLoaded = true;
        };
    }
  
    process( ins, outs, parameters ) {
        if ( !this.isLoaded ) {
            return true;
        }

        const inCount = ins.length;
        const outChans = outs[0];
        const outChansCount = outChans.length;

        for ( let c = 0; c < outChansCount; ++ c ) {
            const outSamps = outChans[c];
            const outSampCount = outSamps.length;

            for ( let i = 0; i < outSampCount; ++ i ) { 
                let samp = 0.0;

                for ( let j = 0; j < inCount; ++ j ) {
                    const p = lerpi( ins[j][0][i], -1.0, 1.0, 0, this.audioChannel0.length - 1 );
                    
                    samp += 0.5 * (
                        this.audioChannel0[p] +
                        this.audioChannel1[p] );
                }

                outSamps[i] = samp / inCount;
            }
        }

        return true;
    }
};
  
registerProcessor( 'audio-player', AudioPlayer );