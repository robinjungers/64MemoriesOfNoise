#version 300 es
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float shiverProgress;
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

  float t = 1.2 + 0.3 * cos( 0.0001 * time );
  float x = position.x * exp( 8.0 * t * ( inv - 1.05 ) );
  float y = position.y;

  vUv = vec2( x, y );

  float r0 = showHighlight ? 3.0 : 8.0;
  float r1 = showHighlight ? 1.5 : 0.5;

  gl_PointSize = mix( r0, r1, vLevel ) * scale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( x, y, 0.0, 1.0 );
}