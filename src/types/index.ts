// ============================================================================
// SUPERELLIPSE GENERATOR PRO 3.0 - TYPE DEFINITIONS
// Phase 1: Infrastructure Foundation
// ============================================================================

// ============================================================================
// LAYER SYSTEM TYPES
// ============================================================================

export type LayerType = 'shape' | 'image' | 'text' | 'group' | 'adjustment';

export type BlendMode =
'normal' |
'multiply' |
'screen' |
'overlay' |
'darken' |
'lighten' |
'color-dodge' |
'color-burn' |
'hard-light' |
'soft-light' |
'difference' |
'exclusion' |
'hue' |
'saturation' |
'color' |
'luminosity';

export interface Transform {
  x: number;
  y: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  anchorX: number; // 0-1
  anchorY: number; // 0-1
}

export interface MaskSettings {
  type: 'alpha' | 'luminance';
  inverted: boolean;
  sourceLayerId: string;
}

export interface LayerEffect {
  id: string;
  type: string;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
}

export interface Layer {
  // Identification
  id: string;
  name: string;
  type: LayerType;

  // State
  visible: boolean;
  locked: boolean;
  solo: boolean;

  // Appearance
  opacity: number;
  blendMode: BlendMode;

  // Transform
  transform: Transform;

  // Content (type-dependent)
  content: LayerContent;

  // Effects
  effects: LayerEffect[];

  // Masking
  mask?: MaskSettings;

  // Hierarchy
  parentId: string | null;
  children: string[];
  zIndex: number;

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
  };
}

// ============================================================================
// LAYER CONTENT TYPES
// ============================================================================

export type LayerContent =
ShapeContent |
ImageContent |
TextContent |
GroupContent |
AdjustmentContent;

export interface ShapeContent {
  type: 'superellipse' | 'rectangle' | 'ellipse' | 'path';
  params: SuperellipseParams | RectParams | EllipseParams | PathParams;
  fill: FillStyle;
  stroke: StrokeStyle;
}

export interface SuperellipseParams {
  width: number;
  height: number;
  radius: number;
  smoothing: number;
  eccentricity: number;
  cornerExponents?: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
}

export interface RectParams {
  width: number;
  height: number;
  cornerRadius: number;
}

export interface EllipseParams {
  radiusX: number;
  radiusY: number;
}

export interface PathParams {
  d: string; // SVG path data
}

export interface FillStyle {
  type: 'solid' | 'gradient';
  color?: string;
  gradient?: GradientDefinition;
  opacity: number;
}

export interface StrokeStyle {
  enabled: boolean;
  color: string;
  width: number;
  position: 'inside' | 'center' | 'outside';
  style: 'solid' | 'dashed' | 'dotted';
  opacity: number;
}

export interface GradientDefinition {
  type: 'linear' | 'radial' | 'conic';
  angle?: number;
  position?: string;
  stops: Array<{color: string;position: number;}>;
}

export interface ImageContent {
  assetId: string;
  fit: 'contain' | 'cover' | 'fill' | 'none';
  position: {x: number;y: number;};
}

export interface TextContent {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
}

export interface GroupContent {
  expanded: boolean;
}

export interface AdjustmentContent {
  adjustmentType: 'brightness' | 'contrast' | 'hue' | 'saturation';
  params: Record<string, number>;
}

// ============================================================================
// ASSET LIBRARY TYPES
// ============================================================================

export type AssetType = 'image' | 'font' | 'video';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  createdAt: Date;
}

export interface ImageAsset extends Asset {
  type: 'image';
  originalName: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number; // bytes
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'gif';
  usedIn: string[]; // Project IDs
}

export interface FontAsset extends Asset {
  type: 'font';
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  variants: Array<{
    weight: number;
    style: 'normal' | 'italic';
    url: string;
  }>;
  source: 'google' | 'custom' | 'system';
  previewText?: string;
}

export interface AssetFilters {
  type?: AssetType;
  format?: string;
  tags?: string[];
  dateRange?: {start: Date;end: Date;};
}

// ============================================================================
// PROJECT STRUCTURE TYPES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;

  canvas: CanvasSettings;
  layers: Layer[];
  assets: AssetReference[];
  timeline?: Timeline;

  metadata: {
    author?: string;
    description?: string;
    tags?: string[];
    thumbnail?: string;
  };
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  fps: number;
}

export interface AssetReference {
  assetId: string;
  layerId: string;
}

// ============================================================================
// ANIMATION TYPES (Phase 3 preparation)
// ============================================================================

export interface Timeline {
  duration: number; // milliseconds
  fps: number;
  currentTime: number;
  playing: boolean;
  loop: boolean;
  playbackSpeed: number;
  tracks: Track[];
  markers: Marker[];
}

export interface Track {
  id: string;
  layerId: string;
  name: string;
  color: string;
  locked: boolean;
  muted: boolean;
  collapsed: boolean;
  keyframes: Keyframe[];
}

export interface Keyframe {
  id: string;
  time: number;
  properties: Partial<AnimatableProperties>;
  easing: EasingDefinition;
  handleIn?: {x: number;y: number;};
  handleOut?: {x: number;y: number;};
}

export interface AnimatableProperties {
  // Transform
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  anchorX: number;
  anchorY: number;

  // Appearance
  opacity: number;

  // Superellipse specific
  exp: number;
  width: number;
  height: number;
  cornerTopLeft: number;
  cornerTopRight: number;
  cornerBottomRight: number;
  cornerBottomLeft: number;

  // Color (OKLCH)
  hue: number;
  chroma: number;
  lightness: number;

  // Glow
  glowScale: number;
  glowPositionX: number;
  glowPositionY: number;
  glowOpacity: number;
  glowBlur: number;

  // Effect parameters (dynamic)
  [effectParam: string]: number;
}

export type EasingDefinition =
{type: 'preset';name: PresetEasing;} |
{type: 'cubic-bezier';p1x: number;p1y: number;p2x: number;p2y: number;} |
{type: 'spring';stiffness: number;damping: number;mass: number;} |
{type: 'steps';count: number;direction: 'start' | 'end';};

export type PresetEasing =
'linear' |
'ease' |
'ease-in' |
'ease-out' |
'ease-in-out' |
'ease-in-quad' |
'ease-out-quad' |
'ease-in-out-quad' |
'ease-in-cubic' |
'ease-out-cubic' |
'ease-in-out-cubic' |
'ease-in-elastic' |
'ease-out-elastic' |
'ease-in-bounce' |
'ease-out-bounce';

export interface Marker {
  id: string;
  time: number;
  label: string;
  color?: string;
}

// ============================================================================
// WEBGL TYPES (Phase 2 preparation)
// ============================================================================

export interface ShaderProgram {
  id: string;
  name: string;
  category: EffectCategory;
  vertex: string;
  fragment: string;
  defaultUniforms: Record<string, UniformValue>;
}

export type EffectCategory =
'blur' |
'distortion' |
'color' |
'noise' |
'glow' |
'edge' |
'geometric' |
'blend' |
'3d' |
'special';

export type UniformValue = number | number[] | boolean | WebGLTexture;

export interface ShaderPass {
  shader: ShaderProgram;
  enabled: boolean;
  uniforms: Record<string, UniformValue>;
  renderTarget: WebGLFramebuffer | null;
}

// ============================================================================
// INTERACTION TYPES (Phase 3 preparation)
// ============================================================================

export interface Interaction {
  id: string;
  name: string;
  trigger: InteractionTrigger;
  conditions: Condition[];
  actions: Action[];
}

export type InteractionTrigger =
{type: 'click';target: 'self' | string;} |
{type: 'hover';target: 'self' | string;} |
{type: 'scroll';threshold: number;direction: 'up' | 'down' | 'both';} |
{type: 'viewport';intersection: number;} |
{type: 'time';delay: number;} |
{type: 'load';};

export type Condition =
{
  type: 'state';
  property: string;
  operator: '==' | '!=' | '>' | '<';
  value: any;
} |
{type: 'breakpoint';min?: number;max?: number;};

export type Action =
{type: 'animate';animationId: string;options?: AnimationOptions;} |
{type: 'setState';property: string;value: any;} |
{type: 'toggle';property: string;} |
{type: 'navigate';url: string;target?: '_blank' | '_self';} |
{type: 'scroll';target: string;behavior?: 'smooth' | 'instant';};

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: EasingDefinition;
  loop?: boolean;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat =
'png' |
'webp' |
'svg' |
'json' |
'react' |
'vanilla' |
'lottie';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // 0-100 for raster formats
  scale?: number; // 1x, 2x, 3x
  includeAssets?: boolean;
  minify?: boolean;
}