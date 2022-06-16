import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import pointsVert from '../shaders/points_vert.glsl?raw';
import pointsFrag from '../shaders/points_frag.glsl?raw';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import { lerp, makeRandomChoiceGen } from './utils';
import { times } from 'lodash';

const LANE_COUNT = 64;
const POINT_COUNT = 1000;

let randomLaneGen = makeRandomChoiceGen( times( LANE_COUNT, i => i ) )

type NumberUniform = THREE.IUniform<number>;

function makePoints( flatness : Uint8Array ) : THREE.Points {
  const sign = 1.0;//randChoice() ? -1.0 : 1.0;
  const lane = randomLaneGen();
  const positions = new Float32Array( POINT_COUNT * 3 );
  const values = new Float32Array( POINT_COUNT * 2 );

  for ( let i = 0; i < POINT_COUNT; ++ i ) {
    const sampleIndex = randInt( 0, flatness.length - 1 );
    const samplePosition = lerp( sampleIndex, 0, flatness.length, 0.0, 1.0 );
    const sampleValue = lerp( flatness[sampleIndex], 0, 255, 0.0, 1.0 );
    
    const laneSpan = 1.9 * sampleValue;
    const ySpan = 0.95;
    const y = randFloat(
      lerp( lane - laneSpan, 0, LANE_COUNT - 1, -ySpan, ySpan ),
      lerp( lane + laneSpan, 0, LANE_COUNT - 1, -ySpan, ySpan ),
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
      shiverPosition : { value : 0.0 },
      shiverFade : { value : 0.0 },
      showHighlight : { value : false },
      drift : { value : 0.0 },
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
  public latitude : number;
  public longitude : number;
  public flatness : Uint8Array;
  public points : THREE.Points;
  private driftTween : TWEEN.Tween<NumberUniform> | null = null;

  constructor(
    id : number,
    time : number,
    latitude : number,
    longitude : number,
    flatness : Uint8Array,
  ) {
    this.id = id;
    this.time = time;
    this.latitude = latitude;
    this.longitude = longitude;
    this.flatness = flatness;
    this.points = makePoints( flatness );
  }

  get uniforms() {
    return ( this.points.material as THREE.RawShaderMaterial ).uniforms;
  }

  animateDrift( drift : number ) {
    this.driftTween?.stop();
    this.driftTween = new TWEEN.Tween<NumberUniform>( this.uniforms.drift );
    this.driftTween.to( { value : drift }, 2e3 );
    this.driftTween.easing( TWEEN.Easing.Quintic.InOut );
    this.driftTween.start();
  }

  get displayTime() : Date {
    return new Date( this.time * 1000 );
  }

  disposeAndRemoveFromParent() {
    ( this.points.material as THREE.Material ).dispose();
    ( this.points.geometry as THREE.BufferGeometry ).dispose();
    this.points.removeFromParent();
  }
}