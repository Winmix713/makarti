import React from 'react';
import { CustomSlider } from './CustomSlider';
import { SuperellipseState } from '../hooks/useSuperellipse';
import { Copy } from 'lucide-react';
interface BorderControlsProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}
export function BorderControls({ state, updateState }: BorderControlsProps) {
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };
  return (
    <div className="space-y-6">
      {/* Border Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Stroke
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Add border outline
          </p>
        </div>
        <label className="relative inline-block w-10 h-[22px]">
          <input
            type="checkbox"
            checked={state.borderEnabled}
            onChange={(e) =>
            updateState({
              borderEnabled: e.target.checked
            })
            }
            className="opacity-0 w-0 h-0 peer" />
          
          <span className="absolute cursor-pointer inset-0 bg-zinc-300 dark:bg-zinc-700 rounded-full transition-colors peer-checked:bg-green-500 before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white dark:before:bg-zinc-900 before:rounded-full before:transition-transform peer-checked:before:translate-x-[18px]" />
        </label>
      </div>

      {state.borderEnabled &&
      <div className="space-y-4 animate-fade-in">
          {/* Stroke Color */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
              Stroke Color
            </p>
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem]">
              <div className="relative size-7 mr-3 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
                <input
                type="color"
                value={state.strokeColor}
                onChange={(e) =>
                updateState({
                  strokeColor: e.target.value
                })
                }
                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer opacity-0 z-10" />
              
                <div
                className="w-full h-full transition-colors"
                style={{
                  backgroundColor: state.strokeColor
                }} />
              
              </div>

              <input
              type="text"
              value={state.strokeColor.toUpperCase()}
              onChange={(e) =>
              updateState({
                strokeColor: e.target.value
              })
              }
              className="flex-1 bg-transparent border-none text-sm font-mono text-zinc-700 dark:text-zinc-300 uppercase focus:outline-none"
              placeholder="#FFFFFF"
              maxLength={7} />
            

              <button
              onClick={() => copyColor(state.strokeColor)}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Copy color">
              
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Stroke Width */}
          <CustomSlider
          label="Stroke Width"
          value={state.strokeWidth}
          min={0}
          max={20}
          step={1}
          onChange={(val) =>
          updateState({
            strokeWidth: val
          })
          }
          unit="px" />
        

          {/* Stroke Position */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
              Position
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['inside', 'center', 'outside'] as const).map((position) =>
            <button
              key={position}
              onClick={() =>
              updateState({
                strokePosition: position
              })
              }
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${state.strokePosition === position ? 'bg-indigo-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
              
                  {position}
                </button>
            )}
            </div>
          </div>

          {/* Stroke Style */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
              Style
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'dashed', 'dotted'] as const).map((style) =>
            <button
              key={style}
              onClick={() =>
              updateState({
                strokeStyle: style
              })
              }
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${state.strokeStyle === style ? 'bg-indigo-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
              
                  {style}
                </button>
            )}
            </div>
          </div>

          {/* Stroke Opacity */}
          <CustomSlider
          label="Stroke Opacity"
          value={state.strokeOpacity}
          min={0}
          max={100}
          step={1}
          onChange={(val) =>
          updateState({
            strokeOpacity: val
          })
          }
          unit="%" />
        
        </div>
      }

      {/* Shadow Controls */}
      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
          Shadow
        </p>

        <CustomSlider
          label="Shadow Distance"
          value={state.shadowDistance}
          min={0}
          max={50}
          step={1}
          onChange={(val) =>
          updateState({
            shadowDistance: val
          })
          }
          unit="px" />
        

        <CustomSlider
          label="Shadow Intensity"
          value={state.shadowIntensity}
          min={0}
          max={100}
          step={1}
          onChange={(val) =>
          updateState({
            shadowIntensity: val
          })
          }
          unit="%" />
        
      </div>

      {/* Quick Presets */}
      <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
          Quick Presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
            updateState({
              borderEnabled: true,
              strokeWidth: 2,
              strokeColor: '#000000',
              strokePosition: 'inside',
              strokeStyle: 'solid',
              strokeOpacity: 100
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Thin Black
          </button>
          <button
            onClick={() =>
            updateState({
              borderEnabled: true,
              strokeWidth: 4,
              strokeColor: '#FFFFFF',
              strokePosition: 'inside',
              strokeStyle: 'solid',
              strokeOpacity: 100
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Thick White
          </button>
          <button
            onClick={() =>
            updateState({
              borderEnabled: true,
              strokeWidth: 3,
              strokeColor: '#6366F1',
              strokePosition: 'center',
              strokeStyle: 'dashed',
              strokeOpacity: 80
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Dashed Blue
          </button>
          <button
            onClick={() =>
            updateState({
              borderEnabled: true,
              strokeWidth: 2,
              strokeColor: '#10B981',
              strokePosition: 'outside',
              strokeStyle: 'dotted',
              strokeOpacity: 100
            })
            }
            className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
            
            Dotted Green
          </button>
        </div>
      </div>
    </div>);

}