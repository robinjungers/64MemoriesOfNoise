import * as THREE from 'three';

export default class Canvas {
  private renderer : THREE.WebGLRenderer;
  private camera : THREE.OrthographicCamera;
  private scene : THREE.Scene;

  constructor( container : HTMLDivElement ) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer( { antialias : true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 2.0;

    this.camera = new THREE.OrthographicCamera( -1.0, 1.0, 1.0, -1.0, 0.1, 1.0 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xc4c4c4 );
    this.scene.add( this.camera );

    container.appendChild( this.renderer.domElement );

    window.requestAnimationFrame( this.draw.bind( this ) );
  }

  private draw() {
    window.requestAnimationFrame( this.draw.bind( this ) );

    this.renderer.render( this.scene, this.camera );
  }
}