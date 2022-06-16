import { maxBy, minBy, orderBy } from 'lodash';
import EventEmitter from 'events';
import Snippet from './Snippet';
import { lerp } from './utils';

export default class SnippetList extends EventEmitter {
  private maxLength : number;
  public snippets : Snippet[] = [];

  constructor( maxLength : number ) {
    super();

    this.maxLength = maxLength;
  }

  getSnippetById( id : number ) : Snippet | null {
    return this.snippets.find( snippet => snippet.id === id ) ?? null;
  }

  forEach( callback : ( snippet : Snippet, index : number ) => void ) {
    this.snippets.forEach( callback );
  }

  addSnippet( snippet : Snippet ) {
    const exists = !!this.getSnippetById( snippet.id );

    if ( exists ) {
      return;
    }

    const newSnippets = [...this.snippets, snippet];
    this.snippets = orderBy( newSnippets, 'time', 'asc' );

    this.emit( 'added', snippet );

    if ( this.snippets.length > this.maxLength ) {
      const oldestSnippet = this.snippets.shift();

      this.emit( 'removed', oldestSnippet );
    }

    const timeMin = minBy( this.snippets, 'time' )!.time;
    const timeMax = maxBy( this.snippets, 'time' )!.time;
    this.snippets.forEach( ( snippet : Snippet ) => {
      const drift = lerp( snippet.time, timeMin, timeMax, 1.0, 0.0 );

      snippet.animateDrift( drift );
    } );

    this.emit( 'changed', this.snippets );
  }
}