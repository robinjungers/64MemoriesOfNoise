import { min, max, mean } from 'lodash';

export function lerp( x : number, a : number, b : number, c : number, d : number ) : number {
    return c + ( d - c ) * ( x - a ) / ( b - a );
}

export function lerpi( x : number, a : number, b : number, c : number, d : number ) : number {
    return Math.floor( lerp( x, a, b, c, d ) );
}

export function clamp( x : number, a : number, b : number ) : number {
    const min = Math.min( a, b );
    const max = Math.max( a, b );

    return Math.min( Math.max( x, min ), max );
}

export function shrinkArray( array : Float32Array, targetLength : number ) : Float32Array {
    if ( array.length < targetLength ) {
        throw 'Target length must be smaller that original length';
    }

    const newArray = new Float32Array( targetLength );
    newArray[0] = array[0];

    for ( let i = 1; i < targetLength; ++ i ) {
        const arrayIndex0 = lerpi( i - 1, 0, targetLength, 0, array.length );
        const arrayIndex1 = lerpi( i - 0, 0, targetLength, 0, array.length );
        const arraySlice = array.slice( arrayIndex0, arrayIndex1 );
        const arraySliceMean = mean( arraySlice );

        newArray[i] = arraySliceMean;
    }

    return newArray;
}

export function minMaxScale( array : Float32Array ) : Float32Array {
    const valueMin = min( array )!;
    const valueMax = max( array )!;

    return Float32Array.from( array, value => {
        return lerp( value, valueMin, valueMax, 0.0, 1.0 );
    } );
}

export function floatsToBytes( array : Float32Array, min : number, max : number ) : Uint8Array {
    return Uint8Array.from( array, ( x : number ) => {
        return lerpi( x, min, max, 0, 255 );
    } );
}

export function bytesToFloats( array : Float32Array, min : number, max : number ) : Float32Array {
    return Float32Array.from( array, ( x : number ) => {
        return lerp( x, 0, 255, min, max );
    } );
}