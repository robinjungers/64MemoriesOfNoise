import { maxBy, minBy, orderBy } from 'lodash';
import EventEmitter from 'events';
import Snippet from './Snippet';

export default class SnippetList extends EventEmitter {
  private maxLength : number;
  public snippets : Snippet[] = [];
  public snippetMinTime : number = 0.0;
  public snippetMaxTime : number = 1.0;

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
    this.snippetMinTime = minBy( newSnippets, 'time' )!.time;
    this.snippetMaxTime = maxBy( newSnippets, 'time' )!.time;
    this.snippets = orderBy( newSnippets, 'time', 'asc' );

    this.emit( 'added', snippet );

    if ( this.snippets.length > this.maxLength ) {
      const oldestSnippet = this.snippets.shift();

      this.emit( 'removed', oldestSnippet );
    }

    this.emit( 'changed', this.snippets );
  }
}