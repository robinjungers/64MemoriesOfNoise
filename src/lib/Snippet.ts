import * as THREE from 'three';
import pointsVert from '../shaders/points_vert.glsl?raw';
import pointsFrag from '../shaders/points_frag.glsl?raw';
import { randFloat } from 'three/src/math/MathUtils';
import { lerp, lerpi, makeRandomChoiceGen } from './utils';
import { times } from 'lodash';

const laneCount = 100;

let randomLaneGen = makeRandomChoiceGen( times( laneCount, i => i ) )

export default class Snippet {
  public id : number;
  public time : number;
  public flatness : Uint8Array;

  constructor( id : number, time : number, flatness : Uint8Array ) {
    this.id = id;
    this.time = time;
    this.flatness = flatness;
  }

  get displayTime() : Date {
    return new Date( this.time * 1000 );
  }

  makeCanvasPoints() : THREE.Points {
    const lane = randomLaneGen();
    const count = this.flatness.length;
    const positions = new Float32Array( count * 2 );
    const values = new Float32Array( count * 2 );

    const xSpan = lerp( count, 0, 2000, 0.0, 1.0 );
    const xOffset = randFloat( -0.2, 0.2 );

    for ( let i = 0; i < count; ++ i ) {
      const x = randFloat( -xSpan, xSpan ) + xOffset;
      const valueIndex = lerpi( x, -xSpan, xSpan, 0, count - 1 );
      const valueRaw = this.flatness[valueIndex];
      const value = lerp( valueRaw, 0, 255, 0.0, 1.0 );
      const yMin = lerp( lane - 0.2 * value, 0, laneCount, -0.9, 0.9 );
      const yMax = lerp( lane + 0.2 * value, 0, laneCount, -0.9, 0.9 );
      const y = randFloat( yMin, yMax );

      positions[i * 2 + 0] = x;
      positions[i * 2 + 1] = y;
      
      values[i * 2 + 0] = lerp( i, 0, count, 0.0, 1.0 );
      values[i * 2 + 1] = value;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 2 ) );
    geometry.setAttribute( 'value', new THREE.Float32BufferAttribute( values, 2 ) );
    
    const material = new THREE.RawShaderMaterial( {
      vertexShader : pointsVert,
      fragmentShader : pointsFrag,
      uniforms : {},
      transparent : true,
      depthTest : false,
    } );
    
    const points = new THREE.Points( geometry, material );
    points.frustumCulled = false;

    return points;
  }
}