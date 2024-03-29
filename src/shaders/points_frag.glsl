#version 300 es
precision mediump float;

uniform float shiverPosition;
uniform float shiverFade;
uniform float time;
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
    float f = activate( vPosition, shiverPosition ) * shiverFade;
    float ff = ( 0.5 + 2.0 * vLevel * vLevel );
    float fff = vLevel > 0.7 ? sin( time ) : 1.0;
  
    color = mix( c0, c1, f ) * ff * fff;
  } else {
    color = vec4( l, l, l, a );
  }
}