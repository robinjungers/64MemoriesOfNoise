#version 300 es
precision mediump float;

uniform sampler2D noiseTex;
uniform vec2 focusCenter;
uniform float time;

in vec2 vUv;

out vec4 color;

float cbrt( float x )
{
  return pow( x, 1.0 / 3.0 );
}

vec3 linear_srgb_to_oklab( vec3 c) 
{
  float l = 0.4122214708f * c.r + 0.5363325363f * c.g + 0.0514459929f * c.b;
	float m = 0.2119034982f * c.r + 0.6806995451f * c.g + 0.1073969566f * c.b;
	float s = 0.0883024619f * c.r + 0.2817188376f * c.g + 0.6299787005f * c.b;

  float l_ = cbrt( l );
  float m_ = cbrt( m );
  float s_ = cbrt( s );

  return vec3(
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  );
}

vec3 oklab_to_linear_srgb( vec3 c )
{
  float l_ = c[0] + 0.3963377774 * c[1] + 0.2158037573 * c[2];
  float m_ = c[0] - 0.1055613458 * c[1] - 0.0638541728 * c[2];
  float s_ = c[0] - 0.0894841775 * c[1] - 1.2914855480 * c[2];

  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;

  return vec3(
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

void main()
{
  float d0 = 2.1 * length( vUv - 0.5 );
  float d1 = 2.1 * length( vUv - 0.5 + 0.08 * focusCenter );
  float d2 = 2.1 * length( vUv - 0.5 + 0.16 * focusCenter );
  float n = texture( noiseTex, vUv ).r;

  vec3 c = vec3(
    mix( 0.74, 0.86, pow( d0, 2.1 ) ),
    mix( 0.78, 0.89, pow( d1, 1.8 ) ),
    mix( 0.74, 0.80, pow( d2, 0.3 ) )
  );

  c = mix( c, vec3( 0.2 ), n );

  color = vec4( c, 1.0 );
}