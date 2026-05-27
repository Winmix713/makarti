import React, { useState } from 'react';
import { SunIcon, GlassesIcon, BoxIcon, CircleIcon } from 'lucide-react';
import { SuperellipseState } from '../hooks/useSuperellipse';
interface DockProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}
type EffectPreset = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  values: Partial<SuperellipseState>;
};
const EFFECT_PRESETS: EffectPreset[] = [
{
  id: 'glow',
  label: 'Glow',
  icon: <SunIcon className="w-4 h-4" />,
  color: 'from-amber-400 to-orange-500',
  description: 'Radiant light effect',
  values: {
    enabled: true,
    glowEnabled: true,
    solidOpacity: 100,
    backdropBlur: 0,
    noiseEnabled: true,
    noiseIntensity: 35,
    borderEnabled: false,
    blur: 0
  }
},
{
  id: 'glass',
  label: 'Glass',
  icon: <GlassesIcon className="w-4 h-4" />,
  color: 'from-sky-400 to-blue-500',
  description: 'Frosted glass effect',
  values: {
    enabled: true,
    solidOpacity: 30,
    backdropBlur: 15,
    borderEnabled: true,
    strokeWidth: 1,
    strokeColor: '#FFFFFF',
    strokeOpacity: 20,
    strokeStyle: 'solid',
    noiseEnabled: false,
    blur: 0,
    glowEnabled: true
  }
},
{
  id: 'neo',
  label: 'Neo',
  icon: <BoxIcon className="w-4 h-4" />,
  color: 'from-slate-300 to-slate-400',
  description: 'Neumorphism style',
  values: {
    enabled: true,
    solidColor: '#E8E8E8',
    solidOpacity: 100,
    backdropBlur: 0,
    glowEnabled: false,
    borderEnabled: false,
    noiseEnabled: false,
    blur: 0,
    shadowDistance: 15,
    shadowIntensity: 40
  }
},
{
  id: 'clay',
  label: 'Clay',
  icon: <CircleIcon className="w-4 h-4" />,
  color: 'from-rose-400 to-pink-500',
  description: 'Soft clay material',
  values: {
    enabled: true,
    solidOpacity: 100,
    noiseEnabled: true,
    noiseIntensity: 20,
    backdropBlur: 0,
    borderEnabled: false,
    blur: 1,
    glowEnabled: true,
    glowScale: 1.2
  }
}];

export function Dock({ state, updateState }: DockProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const handleApplyPreset = (preset: EffectPreset) => {
    const isActive = activePreset === preset.id;
    if (isActive) {
      setActivePreset(null);
      return;
    }
    setActivePreset(preset.id);
    updateState(preset.values);
  };
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
      {/* Tooltip */}
      {hoveredId &&
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-md border border-border shadow-lg pointer-events-none animate-fade-in">
          <p className="text-[10px] font-medium text-foreground whitespace-nowrap">
            {EFFECT_PRESETS.find((p) => p.id === hoveredId)?.description}
          </p>
        </div>
      }

      {/* Dock Pill */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-2xl">
        {EFFECT_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              onPointerEnter={() => setHoveredId(preset.id)}
              onPointerLeave={() => setHoveredId(null)}
              className={`group relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-accent scale-105 shadow-md' : 'hover:bg-accent/50 hover:-translate-y-1 hover:scale-105'}`}
              aria-label={`Apply ${preset.label} effect`}>
              
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${preset.color} text-white shadow-sm transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                
                {preset.icon}
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {preset.label}
              </span>
              {/* Active dot */}
              {isActive &&
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              }
            </button>);

        })}
      </div>
    </div>);

}