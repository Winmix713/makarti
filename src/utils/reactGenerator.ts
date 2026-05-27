import { SuperellipseState } from '../hooks/useSuperellipse';

export function generateReactComponent(state: SuperellipseState): string {
  const lines: string[] = [];

  lines.push(`import React from 'react'`);
  lines.push(``);
  lines.push(`export function Superellipse() {`);

  // Build style object
  const styleLines: string[] = [];
  styleLines.push(`    width: ${state.width},`);
  styleLines.push(`    height: ${state.height},`);

  // Shape
  if (state.smoothing > 0) {
    const n = 2 + state.smoothing * 10;
    styleLines.push(`    // Superellipse n=${n.toFixed(1)}`);
    styleLines.push(`    borderRadius: '${state.radius}px',`);
  } else {
    styleLines.push(`    borderRadius: ${state.radius},`);
  }

  // Background
  if (state.colorMode === 'solid') {
    if (state.solidOpacity < 100) {
      styleLines.push(`    backgroundColor: '${state.solidColor}',`);
      styleLines.push(`    opacity: ${(state.solidOpacity / 100).toFixed(2)},`);
    } else {
      styleLines.push(`    backgroundColor: '${state.solidColor}',`);
    }
  } else {
    const stopsStr = state.gradientStops.
    map((s) => `${s.color} ${s.position}%`).
    join(', ');

    if (state.colorMode === 'linear') {
      styleLines.push(
        `    background: 'linear-gradient(${state.gradientAngle}deg, ${stopsStr})',`
      );
    } else if (state.colorMode === 'radial') {
      styleLines.push(
        `    background: 'radial-gradient(circle at ${state.gradientPosition}, ${stopsStr})',`
      );
    } else if (state.colorMode === 'conic') {
      styleLines.push(
        `    background: 'conic-gradient(from ${state.gradientAngle}deg, ${stopsStr})',`
      );
    }
  }

  // Effects
  const shadows: string[] = [];
  if (state.glowEnabled) {
    shadows.push(
      `0 0 ${state.glowBlur}px ${state.glowSpread}px ${state.glowColor}`
    );
  }
  if (shadows.length > 0) {
    styleLines.push(`    boxShadow: '${shadows.join(', ')}',`);
  }

  if (state.backdropBlur > 0) {
    styleLines.push(`    backdropFilter: 'blur(${state.backdropBlur}px)',`);
  }

  if (state.blur > 0) {
    styleLines.push(`    filter: 'blur(${state.blur}px)',`);
  }

  if (state.borderEnabled && state.strokeWidth > 0) {
    const borderStyle = state.strokeStyle || 'solid';
    styleLines.push(
      `    border: '${state.strokeWidth}px ${borderStyle} ${state.strokeColor}',`
    );
    if (state.strokeOpacity < 100) {
      styleLines.push(
        `    borderOpacity: ${(state.strokeOpacity / 100).toFixed(2)},`
      );
    }
  }

  lines.push(`  const style: React.CSSProperties = {`);
  lines.push(...styleLines);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  return <div style={style} />`);
  lines.push(`}`);

  return lines.join('\n');
}