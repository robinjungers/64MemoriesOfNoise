const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

export default class MidiDevice {
  public access : WebMidi.MIDIAccess | null = null;
  public output : WebMidi.MIDIOutput | null = null;
  
  constructor() {
  }
  
  get outputs() : WebMidi.MIDIOutput[] {
    return this.access ? Array.from( this.access.outputs.values() ) : [];
  }
  
  async request() {
    const access = await navigator.requestMIDIAccess();
    
    this.access = access;
    this.output = null;
    
    if ( this.outputs.length > 0 ) {
      this.selectOutputByID( this.outputs[0].id );
    }
  }
  
  selectOutputByID( id : string ) {
    if ( !this.access ) {
      throw 'Device not initialized';
    }
    
    const output = this.access.outputs.get( id );
    
    if ( !output ) {
      throw 'Output not available';
    }

    console.debug( 'MidiDevice - Selecting %s', id );
    
    this.output?.close();
    this.output = output;
    this.output.open();
  }
  
  sendNote( channel : number, pitch : number, velocity : number ) {
      if ( !this.access || !this.output ) {
        console.warn( 'MGMidiDevice - Not initialized' );
        return;
      }
      
      if (
        channel < 0 ||
        channel > 15
        ) {
          throw 'MIDI channel out of range';
        }
        
        this.output.send( [NOTE_ON + channel, pitch, velocity], 0 );
      }
    }