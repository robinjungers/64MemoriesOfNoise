#version 300 es
precision mediump float;

in float intensity;

out vec4 color;

void main()
{
  if ( length( gl_PointCoord.xy - 0.5 ) > 0.5 )
  {
    discard;
  }

  float l = mix( 0.0, 0.2, intensity );
  float a = mix( 0.1, 0.3, intensity );
  color = vec4( l, l, l, a );
}