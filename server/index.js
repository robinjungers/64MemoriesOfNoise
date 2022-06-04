const path = require( 'path' );
const express = require( 'express' );
const { WebSocket, WebSocketServer } = require( 'ws' );
const app = express();
const sqlite3 = require( 'sqlite3' );

function broadcastData( wsServer, data, skipClient = null ) {
  wsServer.clients.forEach( wsClient => {
    if (
      wsClient !== skipClient &&
      wsClient.readyState === WebSocket.OPEN
    ) {
      wsClient.send( data );
    }
  } );
}

function packSnippetPayload( id, time, flatness ) {
  const info = new Uint32Array( [id, time] ).buffer;
  const data = new Uint8Array( info.byteLength + flatness.length );
  data.set( new Uint8Array( info ), 0 );
  data.set( new Uint8Array( flatness ), info.byteLength );

  console.log( "Packing snippet:", id, time, flatness.length );

  return data;
}

( async () => {
  const dbPath = path.join( __dirname, './data.db' );
  const db = new sqlite3.Database( dbPath );

  await db.run( `
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

    wsClient.on( 'error', error => console.error( error ) );
    wsClient.on( 'message', buffer => {
      const snippetTime = Math.round( Date.now() / 1000 );
      const snippetFlatness = new Uint8Array( buffer );
      
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
} )();