import { debounce } from 'lodash';
import * as THREE from 'three';
import Snippet from './Snippet';
import SimplexNoise from 'simplex-noise';
import noiseTexURL from '../images/noise.png?url'
import bgVert from '../shaders/bg_vert.glsl?raw';
import bgFrag from '../shaders/bg_frag.glsl?raw';

function setupBackground() {
  const texture = new THREE.TextureLoader().load( noiseTexURL );
  const geometry = new THREE.PlaneGeometry( 2.0, 2.0 );
  const material = new THREE.RawShaderMaterial( {
    vertexShader : bgVert,
    fragmentShader : bgFrag,
    uniforms : {
      noiseTex : { value : texture },
      focusCenter : { value : new THREE.Vector2( 0.0, 0.0 ) },
      time : { value : 0.0 },
    },
  } );
  
  return new THREE.Mesh( geometry, material );
}

export default class Canvas {
  private renderer : THREE.WebGLRenderer;
  private camera : THREE.OrthographicCamera;
  private background : THREE.Mesh;
  private scene : THREE.Scene;
  private simplex : SimplexNoise;

  constructor( container : HTMLDivElement ) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer( { antialias : false } );
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );

    container.appendChild( this.renderer.domElement );

    console.debug( 'Canvas - WebGL2', this.renderer.capabilities.isWebGL2 );
    
    const ratio = w / h;
    this.camera = new THREE.OrthographicCamera( -ratio, ratio, 1.0, -1.0, 0.1, 100.0 );
    this.camera.position.set( 0.0, 0.0, 1.0 );
    this.camera.lookAt( 0.0, 0.0, 0.0 );

    this.background = setupBackground();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xc4c4c4 );
    this.scene.add( this.background );

    this.simplex = new SimplexNoise();

    window.addEventListener( 'resize', debounce( this.resize.bind( this ), 500 ) );
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize( w, h );

    const ratio = w / h;
    this.camera.left = -ratio;
    this.camera.right = ratio;
    this.camera.updateProjectionMatrix();
  }

  draw( time : number ) {
    const bgUniforms = ( this.background.material as any ).uniforms;
    bgUniforms.time.value = time;
    bgUniforms.focusCenter.value.setX( this.simplex.noise2D( 0.0001 * time, 34.8 ) );
    bgUniforms.focusCenter.value.setY( this.simplex.noise2D( 0.0001 * time, 71.3 ) );

    this.renderer.setRenderTarget( null );
    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
  }

  applyShiverProgress( snippet : Snippet, progress : number ) {
    const object = this.scene.getObjectByName( snippet.sceneName );

    if ( !object ) {
      throw 'Undefined snippet mesh';
    }

    const mesh = ( object as THREE.Mesh );
    const material = ( mesh.material as any );
    
    material.uniforms.shiverProgress.value = progress;
  }

  addSnippet( snippet : Snippet ) {
    const points = snippet.makeCanvasPoints();

    this.scene.add( points );
  }
}