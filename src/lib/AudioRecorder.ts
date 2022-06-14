export default class AudioRecorder {
    public ctx : AudioContext = new AudioContext();
    public chunks : Blob[] = [];
    public stream? : MediaStream;
    public recorder? : MediaRecorder;

    constructor() {
    }

    async request() {
        this.stream = await navigator.mediaDevices.getUserMedia ( { audio : true, video : false } );

        this.recorder = new MediaRecorder( this.stream );
        this.recorder.addEventListener( 'dataavailable', event => {
            this.chunks.push( event.data );
        } );
    }

    async init() {
        if ( this.ctx.state === 'suspended' ) {
            await this.ctx.resume();
        }
    }

    start() {
        if ( !this.recorder ) {
            throw 'Recorder not initalized';
        }

        this.recorder.start();
    }

    stop() : Promise<AudioBuffer | null> {
        if ( !this.recorder ) {
            throw 'Recorder not initalized';
        }

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

            this.recorder!.addEventListener( 'stop', onStop, { once : true } );
            this.recorder!.stop();
        } );
    }
}