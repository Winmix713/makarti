import React, { useState, createElement } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Check } from 'lucide-react';
import { usePresets } from '../hooks/usePresets';
import { SuperellipseState } from '../hooks/useSuperellipse';
interface PresetManagerProps {
  currentState: SuperellipseState;
  onLoadPreset: (state: SuperellipseState) => void;
}
export function PresetManager({
  currentState,
  onLoadPreset
}: PresetManagerProps) {
  const { presets, savePreset, loadPreset, deletePreset } = usePresets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetList, setShowPresetList] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), currentState);
      setPresetName('');
      setShowSaveDialog(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };
  const handleLoadPreset = (id: string) => {
    const state = loadPreset(id);
    if (state) {
      onLoadPreset(state);
      setShowPresetList(false);
    }
  };
  const handleExportJSON = () => {
    const json = JSON.stringify(currentState, null, 2);
    const blob = new Blob([json], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superellipse-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const state = JSON.parse(json);
          onLoadPreset(state);
          alert('Configuration imported successfully!');
        } catch (error) {
          alert('Failed to import configuration. Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="space-y-4">
      {/* Success Message */}
      {saveSuccess &&
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Preset saved successfully!
          </p>
        </div>
      }

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          
          <Save className="w-4 h-4" />
          Save Preset
        </button>

        <button
          onClick={() => setShowPresetList(!showPresetList)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          
          <FolderOpen className="w-4 h-4" />
          Load ({presets.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          
          <Download className="w-4 h-4" />
          Export JSON
        </button>

        <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden" />
          
        </label>
      </div>

      {/* Save Dialog */}
      {showSaveDialog &&
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-3 animate-fade-in">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Save Current Configuration
          </p>
          <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
          placeholder="Enter preset name..."
          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus />
        
          <div className="flex gap-2">
            <button
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            className="flex-1 px-3 py-2 rounded-md bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            
              Save
            </button>
            <button
            onClick={() => {
              setShowSaveDialog(false);
              setPresetName('');
            }}
            className="flex-1 px-3 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
            
              Cancel
            </button>
          </div>
        </div>
      }

      {/* Preset List */}
      {showPresetList &&
      <div className="space-y-2 animate-fade-in">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
            Saved Presets
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            {presets.length === 0 ?
          <div className="text-center py-8">
                <FolderOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No saved presets yet</p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Save your first preset above
                </p>
              </div> :

          presets.map((preset) =>
          <div
            key={preset.id}
            className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group">
            
                  <button
              onClick={() => handleLoadPreset(preset.id)}
              className="flex-1 text-left">
              
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {formatDate(preset.createdAt)}
                    </p>
                  </button>
                  <button
              onClick={() => {
                if (confirm(`Delete preset "${preset.name}"?`)) {
                  deletePreset(preset.id);
                }
              }}
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete preset">
              
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
          )
          }
          </div>
        </div>
      }

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>Tip:</strong> Presets are saved locally in your browser.
          Export as JSON to share or backup your configurations.
        </p>
      </div>
    </div>);

}