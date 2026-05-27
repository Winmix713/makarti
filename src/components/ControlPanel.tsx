import React, { useState } from 'react';
import {
  SquareIcon,
  DropletIcon,
  SparklesIcon,
  ZapIcon,
  SaveIcon,
  DownloadIcon,
  LayersIcon,
  ImageIcon,
  FolderOpenIcon,
  ClockIcon } from
'lucide-react';
import { ShapeControls } from './ShapeControls';
import { ColorControls } from './ColorControls';
import { EffectsControls } from './EffectsControls';
import { GlowControls } from './glow-editor/GlowControls';
import { PresetManager } from './PresetManager';
import { ExportPanel } from './ExportPanel';
import { LayerPanel } from './panels/LayerPanel';
import { AssetPanel } from './panels/AssetPanel';
import { ProjectPanel } from './panels/ProjectPanel';
import { TimelinePanel } from './panels/TimelinePanel';
import { SuperellipseState, GradientStop } from '../hooks/useSuperellipse';
import type {
  Layer,
  LayerType,
  LayerEffect,
  BlendMode,
  Asset,
  FontAsset,
  Project } from
'../types';
interface ControlPanelProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
  resetState: () => void;
  loadState: (state: SuperellipseState) => void;
  randomizeGlow?: () => void;
  // Layer props
  layers?: Layer[];
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string | null) => void;
  onAddLayer?: (type: LayerType, name?: string) => void;
  onRemoveLayer?: (id: string) => void;
  onUpdateLayer?: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onToggleSolo?: (id: string) => void;
  onReorderLayer?: (id: string, direction: 'up' | 'down') => void;
  onGroupLayers?: (ids: string[]) => void;
  onUngroupLayer?: (id: string) => void;
  onToggleGroupExpanded?: (id: string) => void;
  onAddEffect?: (layerId: string, effect: LayerEffect) => void;
  onRemoveEffect?: (layerId: string, effectId: string) => void;
  // Asset props
  assets?: Asset[];
  assetsLoading?: boolean;
  assetsError?: string | null;
  onUploadAsset?: (file: File) => Promise<Asset>;
  onDeleteAsset?: (id: string) => Promise<void>;
  onLoadGoogleFont?: (family: string) => Promise<FontAsset>;
  storageUsage?: number;
  // Project props
  currentProject?: Project | null;
  projects?: Project[];
  projectLoading?: boolean;
  projectError?: string | null;
  onCreateProject?: (settings?: Partial<Project>) => void;
  onSaveProject?: () => Promise<void>;
  onLoadProject?: (id: string) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  onExportProject?: (format: 'json') => Promise<Blob>;
  onImportProject?: (file: File) => Promise<void>;
  onUpdateMetadata?: (updates: Partial<Project['metadata']>) => void;
  onUpdateCanvas?: (settings: Partial<Project['canvas']>) => void;
}
type CategoryId =
'layers' |
'shape' |
'color' |
'effects' |
'glow' |
'assets' |
'presets' |
'project' |
'export';
type Category = {
  id: CategoryId;
  icon: React.ReactNode;
  label: string;
  title: string;
};
const categories: Category[] = [
{
  id: 'layers',
  icon: <LayersIcon className="w-3.5 h-3.5" />,
  label: 'Layers',
  title: 'Layer Manager'
},
{
  id: 'shape',
  icon: <SquareIcon className="w-3.5 h-3.5" />,
  label: 'Shape',
  title: 'Shape & Size'
},
{
  id: 'color',
  icon: <DropletIcon className="w-3.5 h-3.5" />,
  label: 'Color',
  title: 'Color & Appearance'
},
{
  id: 'effects',
  icon: <SparklesIcon className="w-3.5 h-3.5" />,
  label: 'Effects',
  title: 'Effects & Textures'
},
{
  id: 'glow',
  icon: <ZapIcon className="w-3.5 h-3.5" />,
  label: 'Glow',
  title: 'Glow & Shadow'
},
{
  id: 'assets',
  icon: <ImageIcon className="w-3.5 h-3.5" />,
  label: 'Assets',
  title: 'Asset Library'
},
{
  id: 'presets',
  icon: <SaveIcon className="w-3.5 h-3.5" />,
  label: 'Presets',
  title: 'Presets & Config'
},
{
  id: 'project',
  icon: <FolderOpenIcon className="w-3.5 h-3.5" />,
  label: 'Project',
  title: 'Project Manager'
},
{
  id: 'export',
  icon: <DownloadIcon className="w-3.5 h-3.5" />,
  label: 'Export',
  title: 'Export & Download'
}];

const noop = () => {};
const noopAsync = async () => {};
const noopAsyncReturn = async () => ({}) as any;
export function ControlPanel({
  state,
  updateState,
  updateGradientStop,
  resetState,
  loadState,
  randomizeGlow,
  layers = [],
  selectedLayerId = null,
  onSelectLayer = noop,
  onAddLayer = noop,
  onRemoveLayer = noop,
  onUpdateLayer = noop,
  onDuplicateLayer = noop,
  onToggleVisibility = noop,
  onToggleLock = noop,
  onToggleSolo = noop,
  onReorderLayer = noop,
  onGroupLayers = noop,
  onUngroupLayer = noop,
  onToggleGroupExpanded = noop,
  onAddEffect = noop,
  onRemoveEffect = noop,
  assets = [],
  assetsLoading = false,
  assetsError = null,
  onUploadAsset = noopAsyncReturn,
  onDeleteAsset = noopAsync,
  onLoadGoogleFont = noopAsyncReturn,
  storageUsage = 0,
  currentProject = null,
  projects = [],
  projectLoading = false,
  projectError = null,
  onCreateProject = noop,
  onSaveProject = noopAsync,
  onLoadProject = noopAsync,
  onDeleteProject = noopAsync,
  onExportProject = noopAsyncReturn,
  onImportProject = noopAsync,
  onUpdateMetadata = noop,
  onUpdateCanvas = noop
}: ControlPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('glow');
  const [headerTitle, setHeaderTitle] = useState('Glow & Shadow');
  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category.id);
    setHeaderTitle(category.title);
  };
  const isLayerPanel = activeCategory === 'layers';
  return (
    <aside className="flex-[2] h-[45vh] md:h-screen w-full md:max-w-md bg-card border-l border-border flex shadow-2xl z-30 rounded-b-[1.25rem] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[52px] p-1.5 border-r border-border flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
        {categories.map((category) =>
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category)}
          className={`w-full flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all ${activeCategory === category.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          title={category.label}>
          
            <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${activeCategory === category.id ? 'bg-background shadow-sm' : ''}`}>
            
              {category.icon}
            </div>
            <span className="text-[8px] font-medium leading-none">
              {category.label}
            </span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <p className="text-xs font-semibold text-foreground">{headerTitle}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {isLayerPanel ?
          <LayerPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSelectLayer}
            onAddLayer={onAddLayer}
            onRemoveLayer={onRemoveLayer}
            onUpdateLayer={onUpdateLayer}
            onDuplicateLayer={onDuplicateLayer}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            onToggleSolo={onToggleSolo}
            onReorderLayer={onReorderLayer}
            onGroupLayers={onGroupLayers}
            onUngroupLayer={onUngroupLayer}
            onToggleGroupExpanded={onToggleGroupExpanded}
            onAddEffect={onAddEffect}
            onRemoveEffect={onRemoveEffect} /> :


          <div className="px-4 py-4">
              {activeCategory === 'shape' &&
            <ShapeControls state={state} updateState={updateState} />
            }
              {activeCategory === 'color' &&
            <ColorControls
              state={state}
              updateState={updateState}
              updateGradientStop={updateGradientStop} />

            }
              {activeCategory === 'effects' &&
            <EffectsControls state={state} updateState={updateState} />
            }
              {activeCategory === 'glow' &&
            <GlowControls
              state={state}
              updateState={updateState}
              onRandomize={randomizeGlow} />

            }
              {activeCategory === 'assets' &&
            <AssetPanel
              assets={assets}
              loading={assetsLoading}
              error={assetsError}
              onUpload={onUploadAsset}
              onDelete={onDeleteAsset}
              onLoadGoogleFont={onLoadGoogleFont}
              storageUsage={storageUsage} />

            }
              {activeCategory === 'presets' &&
            <PresetManager currentState={state} onLoadPreset={loadState} />
            }
              {activeCategory === 'project' &&
            <ProjectPanel
              currentProject={currentProject}
              projects={projects}
              loading={projectLoading}
              error={projectError}
              onCreateProject={onCreateProject}
              onSaveProject={onSaveProject}
              onLoadProject={onLoadProject}
              onDeleteProject={onDeleteProject}
              onExportProject={onExportProject}
              onImportProject={onImportProject}
              onUpdateMetadata={onUpdateMetadata}
              onUpdateCanvas={onUpdateCanvas} />

            }
              {activeCategory === 'export' && <ExportPanel state={state} />}
            </div>
          }
        </div>

        {/* Footer - Reset Button */}
        {!['export', 'presets', 'layers', 'assets', 'project'].includes(
          activeCategory
        ) &&
        <div className="p-3 border-t border-border flex-shrink-0">
            <button
            onClick={resetState}
            className="w-full h-9 rounded-lg border border-border bg-background text-foreground font-medium text-xs hover:bg-muted active:scale-[0.98] transition-all">
            
              Reset to Defaults
            </button>
          </div>
        }
      </div>
    </aside>);

}