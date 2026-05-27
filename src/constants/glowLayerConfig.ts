/**
 * Glow Editor — Layer configuration constants
 *
 * Single source of truth for all 4 glow layer dimensions, blur radii,
 * opacities, positions, and slider ranges. Imported by the preview,
 * the CSS generator, and the control panel.
 */

export const GLOW_LAYER_CONFIG = {
  OUTER: {
    size: { width: 1620 }, // height is dynamic: 1800 × maskSize + 600
    blur: 180,
    opacity: 0.4
  },
  MID: {
    size: { width: 1170, height: 1170 },
    blur: 120,
    opacity: 0.6
  },
  INNER: {
    size: { width: 900, height: 720 },
    blur: 60,
    opacityDark: 1.0,
    opacityLight: 0.6
  },
  CORE: {
    size: { width: 540, height: 396 },
    color: '#FFFFFF',
    blurDark: 80,
    blurLight: 120,
    opacityDark: 0.4,
    opacityLight: 0.7,
    blendMode: 'normal' as const
  }
} as const;

export const LAYER_POSITIONS = {
  OUTER: { top: 360, left: 270 },
  MID: { top: 540, left: 414 },
  INNER: { top: 630, left: 504 },
  CORE: { top: 720, left: 630 }
} as const;

export const GLOW_CONTAINER = {
  width: 1530,
  height: 2160,
  maskStartPercent: 30,
  maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
} as const;

export const NOISE_SVG_CONFIG = {
  width: 200,
  height: 200,
  turbulenceType: 'fractalNoise' as const,
  baseFrequency: 0.8,
  numOctaves: 4
} as const;

/**
 * Outer glow height formula from the Glow Editor documentation.
 * height = 1800 × maskSize + 600  (px)
 */
export function calculateOuterGlowHeight(maskSize: number): number {
  return Math.round(1800 * maskSize + 600);
}

/**
 * Slider ranges. The maskSize slider operates in percentage (0–100)
 * and is converted to 0–1 in the state by the control panel.
 */
export const SLIDER_RANGES = {
  lightness: { min: 0, max: 100, step: 1 },
  chroma: { min: 0, max: 0.4, step: 0.001 },
  hue: { min: 0, max: 360, step: 1 },
  maskSize: { min: 0, max: 100, step: 1 },
  glowScale: { min: 0.5, max: 3, step: 0.1 },
  positionX: { min: -800, max: -350, step: 5 },
  positionY: { min: -1400, max: -600, step: 5 },
  noiseIntensity: { min: 0, max: 100, step: 1 }
} as const;

/* ---------- Legacy aliases (kept for any older imports) ---------- */
export const GLOW_LAYERS = {
  OUTER: {
    width: GLOW_LAYER_CONFIG.OUTER.size.width,
    blur: GLOW_LAYER_CONFIG.OUTER.blur,
    opacity: GLOW_LAYER_CONFIG.OUTER.opacity,
    blend: { dark: 'screen', light: 'normal' },
    top: LAYER_POSITIONS.OUTER.top,
    left: LAYER_POSITIONS.OUTER.left
  },
  MID: {
    width: GLOW_LAYER_CONFIG.MID.size.width,
    height: GLOW_LAYER_CONFIG.MID.size.height,
    blur: GLOW_LAYER_CONFIG.MID.blur,
    opacity: GLOW_LAYER_CONFIG.MID.opacity,
    blend: { dark: 'screen', light: 'normal' },
    top: LAYER_POSITIONS.MID.top,
    left: LAYER_POSITIONS.MID.left
  },
  INNER: {
    width: GLOW_LAYER_CONFIG.INNER.size.width,
    height: GLOW_LAYER_CONFIG.INNER.size.height,
    blur: GLOW_LAYER_CONFIG.INNER.blur,
    opacity: {
      dark: GLOW_LAYER_CONFIG.INNER.opacityDark,
      light: GLOW_LAYER_CONFIG.INNER.opacityLight
    },
    blend: { dark: 'screen', light: 'normal' },
    top: LAYER_POSITIONS.INNER.top,
    left: LAYER_POSITIONS.INNER.left
  },
  CORE: {
    width: GLOW_LAYER_CONFIG.CORE.size.width,
    height: GLOW_LAYER_CONFIG.CORE.size.height,
    blur: {
      dark: GLOW_LAYER_CONFIG.CORE.blurDark,
      light: GLOW_LAYER_CONFIG.CORE.blurLight
    },
    opacity: {
      dark: GLOW_LAYER_CONFIG.CORE.opacityDark,
      light: GLOW_LAYER_CONFIG.CORE.opacityLight
    },
    blend: GLOW_LAYER_CONFIG.CORE.blendMode,
    color: GLOW_LAYER_CONFIG.CORE.color,
    top: LAYER_POSITIONS.CORE.top,
    left: LAYER_POSITIONS.CORE.left
  }
} as const;

export const CONTAINER_CONFIG = {
  width: GLOW_CONTAINER.width,
  height: GLOW_CONTAINER.height,
  maskImage: GLOW_CONTAINER.maskImage
} as const;