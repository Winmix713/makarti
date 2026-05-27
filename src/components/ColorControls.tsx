import React from 'react';
import { SuperellipseState, GradientStop } from '../hooks/useSuperellipse';
import { tailwindColors } from '../utils/colorPalette';
import { gradientPresets } from '../utils/gradientPresets';
import { CustomSlider } from './CustomSlider';
import { Copy, Plus, Trash2 } from 'lucide-react';
interface ColorControlsProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
}
export function ColorControls({
  state,
  updateState,
  updateGradientStop
}: ColorControlsProps) {
  const modes = ['solid', 'linear', 'radial', 'conic'] as const;
  const positions = [
  'top left',
  'top',
  'top right',
  'left',
  'center',
  'right',
  'bottom left',
  'bottom',
  'bottom right'];

  const addGradientStop = () => {
    const newStops = [...state.gradientStops];
    const lastStop = newStops[newStops.length - 1];
    newStops.push({
      color: lastStop.color,
      position: Math.min(lastStop.position + 10, 100)
    });
    updateState({
      gradientStops: newStops
    });
  };
  const removeGradientStop = (index: number) => {
    if (state.gradientStops.length > 2) {
      const newStops = state.gradientStops.filter((_, i) => i !== index);
      updateState({
        gradientStops: newStops
      });
    }
  };
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Tabs */}
      <div className="p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex border border-zinc-200 dark:border-zinc-800">
        {modes.map((mode) =>
        <button
          key={mode}
          onClick={() =>
          updateState({
            colorMode: mode
          })
          }
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize ${state.colorMode === mode ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>
          
            {mode}
          </button>
        )}
      </div>

      {state.colorMode === 'solid' ?
      <div className="space-y-6">
          {/* Color Grid */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
              Color Palette
            </p>
            <div className="grid grid-cols-10 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {tailwindColors.map((color) =>
            <button
              key={color}
              onClick={() =>
              updateState({
                solidColor: color
              })
              }
              className={`w-full aspect-square rounded-md hover:scale-110 transition-transform border-2 ${state.solidColor === color ? 'border-zinc-900 dark:border-white ring-2 ring-offset-2 ring-zinc-900 dark:ring-white' : 'border-black/5 dark:border-white/5'}`}
              style={{
                backgroundColor: color
              }}
              aria-label={`Select color ${color}`} />

            )}
            </div>
          </div>

          {/* Color Picker & Opacity */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem]">
            <div className="relative size-7 mr-3 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
              <input
              type="color"
              value={state.solidColor}
              onChange={(e) =>
              updateState({
                solidColor: e.target.value
              })
              }
              className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer opacity-0 z-10" />
            
              <div
              className="w-full h-full transition-colors"
              style={{
                backgroundColor: state.solidColor
              }} />
            
            </div>

            <input
            type="text"
            value={state.solidColor.toUpperCase()}
            onChange={(e) =>
            updateState({
              solidColor: e.target.value
            })
            }
            className="flex-1 bg-transparent border-none text-sm font-mono text-zinc-700 dark:text-zinc-300 uppercase focus:outline-none"
            placeholder="F4F4F4" />
          

            <button
            onClick={() => copyColor(state.solidColor)}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            title="Copy color">
            
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            <div className="flex justify-center gap-2 w-16 ml-2 border-l border-zinc-200/50 dark:border-zinc-700/50 pl-3">
              <select
              value={state.solidOpacity}
              onChange={(e) =>
              updateState({
                solidOpacity: parseInt(e.target.value)
              })
              }
              className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none appearance-none cursor-pointer">
              
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map((op) =>
              <option key={op} value={op}>
                    {op}
                  </option>
              )}
              </select>
              <span className="text-sm text-zinc-500">%</span>
            </div>
          </div>

          {/* Lightness Control (if exists) */}
          {state.lightness !== undefined &&
        <CustomSlider
          label="Lightness"
          value={state.lightness}
          min={0}
          max={100}
          step={1}
          onChange={(val) =>
          updateState({
            lightness: val
          })
          }
          unit="%" />

        }
        </div> :

      <div className="space-y-6">
          {/* Gradient Presets */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-300">
                Color Stops
              </span>
              <button
              onClick={addGradientStop}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              title="Add color stop">
              
                <Plus className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {state.gradientStops.map((stop, index) =>
          <div
            key={index}
            className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 shadow-sm">
            
                <span className="w-8 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {index === 0 ?
              'From' :
              index === state.gradientStops.length - 1 ?
              'To' :
              `#${index + 1}`}
                </span>

                <div className="relative w-6 h-6 rounded-full shadow-inner ring-1 ring-black/5 dark:ring-white/10 overflow-hidden shrink-0 group">
                  <input
                type="color"
                value={stop.color}
                onChange={(e) =>
                updateGradientStop(index, {
                  color: e.target.value
                })
                }
                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer opacity-0 z-10" />
              
                  <div
                className="w-full h-full transition-colors"
                style={{
                  backgroundColor: stop.color
                }} />
              
                </div>

                <input
              type="text"
              value={stop.color}
              onChange={(e) =>
              updateGradientStop(index, {
                color: e.target.value
              })
              }
              className="flex-1 h-6 bg-transparent border-none text-[11px] font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none uppercase" />
            

                <div className="w-16">
                  <input
                type="number"
                value={stop.position}
                onChange={(e) =>
                updateGradientStop(index, {
                  position: parseInt(e.target.value) || 0
                })
                }
                min={0}
                max={100}
                className="w-full h-6 bg-transparent text-[10px] font-mono text-zinc-500 focus:outline-none text-right" />
              
                </div>

                {state.gradientStops.length > 2 &&
            <button
              onClick={() => removeGradientStop(index)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Remove stop">
              
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
            }
              </div>
          )}
          </div>
        </div>
      }
    </div>);

}