import { SuperellipseState } from '../hooks/useSuperellipse';
import {
  GLOW_LAYER_CONFIG,
  LAYER_POSITIONS,
  GLOW_CONTAINER,
  calculateOuterGlowHeight,
  NOISE_SVG_CONFIG } from
'../constants/glowLayerConfig';

/**
 * Generate complete CSS for all 4 glow layers with theme awareness
 * Follows the Glow Editor documentation exactly
 */
export function generateGlowCSS(state: SuperellipseState): string {
  const isDark = state.glowThemeMode === 'dark';
  const {
    glowColor,
    glowScale,
    glowMaskSize,
    noiseEnabled,
    noiseIntensity
  } = state;

  // Calculate outer layer height using documentation formula
  const outerHeight = calculateOuterGlowHeight(glowMaskSize);

  // Generate CSS for each layer
  const containerCSS = generateContainerCSS(glowScale);
  const outerLayerCSS = generateOuterLayerCSS(glowColor, outerHeight, isDark);
  const midLayerCSS = generateMidLayerCSS(glowColor, isDark);
  const innerLayerCSS = generateInnerLayerCSS(glowColor, isDark);
  const coreLayerCSS = generateCoreLayerCSS(isDark);
  const noiseCSS = noiseEnabled ? generateNoiseCSS(noiseIntensity) : '';

  return `${containerCSS}\n${outerLayerCSS}\n${midLayerCSS}\n${innerLayerCSS}\n${coreLayerCSS}${noiseCSS}`;
}

/**
 * Generate glow container CSS with mask and scale
 */
function generateContainerCSS(glowScale: number): string {
  return `/* Glow Container */
.glow-effect {
  position: relative;
  transform: scale(${glowScale.toFixed(1)});
  mask-image: linear-gradient(to bottom, black ${GLOW_CONTAINER.maskStartPercent}%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black ${GLOW_CONTAINER.maskStartPercent}%, transparent 100%);
}`;
}

/**
 * Generate outer glow layer CSS (largest, most diffused)
 * Size: 1620 × dynamic (height = 1800 × maskSize + 600)
 * Blur: 180px
 * Opacity: 40%
 */
function generateOuterLayerCSS(color: string, height: number, isDark: boolean): string {
  const blendMode = isDark ? 'screen' : 'normal';

  return `
/* Outer Glow Layer */
.glow-layer-outer {
  position: absolute;
  top: ${LAYER_POSITIONS.OUTER.top}px;
  left: ${LAYER_POSITIONS.OUTER.left}px;
  width: ${GLOW_LAYER_CONFIG.OUTER.size.width}px;
  height: ${height}px;
  background-color: ${color};
  filter: blur(${GLOW_LAYER_CONFIG.OUTER.blur}px);
  opacity: ${GLOW_LAYER_CONFIG.OUTER.opacity};
  border-radius: 9999px;
  mix-blend-mode: ${blendMode};
}`;
}

/**
 * Generate mid glow layer CSS (medium-sized circular glow)
 * Size: 1170 × 1170
 * Blur: 120px
 * Opacity: 60%
 */
function generateMidLayerCSS(color: string, isDark: boolean): string {
  const blendMode = isDark ? 'screen' : 'normal';

  return `
/* Mid Glow Layer */
.glow-layer-mid {
  position: absolute;
  top: ${LAYER_POSITIONS.MID.top}px;
  left: ${LAYER_POSITIONS.MID.left}px;
  width: ${GLOW_LAYER_CONFIG.MID.size.width}px;
  height: ${GLOW_LAYER_CONFIG.MID.size.height}px;
  background-color: ${color};
  filter: blur(${GLOW_LAYER_CONFIG.MID.blur}px);
  opacity: ${GLOW_LAYER_CONFIG.MID.opacity};
  border-radius: 9999px;
  mix-blend-mode: ${blendMode};
}`;
}

/**
 * Generate inner glow layer CSS (sharpest colored layer)
 * Size: 900 × 720
 * Blur: 60px
 * Opacity: 100% (dark) / 60% (light)
 */
function generateInnerLayerCSS(color: string, isDark: boolean): string {
  const blendMode = isDark ? 'screen' : 'normal';
  const opacity = isDark ? GLOW_LAYER_CONFIG.INNER.opacityDark : GLOW_LAYER_CONFIG.INNER.opacityLight;

  return `
/* Inner Glow Layer */
.glow-layer-inner {
  position: absolute;
  top: ${LAYER_POSITIONS.INNER.top}px;
  left: ${LAYER_POSITIONS.INNER.left}px;
  width: ${GLOW_LAYER_CONFIG.INNER.size.width}px;
  height: ${GLOW_LAYER_CONFIG.INNER.size.height}px;
  background-color: ${color};
  filter: blur(${GLOW_LAYER_CONFIG.INNER.blur}px);
  opacity: ${opacity};
  border-radius: 9999px;
  mix-blend-mode: ${blendMode};
}`;
}

/**
 * Generate core white glow layer CSS (brightest point)
 * Size: 540 × 396
 * Blur: 80px (dark) / 120px (light)
 * Opacity: 40% (dark) / 70% (light)
 */
function generateCoreLayerCSS(isDark: boolean): string {
  const blur = isDark ? GLOW_LAYER_CONFIG.CORE.blurDark : GLOW_LAYER_CONFIG.CORE.blurLight;
  const opacity = isDark ? GLOW_LAYER_CONFIG.CORE.opacityDark : GLOW_LAYER_CONFIG.CORE.opacityLight;

  return `
/* Core White Glow Layer */
.glow-layer-core {
  position: absolute;
  top: ${LAYER_POSITIONS.CORE.top}px;
  left: ${LAYER_POSITIONS.CORE.left}px;
  width: ${GLOW_LAYER_CONFIG.CORE.size.width}px;
  height: ${GLOW_LAYER_CONFIG.CORE.size.height}px;
  background-color: ${GLOW_LAYER_CONFIG.CORE.color};
  filter: blur(${blur}px);
  opacity: ${opacity};
  border-radius: 9999px;
  mix-blend-mode: ${GLOW_LAYER_CONFIG.CORE.blendMode};
}`;
}

/**
 * Generate noise overlay CSS with inline SVG
 */
function generateNoiseCSS(noiseIntensity: number): string {
  const svgData = generateNoiseSVG();
  const opacityValue = (noiseIntensity / 100).toFixed(2);

  return `
/* Noise Overlay */
.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("${svgData}");
  background-repeat: repeat;
  background-size: ${NOISE_SVG_CONFIG.width}px ${NOISE_SVG_CONFIG.height}px;
  opacity: ${opacityValue};
  mix-blend-mode: overlay;
  pointer-events: none;
}`;
}

/**
 * Generate noise SVG with feTurbulence filter
 * Returns data URL for inline use
 */
function generateNoiseSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${NOISE_SVG_CONFIG.width}" height="${NOISE_SVG_CONFIG.height}">
  <filter id="noise">
    <feTurbulence type="${NOISE_SVG_CONFIG.turbulenceType}" baseFrequency="${NOISE_SVG_CONFIG.baseFrequency}" numOctaves="${NOISE_SVG_CONFIG.numOctaves}" result="noise" />
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)" />
</svg>`;

  // Encode SVG to data URL
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encoded}`;
}

/**
 * Generate CSS for a specific glow configuration
 * Used for exporting individual layer styles
 */
export function generateLayerCSS(
layerName: 'outer' | 'mid' | 'inner' | 'core',
color: string,
isDark: boolean,
glowMaskSize?: number)
: string {
  switch (layerName) {
    case 'outer':
      return generateOuterLayerCSS(color, glowMaskSize ? calculateOuterGlowHeight(glowMaskSize) : 600, isDark);
    case 'mid':
      return generateMidLayerCSS(color, isDark);
    case 'inner':
      return generateInnerLayerCSS(color, isDark);
    case 'core':
      return generateCoreLayerCSS(isDark);
    default:
      return '';
  }
}