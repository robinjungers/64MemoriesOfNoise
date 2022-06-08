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
} );