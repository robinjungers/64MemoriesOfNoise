// @ts-ignore
import { EssentiaWASM } from 'essentia.js/dist/essentia-wasm.es.js';
// @ts-ignore
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es.js';
import Essentia from 'essentia.js/dist/core_api';
import * as Comlink from 'comlink';

const essentia = new EssentiaJS( EssentiaWASM, false) as Essentia;

function computeFlatness( audioData : Float32Array ) : Float32Array {
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

export type Analyzer = {
    computeFlatness : ( audioData : Float32Array ) => Float32Array;
}

Comlink.expose( {
    computeFlatness,
} );