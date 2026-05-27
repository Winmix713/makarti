import React, { useState, useRef, createElement } from 'react';
import {
  FolderPlusIcon,
  SaveIcon,
  FolderOpenIcon,
  Trash2Icon,
  DownloadIcon,
  UploadIcon,
  CheckIcon,
  AlertCircleIcon,
  FileJsonIcon,
  SettingsIcon,
  PaletteIcon } from
'lucide-react';
import type { Project } from '../../types';
interface ProjectPanelProps {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
  onCreateProject: (settings?: Partial<Project>) => void;
  onSaveProject: () => Promise<void>;
  onLoadProject: (id: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onExportProject: (format: 'json') => Promise<Blob>;
  onImportProject: (file: File) => Promise<void>;
  onUpdateMetadata: (updates: Partial<Project['metadata']>) => void;
  onUpdateCanvas: (settings: Partial<Project['canvas']>) => void;
}
export function ProjectPanel({
  currentProject,
  projects,
  loading,
  error,
  onCreateProject,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
  onUpdateMetadata,
  onUpdateCanvas
}: ProjectPanelProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const handleSave = async () => {
    try {
      await onSaveProject();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {

      // Error handled by parent
    }};
  const handleExport = async () => {
    try {
      const blob = await onExportProject('json');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject?.name || 'project'}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {

      // Error handled by parent
    }};
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImportProject(file);
    }
    e.target.value = '';
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="space-y-4">
      {/* Error */}
      {error &&
      <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
          <AlertCircleIcon className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <p className="text-[10px] text-destructive">{error}</p>
        </div>
      }

      {/* Save Success */}
      {saveSuccess &&
      <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <CheckIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-[10px] text-green-700 dark:text-green-300">
            Project saved!
          </p>
        </div>
      }

      {/* Current Project */}
      {currentProject ?
      <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="flex items-center gap-2">
              <FileJsonIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <input
                type="text"
                value={currentProject.name}
                onChange={(e) =>
                onUpdateMetadata({
                  ...currentProject.metadata
                })
                }
                className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                placeholder="Project Name" />
              
                <p className="text-[10px] text-muted-foreground">
                  v{currentProject.version} · Updated{' '}
                  {formatDate(currentProject.updatedAt)}
                </p>
              </div>
            </div>

            {/* Description */}
            <textarea
            value={currentProject.metadata.description || ''}
            onChange={(e) =>
            onUpdateMetadata({
              description: e.target.value
            })
            }
            placeholder="Add a description..."
            className="w-full h-14 bg-background border border-border rounded-md p-2 text-[10px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          

            {/* Tags */}
            <div>
              <span className="text-[10px] text-muted-foreground">Tags</span>
              <input
              type="text"
              value={currentProject.metadata.tags?.join(', ') || ''}
              onChange={(e) =>
              onUpdateMetadata({
                tags: e.target.value.
                split(',').
                map((t) => t.trim()).
                filter(Boolean)
              })
              }
              placeholder="tag1, tag2, tag3"
              className="w-full h-7 bg-background border border-border rounded-md px-2 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mt-1" />
            
            </div>
          </div>
        </div> :

      <div className="flex flex-col items-center justify-center py-8 text-center">
          <FolderPlusIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs font-medium text-foreground mb-1">
            No active project
          </p>
          <p className="text-[10px] text-muted-foreground mb-3">
            Create or load a project
          </p>
        </div>
      }

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() =>
          onCreateProject({
            name: 'New Project'
          })
          }
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          
          <FolderPlusIcon className="w-3.5 h-3.5" />
          New
        </button>
        <button
          onClick={handleSave}
          disabled={!currentProject || loading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50">
          
          <SaveIcon className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          onClick={handleExport}
          disabled={!currentProject}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50">
          
          <DownloadIcon className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors">
          
          <UploadIcon className="w-3.5 h-3.5" />
          Import
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden" />
        
      </div>

      {/* Canvas Settings */}
      {currentProject &&
      <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 px-1">
            <SettingsIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              Canvas Settings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Width</label>
              <input
              type="number"
              value={currentProject.canvas.width}
              onChange={(e) =>
              onUpdateCanvas({
                width: parseInt(e.target.value) || 0
              })
              }
              className="w-full h-7 bg-muted border border-border rounded-md px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring mt-0.5" />
            
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">
                Height
              </label>
              <input
              type="number"
              value={currentProject.canvas.height}
              onChange={(e) =>
              onUpdateCanvas({
                height: parseInt(e.target.value) || 0
              })
              }
              className="w-full h-7 bg-muted border border-border rounded-md px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring mt-0.5" />
            
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PaletteIcon className="w-3 h-3 text-muted-foreground" />
            <label className="text-[10px] text-muted-foreground">
              Background
            </label>
            <div className="flex items-center gap-1.5 flex-1">
              <div className="relative w-6 h-6 rounded-md border border-border overflow-hidden">
                <input
                type="color"
                value={currentProject.canvas.backgroundColor}
                onChange={(e) =>
                onUpdateCanvas({
                  backgroundColor: e.target.value
                })
                }
                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10" />
              
                <div
                className="w-full h-full"
                style={{
                  backgroundColor: currentProject.canvas.backgroundColor
                }} />
              
              </div>
              <input
              type="text"
              value={currentProject.canvas.backgroundColor}
              onChange={(e) =>
              onUpdateCanvas({
                backgroundColor: e.target.value
              })
              }
              className="flex-1 h-6 bg-transparent text-[10px] font-mono text-muted-foreground uppercase focus:outline-none"
              maxLength={7} />
            
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground">FPS</label>
            <select
            value={currentProject.canvas.fps}
            onChange={(e) =>
            onUpdateCanvas({
              fps: parseInt(e.target.value)
            })
            }
            className="w-full h-7 bg-muted border border-border rounded-md px-2 text-xs text-foreground focus:outline-none mt-0.5">
            
              <option value={24}>24 fps</option>
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>
        </div>
      }

      {/* Project List */}
      <div className="space-y-2 pt-3 border-t border-border">
        <button
          onClick={() => setShowProjectList(!showProjectList)}
          className="flex items-center gap-1.5 px-1 w-full text-left">
          
          <FolderOpenIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground flex-1">
            Saved Projects ({projects.length})
          </span>
        </button>

        {showProjectList &&
        <div className="space-y-1 animate-fade-in max-h-48 overflow-y-auto scrollbar-none">
            {projects.length === 0 ?
          <p className="text-[10px] text-muted-foreground text-center py-4">
                No saved projects
              </p> :

          projects.map((project) =>
          <div
            key={project.id}
            className={`flex items-center justify-between p-2 rounded-lg border transition-colors group ${currentProject?.id === project.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
            
                  <button
              onClick={() => onLoadProject(project.id)}
              className="flex-1 text-left">
              
                    <p className="text-xs font-medium text-foreground">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </p>
                  </button>
                  <button
              onClick={() => {
                if (confirm(`Delete "${project.name}"?`)) {
                  onDeleteProject(project.id);
                }
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
              
                    <Trash2Icon className="w-3 h-3" />
                  </button>
                </div>
          )
          }
          </div>
        }
      </div>
    </div>);

}