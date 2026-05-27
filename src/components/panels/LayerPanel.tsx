import React, { useState, Children } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  Trash2Icon,
  CopyIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SquareIcon,
  TypeIcon,
  ImageIcon,
  FolderIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SlidersHorizontalIcon,
  GroupIcon,
  UngroupIcon,
  StarIcon } from
'lucide-react';
import type { Layer, LayerType, BlendMode, LayerEffect } from '../../types';
interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddLayer: (type: LayerType, name?: string) => void;
  onRemoveLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
  onGroupLayers: (ids: string[]) => void;
  onUngroupLayer: (id: string) => void;
  onToggleGroupExpanded: (id: string) => void;
  onAddEffect: (layerId: string, effect: LayerEffect) => void;
  onRemoveEffect: (layerId: string, effectId: string) => void;
}
const BLEND_MODES: BlendMode[] = [
'normal',
'multiply',
'screen',
'overlay',
'darken',
'lighten',
'color-dodge',
'color-burn',
'hard-light',
'soft-light',
'difference',
'exclusion',
'hue',
'saturation',
'color',
'luminosity'];

const LAYER_TYPE_ICONS: Record<LayerType, React.ReactNode> = {
  shape: <SquareIcon className="w-3.5 h-3.5" />,
  text: <TypeIcon className="w-3.5 h-3.5" />,
  image: <ImageIcon className="w-3.5 h-3.5" />,
  group: <FolderIcon className="w-3.5 h-3.5" />,
  adjustment: <SlidersHorizontalIcon className="w-3.5 h-3.5" />
};
export function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onToggleLock,
  onToggleSolo,
  onReorderLayer,
  onGroupLayers,
  onUngroupLayer,
  onToggleGroupExpanded
}: LayerPanelProps) {
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const rootLayers = layers.filter((l) => l.parentId === null);
  const getChildren = (parentId: string) =>
  layers.filter((l) => l.parentId === parentId);
  const renderLayer = (layer: Layer, depth: number = 0) => {
    const isSelected = layer.id === selectedLayerId;
    const isGroup = layer.type === 'group';
    const isExpanded = isGroup && (layer.content as any)?.expanded;
    const children = getChildren(layer.id);
    const showDetails = expandedDetails === layer.id;
    return (
      <div key={layer.id}>
        {/* Layer Row */}
        <div
          className={`group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-colors border-l-2 ${isSelected ? 'bg-accent border-l-primary text-accent-foreground' : 'border-l-transparent hover:bg-muted/50'}`}
          style={{
            paddingLeft: `${depth * 16 + 8}px`
          }}
          onClick={() => onSelectLayer(layer.id)}>
          
          {/* Group Expand Toggle */}
          {isGroup ?
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleGroupExpanded(layer.id);
            }}
            className="p-0.5 rounded hover:bg-accent transition-colors">
            
              {isExpanded ?
            <ChevronDownIcon className="w-3 h-3 text-muted-foreground" /> :

            <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
            }
            </button> :

          <span className="w-4" />
          }

          {/* Type Icon */}
          <span
            className={`flex-shrink-0 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
            
            {LAYER_TYPE_ICONS[layer.type]}
          </span>

          {/* Name */}
          <span className="flex-1 text-[11px] font-medium truncate text-foreground">
            {layer.name}
          </span>

          {/* Solo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSolo(layer.id);
            }}
            className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${layer.solo ? '!opacity-100 text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
            title="Solo">
            
            <StarIcon className="w-3 h-3" />
          </button>

          {/* Visibility */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(layer.id);
            }}
            className={`p-0.5 rounded transition-colors ${layer.visible ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/30'}`}
            title={layer.visible ? 'Hide' : 'Show'}>
            
            {layer.visible ?
            <EyeIcon className="w-3 h-3" /> :

            <EyeOffIcon className="w-3 h-3" />
            }
          </button>

          {/* Lock */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(layer.id);
            }}
            className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${layer.locked ? '!opacity-100 text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
            title={layer.locked ? 'Unlock' : 'Lock'}>
            
            {layer.locked ?
            <LockIcon className="w-3 h-3" /> :

            <UnlockIcon className="w-3 h-3" />
            }
          </button>
        </div>

        {/* Layer Details (when selected) */}
        {isSelected &&
        <div className="px-3 py-2 bg-muted/30 border-b border-border space-y-2 animate-fade-in">
            {/* Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-12">
                Opacity
              </span>
              <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity}
              onChange={(e) =>
              onUpdateLayer(layer.id, {
                opacity: parseFloat(e.target.value)
              })
              }
              className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
            
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>

            {/* Blend Mode */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-12">
                Blend
              </span>
              <select
              value={layer.blendMode}
              onChange={(e) =>
              onUpdateLayer(layer.id, {
                blendMode: e.target.value as BlendMode
              })
              }
              className="flex-1 h-6 bg-background border border-border rounded-md text-[10px] text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-ring">
              
                {BLEND_MODES.map((mode) =>
              <option key={mode} value={mode}>
                    {mode}
                  </option>
              )}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-1">
              <button
              onClick={() => onReorderLayer(layer.id, 'up')}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Move Up">
              
                <ArrowUpIcon className="w-3 h-3" />
              </button>
              <button
              onClick={() => onReorderLayer(layer.id, 'down')}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Move Down">
              
                <ArrowDownIcon className="w-3 h-3" />
              </button>
              <button
              onClick={() => onDuplicateLayer(layer.id)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Duplicate">
              
                <CopyIcon className="w-3 h-3" />
              </button>
              {isGroup &&
            <button
              onClick={() => onUngroupLayer(layer.id)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Ungroup">
              
                  <UngroupIcon className="w-3 h-3" />
                </button>
            }
              <div className="flex-1" />
              <button
              onClick={() => onRemoveLayer(layer.id)}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete">
              
                <Trash2Icon className="w-3 h-3" />
              </button>
            </div>
          </div>
        }

        {/* Children */}
        {isGroup &&
        isExpanded &&
        children.map((child) => renderLayer(child, depth + 1))}
      </div>);

  };
  return (
    <div className="flex flex-col h-full">
      {/* Add Layer Buttons */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddLayer('shape', 'Shape')}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-accent transition-colors"
            title="Add Shape">
            
            <SquareIcon className="w-3 h-3" />
            Shape
          </button>
          <button
            onClick={() => onAddLayer('text', 'Text')}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-accent transition-colors"
            title="Add Text">
            
            <TypeIcon className="w-3 h-3" />
            Text
          </button>
          <button
            onClick={() => onAddLayer('image', 'Image')}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-accent transition-colors"
            title="Add Image">
            
            <ImageIcon className="w-3 h-3" />
            Image
          </button>
          <button
            onClick={() => onAddLayer('group', 'Group')}
            className="flex items-center justify-center p-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
            title="Add Group">
            
            <FolderIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {layers.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <SquareIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-foreground mb-1">
              No layers yet
            </p>
            <p className="text-[10px] text-muted-foreground">
              Add a shape, text, or image layer to get started
            </p>
          </div> :

        <div className="py-1">
            {[...rootLayers].reverse().map((layer) => renderLayer(layer))}
          </div>
        }
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </span>
        {selectedLayerId &&
        <button
          onClick={() => {
            if (selectedLayerId) {
              onGroupLayers([selectedLayerId]);
            }
          }}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          
            <GroupIcon className="w-3 h-3" />
            Group
          </button>
        }
      </div>
    </div>);

}