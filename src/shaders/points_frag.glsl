#version 300 es
precision mediump float;

uniform float shiverProgress;
uniform bool showHighlight;

in float vPosition;
in float vLevel;
in vec2 vUv;

out vec4 color;

float activate( float x, float s ) {
  float t = tanh( 30.0 * ( x - s ) );

  return 1.0 - t * t;
}

float lerp( float x, float a, float b, float c, float d )
{
  return c + ( d - c ) * ( x - a ) / ( b - a );
}

float envelop( float p )
{
  return sin( p * 3.1415 );
  if ( p < 0.05 ) return lerp( p, 0.0, 0.1, 0.0, 1.0 );
  if ( p > 0.95 ) return lerp( p, 0.9, 1.0, 1.0, 1.0 );
  return 1.0;
}

void main()
{
  if ( length( gl_PointCoord.xy - 0.5 ) > 0.5 )
  {
    discard;
  }

  float l = mix( 0.1, 0.0, vLevel );
  float a = mix( 0.0, 0.1, vLevel );

  if ( showHighlight ) {
    vec4 c0 = vec4( 0.6, 0.3, 0.4, 0.0 );
    vec4 c1 = vec4( 0.5, 0.2, 0.1, a );
    float f = activate( vPosition, shiverProgress ) * envelop( shiverProgress );
    float ff = ( 0.5 + 2.0 * vLevel * vLevel );
  
    color = mix( c0, c1, f ) * ff;
  } else {
    color = vec4( l, l, l, a );
  }
}