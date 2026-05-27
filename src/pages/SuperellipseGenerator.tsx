import React, { useCallback, useState } from 'react';
import { PreviewArea } from '../components/PreviewArea';
import { ControlPanel } from '../components/ControlPanel';
import { LiveCodePanel } from '../components/panels/LiveCodePanel';
import { useSuperellipse, SuperellipseState } from '../hooks/useSuperellipse';
import { useTheme } from '../hooks/useTheme';
import { useLayerManager } from '../hooks/useLayerManager';
import { useAssetLibrary } from '../hooks/useAssetLibrary';
import { useProjectManager } from '../hooks/useProjectManager';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CodeIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
export function SuperellipseGenerator() {
  const { theme, toggleTheme } = useTheme();
  const { state, updateState, updateGradientStop, resetState, randomizeGlow } =
  useSuperellipse();
  const layerManager = useLayerManager();
  const assetLibrary = useAssetLibrary();
  const projectManager = useProjectManager();
  const undoRedo = useUndoRedo<SuperellipseState>(state);
  const [showCodePanel, setShowCodePanel] = useState(false);
  // Load state from preset
  const loadState = useCallback(
    (newState: SuperellipseState) => {
      Object.keys(newState).forEach((key) => {
        updateState({
          [key]: newState[key as keyof SuperellipseState]
        });
      });
    },
    [updateState]
  );
  const handleUndo = useCallback(() => {
    const prevState = undoRedo.undo();
    if (prevState) loadState(prevState);
  }, [undoRedo, loadState]);
  const handleRedo = useCallback(() => {
    const nextState = undoRedo.redo();
    if (nextState) loadState(nextState);
  }, [undoRedo, loadState]);
  const handleSave = useCallback(async () => {
    if (projectManager.currentProject) {
      await projectManager.saveProject();
    } else {
      projectManager.createProject({
        name: 'Untitled Project'
      });
    }
  }, [projectManager]);
  const handleImportProject = useCallback(
    async (file: File) => {
      await projectManager.importProject(file);
    },
    [projectManager]
  );
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSave,
    onDelete: () => {
      if (layerManager.selectedLayerId) {
        layerManager.removeLayer(layerManager.selectedLayerId);
      }
    },
    onDuplicate: () => {
      if (layerManager.selectedLayerId) {
        layerManager.duplicateLayer(layerManager.selectedLayerId);
      }
    },
    onPlayPause: () => setShowCodePanel((prev) => !prev),
    onEscape: () => layerManager.selectLayer(null)
  });
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <PreviewArea
          state={state}
          updateState={updateState}
          theme={theme}
          toggleTheme={toggleTheme}
          projectName={projectManager.currentProject?.name}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          resetState={resetState} />
        

        <ControlPanel
          state={state}
          updateState={updateState}
          updateGradientStop={updateGradientStop}
          resetState={resetState}
          loadState={loadState}
          randomizeGlow={randomizeGlow}
          layers={layerManager.layers}
          selectedLayerId={layerManager.selectedLayerId}
          onSelectLayer={layerManager.selectLayer}
          onAddLayer={layerManager.addLayer}
          onRemoveLayer={layerManager.removeLayer}
          onUpdateLayer={layerManager.updateLayer}
          onDuplicateLayer={layerManager.duplicateLayer}
          onToggleVisibility={layerManager.toggleVisibility}
          onToggleLock={layerManager.toggleLock}
          onToggleSolo={layerManager.toggleSolo}
          onReorderLayer={layerManager.reorderLayer}
          onGroupLayers={layerManager.groupLayers}
          onUngroupLayer={layerManager.ungroupLayer}
          onToggleGroupExpanded={layerManager.toggleGroupExpanded}
          onAddEffect={layerManager.addEffect}
          onRemoveEffect={layerManager.removeEffect}
          assets={assetLibrary.assets}
          assetsLoading={assetLibrary.loading}
          assetsError={assetLibrary.error}
          onUploadAsset={assetLibrary.uploadAsset}
          onDeleteAsset={assetLibrary.deleteAsset}
          onLoadGoogleFont={assetLibrary.loadGoogleFont}
          storageUsage={assetLibrary.getStorageUsage()}
          currentProject={projectManager.currentProject}
          projects={projectManager.projects}
          projectLoading={projectManager.loading}
          projectError={projectManager.error}
          onCreateProject={projectManager.createProject}
          onSaveProject={projectManager.saveProject}
          onLoadProject={projectManager.loadProject}
          onDeleteProject={projectManager.deleteProject}
          onExportProject={projectManager.exportProject}
          onImportProject={handleImportProject}
          onUpdateMetadata={projectManager.updateProjectMetadata}
          onUpdateCanvas={projectManager.updateCanvasSettings} />
        
      </div>

      {/* Code Panel Toggle */}
      <button
        onClick={() => setShowCodePanel(!showCodePanel)}
        className="flex items-center justify-center gap-1.5 h-7 bg-card border-t border-border text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
        
        {showCodePanel ?
        <ChevronDownIcon className="w-3 h-3" /> :

        <ChevronUpIcon className="w-3 h-3" />
        }
        <CodeIcon className="w-3 h-3" />
        Live Code
        <span className="text-[9px] text-muted-foreground/60 ml-1 hidden sm:inline">
          ⌘ Space
        </span>
      </button>

      {/* Live Code Panel */}
      {showCodePanel &&
      <div className="h-[200px] flex-shrink-0 animate-fade-in">
          <LiveCodePanel state={state} />
        </div>
      }
    </div>);

}