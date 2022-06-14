#version 300 es
precision mediump float;

uniform sampler2D noiseTex;
uniform vec2 focusCenter;
uniform float time;

in vec2 vUv;

out vec4 color;

void main()
{
  float d0 = 2.1 * length( vUv - 0.5 );
  float d1 = 2.1 * length( vUv - 0.5 + 0.08 * focusCenter );
  float d2 = 2.1 * length( vUv - 0.5 + 0.16 * focusCenter );
  
  float n0 = 1.9 * texture( noiseTex, 0.5 * vUv ).r;
  float n1 = 1.0 * texture( noiseTex, 0.8 * vUv ).r;

  vec3 c = vec3(
    mix( 0.74, 0.86, pow( d0 * n0, 2.1 + 0.14 * sin( 0.002 * time ) ) ),
    mix( 0.78, 0.89, pow( d1 * n0, 1.8 + 0.12 * sin( 0.001 * time ) ) ),
    mix( 0.74, 0.80, pow( d2 * n0, 0.3 + 0.18 * sin( 0.003 * time ) ) )
  );

  c = mix( c, vec3( 0.1 ), n1 );

  color = vec4( c, 1.0 );
}