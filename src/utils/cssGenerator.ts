import { SuperellipseState } from '../hooks/useSuperellipse';

// Helper to convert hex to rgb for opacity handling if needed
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
  {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } :
  null;
};

// Generate SVG Path for Superellipse (Squircle)
const getSuperellipsePath = (
width: number,
height: number,
radius: number,
smoothing: number) =>
{
  // If smoothing is 0, we can just use border-radius, but for the path generation:
  // This is a simplified approximation of a superellipse path for clip-path
  // In a real "Pro" tool, we might use a more complex formula.
  // For this implementation, we'll stick to a standard rect if smoothing is 0,
  // and a path if smoothing > 0.

  if (smoothing === 0) return '';

  const w = width;
  const h = height;
  // n = 2 is an ellipse. n > 2 is a superellipse.
  // Mapping smoothing 0..1 to n 2..10 roughly
  const n = 2 + smoothing * 10;

  // Generating a path using the superellipse equation: |x/a|^n + |y/b|^n = 1
  // We'll generate points and create a polygon/path
  const a = w / 2;
  const b = h / 2;
  const steps = 360; // Resolution
  let path = 'M ';

  for (let i = 0; i <= steps; i++) {
    const theta = i / steps * 2 * Math.PI;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const x = Math.pow(Math.abs(cosTheta), 2 / n) * a * Math.sign(cosTheta) + a;
    const y = Math.pow(Math.abs(sinTheta), 2 / n) * b * Math.sign(sinTheta) + b;

    path += `${x.toFixed(2)} ${y.toFixed(2)}`;
    if (i < steps) path += ' L ';
  }

  path += ' Z';
  return `path('${path}')`;
};

export const generateCSS = (state: SuperellipseState): string => {
  const lines: string[] = [];

  // Size
  lines.push(`width: ${state.width}px;`);
  lines.push(`height: ${state.height}px;`);

  // Shape (Border Radius vs Clip Path)
  if (state.smoothing > 0) {
    // Use clip-path for smoothing
    // Note: In a real production app, we might want to output the SVG separately
    // or use a mask. For this demo, we'll generate the path.
    const path = getSuperellipsePath(
      state.width,
      state.height,
      state.radius,
      state.smoothing
    );
    lines.push(`clip-path: ${path};`);
    // Fallback for non-supporting browsers could be added here
  } else {
    lines.push(`border-radius: ${state.radius}px;`);
  }

  // Background
  if (state.colorMode === 'solid') {
    if (state.solidOpacity < 100) {
      const rgb = hexToRgb(state.solidColor);
      if (rgb) {
        lines.push(
          `background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.solidOpacity / 100});`
        );
      } else {
        lines.push(`background-color: ${state.solidColor};`);
        lines.push(`opacity: ${state.solidOpacity / 100};`);
      }
    } else {
      lines.push(`background-color: ${state.solidColor};`);
    }
  } else {
    // Gradients
    const stopsStr = state.gradientStops.
    map((stop) => `${stop.color} ${stop.position}%`).
    join(', ');

    if (state.colorMode === 'linear') {
      lines.push(
        `background: linear-gradient(${state.gradientAngle}deg, ${stopsStr});`
      );
    } else if (state.colorMode === 'radial') {
      lines.push(
        `background: radial-gradient(circle at ${state.gradientPosition}, ${stopsStr});`
      );
    } else if (state.colorMode === 'conic') {
      lines.push(
        `background: conic-gradient(from ${state.gradientAngle}deg, ${stopsStr});`
      );
    }
  }

  // Effects
  const effects: string[] = [];

  if (state.glowEnabled) {
    effects.push(
      `0 0 ${state.glowBlur}px ${state.glowSpread}px ${state.glowColor}`
    );
  }

  if (effects.length > 0) {
    lines.push(`box-shadow: ${effects.join(', ')};`);
  }

  if (state.backdropBlur > 0) {
    lines.push(`backdrop-filter: blur(${state.backdropBlur}px);`);
  }

  if (state.borderEnabled) {
    lines.push(`border: 1px solid rgba(255, 255, 255, 0.2);`);
  }

  return lines.join('\n');
};