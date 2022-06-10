import * as THREE from 'three';
import pointsVert from '../shaders/points_vert.glsl?raw';
import pointsFrag from '../shaders/points_frag.glsl?raw';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import { lerp, makeRandomChoiceGen, randChoice } from './utils';
import { times } from 'lodash';

const LANE_COUNT = 100;
const POINT_COUNT = 1000;

let randomLaneGen = makeRandomChoiceGen( times( LANE_COUNT, i => i ) )

function makePoints( flatness : Uint8Array ) : THREE.Points {
  const sign = randChoice() ? -1.0 : 1.0;
  const lane = randomLaneGen();
  const positions = new Float32Array( POINT_COUNT * 3 );
  const values = new Float32Array( POINT_COUNT * 2 );

  for ( let i = 0; i < POINT_COUNT; ++ i ) {
    const sampleIndex = randInt( 0, flatness.length - 1 );
    const samplePosition = lerp( sampleIndex, 0, flatness.length, 0.0, 1.0 );
    const sampleValue = lerp( flatness[sampleIndex] + randFloat( -0.5, 0.5 ), 0, 255, 0.0, 1.0 );
    
    const laneSpan = 0.8 * sampleValue
    const ySpan = 0.95;
    const y = randFloat(
      lerp( lane - laneSpan, 0, LANE_COUNT, -ySpan, ySpan ),
      lerp( lane + laneSpan, 0, LANE_COUNT, -ySpan, ySpan ),
    );

    positions[i * 3 + 0] = sign;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = lane;
    
    values[i * 2 + 0] = samplePosition;
    values[i * 2 + 1] = sampleValue;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  geometry.setAttribute( 'value', new THREE.Float32BufferAttribute( values, 2 ) );
  
  const material = new THREE.RawShaderMaterial( {
    vertexShader : pointsVert,
    fragmentShader : pointsFrag,
    uniforms : {
      shiverProgress : { value : 0.0 },
      showHighlight : { value : false },
      scale : { value : 1.0 },
      time : { value : 0.0 },
    },
    transparent : true,
    depthTest : false,
  } );
  
  const points = new THREE.Points( geometry, material );
  points.frustumCulled = false;
  points.userData.isPoints = true;

  return points;
}

export default class Snippet {
  public id : number;
  public time : number;
  public flatness : Uint8Array;
  public points : THREE.Points;

  constructor( id : number, time : number, flatness : Uint8Array ) {
    this.id = id;
    this.time = time;
    this.flatness = flatness;
    this.points = makePoints( flatness );
  }

  set shaderShiverProgress( progress : number ) {
    ( this.points.material as any ).uniforms.shiverProgress.value = progress;
  }

  set shaderScale( scale : number ) {
    ( this.points.material as any ).uniforms.scale.value = scale;
  }

  set shaderTime( time : number ) {
    ( this.points.material as any ).uniforms.time.value = time;
  }

  set shaderShowHighlight( showHighlight : boolean ) {
    ( this.points.material as any ).uniforms.showHighlight.value = showHighlight;
  }

  get displayTime() : Date {
    return new Date( this.time * 1000 );
  }
}