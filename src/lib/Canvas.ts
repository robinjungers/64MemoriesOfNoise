import * as THREE from 'three';
import Snippet from './Snippet';

export default class Canvas {
  private renderer : THREE.WebGLRenderer;
  private camera : THREE.OrthographicCamera;
  private scene : THREE.Scene;

  constructor( container : HTMLDivElement ) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer( { antialias : false } );
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.renderer.setAnimationLoop( this.draw.bind( this ) );

    container.appendChild( this.renderer.domElement );

    console.debug( 'Canvas - WebGL2', this.renderer.capabilities.isWebGL2 );
    
    const ratio = w / h;
    this.camera = new THREE.OrthographicCamera( -ratio, ratio, 1.0, -1.0, 0.1, 100.0 );
    this.camera.position.set( 0.0, 0.0, 1.0 );
    this.camera.lookAt( 0.0, 0.0, 0.0 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xc4c4c4 );

    window.addEventListener( 'resize', this.resize.bind( this ) );
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

  private draw() {
    this.renderer.setRenderTarget( null );
    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
  }

  addSnippet( snippet : Snippet ) {
    const points = snippet.makeCanvasPoints();

    this.scene.add( points );
  }
}