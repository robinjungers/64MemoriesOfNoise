#version 300 es
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float shiverProgress;

in vec3 position;
in vec2 value;

out float intensity;

float lerp( float x, float a, float b, float c, float d )
{
  return c + ( d - c ) * ( x - a ) / ( b - a );
}

float rand( vec2 co )
{
  return fract( sin( dot( co, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}

void main()
{
  intensity = 1.0 - value.y;
  intensity = intensity * intensity;
  // intensity = abs( value.x - shiverProgress );

  gl_PointSize = mix( 15.0, 1.0, intensity );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}