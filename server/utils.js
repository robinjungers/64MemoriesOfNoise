const sumBy = require( 'lodash/sumBy' );

function packUint8Array( arrays ) {
  const length = sumBy( arrays, 'byteLength' );
  const data = new Uint8Array( length );

  let i = 0;
  for ( const array of arrays ) {
      data.set( new Uint8Array( array.buffer ), i );
      i += array.byteLength;
  }

  return data;
}

module.exports = {
  packUint8Array,
};

module.exports = {
  packUint8Array,
};