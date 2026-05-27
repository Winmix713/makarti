import { SuperellipseState } from '../hooks/useSuperellipse';

export function generateSVG(state: SuperellipseState): string {
  const {
    width,
    height,
    radius,
    smoothing,
    colorMode,
    solidColor,
    solidOpacity,
    gradientStops,
    gradientAngle,
    gradientPosition
  } = state;

  // Generate gradient definitions
  let gradientDef = '';
  let fillValue = solidColor;

  if (colorMode !== 'solid') {
    const gradientId = `gradient-${Date.now()}`;

    if (colorMode === 'linear') {
      const angle = gradientAngle;
      const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180);
      const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180);
      const x2 = 50 - 50 * Math.cos((angle - 90) * Math.PI / 180);
      const y2 = 50 - 50 * Math.sin((angle - 90) * Math.PI / 180);

      gradientDef = `
    <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${gradientStops.map((stop) => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`).join('\n      ')}
    </linearGradient>`;
    } else if (colorMode === 'radial') {
      const [cy, cx] = gradientPosition.split(' ');
      const posMap: Record<string, number> = {
        top: 0,
        center: 50,
        bottom: 100,
        left: 0,
        right: 100
      };
      const cxVal = posMap[cx] || 50;
      const cyVal = posMap[cy] || 50;

      gradientDef = `
    <radialGradient id="${gradientId}" cx="${cxVal}%" cy="${cyVal}%">
      ${gradientStops.map((stop) => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`).join('\n      ')}
    </radialGradient>`;
    } else if (colorMode === 'conic') {
      // SVG doesn't support conic gradients natively, fallback to linear
      gradientDef = `
    <linearGradient id="${gradientId}">
      ${gradientStops.map((stop) => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`).join('\n      ')}
    </linearGradient>`;
    }

    fillValue = `url(#${gradientId})`;
  }

  // Generate path for superellipse
  let pathData = '';

  if (smoothing > 0) {
    const n = 2 + smoothing * 10;
    const a = width / 2;
    const b = height / 2;
    const steps = 360;
    const points: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const theta = i / steps * 2 * Math.PI;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const x =
      Math.pow(Math.abs(cosTheta), 2 / n) * a * Math.sign(cosTheta) + a;
      const y =
      Math.pow(Math.abs(sinTheta), 2 / n) * b * Math.sign(sinTheta) + b;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    pathData = `M ${points.join(' L ')} Z`;
  } else {
    // Use rounded rectangle
    const r = Math.min(radius, width / 2, height / 2);
    pathData = `
      M ${r},0
      L ${width - r},0
      Q ${width},0 ${width},${r}
      L ${width},${height - r}
      Q ${width},${height} ${width - r},${height}
      L ${r},${height}
      Q 0,${height} 0,${height - r}
      L 0,${r}
      Q 0,0 ${r},0
      Z
    `.trim();
  }

  // Build SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradientDef}
  </defs>
  <path d="${pathData}" fill="${fillValue}" opacity="${solidOpacity / 100}" />
</svg>`;

  return svg;
}

export function downloadSVG(
state: SuperellipseState,
filename: string = 'superellipse.svg')
{
  const svg = generateSVG(state);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}