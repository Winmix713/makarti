import { useState, useEffect } from 'react';
import { SuperellipseState } from './useSuperellipse';

export type Preset = {
  id: string;
  name: string;
  state: SuperellipseState;
  createdAt: number;
};

const STORAGE_KEY = 'superellipse-presets';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }, [presets]);

  const savePreset = (name: string, state: SuperellipseState) => {
    const preset: Preset = {
      id: `preset-${Date.now()}`,
      name,
      state,
      createdAt: Date.now()
    };
    setPresets((prev) => [...prev, preset]);
    return preset;
  };

  const loadPreset = (id: string): SuperellipseState | null => {
    const preset = presets.find((p) => p.id === id);
    return preset ? preset.state : null;
  };

  const deletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePreset = (id: string, updates: Partial<Preset>) => {
    setPresets((prev) =>
    prev.map((p) => p.id === id ? { ...p, ...updates } : p)
    );
  };

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset
  };
}