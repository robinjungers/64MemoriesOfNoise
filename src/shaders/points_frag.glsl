#version 300 es
precision mediump float;

uniform float shiverProgress;
uniform bool showHighlight;

in float vPosition;
in float vLevel;

out vec4 color;

float activate( float x, float s ) {
  float t = tanh( 15.0 * ( x - s ) );

  return 1.0 - t * t;
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
    vec4 c0 = vec4( 0.6, 0.2, 0.5, 0.0 );
    vec4 c1 = vec4( 0.9, 0.6, 0.1, a );
  
    color = mix( c0, c1, activate( vPosition, shiverProgress ) * sin( shiverProgress * 3.1415 ) );
  } else {
    color = vec4( l, l, l, a );
  }
}