export default class AudioRecorder {
    public ctx : AudioContext;
    public input : MediaStreamAudioDestinationNode;
    public chunks : Blob[];
    public recorder : MediaRecorder;

    constructor( ctx : AudioContext ) {
        this.ctx = ctx;

        this.input = this.ctx.createMediaStreamDestination();

        this.chunks = [];

        this.recorder = new MediaRecorder( this.input.stream );
        this.recorder.addEventListener( 'dataavailable', event => {
            this.chunks.push( event.data );
        } );
    }

    start() {
        this.recorder.start();
    }

    stop() : Promise<AudioBuffer | null> {
        return new Promise( ( resolve ) => {
            const onStop = async () => {
                const blob = new Blob( this.chunks, { 'type' : 'audio/ogg; codecs=opus' } );

                if ( blob.size > 0 ) {
                    const arrayBuffer = await blob.arrayBuffer();
                    const audioBuffer = await this.ctx.decodeAudioData( arrayBuffer );

                    resolve( audioBuffer );
                } else {
                    resolve( null );
                }
                
                this.chunks = [];
            };

            this.recorder.addEventListener( 'stop', onStop, { once : true } );
            this.recorder.stop();
        } );
    }
}