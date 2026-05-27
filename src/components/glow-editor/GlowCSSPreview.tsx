import React, { useCallback, useState } from 'react';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { SuperellipseState } from '../../hooks/useSuperellipse';
import { generateGlowCSS } from '../../utils/glowCssGenerator';
import { CollapsibleSection } from './CollapsibleSection';
import { calculateOuterGlowHeight } from '../../constants/glowLayerConfig';

interface GlowCSSPreviewProps {
  state: SuperellipseState;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * GlowCSSPreview Component
 * Displays the generated CSS for all 4 glow layers with documentation
 * 
 * Shows:
 * - Complete CSS code for all 4 layers
 * - Container CSS with mask and scale
 * - Noise overlay CSS (if enabled)
 * - Calculated values (heights, opacities, blur radii)
 */
export function GlowCSSPreview({
  state,
  expanded,
  onToggle
}: GlowCSSPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Generate complete CSS
  const cssCode = generateGlowCSS(state);

  /**
   * Copy CSS to clipboard
   */
  const handleCopyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  // Calculate displayed values
  const outerHeight = calculateOuterGlowHeight(state.glowMaskSize);
  const isDark = state.glowThemeMode === 'dark';

  return (
    <CollapsibleSection
      title="CSS Code"
      expanded={expanded}
      onToggle={onToggle}>
      
      {/* CSS Code Block */}
      <div className="relative bg-secondary/50 border border-border rounded-lg overflow-hidden group mb-4">
        {/* Copy Button */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopyCSS}
            className="p-1.5 rounded-md bg-background/80 backdrop-blur hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shadow-sm border border-border/50">
            
            {copied ?
            <CheckIcon className="w-3.5 h-3.5 text-green-500" /> :

            <CopyIcon className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* CSS Code */}
        <pre className="p-3 pr-10 text-[10px] leading-relaxed font-mono text-muted-foreground overflow-x-auto max-h-96 custom-scrollbar whitespace-pre-wrap break-words">
          {cssCode}
        </pre>
      </div>

      {/* Calculated Values Display */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-[9px]">
        {/* Theme Mode */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Theme
          </div>
          <div className="text-foreground font-mono">
            {isDark ? 'Dark' : 'Light'}
          </div>
        </div>

        {/* Glow Scale */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Scale
          </div>
          <div className="text-foreground font-mono">
            {state.glowScale.toFixed(1)}x
          </div>
        </div>

        {/* Outer Glow Height */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Outer Height
          </div>
          <div className="text-foreground font-mono">
            {outerHeight}px
          </div>
        </div>

        {/* Mask Size */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Mask Size
          </div>
          <div className="text-foreground font-mono">
            {Math.round(state.glowMaskSize * 100)}%
          </div>
        </div>

        {/* Noise Status */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Noise
          </div>
          <div className="text-foreground font-mono">
            {state.noiseEnabled ? Math.round(state.noiseIntensity) + '%' : 'Off'}
          </div>
        </div>

        {/* Position */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded">
          <div className="text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">
            Position
          </div>
          <div className="text-foreground font-mono">
            ({state.glowPositionX}, {state.glowPositionY})
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="space-y-2 text-[9px]">
        <p className="text-muted-foreground">
          Simulating CSS{' '}
          <code className="bg-secondary px-1 py-0.5 rounded text-[9px] border border-border/50">
            backdrop-filter
          </code>
          {' '}&{' '}
          <code className="bg-secondary px-1 py-0.5 rounded text-[9px] border border-border/50">
            mask-image
          </code>
        </p>

        {/* Layer Information */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded space-y-1 text-muted-foreground">
          <div className="font-semibold text-foreground mb-2">Layer Information</div>
          
          <div className="flex justify-between">
            <span>Outer Glow:</span>
            <span className="font-mono">180px blur, 40% opacity</span>
          </div>
          <div className="flex justify-between">
            <span>Mid Glow:</span>
            <span className="font-mono">120px blur, 60% opacity</span>
          </div>
          <div className="flex justify-between">
            <span>Inner Glow:</span>
            <span className="font-mono">60px blur, {isDark ? '100%' : '60%'} opacity</span>
          </div>
          <div className="flex justify-between">
            <span>Core White:</span>
            <span className="font-mono">{isDark ? '80px' : '120px'} blur, {isDark ? '40%' : '70%'} opacity</span>
          </div>

          {state.noiseEnabled &&
          <div className="flex justify-between pt-1 border-t border-border/50 mt-1">
              <span>Noise Overlay:</span>
              <span className="font-mono">
                {(state.noiseIntensity / 100).toFixed(2)} opacity
              </span>
            </div>
          }
        </div>

        {/* Theme Mode Info */}
        <div className="bg-secondary/30 border border-border/50 p-2 rounded space-y-1 text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">Blend Mode</div>
          {isDark ?
          <div>
              <span className="text-foreground">Dark Mode:</span>
              <div className="ml-2">Uses <code className="bg-secondary px-1 py-0.5 rounded text-[8px] border border-border/50">mix-blend-mode: screen</code></div>
              <div className="ml-2 text-[8px]">Creates vivid, neon-like glow effect</div>
            </div> :

          <div>
              <span className="text-foreground">Light Mode:</span>
              <div className="ml-2">Uses <code className="bg-secondary px-1 py-0.5 rounded text-[8px] border border-border/50">mix-blend-mode: normal</code></div>
              <div className="ml-2 text-[8px]">Creates soft, pastel-like glow effect</div>
            </div>
          }
        </div>
      </div>
    </CollapsibleSection>);

}