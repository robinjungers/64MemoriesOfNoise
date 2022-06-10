const path = require( 'path' );
const express = require( 'express' );
const sumBy = require( 'lodash/sumBy' );
const { WebSocket, WebSocketServer } = require( 'ws' );
const app = express();
const sqlite3 = require( 'sqlite3' );

const MESSAGE_TYPE_SNIPPET = 0;
const MESSAGE_TYPE_BEAT = 1;
const BEAT_INTERVAL = 500;

function startBeat( wsServer ) {
  setInterval( () => {
    const position = Math.random();
    const data = packBeatPayload( position );

    broadcastData( wsServer, data );
  }, BEAT_INTERVAL );
}

function broadcastData( wsServer, data ) {
  wsServer.clients.forEach( wsClient => {
    if ( wsClient.readyState === WebSocket.OPEN ) {
      wsClient.send( data, { binary : true } );
    }
  } );
}

function packPayload( arrays ) {
  const length = sumBy( arrays, 'byteLength' );
  const data = new Uint8Array( length );

  let i = 0;
  for ( const array of arrays ) {
    data.set( new Uint8Array( array.buffer ), i );
    i += array.byteLength;
  }

  return data;
}

function packBeatPayload( position ) {
  console.log( "Packing beat:", position );

  return packPayload( [
    new Uint8Array( [MESSAGE_TYPE_BEAT] ),
    new Float64Array( [position] ),
  ] );
}

function packSnippetPayload( id, time, flatness ) {
  const data = packPayload( [
    new Uint8Array( [MESSAGE_TYPE_SNIPPET] ),
    new Uint32Array( [id, time] ),
    new Uint8Array( flatness ),
  ] );

  console.log( "Packing snippet:", id, time, flatness.length );

  return data;
}

( async () => {
  const dbPath = path.join( __dirname, './data.db' );
  const db = new sqlite3.Database( dbPath );

  db.run( `
    CREATE TABLE IF NOT EXISTS snippets (
      snippet_id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_time INTEGER NOT NULL,
      snippet_flatness BLOB NOT NULL
    );
  ` );

  const staticDir = path.join( __dirname, '../dist' );
  const staticMid = express.static( staticDir );
  app.use( staticMid );

  const serverPort = 3001;
  const server = app.listen( serverPort, () => {
    console.log( 'Listening on %d', serverPort );
  } );

  const wsServer = new WebSocketServer( { server, maxPayload : 1024 } );
  wsServer.on( 'connection', wsClient => {
    db.serialize( () => {
      db.each( `
        SELECT
          snippet_id,
          snippet_time,
          snippet_flatness
        FROM snippets
        ORDER BY snippet_id DESC
        LIMIT 1000;
      `, ( error, row ) => {
        if ( error ) {
          throw error;
        }

        const data = packSnippetPayload(
          row['snippet_id'],
          row['snippet_time'],
          row['snippet_flatness'],
        );

        wsClient.send( data, { binary : true } );
      } );
    } );

    wsClient.on( 'error', error => console.error( error ) );
    wsClient.on( 'message', buffer => {
      const snippetTime = Math.round( Date.now() / 1000 );
      const snippetFlatness = new Uint8Array( buffer );
      
      db.serialize( () => {
        db.run( `
          INSERT INTO snippets (
            snippet_time,
            snippet_flatness
          ) VALUES ( ?, ? );
        `, [
          snippetTime,
          snippetFlatness,
        ], function() {
          const data = packSnippetPayload(
            this.lastID,
            snippetTime,
            snippetFlatness,
          );

          broadcastData( wsServer, data );
        } );
      } );
    } );
  } );

  startBeat( wsServer );
} )();