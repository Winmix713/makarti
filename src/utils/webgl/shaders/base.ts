// ============================================================================
// BASE SHADERS
// Phase 2 Foundation: Base vertex and fragment shaders for WebGL pipeline
// ============================================================================

/**
 * Base Vertex Shader
 * Standard vertex shader for full-screen quad rendering
 */
export const BASE_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uModelMatrix * vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Pass-through Fragment Shader
 * Simple shader that just samples and outputs the input texture
 */
export const PASSTHROUGH_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;

void main() {
  fragColor = texture(uSource, vTexCoord);
}
`;

/**
 * Chromatic Aberration Shader
 * Splits RGB channels for a lens distortion effect
 */
export const CHROMATIC_ABERRATION_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uAmount;
uniform float uAngle;

void main() {
  vec2 direction = vec2(cos(uAngle), sin(uAngle));
  vec2 offset = uAmount * direction * 0.01;
  
  float r = texture(uSource, vTexCoord + offset).r;
  float g = texture(uSource, vTexCoord).g;
  float b = texture(uSource, vTexCoord - offset).b;
  float a = texture(uSource, vTexCoord).a;
  
  fragColor = vec4(r, g, b, a);
}
`;

/**
 * Gaussian Blur Shader (Single Pass)
 * Two-pass blur shader for efficient blurring
 */
export const GAUSSIAN_BLUR_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform float uRadius;

const float SIGMA = 3.0;

float gaussian(float x) {
  return exp(-(x * x) / (2.0 * SIGMA * SIGMA));
}

void main() {
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;
  
  for (float i = -uRadius; i <= uRadius; i += 1.0) {
    float weight = gaussian(i);
    vec2 offset = i * uDirection / uResolution;
    color += texture(uSource, vTexCoord + offset) * weight;
    totalWeight += weight;
  }
  
  fragColor = color / totalWeight;
}
`;

/**
 * Glitch Effect Shader
 * Digital glitch distortion effect
 */
export const GLITCH_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uBlockSize;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  
  float blockY = floor(uv.y * uBlockSize) / uBlockSize;
  float noise = random(vec2(blockY, floor(uTime * 10.0)));
  
  if (noise < uIntensity * 0.1) {
    uv.x += (random(vec2(uTime, blockY)) - 0.5) * uIntensity * 0.1;
  }
  
  vec4 color;
  color.r = texture(uSource, uv + vec2(uIntensity * 0.01, 0.0)).r;
  color.g = texture(uSource, uv).g;
  color.b = texture(uSource, uv - vec2(uIntensity * 0.01, 0.0)).b;
  color.a = texture(uSource, uv).a;
  
  fragColor = color;
}
`;

/**
 * Hue Shift Shader
 * Adjusts the hue of the input image
 */
export const HUE_SHIFT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uHueShift;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 color = texture(uSource, vTexCoord);
  vec3 hsv = rgb2hsv(color.rgb);
  hsv.x = fract(hsv.x + uHueShift / 360.0);
  fragColor = vec4(hsv2rgb(hsv), color.a);
}
`;

/**
 * Brightness/Contrast Shader
 * Adjusts brightness and contrast
 */
export const BRIGHTNESS_CONTRAST_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uBrightness;
uniform float uContrast;

void main() {
  vec4 color = texture(uSource, vTexCoord);
  
  // Apply brightness
  color.rgb += uBrightness;
  
  // Apply contrast
  color.rgb = (color.rgb - 0.5) * (1.0 + uContrast) + 0.5;
  
  fragColor = color;
}
`;

/**
 * Vignette Shader
 * Darkens the edges of the image
 */
export const VIGNETTE_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uIntensity;
uniform float uSoftness;

void main() {
  vec4 color = texture(uSource, vTexCoord);
  
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vTexCoord, center);
  float vignette = smoothstep(uIntensity, uIntensity - uSoftness, dist);
  
  fragColor = vec4(color.rgb * vignette, color.a);
}
`;

/**
 * Pixelate Shader
 * Creates a pixelated/mosaic effect
 */
export const PIXELATE_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uPixelSize;

void main() {
  vec2 pixelSize = vec2(uPixelSize) / uResolution;
  vec2 coord = floor(vTexCoord / pixelSize) * pixelSize;
  fragColor = texture(uSource, coord);
}
`;

/**
 * RGB Split Shader
 * Separates RGB channels with offset
 */
export const RGB_SPLIT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;
uniform float uAngle;

void main() {
  vec2 offset = vec2(cos(uAngle), sin(uAngle)) * uAmount * 0.01;
  
  float r = texture(uSource, vTexCoord + offset).r;
  float g = texture(uSource, vTexCoord).g;
  float b = texture(uSource, vTexCoord - offset).b;
  float a = texture(uSource, vTexCoord).a;
  
  fragColor = vec4(r, g, b, a);
}
`;

/**
 * Shader Registry
 * Collection of all available shaders
 */
export const SHADER_REGISTRY = {
  passthrough: {
    vertex: BASE_VERTEX_SHADER,
    fragment: PASSTHROUGH_FRAGMENT_SHADER
  },
  chromaticAberration: {
    vertex: BASE_VERTEX_SHADER,
    fragment: CHROMATIC_ABERRATION_SHADER
  },
  gaussianBlur: {
    vertex: BASE_VERTEX_SHADER,
    fragment: GAUSSIAN_BLUR_SHADER
  },
  glitch: {
    vertex: BASE_VERTEX_SHADER,
    fragment: GLITCH_SHADER
  },
  hueShift: {
    vertex: BASE_VERTEX_SHADER,
    fragment: HUE_SHIFT_SHADER
  },
  brightnessContrast: {
    vertex: BASE_VERTEX_SHADER,
    fragment: BRIGHTNESS_CONTRAST_SHADER
  },
  vignette: {
    vertex: BASE_VERTEX_SHADER,
    fragment: VIGNETTE_SHADER
  },
  pixelate: {
    vertex: BASE_VERTEX_SHADER,
    fragment: PIXELATE_SHADER
  },
  rgbSplit: {
    vertex: BASE_VERTEX_SHADER,
    fragment: RGB_SPLIT_SHADER
  }
} as const;

export type ShaderName = keyof typeof SHADER_REGISTRY;