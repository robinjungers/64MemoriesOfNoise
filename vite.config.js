const { resolve } = require( 'path' );
const { defineConfig } = require( 'vite' );

module.exports = defineConfig( {
  build : {
    rollupOptions : {
      input : [
        resolve( __dirname, './index.html' ),
        resolve( __dirname, './ear.html' ),
        resolve( __dirname, './dir.html' ),
      ],
    },
  },
  define : {
    '__NODE_ENV' : JSON.stringify( process.env.NODE_ENV ),
    '__NODE_PORT' : JSON.stringify( process.env.NODE_PORT ),
  }
} );