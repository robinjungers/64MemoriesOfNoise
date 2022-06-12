#version 300 es
precision mediump float;

uniform sampler2D tex0;
uniform sampler2D tex1;

in vec2 vUv;

out vec4 color;

void main()
{
  color = texture( tex0, vUv ) + 1.0 * texture( tex1, vUv );
}