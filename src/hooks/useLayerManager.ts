// ============================================================================
// LAYER MANAGER HOOK
// Phase 1: Multi-layer composition system with hierarchy and effects
// ============================================================================

import { useState, useCallback } from 'react';
import type {
  Layer,
  LayerType,
  LayerContent,
  Transform,
  BlendMode,
  LayerEffect } from
'../types';

interface UseLayerManagerReturn {
  layers: Layer[];
  selectedLayerId: string | null;

  // CRUD Operations
  addLayer: (type: LayerType, name?: string, data?: Partial<Layer>) => Layer;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  duplicateLayer: (layerId: string) => Layer | null;

  // Selection
  selectLayer: (layerId: string | null) => void;
  getSelectedLayer: () => Layer | null;

  // Visibility & Lock
  toggleVisibility: (layerId: string) => void;
  toggleLock: (layerId: string) => void;
  toggleSolo: (layerId: string) => void;

  // Hierarchy
  reorderLayer: (layerId: string, direction: 'up' | 'down') => void;
  moveLayerTo: (layerId: string, targetIndex: number) => void;
  setParent: (layerId: string, parentId: string | null) => void;
  getChildLayers: (parentId: string | null) => Layer[];

  // Group Operations
  groupLayers: (layerIds: string[]) => Layer;
  ungroupLayer: (groupId: string) => void;
  toggleGroupExpanded: (groupId: string) => void;

  // Effects
  addEffect: (layerId: string, effect: LayerEffect) => void;
  removeEffect: (layerId: string, effectId: string) => void;
  updateEffect: (
  layerId: string,
  effectId: string,
  updates: Partial<LayerEffect>)
  => void;
  reorderEffect: (
  layerId: string,
  effectId: string,
  direction: 'up' | 'down')
  => void;

  // Bulk Operations
  clearLayers: () => void;
  importLayers: (layers: Layer[]) => void;

  // Utilities
  getLayer: (layerId: string) => Layer | undefined;
  getLayersByType: (type: LayerType) => Layer[];
  getVisibleLayers: () => Layer[];
}

const createDefaultTransform = (): Transform => ({
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  anchorX: 0.5,
  anchorY: 0.5
});

const createDefaultContent = (type: LayerType): LayerContent => {
  switch (type) {
    case 'shape':
      return {
        type: 'superellipse',
        params: {
          width: 200,
          height: 200,
          radius: 40,
          smoothing: 0,
          eccentricity: 4.0
        },
        fill: {
          type: 'solid',
          color: '#6366F1',
          opacity: 1
        },
        stroke: {
          enabled: false,
          color: '#000000',
          width: 2,
          position: 'center',
          style: 'solid',
          opacity: 1
        }
      };
    case 'image':
      return {
        assetId: '',
        fit: 'contain',
        position: { x: 0, y: 0 }
      };
    case 'text':
      return {
        text: 'Text Layer',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 400,
        fontStyle: 'normal',
        lineHeight: 1.5,
        letterSpacing: 0,
        textAlign: 'left',
        color: '#000000'
      };
    case 'group':
      return {
        expanded: true
      };
    case 'adjustment':
      return {
        adjustmentType: 'brightness',
        params: { value: 0 }
      };
  }
};

export function useLayerManager(): UseLayerManagerReturn {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add Layer
  const addLayer = useCallback(
    (type: LayerType, name?: string, data?: Partial<Layer>): Layer => {
      const newLayer: Layer = {
        id: generateId(),
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
        type,
        visible: true,
        locked: false,
        solo: false,
        opacity: 1,
        blendMode: 'normal',
        transform: createDefaultTransform(),
        content: createDefaultContent(type),
        effects: [],
        parentId: null,
        children: [],
        zIndex: layers.length,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        },
        ...data
      };

      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      return newLayer;
    },
    [layers.length, generateId]
  );

  // Remove Layer
  const removeLayer = useCallback(
    (layerId: string) => {
      setLayers((prev) => {
        const layer = prev.find((l) => l.id === layerId);
        if (!layer) return prev;

        // Remove children if it's a group
        let filtered = prev.filter(
          (l) => l.id !== layerId && l.parentId !== layerId
        );

        // Update parent's children array
        if (layer.parentId) {
          filtered = filtered.map((l) =>
          l.id === layer.parentId ?
          { ...l, children: l.children.filter((id) => id !== layerId) } :
          l
          );
        }

        return filtered;
      });

      if (selectedLayerId === layerId) {
        setSelectedLayerId(null);
      }
    },
    [selectedLayerId]
  );

  // Update Layer
  const updateLayer = useCallback(
    (layerId: string, updates: Partial<Layer>) => {
      setLayers((prev) =>
      prev.map((layer) =>
      layer.id === layerId ?
      {
        ...layer,
        ...updates,
        metadata: {
          ...layer.metadata,
          updatedAt: new Date()
        }
      } :
      layer
      )
      );
    },
    []
  );

  // Duplicate Layer
  const duplicateLayer = useCallback(
    (layerId: string): Layer | null => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return null;

      const duplicated: Layer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        zIndex: layer.zIndex + 1,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      setLayers((prev) => {
        const index = prev.findIndex((l) => l.id === layerId);
        const newLayers = [...prev];
        newLayers.splice(index + 1, 0, duplicated);
        return newLayers;
      });

      setSelectedLayerId(duplicated.id);
      return duplicated;
    },
    [layers, generateId]
  );

  // Selection
  const selectLayer = useCallback((layerId: string | null) => {
    setSelectedLayerId(layerId);
  }, []);

  const getSelectedLayer = useCallback((): Layer | null => {
    return layers.find((l) => l.id === selectedLayerId) || null;
  }, [layers, selectedLayerId]);

  // Toggle Visibility
  const toggleVisibility = useCallback(
    (layerId: string) => {
      updateLayer(layerId, {
        visible: !layers.find((l) => l.id === layerId)?.visible
      });
    },
    [layers, updateLayer]
  );

  // Toggle Lock
  const toggleLock = useCallback(
    (layerId: string) => {
      updateLayer(layerId, {
        locked: !layers.find((l) => l.id === layerId)?.locked
      });
    },
    [layers, updateLayer]
  );

  // Toggle Solo
  const toggleSolo = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      const newSoloState = !layer.solo;

      setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        solo: l.id === layerId ? newSoloState : false
      }))
      );
    },
    [layers]
  );

  // Reorder Layer
  const reorderLayer = useCallback(
    (layerId: string, direction: 'up' | 'down') => {
      setLayers((prev) => {
        const index = prev.findIndex((l) => l.id === layerId);
        if (index === -1) return prev;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;

        const newLayers = [...prev];
        const [removed] = newLayers.splice(index, 1);
        newLayers.splice(newIndex, 0, removed);

        // Update zIndex
        return newLayers.map((layer, i) => ({ ...layer, zIndex: i }));
      });
    },
    []
  );

  // Move Layer To Index
  const moveLayerTo = useCallback((layerId: string, targetIndex: number) => {
    setLayers((prev) => {
      const index = prev.findIndex((l) => l.id === layerId);
      if (index === -1) return prev;

      const newLayers = [...prev];
      const [removed] = newLayers.splice(index, 1);
      newLayers.splice(targetIndex, 0, removed);

      return newLayers.map((layer, i) => ({ ...layer, zIndex: i }));
    });
  }, []);

  // Set Parent
  const setParent = useCallback((layerId: string, parentId: string | null) => {
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === layerId);
      const oldParent = prev.find((l) => l.id === layer?.parentId);
      const newParent = parentId ? prev.find((l) => l.id === parentId) : null;

      if (!layer) return prev;

      return prev.map((l) => {
        // Update the layer itself
        if (l.id === layerId) {
          return { ...l, parentId };
        }
        // Remove from old parent's children
        if (l.id === oldParent?.id) {
          return {
            ...l,
            children: l.children.filter((id) => id !== layerId)
          };
        }
        // Add to new parent's children
        if (l.id === newParent?.id && !l.children.includes(layerId)) {
          return {
            ...l,
            children: [...l.children, layerId]
          };
        }
        return l;
      });
    });
  }, []);

  // Get Child Layers
  const getChildLayers = useCallback(
    (parentId: string | null): Layer[] => {
      return layers.filter((l) => l.parentId === parentId);
    },
    [layers]
  );

  // Group Layers
  const groupLayers = useCallback(
    (layerIds: string[]): Layer => {
      const group = addLayer('group', 'Group');

      layerIds.forEach((layerId) => {
        setParent(layerId, group.id);
      });

      return group;
    },
    [addLayer, setParent]
  );

  // Ungroup Layer
  const ungroupLayer = useCallback(
    (groupId: string) => {
      const group = layers.find((l) => l.id === groupId);
      if (!group || group.type !== 'group') return;

      // Move children to group's parent
      group.children.forEach((childId) => {
        setParent(childId, group.parentId);
      });

      // Remove the group
      removeLayer(groupId);
    },
    [layers, setParent, removeLayer]
  );

  // Toggle Group Expanded
  const toggleGroupExpanded = useCallback(
    (groupId: string) => {
      const group = layers.find((l) => l.id === groupId);
      if (!group || group.type !== 'group') return;

      updateLayer(groupId, {
        content: {
          ...group.content,
          expanded: !(group.content as any).expanded
        }
      });
    },
    [layers, updateLayer]
  );

  // Add Effect
  const addEffect = useCallback(
    (layerId: string, effect: LayerEffect) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      updateLayer(layerId, {
        effects: [...layer.effects, effect]
      });
    },
    [layers, updateLayer]
  );

  // Remove Effect
  const removeEffect = useCallback(
    (layerId: string, effectId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      updateLayer(layerId, {
        effects: layer.effects.filter((e) => e.id !== effectId)
      });
    },
    [layers, updateLayer]
  );

  // Update Effect
  const updateEffect = useCallback(
    (layerId: string, effectId: string, updates: Partial<LayerEffect>) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      updateLayer(layerId, {
        effects: layer.effects.map((e) =>
        e.id === effectId ? { ...e, ...updates } : e
        )
      });
    },
    [layers, updateLayer]
  );

  // Reorder Effect
  const reorderEffect = useCallback(
    (layerId: string, effectId: string, direction: 'up' | 'down') => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;

      const effects = [...layer.effects];
      const index = effects.findIndex((e) => e.id === effectId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= effects.length) return;

      const [removed] = effects.splice(index, 1);
      effects.splice(newIndex, 0, removed);

      updateLayer(layerId, { effects });
    },
    [layers, updateLayer]
  );

  // Clear Layers
  const clearLayers = useCallback(() => {
    setLayers([]);
    setSelectedLayerId(null);
  }, []);

  // Import Layers
  const importLayers = useCallback((importedLayers: Layer[]) => {
    setLayers(importedLayers);
    setSelectedLayerId(null);
  }, []);

  // Get Layer
  const getLayer = useCallback(
    (layerId: string): Layer | undefined => {
      return layers.find((l) => l.id === layerId);
    },
    [layers]
  );

  // Get Layers By Type
  const getLayersByType = useCallback(
    (type: LayerType): Layer[] => {
      return layers.filter((l) => l.type === type);
    },
    [layers]
  );

  // Get Visible Layers
  const getVisibleLayers = useCallback((): Layer[] => {
    const soloLayers = layers.filter((l) => l.solo);
    if (soloLayers.length > 0) {
      return soloLayers.filter((l) => l.visible);
    }
    return layers.filter((l) => l.visible);
  }, [layers]);

  return {
    layers,
    selectedLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    duplicateLayer,
    selectLayer,
    getSelectedLayer,
    toggleVisibility,
    toggleLock,
    toggleSolo,
    reorderLayer,
    moveLayerTo,
    setParent,
    getChildLayers,
    groupLayers,
    ungroupLayer,
    toggleGroupExpanded,
    addEffect,
    removeEffect,
    updateEffect,
    reorderEffect,
    clearLayers,
    importLayers,
    getLayer,
    getLayersByType,
    getVisibleLayers
  };
}