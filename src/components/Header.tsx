import React from 'react';
import { SunIcon, MoonIcon, Undo2Icon, Redo2Icon, SaveIcon } from 'lucide-react';
interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  projectName?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}
export function Header({
  theme,
  toggleTheme,
  projectName,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSave
}: HeaderProps) {
  return (
    <header className="relative z-20 flex items-center justify-between px-4 py-3">
      {/* Left: Logo + Undo/Redo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground shadow-lg">
            <span className="font-bold text-[11px] tracking-tighter">Se</span>
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="font-semibold text-xs tracking-tight text-foreground">
              Superellipse
            </h1>
            <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
              Generator Pro 3.0
            </span>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)">
            
            <Undo2Icon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)">
            
            <Redo2Icon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Project Name */}
      {projectName &&
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-[11px] font-medium text-muted-foreground">
            {projectName}
          </span>
        </div>
      }

      {/* Right: Save + Theme */}
      <div className="flex items-center gap-1">
        {onSave &&
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Save (Ctrl+S)">
          
            <SaveIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        }
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme">
          
          {theme === 'light' ?
          <SunIcon className="w-4 h-4" /> :

          <MoonIcon className="w-4 h-4" />
          }
        </button>
      </div>
    </header>);

}