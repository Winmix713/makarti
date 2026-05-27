import React from 'react';
import { RulerIcon, SparklesIcon, WavesIcon } from 'lucide-react';
import { SuperellipseState } from '../hooks/useSuperellipse';
interface CanvasHUDProps {
  state: SuperellipseState;
}
export function CanvasHUD({ state }: CanvasHUDProps) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg">
        {/* Dimensions */}
        <div className="flex items-center gap-1.5">
          <RulerIcon className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-mono font-medium text-foreground tabular-nums">
            {state.width}
            <span className="text-muted-foreground mx-0.5">×</span>
            {state.height}
          </span>
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* Eccentricity */}
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-mono font-medium text-foreground tabular-nums">
            n={state.eccentricity.toFixed(1)}
          </span>
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* Smoothing */}
        <div className="flex items-center gap-1.5">
          <WavesIcon className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-mono font-medium text-foreground tabular-nums">
            {(state.smoothing * 100).toFixed(0)}%
          </span>
        </div>

        {/* Glow indicator */}
        {state.enabled && state.glowEnabled &&
        <>
            <div className="w-px h-3.5 bg-border" />
            <div className="flex items-center gap-1.5">
              <div
              className="w-2.5 h-2.5 rounded-full shadow-sm border border-foreground/10"
              style={{
                backgroundColor: state.glowColor
              }} />
            
              <span className="text-[10px] font-mono text-muted-foreground">
                {state.glowColor.toUpperCase()}
              </span>
            </div>
          </>
        }
      </div>
    </div>);

}