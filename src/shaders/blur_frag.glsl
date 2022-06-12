#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform sampler2D tex;

in vec2 vUv;

out vec4 fColor;
   
const int samples = 35;
const int LOD = 2;
const int sLOD = 1 << LOD;
const float sigma = float( samples ) * 0.25;

float gaussian( vec2 i ) 
{
  return exp( -0.5 * dot( i /= sigma, i ) ) / ( 6.28 * sigma * sigma );
}

vec4 blur( sampler2D sp, vec2 U, vec2 scale )
{
  vec4 O = vec4(0);  
  int s = samples/sLOD;
  
  for ( int i = 0; i < s*s; i++ ) {
      vec2 d = vec2(i%s, i/s)*float(sLOD) - float(samples)/2.;
      O += gaussian(d) * textureLod( sp, U + scale * d , float(LOD) );
  }
  
  return O / O.a;
}

void main()
{
    fColor = 1.2 * texture( tex, vUv ) + 1.7 * blur( tex, vUv, 0.5 / resolution );
}