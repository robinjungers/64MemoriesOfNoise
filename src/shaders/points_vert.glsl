#version 300 es
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float scale;
uniform float time;
uniform float timeMin;
uniform float timeMax;
uniform bool showHighlight;

in vec3 position;
in vec2 value;

out float vPosition;
out float vLevel;
out vec2 vUv;

void main()
{
  float inv = 1.0 - value.y;

  vPosition = value.x;
  vLevel = inv * inv;

  float x = position.x * exp( 8.0 * ( inv - 1.05 ) ) - 0.2;
  float y = position.y;

  vUv = vec2( x, y );

  float r0 = showHighlight ? 5.0 : 8.0;
  float r1 = showHighlight ? 2.0 : 1.0;

  gl_PointSize = mix( r0, r1, vLevel ) * scale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( x, y, 0.0, 1.0 );
}