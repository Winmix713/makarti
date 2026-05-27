import React, { useState } from 'react';
import { ShuffleIcon } from 'lucide-react';
import { CustomSlider } from '../CustomSlider';
import { SuperellipseState } from '../../hooks/useSuperellipse';
import { CollapsibleSection } from './CollapsibleSection';
import { ToggleSwitch } from './ToggleSwitch';
import { OklchColorPicker } from './OklchColorPicker';
import { GlowCSSPreview } from './GlowCSSPreview';
import { useColorConversion } from '../../hooks/useColorConversion';
import { SLIDER_RANGES } from '../../constants/glowLayerConfig';

interface GlowControlsProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  onRandomize?: () => void;
}

/**
 * GlowControls Component
 * Master control panel for the Glow Editor
 * 
 * Includes:
 * - Power toggle
 * - Theme mode selector (dark/light)
 * - Base color (OKLCH) picker
 * - Shape configuration (mask size, glow scale, noise)
 * - Position controls (X, Y)
 * - CSS code preview
 * - Randomize button
 */
export function GlowControls({
  state,
  updateState,
  onRandomize
}: GlowControlsProps) {
  const { oklchToHex } = useColorConversion();

  // Collapsible sections state
  const [configExpanded, setConfigExpanded] = useState(true);
  const [positionExpanded, setPositionExpanded] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(false);

  /**
   * Handle color changes from the OKLCH picker
   * Updates both glow color and lightness in state
   */
  const handleColorChange = (color: string, lightness: number) => {
    updateState({
      glowColor: color,
      solidColor: color,
      lightness: lightness
    });
  };

  /**
   * Handle randomize button click
   * Generates random OKLCH values for vibrant colors
   */
  const handleRandomize = () => {
    if (onRandomize) {
      onRandomize();
    } else {
      // Fallback internal randomization if prop not provided
      const randomL = 0.6 + Math.random() * 0.3; // 0.6-0.9 lightness (60-90%)
      const randomC = 0.15 + Math.random() * 0.2; // 0.15-0.35 chroma (vibrant)
      const randomH = Math.random() * 360; // 0-360° hue

      const hex = oklchToHex(randomL, randomC, randomH);

      updateState({
        lightness: Math.round(randomL * 100),
        glowColor: hex,
        solidColor: hex,
        glowPositionX: -800 + Math.random() * 450,
        glowPositionY: -1400 + Math.random() * 800,
        glowScale: 0.7 + Math.random() * 2.3
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Header with Power Toggle */}
      <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-xl border border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Glow Effect</h2>
          <p className="text-[10px] text-muted-foreground">
            CSS Progressive Blur
          </p>
        </div>
        <ToggleSwitch
          label="Power"
          checked={state.glowEnabled}
          onChange={(checked) =>
          updateState({
            glowEnabled: checked
          })
          }
          activeColor={state.glowColor} />
        
      </div>

      {/* Theme Mode Selector */}
      <div className="space-y-2 bg-secondary/50 p-3 rounded-xl border border-border">
        <label className="text-xs font-medium text-muted-foreground">
          Theme Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateState({ glowThemeMode: 'dark' })}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            state.glowThemeMode === 'dark' ?
            'bg-foreground text-background border border-foreground' :
            'bg-secondary border border-border text-foreground hover:bg-secondary/80'}`
            }>
            
            Dark
          </button>
          <button
            onClick={() => updateState({ glowThemeMode: 'light' })}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            state.glowThemeMode === 'light' ?
            'bg-foreground text-background border border-foreground' :
            'bg-secondary border border-border text-foreground hover:bg-secondary/80'}`
            }>
            
            Light
          </button>
        </div>
        <p className="text-[8px] text-muted-foreground/70 italic">
          Dark: Vivid neon effect • Light: Soft pastel effect
        </p>
      </div>

      {/* Base Color (OKLCH) Picker */}
      <OklchColorPicker
        color={state.glowColor}
        onChange={handleColorChange} />
      

      <div className="h-px bg-border my-2" />

      {/* Shape Configuration */}
      <CollapsibleSection
        title="Shape Configuration"
        expanded={configExpanded}
        onToggle={() => setConfigExpanded(!configExpanded)}>
        
        {/* Gradient Mask Size Slider */}
        <CustomSlider
          compact
          label="Gradient Mask Size (Shape 1)"
          value={Math.round(state.glowMaskSize * 100)}
          min={SLIDER_RANGES.maskSize.min}
          max={SLIDER_RANGES.maskSize.max}
          step={1}
          onChange={(val) =>
          updateState({
            glowMaskSize: val / 100
          })
          }
          displayValue={`${Math.round(state.glowMaskSize * 100)}%`} />
        

        {/* Glow Scale Slider */}
        <CustomSlider
          compact
          label="Glow Scale"
          value={state.glowScale}
          min={SLIDER_RANGES.glowScale.min}
          max={SLIDER_RANGES.glowScale.max}
          step={SLIDER_RANGES.glowScale.step}
          onChange={(val) =>
          updateState({
            glowScale: val
          })
          }
          displayValue={`${state.glowScale.toFixed(1)}x`} />
        

        {/* Noise Overlay Section */}
        <div className="pt-2 border-t border-border/50 mt-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-medium text-muted-foreground">
              Noise Overlay
            </label>
            <ToggleSwitch
              checked={state.noiseEnabled}
              onChange={(checked) =>
              updateState({
                noiseEnabled: checked
              })
              } />
            
          </div>
          
          {/* Noise Intensity - Only visible when enabled */}
          {state.noiseEnabled &&
          <div className="animate-fade-in">
              <CustomSlider
              compact
              label="Noise Intensity"
              value={Math.round(state.noiseIntensity)}
              min={0}
              max={100}
              step={1}
              onChange={(val) =>
              updateState({
                noiseIntensity: val
              })
              }
              displayValue={`${Math.round(state.noiseIntensity)}%`} />
            
            </div>
          }
        </div>
      </CollapsibleSection>

      {/* Glow Position */}
      <CollapsibleSection
        title="Glow Position"
        expanded={positionExpanded}
        onToggle={() => setPositionExpanded(!positionExpanded)}>
        
        {/* Horizontal Position (X) */}
        <CustomSlider
          compact
          label="Horizontal (X)"
          value={Math.round(state.glowPositionX)}
          min={SLIDER_RANGES.positionX.min}
          max={SLIDER_RANGES.positionX.max}
          step={SLIDER_RANGES.positionX.step}
          onChange={(val) =>
          updateState({
            glowPositionX: val
          })
          }
          displayValue={`${Math.round(state.glowPositionX)}px`} />
        

        {/* Vertical Position (Y) */}
        <CustomSlider
          compact
          label="Vertical (Y)"
          value={Math.round(state.glowPositionY)}
          min={SLIDER_RANGES.positionY.min}
          max={SLIDER_RANGES.positionY.max}
          step={SLIDER_RANGES.positionY.step}
          onChange={(val) =>
          updateState({
            glowPositionY: val
          })
          }
          displayValue={`${Math.round(state.glowPositionY)}px`} />
        

        <p className="text-[9px] text-muted-foreground/70 mt-1 italic">
          Position and Scale interact multiplicatively. Adjust Scale first, then fine-tune Position.
        </p>
      </CollapsibleSection>

      {/* CSS Code Preview */}
      <GlowCSSPreview
        state={state}
        expanded={codeExpanded}
        onToggle={() => setCodeExpanded(!codeExpanded)} />
      

      {/* Randomize Button */}
      <button
        onClick={handleRandomize}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg active:scale-95">
        
        <ShuffleIcon className="w-4 h-4" />
        Random Spotlight
      </button>
    </div>);

}