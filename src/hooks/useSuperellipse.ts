import { useState, useRef, useCallback } from 'react';

export type GradientStop = {
  color: string;
  position: number;
};

export type SuperellipseState = {
  width: number;
  height: number;
  radius: number;
  smoothing: number;
  eccentricity: number;
  colorMode: 'solid' | 'linear' | 'radial' | 'conic';
  solidColor: string;
  solidOpacity: number;
  lightness: number;
  gradientAngle: number;
  gradientPosition: string;
  gradientStops: GradientStop[];
  glowEnabled: boolean;
  glowBlur: number;
  glowSpread: number;
  glowColor: string;
  backdropBlur: number;
  blur: number;
  noiseEnabled: boolean;
  noiseIntensity: number;
  glowMaskSize: number;
  glowScale: number;
  glowPositionX: number;
  glowPositionY: number;
  shadowDistance: number;
  shadowIntensity: number;
  borderEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokePosition: 'inside' | 'center' | 'outside';
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeOpacity: number;
  viewMode: 'shape' | 'button' | 'card';
  enabled: boolean;
  glowThemeMode: 'dark' | 'light';
};

export const DEFAULT_STATE: SuperellipseState = {
  width: 290,
  height: 350,
  radius: 52,
  smoothing: 0,
  eccentricity: 4.0,
  colorMode: 'solid',
  solidColor: '#FF9F00',
  solidOpacity: 100,
  lightness: 78,
  gradientAngle: 135,
  gradientPosition: 'center',
  gradientStops: [
  { color: '#6366F1', position: 0 },
  { color: '#A855F7', position: 50 },
  { color: '#EC4899', position: 100 }],


  glowEnabled: true,
  glowBlur: 20,
  glowSpread: 0,
  glowColor: '#FF9F00',
  backdropBlur: 0,
  blur: 0,
  noiseEnabled: true,
  noiseIntensity: 35,
  glowMaskSize: 0.3,
  glowScale: 0.9,
  glowPositionX: -590,
  glowPositionY: -1070,
  shadowDistance: 10,
  shadowIntensity: 30,
  borderEnabled: false,
  strokeColor: '#FFFFFF',
  strokeWidth: 0,
  strokePosition: 'inside',
  strokeStyle: 'solid',
  strokeOpacity: 100,
  viewMode: 'shape',
  enabled: true,
  glowThemeMode: 'dark'
};

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).
    toString(16).
    padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Proper OKLCH → RGB → Hex conversion for randomize
function sRgbToLinear(c: number): number {
  return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

function linearToSRgb(c: number): number {
  return c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
}

function oklchToHex(l: number, c: number, h: number): string {
  const hRad = h * (Math.PI / 180);
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const InvM2 = [
  [0.9999999985, 0.3963377922, 0.2158037581],
  [1.0000000089, -0.1055613423, -0.0638541748],
  [1.0000000547, -0.0894841821, -1.2914855379]];


  // CRITICAL FIX: Using correct combined LMS→sRGB matrix
  const InvM1 = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701]];


  const lms_ = [
  InvM2[0][0] * l + InvM2[0][1] * a + InvM2[0][2] * b,
  InvM2[1][0] * l + InvM2[1][1] * a + InvM2[1][2] * b,
  InvM2[2][0] * l + InvM2[2][1] * a + InvM2[2][2] * b];


  const lms = lms_.map((v) => v * v * v);
  const rgb = [
  InvM1[0][0] * lms[0] + InvM1[0][1] * lms[1] + InvM1[0][2] * lms[2],
  InvM1[1][0] * lms[0] + InvM1[1][1] * lms[1] + InvM1[1][2] * lms[2],
  InvM1[2][0] * lms[0] + InvM1[2][1] * lms[1] + InvM1[2][2] * lms[2]];


  const toHex = (v: number) => {
    const srgb = linearToSRgb(v);
    const clamped = Math.round(Math.max(0, Math.min(255, srgb * 255)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`.toUpperCase();
}

export function useSuperellipse(props?: {
  onStateChange?: (state: SuperellipseState) => void;
}) {
  const [state, setState] = useState<SuperellipseState>(DEFAULT_STATE);

  // Track latest state and callback in refs for reliable access
  const stateRef = useRef(state);
  stateRef.current = state;
  const onStateChangeRef = useRef(props?.onStateChange);
  onStateChangeRef.current = props?.onStateChange;

  const updateState = useCallback((updates: Partial<SuperellipseState>) => {
    const newState = { ...stateRef.current, ...updates };
    setState(newState);
    onStateChangeRef.current?.(newState);
  }, []);

  const updateGradientStop = (
  index: number,
  updates: Partial<GradientStop>) =>
  {
    const newStops = [...state.gradientStops];
    newStops[index] = { ...newStops[index], ...updates };
    updateState({ gradientStops: newStops });
  };

  const resetState = () => {
    setState(DEFAULT_STATE);
    onStateChangeRef.current?.(DEFAULT_STATE);
  };

  const randomizeGlow = () => {
    // Generate random OKLCH values for vibrant colors
    const randomL = 0.6 + Math.random() * 0.3; // 0.6-0.9 lightness
    const randomC = 0.15 + Math.random() * 0.2; // 0.15-0.35 chroma (vibrant)
    const randomH = Math.random() * 360; // full hue range

    const hex = oklchToHex(randomL, randomC, randomH);

    updateState({
      lightness: Math.round(randomL * 100),
      glowColor: hex,
      solidColor: hex,
      glowPositionX: -800 + Math.random() * 450,
      glowPositionY: -1400 + Math.random() * 800,
      glowScale: 0.7 + Math.random() * 2.3
    });
  };

  return {
    state,
    updateState,
    updateGradientStop,
    resetState,
    randomizeGlow
  };
}/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
