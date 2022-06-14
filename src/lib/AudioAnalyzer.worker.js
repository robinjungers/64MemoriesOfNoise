import { EssentiaWASM } from 'essentia.js/dist/essentia-wasm.es.js';
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es.js';
import * as Comlink from 'comlink';

const essentia = new EssentiaJS( EssentiaWASM, false );

function computeFlatness( audioData ) {
    const frameSize = 1024;
    const frames = essentia.FrameGenerator( audioData, frameSize, frameSize / 2 );
    const flatness = new Float32Array( frames.size() );

    for ( let i = 0; i < frames.size(); ++ i ) {
        const frame = essentia.Windowing( frames.get( i ) ).frame;
        const frameSpectrum = essentia.Spectrum( frame, frameSize ).spectrum;
        const frameFlatness = essentia.Flatness( frameSpectrum ).flatness;

        flatness[i] = frameFlatness;
    }

    return flatness;
};

Comlink.expose( {
    computeFlatness,
} );