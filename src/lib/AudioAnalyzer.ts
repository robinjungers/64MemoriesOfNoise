import { Remote, wrap } from 'comlink';

type Analyzer = {
  computeFlatness : ( audioData : Float32Array ) => Float32Array;
}

export default class AudioAnalyzer {
  private wrapper : Remote<Analyzer>;

  constructor() {
    const worker = new Worker( new URL( './AudioAnalyzer.worker.js', import.meta.url ), {
      type : 'module',
    } );

    this.wrapper = wrap<Analyzer>( worker );
  }

  async computeFlatness( audioData : Float32Array ) : Promise<Float32Array> {
    return await this.wrapper.computeFlatness( audioData );
  }

}