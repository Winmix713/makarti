import React, { useCallback, useEffect, useState } from 'react';
import { CustomSlider } from '../CustomSlider';
import { useColorConversion } from '../../hooks/useColorConversion';
import { SLIDER_RANGES } from '../../constants/glowLayerConfig';

interface OklchColorPickerProps {
  color: string;
  onChange: (color: string, lightness: number) => void;
}

/**
 * OklchColorPicker Component
 * Provides bidirectional OKLCH ↔ HEX color synchronization
 * 
 * Ranges (per documentation):
 * - Lightness: 0-100%
 * - Chroma: 0-0.4
 * - Hue: 0-360°
 */
export function OklchColorPicker({ color, onChange }: OklchColorPickerProps) {
  const { hexToOklch, oklchToHex } = useColorConversion();

  // Local state for OKLCH values (L is 0-1 internally, converted to 0-100 for display)
  const [oklch, setOklch] = useState({
    l: 0.78, // 78% lightness
    c: 0.18, // 0.18 chroma
    h: 70 // 70° hue
  });

  // Sync OKLCH from hex when color prop changes externally
  useEffect(() => {
    const result = hexToOklch(color);
    if (result) {
      // Only update if significantly different to avoid jitter during sliding
      setOklch((prev) => {
        const diffL = Math.abs(prev.l - result.l);
        const diffC = Math.abs(prev.c - result.c);
        const diffH = Math.abs(prev.h - result.h);

        // Threshold for updating: 1% for lightness, 0.001 for chroma, 1° for hue
        if (diffL > 0.01 || diffC > 0.001 || diffH > 1) {
          return result;
        }
        return prev;
      });
    }
  }, [color, hexToOklch]);

  /**
   * Handle OKLCH slider changes
   * Updates local state and syncs HEX color
   */
  const handleOklchChange = useCallback(
    (key: 'l' | 'c' | 'h', value: number) => {
      // Clamp values to valid ranges
      let clampedValue = value;
      if (key === 'l') {
        clampedValue = Math.max(0, Math.min(1, value)); // 0-1 for internal use
      } else if (key === 'c') {
        clampedValue = Math.max(0, Math.min(0.4, value)); // 0-0.4
      } else if (key === 'h') {
        clampedValue = (value % 360 + 360) % 360; // 0-360
      }

      const newOklch = {
        ...oklch,
        [key]: clampedValue
      };

      setOklch(newOklch);
      const hex = oklchToHex(newOklch.l, newOklch.c, newOklch.h).toUpperCase();
      onChange(hex, Math.round(newOklch.l * 100)); // Convert L to 0-100 percentage
    },
    [oklch, oklchToHex, onChange]
  );

  /**
   * Handle HEX input changes
   * Validates format and syncs OKLCH values
   */
  const handleHexChange = useCallback(
    (hex: string) => {
      // Validate HEX format
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const result = hexToOklch(hex);
        if (result) {
          // Ensure values are within valid ranges
          const validatedResult = {
            l: Math.max(0, Math.min(1, result.l)),
            c: Math.max(0, Math.min(0.4, result.c)),
            h: (result.h % 360 + 360) % 360
          };
          setOklch(validatedResult);
          onChange(hex.toUpperCase(), Math.round(validatedResult.l * 100));
        }
      }
    },
    [hexToOklch, onChange]
  );

  // Display values
  const lightnessPercent = Math.round(oklch.l * 100);
  const chromaValue = oklch.c.toFixed(3);
  const hueValue = Math.round(oklch.h);

  return (
    <div className="space-y-4 pt-2">
      {/* Color Input Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Base Color (OKLCH)
        </label>
        <div className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 bg-secondary/50">
          {/* Color Preview */}
          <div
            className="w-5 h-5 rounded border border-foreground/10 shadow-inner transition-colors duration-200"
            style={{
              backgroundColor: color
            }} />
          
          
          {/* HEX Input */}
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-16 bg-transparent text-[10px] font-mono text-muted-foreground uppercase focus:outline-none"
            maxLength={7}
            placeholder="#000000" />
          
        </div>
      </div>

      {/* OKLCH Sliders */}
      <div className="space-y-4">
        {/* Lightness Slider (0-100%) */}
        <CustomSlider
          compact
          label="Lightness"
          value={lightnessPercent}
          min={SLIDER_RANGES.lightness.min}
          max={SLIDER_RANGES.lightness.max}
          step={SLIDER_RANGES.lightness.step}
          onChange={(v) => handleOklchChange('l', v / 100)}
          displayValue={`${lightnessPercent}%`}
          gradient="linear-gradient(to right, #000000, #ffffff)" />
        

        {/* Chroma Slider (0-0.4) */}
        <CustomSlider
          compact
          label="Chroma"
          value={oklch.c}
          min={SLIDER_RANGES.chroma.min}
          max={SLIDER_RANGES.chroma.max}
          step={SLIDER_RANGES.chroma.step}
          onChange={(v) => handleOklchChange('c', v)}
          displayValue={chromaValue}
          gradient="linear-gradient(to right, #808080, #ff8800)" />
        

        {/* Hue Slider (0-360°) */}
        <CustomSlider
          compact
          label="Hue"
          value={hueValue}
          min={SLIDER_RANGES.hue.min}
          max={SLIDER_RANGES.hue.max}
          step={SLIDER_RANGES.hue.step}
          onChange={(v) => handleOklchChange('h', v)}
          displayValue={`${hueValue}°`}
          gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)" />
        
      </div>

      {/* OKLCH String Display */}
      <div
        className="text-[10px] text-muted-foreground font-mono bg-secondary/30 px-2 py-1 rounded border border-border/30 text-center">
        
        oklch({lightnessPercent}% {chromaValue} {hueValue})
      </div>

      {/* Documentation Note */}
      <div className="text-[8px] text-muted-foreground/60 italic">
        OKLCH: Perceptually uniform color space with independent lightness, chroma, and hue
      </div>
    </div>);

}