import { Remote, wrap } from 'comlink';
import { Analyzer } from "./AudioAnalyzer.worker";

export default class AudioAnalyzer {
  private wrapper : Remote<Analyzer>;

  constructor() {
    const worker = new Worker( new URL( './AudioAnalyzer.worker.ts', import.meta.url ), {
      type : 'module',
    } );

    this.wrapper = wrap<Analyzer>( worker );
  }

  async computeFlatness( audioData : Float32Array ) : Promise<Float32Array> {
    return await this.wrapper.computeFlatness( audioData );
  }

}