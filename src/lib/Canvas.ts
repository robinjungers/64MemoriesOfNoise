import { debounce } from 'lodash';
import * as THREE from 'three';
import Snippet from './Snippet';
import SimplexNoise from 'simplex-noise';
import noiseTexURL from '../images/noise.jpg?url'
import quadVert from '../shaders/quad_vert.glsl?raw';
import bgFrag from '../shaders/bg_frag.glsl?raw';
import blurFrag from '../shaders/blur_frag.glsl?raw';
import composeFrag from '../shaders/compose_frag.glsl?raw';
import SnippetList from './SnippetList';

function setupBackground() : THREE.Mesh {
  const texture = new THREE.TextureLoader().load( noiseTexURL );
  const geometry = new THREE.PlaneGeometry( 2.0, 2.0 );
  const material = new THREE.RawShaderMaterial( {
    vertexShader : quadVert,
    fragmentShader : bgFrag,
    uniforms : {
      noiseTex : { value : texture },
      focusCenter : { value : new THREE.Vector2( 0.0, 0.0 ) },
      time : { value : 0.0 },
    },
  } );
  
  return new THREE.Mesh( geometry, material );
}

function setupFinalQuad() : THREE.Mesh {
  const geometry = new THREE.PlaneGeometry( 2.0, 2.0 );
  const material = new THREE.RawShaderMaterial( {
    vertexShader : quadVert,
    fragmentShader : composeFrag,
    uniforms : {
      tex0 : { value : null },
      tex1 : { value : null },
    },
  } );
  
  return new THREE.Mesh( geometry, material );
}

function setupBlurQuad() : THREE.Mesh {
  const geometry = new THREE.PlaneGeometry( 2.0, 2.0 );
  const material = new THREE.RawShaderMaterial( {
    vertexShader : quadVert,
    fragmentShader : blurFrag,
    uniforms : {
      tex : { value : null },
      resolution : { value : new THREE.Vector2( 0.0, 0.0 ) },
    },
  } );
  
  return new THREE.Mesh( geometry, material );
}

export default class Canvas {
  private renderer : THREE.WebGLRenderer;
  private camera : THREE.OrthographicCamera;
  private background : THREE.Mesh;
  private fullScene : THREE.Scene;
  private fullTarget : THREE.WebGLRenderTarget;
  private highlightTarget : THREE.WebGLRenderTarget;
  private blurTarget : THREE.WebGLRenderTarget;
  private blurQuad : THREE.Mesh;
  private finalQuad : THREE.Mesh;
  private simplex : SimplexNoise;
  private pixelSize : THREE.Vector2;
  private snippets : SnippetList;

  constructor( snippets : SnippetList, container : HTMLDivElement ) {
    this.snippets = snippets;
    this.snippets.on( 'added', this.onSnippetAdded.bind( this ) );
    this.snippets.on( 'removed', this.onSnippetRemoved.bind( this ) );

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.pixelSize = new THREE.Vector2();

    this.renderer = new THREE.WebGLRenderer( { antialias : false } );
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.renderer.getDrawingBufferSize( this.pixelSize );

    container.appendChild( this.renderer.domElement );

    console.debug( 'Canvas - WebGL2', this.renderer.capabilities.isWebGL2 );
    
    const ratio = w / h;
    this.camera = new THREE.OrthographicCamera( -ratio, ratio, 1.0, -1.0, 0.1, 100.0 );
    this.camera.position.set( 0.0, 0.0, 1.0 );
    this.camera.lookAt( 0.0, 0.0, 0.0 );

    this.background = setupBackground();

    this.fullScene = new THREE.Scene();
    this.fullTarget = new THREE.WebGLRenderTarget( w, h );

    this.highlightTarget = new THREE.WebGLRenderTarget( w, h );

    this.blurTarget = new THREE.WebGLRenderTarget( w, h );
    this.blurQuad = setupBlurQuad();

    this.finalQuad = setupFinalQuad();

    this.simplex = new SimplexNoise();

    window.addEventListener( 'resize', debounce( this.onResize.bind( this ), 500 ) );
  }

  private onSnippetAdded( snippet : Snippet ) {
    this.fullScene.add( snippet.points );
  }

  private onSnippetRemoved( snippet : Snippet ) {
    snippet.disposeAndRemoveFromParent();
  }

  private onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize( w, h );
    this.renderer.getDrawingBufferSize( this.pixelSize );

    const ratio = w / h;
    this.camera.left = -ratio;
    this.camera.right = ratio;
    this.camera.updateProjectionMatrix();

    this.fullTarget.setSize( w, h );
    this.blurTarget.setSize( w, h );
    this.highlightTarget.setSize( w, h );
  }

  draw( time : number ) {
    const bgUniforms = ( this.background.material as THREE.RawShaderMaterial ).uniforms;
    bgUniforms.time.value = time;
    bgUniforms.focusCenter.value.setX( this.simplex.noise2D( 0.00015 * time, 34.8 ) );
    bgUniforms.focusCenter.value.setY( this.simplex.noise2D( 0.00015 * time, 71.3 ) );

    this.snippets.forEach( ( snippet : Snippet ) => {
      snippet.uniforms.time.value = time;
      snippet.uniforms.scale.value = 1e-3 * this.pixelSize.y;
      snippet.uniforms.showHighlight.value = false;
    } );

    this.renderer.setRenderTarget( this.fullTarget );
    this.renderer.clear();
    this.renderer.render( this.background, this.camera );
    this.renderer.render( this.fullScene, this.camera );

    this.renderer.setRenderTarget( this.highlightTarget );
    this.renderer.clear();
    this.snippets.forEach( ( snippet : Snippet ) => void ( snippet.uniforms.showHighlight.value = true ) );
    this.renderer.render( this.fullScene, this.camera );

    this.renderer.setRenderTarget( this.blurTarget );
    this.renderer.clear();
    const blurUniforms = ( this.blurQuad.material as THREE.RawShaderMaterial ).uniforms;
    blurUniforms.tex.value = this.highlightTarget.texture;
    blurUniforms.resolution.value.setX( this.pixelSize.x );
    blurUniforms.resolution.value.setY( this.pixelSize.y );
    this.renderer.render( this.blurQuad, this.camera );

    this.renderer.setRenderTarget( null );
    this.renderer.clear();
    const finalUniforms = ( this.finalQuad.material as THREE.RawShaderMaterial ).uniforms;
    finalUniforms.tex0.value = this.fullTarget.texture;
    finalUniforms.tex1.value = this.blurTarget.texture;
    this.renderer.render( this.finalQuad, this.camera );
  }
}