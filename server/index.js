const path = require( 'path' );
const express = require( 'express' );
const { packUint8Array } = require( './utils' );
const { WebSocket, WebSocketServer } = require( 'ws' );
const app = express();
const sqlite3 = require( 'sqlite3' );

const MESSAGE_TYPE_SNIPPET = 0;
const MESSAGE_TYPE_BEAT = 1;
const BEAT_INTERVAL = 2000;
const MAX_SNIPPETS = 64;

function startBeat( db, wsServer ) {
  setInterval( () => {
    db.serialize( () => {
      db.get( `
        SELECT
          snippet_id
        FROM (
          SELECT
            snippet_id,
            snippet_time
          FROM snippets
          ORDER BY snippet_time DESC
          LIMIT ?
        )
        ORDER BY RANDOM()
        LIMIT 1;
      `, MAX_SNIPPETS, ( error, row ) => {
        if ( error ) {
          throw error;
        }

        if ( row ) {
          const data = packBeatPayload( row['snippet_id'] );

          broadcastData( wsServer, data );
        }
      } );
    } );
  }, BEAT_INTERVAL );
}

function broadcastData( wsServer, data ) {
  wsServer.clients.forEach( wsClient => {
    if ( wsClient.readyState === WebSocket.OPEN ) {
      wsClient.send( data, { binary : true } );
    }
  } );
}

function packBeatPayload( id ) {
  console.log( "Packing beat:", id );

  return packUint8Array( [
    new Uint8Array( [MESSAGE_TYPE_BEAT] ),
    new Uint32Array( [id] ),
  ] );
}

function packSnippetPayload( id, time, latitude, longitude, flatness ) {
  const data = packUint8Array( [
    new Uint8Array( [MESSAGE_TYPE_SNIPPET] ),
    new Uint32Array( [id, time] ),
    new Float64Array( [latitude, longitude] ),
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
      snippet_latitude REAL NOT NULL,
      snippet_longitude REAL NOT NULL,
      snippet_flatness BLOB NOT NULL
    );
  ` );

  const staticDir = path.join( __dirname, '../dist' );
  const staticMid = express.static( staticDir );
  app.use( staticMid );

  const serverPort = process.env.NODE_ENV === 'production' ? 3000 : 3001;
  const server = app.listen( serverPort, () => {
    console.log( 'Listening on %d', serverPort );
  } );

  const wsServer = new WebSocketServer( { server } );
  wsServer.on( 'connection', wsClient => {
    db.serialize( () => {
      db.each( `
        SELECT
          snippet_id,
          snippet_time,
          snippet_latitude,
          snippet_longitude,
          snippet_flatness
        FROM snippets
        ORDER BY snippet_time DESC
        LIMIT ?;
      `, MAX_SNIPPETS, ( error, row ) => {
        if ( error ) {
          throw error;
        }

        const data = packSnippetPayload(
          row['snippet_id'],
          row['snippet_time'],
          row['snippet_latitude'],
          row['snippet_longitude'],
          row['snippet_flatness'],
        );

        wsClient.send( data, { binary : true } );
      } );
    } );

    wsClient.on( 'error', error => console.error( error ) );
    wsClient.on( 'message', buffer => {
      const o = buffer.byteOffset;
      const snippetTime = Math.round( Date.now() / 1000 );
      const snippetLocation = new Float64Array( buffer.buffer.slice( o, o + 16 ) );
      const snippetFlatness = new Uint8Array( buffer.buffer.slice( o + 16 ) );
      
      db.serialize( () => {
        db.run( `
          INSERT INTO snippets (
            snippet_time,
            snippet_latitude,
            snippet_longitude,
            snippet_flatness
          ) VALUES ( ?, ?, ?, ? );
        `, [
          snippetTime,
          snippetLocation[0],
          snippetLocation[1],
          snippetFlatness,
        ], function() {
          const data = packSnippetPayload(
            this.lastID,
            snippetTime,
            snippetLocation[0],
            snippetLocation[1],
            snippetFlatness,
          );

          broadcastData( wsServer, data );
        } );
      } );
    } );
  } );

  startBeat( db, wsServer );
} )();