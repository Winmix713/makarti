import React, { useState } from 'react';
import { CustomSlider } from './CustomSlider';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { Lock, Unlock } from 'lucide-react';
interface ShapeControlsProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}
export function ShapeControls({ state, updateState }: ShapeControlsProps) {
  const [aspectLocked, setAspectLocked] = useState(false);
  const aspectRatio = state.width / state.height;
  const handleWidthChange = (width: number) => {
    if (aspectLocked) {
      updateState({
        width,
        height: Math.round(width / aspectRatio)
      });
    } else {
      updateState({
        width
      });
    }
  };
  const handleHeightChange = (height: number) => {
    if (aspectLocked) {
      updateState({
        height,
        width: Math.round(height * aspectRatio)
      });
    } else {
      updateState({
        height
      });
    }
  };
  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Dimensions
          </p>
          <button
            onClick={() => setAspectLocked(!aspectLocked)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}>
            
            {aspectLocked ?
            <Lock className="w-3.5 h-3.5 text-indigo-500" /> :

            <Unlock className="w-3.5 h-3.5 text-zinc-400" />
            }
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 flex-1">
            <div className="relative flex-1">
              <div className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm pointer-events-none text-zinc-500">
                W
              </div>
              <input
                type="number"
                value={state.width}
                onChange={(e) =>
                handleWidthChange(parseInt(e.target.value) || 0)
                }
                className="w-full h-9 pl-7 pr-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem] text-sm text-zinc-900 dark:text-white outline-0 transition-colors focus:border-zinc-300 dark:focus:border-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-900" />
              
            </div>
            <div className="relative flex-1">
              <div className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm pointer-events-none text-zinc-500">
                H
              </div>
              <input
                type="number"
                value={state.height}
                onChange={(e) =>
                handleHeightChange(parseInt(e.target.value) || 0)
                }
                className="w-full h-9 pl-7 pr-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem] text-sm text-zinc-900 dark:text-white outline-0 transition-colors focus:border-zinc-300 dark:focus:border-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-900" />
              
            </div>
          </div>
          <div className="shrink-0 w-8 text-center text-sm text-zinc-500">
            px
          </div>
        </div>
      </div>

      {/* Roundness */}
      <CustomSlider
        label="Roundness"
        value={state.radius / Math.min(state.width, state.height) * 100}
        min={0}
        max={50}
        step={1}
        onChange={(val) =>
        updateState({
          radius: val / 100 * Math.min(state.width, state.height)
        })
        }
        unit="%" />
      

      {/* Smoothing (Superellipse Parameter) */}
      <div className="space-y-2">
        <CustomSlider
          label="Smoothing"
          value={state.smoothing}
          min={0}
          max={1}
          step={0.01}
          onChange={(val) =>
          updateState({
            smoothing: val
          })
          } />
        
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
          Higher values create more pronounced superellipse curves
        </p>
      </div>

      {/* Eccentricity (if exists in state) */}
      {state.eccentricity !== undefined &&
      <CustomSlider
        label="Eccentricity (n)"
        value={state.eccentricity}
        min={1}
        max={8}
        step={0.1}
        onChange={(val) =>
        updateState({
          eccentricity: val
        })
        } />

      }

      {/* Quick Size Presets */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
          Quick Sizes
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
          {
            label: 'Square',
            w: 200,
            h: 200
          },
          {
            label: 'Wide',
            w: 300,
            h: 200
          },
          {
            label: 'Tall',
            w: 200,
            h: 300
          }].
          map((preset) =>
          <button
            key={preset.label}
            onClick={() =>
            updateState({
              width: preset.w,
              height: preset.h
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
              {preset.label}
            </button>
          )}
        </div>
      </div>
    </div>);

}