import React, { useCallback, useEffect, useState, useRef } from 'react';
interface CustomSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  gradient?: string;
  displayValue?: string;
  compact?: boolean;
  'aria-label'?: string;
}
export function CustomSlider({
  label,
  value = 0,
  min,
  max,
  step,
  onChange,
  unit = '',
  gradient,
  displayValue,
  compact = false,
  'aria-label': ariaLabel
}: CustomSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sync local value when external value changes (and not dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);
  const safeValue =
  typeof localValue === 'number' && !isNaN(localValue) ? localValue : min;
  const clampedValue = Math.max(min, Math.min(max, safeValue));
  const percentage = (clampedValue - min) / (max - min) * 100;
  const computeValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return clampedValue;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let newValue = min + pct * (max - min);
      newValue = Math.round(newValue / step) * step;
      // Clamp to min/max
      newValue = Math.max(min, Math.min(max, newValue));
      // Fix floating point
      const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
      return parseFloat(newValue.toFixed(decimals));
    },
    [min, max, step, clampedValue]
  );
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const newVal = computeValue(e.clientX);
      setLocalValue(newVal);
      // Debounced parent update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(newVal), 16);
    },
    [computeValue, onChange]
  );
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const newVal = computeValue(e.clientX);
      setLocalValue(newVal);
      // Debounced parent update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(newVal), 16);
    },
    [isDragging, computeValue, onChange]
  );
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      // Final commit
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const finalVal = computeValue(e.clientX);
      setLocalValue(finalVal);
      onChange(finalVal);
    },
    [computeValue, onChange]
  );
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  const formattedValue =
  displayValue ??
  (step < 1 ?
  clampedValue.toFixed(String(step).split('.')[1]?.length || 1) :
  String(Math.round(clampedValue))) + unit;
  // Compact mode: thin track with inline label+value
  if (compact) {
    return (
      <div className="space-y-1.5">
        {label &&
        <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{label}</span>
            <span className="font-mono">{formattedValue}</span>
          </div>
        }
        <div
          ref={trackRef}
          className="relative h-5 w-full rounded-full overflow-hidden cursor-pointer touch-none select-none"
          style={{
            background: gradient || 'hsl(var(--secondary))'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="slider"
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={formattedValue}
          tabIndex={0}>
          
          {/* Fill overlay (only when no gradient) */}
          {!gradient &&
          <div
            className="absolute top-0 left-0 h-full rounded-l-full bg-muted-foreground/20 pointer-events-none transition-[width] duration-75"
            style={{
              width: `${percentage}%`
            }} />

          }
          {/* Position indicator */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_3px_rgba(0,0,0,0.5)] pointer-events-none transition-[left] duration-75"
            style={{
              left: `${percentage}%`
            }} />
          
        </div>
      </div>);

  }
  // Full mode: tall track with thumb + value box
  return (
    <div className="space-y-2">
      {label &&
      <div className="flex justify-between items-center px-0.5">
          <label className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
        </div>
      }

      <div className="flex items-center gap-2">
        <div
          ref={trackRef}
          className="flex-1 h-9 rounded-[10px] relative cursor-pointer touch-none select-none overflow-hidden"
          style={{
            background: gradient || 'hsl(var(--secondary))'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="slider"
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={formattedValue}
          tabIndex={0}>
          
          {/* Fill (only when no gradient) */}
          {!gradient &&
          <div
            className="absolute h-full bg-muted-foreground/15 rounded-l-[10px] pointer-events-none transition-[width] duration-75"
            style={{
              width: `${percentage}%`
            }} />

          }

          {/* Thumb */}
          <div
            className={`absolute top-0.5 bottom-0.5 w-6 rounded-lg pointer-events-none transition-[left] duration-75 ${isDragging ? 'bg-card shadow-[0_0_4px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.2)] scale-[1.05]' : 'bg-card shadow-[0_0_2.6px_-1px_rgba(0,0,0,0.17),0_1px_4px_rgba(0,0,0,0.14)]'}`}
            style={{
              left: `clamp(2px, calc(${percentage}% - 12px), calc(100% - 26px))`
            }} />
          
        </div>

        <div className="flex items-center justify-center min-w-[56px] h-9 px-2 border border-border rounded-[10px] bg-transparent">
          <span className="text-xs font-medium text-foreground font-mono tabular-nums">
            {formattedValue}
          </span>
        </div>
      </div>
    </div>);

}