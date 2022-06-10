#version 300 es
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float shiverProgress;
uniform float scale;
uniform float time;
uniform float timeMin;
uniform float timeMax;

in vec3 position;
in vec2 value;

out float vPosition;
out float vLevel;

void main()
{
  float inv = 1.0 - value.y;

  vPosition = value.x;
  vLevel = inv * inv;

  float t = 1.0 + 0.1 * cos( 0.0001 * time );
  float x = position.x * exp( 6.0 * t * ( inv - 1.1 ) );
  float y = position.y;

  gl_PointSize = mix( 5.0 * scale, 0.0, vLevel );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( x, y, 0.0, 1.0 );
}