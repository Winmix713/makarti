import React from 'react';
import { CustomSlider } from './CustomSlider';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { BorderControls } from './BorderControls';
interface EffectsControlsProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}
export function EffectsControls({ state, updateState }: EffectsControlsProps) {
  return (
    <div className="space-y-6">
      {/* Blur Effect */}
      <div className="space-y-3">
        <CustomSlider
          label="Blur"
          value={state.blur || 0}
          min={0}
          max={50}
          step={1}
          onChange={(val) =>
          updateState({
            blur: val
          })
          }
          unit="px" />
        
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
          Apply gaussian blur to the entire shape
        </p>
      </div>

      {/* Backdrop Blur */}
      <div className="space-y-3">
        <CustomSlider
          label="Backdrop Blur"
          value={state.backdropBlur}
          min={0}
          max={30}
          step={1}
          onChange={(val) =>
          updateState({
            backdropBlur: val
          })
          }
          unit="px" />
        
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
          Blur the background behind the shape (glassmorphism)
        </p>
      </div>

      {/* Border/Stroke Controls */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <BorderControls state={state} updateState={updateState} />
      </div>

      {/* Noise Overlay */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Noise Overlay
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Add texture grain effect
            </p>
          </div>
          <label className="relative inline-block w-10 h-[22px]">
            <input
              type="checkbox"
              checked={state.noiseEnabled || false}
              onChange={(e) =>
              updateState({
                noiseEnabled: e.target.checked
              })
              }
              className="opacity-0 w-0 h-0 peer" />
            
            <span className="absolute cursor-pointer inset-0 bg-zinc-300 dark:bg-zinc-700 rounded-full transition-colors peer-checked:bg-green-500 before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white dark:before:bg-zinc-900 before:rounded-full before:transition-transform peer-checked:before:translate-x-[18px]" />
          </label>
        </div>

        {state.noiseEnabled &&
        <div className="animate-fade-in">
            <CustomSlider
            label="Noise Intensity"
            value={state.noiseIntensity || 30}
            min={0}
            max={100}
            step={1}
            onChange={(val) =>
            updateState({
              noiseIntensity: val
            })
            }
            unit="%" />
          
          </div>
        }
      </div>

      {/* Effect Presets */}
      <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
          Quick Effects
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
            updateState({
              blur: 0,
              backdropBlur: 0,
              borderEnabled: false,
              noiseEnabled: false
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            None
          </button>
          <button
            onClick={() =>
            updateState({
              blur: 0,
              backdropBlur: 10,
              borderEnabled: true,
              strokeWidth: 1,
              strokeColor: '#FFFFFF',
              strokeOpacity: 30,
              noiseEnabled: false
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Glass
          </button>
          <button
            onClick={() =>
            updateState({
              blur: 5,
              backdropBlur: 0,
              borderEnabled: false,
              noiseEnabled: false
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Soft
          </button>
          <button
            onClick={() =>
            updateState({
              blur: 0,
              backdropBlur: 0,
              borderEnabled: false,
              noiseEnabled: true,
              noiseIntensity: 40
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Textured
          </button>
        </div>
      </div>
    </div>);

}