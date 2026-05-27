// ============================================================================
// PROJECT MANAGER HOOK
// Phase 1: Project structure with save/load/export functionality
// ============================================================================

import { useState, useCallback } from 'react';
import type { Project, Layer, AssetReference, CanvasSettings } from '../types';

interface UseProjectManagerReturn {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;

  // Project Operations
  createProject: (settings?: Partial<Project>) => Project;
  saveProject: () => Promise<void>;
  loadProject: (id: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectMetadata: (updates: Partial<Project['metadata']>) => void;

  // Export/Import
  exportProject: (format: 'json' | 'zip') => Promise<Blob>;
  importProject: (file: File) => Promise<Project>;

  // Canvas Settings
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;

  // Layer Integration
  setProjectLayers: (layers: Layer[]) => void;
  addAssetReference: (assetId: string, layerId: string) => void;
  removeAssetReference: (assetId: string, layerId: string) => void;

  // Utilities
  getProjectList: () => Project[];
  clearProjects: () => void;
}

const STORAGE_KEY = 'superellipse-projects';
const CURRENT_PROJECT_KEY = 'superellipse-current-project';

const generateId = () => {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'Untitled Project',
  version: '3.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  canvas: {
    width: 1920,
    height: 1080,
    backgroundColor: '#FFFFFF',
    fps: 60
  },
  layers: [],
  assets: [],
  metadata: {
    author: undefined,
    description: undefined,
    tags: [],
    thumbnail: undefined
  }
});

export function useProjectManager(): UseProjectManagerReturn {
  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_PROJECT_KEY);
      if (stored) {
        const project = JSON.parse(stored);
        // Convert date strings back to Date objects
        project.createdAt = new Date(project.createdAt);
        project.updatedAt = new Date(project.updatedAt);
        return project;
      }
    } catch {

      // Ignore errors
    }return null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
    } catch {

      // Ignore errors
    }return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback((allProjects: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
    } catch (err) {
      console.error('Failed to save projects:', err);
      setError('Storage quota exceeded');
    }
  }, []);

  const saveCurrentProject = useCallback((project: Project) => {
    try {
      localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project));
    } catch (err) {
      console.error('Failed to save current project:', err);
    }
  }, []);

  // Create Project
  const createProject = useCallback(
    (settings?: Partial<Project>): Project => {
      const newProject: Project = {
        ...createDefaultProject(),
        ...settings,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCurrentProject(newProject);
      saveCurrentProject(newProject);

      const newProjects = [...projects, newProject];
      setProjects(newProjects);
      saveToStorage(newProjects);

      return newProject;
    },
    [projects, saveToStorage, saveCurrentProject]
  );

  // Save Project
  const saveProject = useCallback(async (): Promise<void> => {
    if (!currentProject) {
      throw new Error('No active project to save');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);

      const projectIndex = projects.findIndex((p) => p.id === currentProject.id);
      const newProjects = [...projects];

      if (projectIndex >= 0) {
        newProjects[projectIndex] = updatedProject;
      } else {
        newProjects.push(updatedProject);
      }

      setProjects(newProjects);
      saveToStorage(newProjects);

      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, [currentProject, projects, saveToStorage, saveCurrentProject]);

  // Load Project
  const loadProject = useCallback(
    async (id: string): Promise<Project> => {
      setLoading(true);
      setError(null);

      try {
        const project = projects.find((p) => p.id === id);
        if (!project) {
          throw new Error('Project not found');
        }

        setCurrentProject(project);
        saveCurrentProject(project);
        setLoading(false);

        return project;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Load failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [projects, saveCurrentProject]
  );

  // Delete Project
  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const newProjects = projects.filter((p) => p.id !== id);
        setProjects(newProjects);
        saveToStorage(newProjects);

        if (currentProject?.id === id) {
          setCurrentProject(null);
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }

        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [projects, currentProject, saveToStorage]
  );

  // Update Project Metadata
  const updateProjectMetadata = useCallback(
    (updates: Partial<Project['metadata']>) => {
      if (!currentProject) return;

      const updatedProject = {
        ...currentProject,
        metadata: {
          ...currentProject.metadata,
          ...updates
        },
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);
    },
    [currentProject, saveCurrentProject]
  );

  // Export Project
  const exportProject = useCallback(
    async (format: 'json' | 'zip'): Promise<Blob> => {
      if (!currentProject) {
        throw new Error('No active project to export');
      }

      setLoading(true);
      setError(null);

      try {
        if (format === 'json') {
          const data = JSON.stringify(currentProject, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          setLoading(false);
          return blob;
        } else {
          // ZIP export would require a library like JSZip
          // For now, just export as JSON
          const data = JSON.stringify(currentProject, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          setLoading(false);
          return blob;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [currentProject]
  );

  // Import Project
  const importProject = useCallback(
    async (file: File): Promise<Project> => {
      setLoading(true);
      setError(null);

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as Project;

        // Validate project structure
        if (!imported.id || !imported.name || !imported.canvas) {
          throw new Error('Invalid project file');
        }

        // Convert date strings to Date objects
        imported.createdAt = new Date(imported.createdAt);
        imported.updatedAt = new Date(imported.updatedAt);

        // Generate new ID to avoid conflicts
        const newProject: Project = {
          ...imported,
          id: generateId(),
          name: `${imported.name} (Imported)`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setCurrentProject(newProject);
        saveCurrentProject(newProject);

        const newProjects = [...projects, newProject];
        setProjects(newProjects);
        saveToStorage(newProjects);

        setLoading(false);
        return newProject;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Import failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [projects, saveToStorage, saveCurrentProject]
  );

  // Update Canvas Settings
  const updateCanvasSettings = useCallback(
    (settings: Partial<CanvasSettings>) => {
      if (!currentProject) return;

      const updatedProject = {
        ...currentProject,
        canvas: {
          ...currentProject.canvas,
          ...settings
        },
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);
    },
    [currentProject, saveCurrentProject]
  );

  // Set Project Layers
  const setProjectLayers = useCallback(
    (layers: Layer[]) => {
      if (!currentProject) return;

      const updatedProject = {
        ...currentProject,
        layers,
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);
    },
    [currentProject, saveCurrentProject]
  );

  // Add Asset Reference
  const addAssetReference = useCallback(
    (assetId: string, layerId: string) => {
      if (!currentProject) return;

      const exists = currentProject.assets.some(
        (ref) => ref.assetId === assetId && ref.layerId === layerId
      );

      if (exists) return;

      const updatedProject = {
        ...currentProject,
        assets: [...currentProject.assets, { assetId, layerId }],
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);
    },
    [currentProject, saveCurrentProject]
  );

  // Remove Asset Reference
  const removeAssetReference = useCallback(
    (assetId: string, layerId: string) => {
      if (!currentProject) return;

      const updatedProject = {
        ...currentProject,
        assets: currentProject.assets.filter(
          (ref) => !(ref.assetId === assetId && ref.layerId === layerId)
        ),
        updatedAt: new Date()
      };

      setCurrentProject(updatedProject);
      saveCurrentProject(updatedProject);
    },
    [currentProject, saveCurrentProject]
  );

  // Get Project List
  const getProjectList = useCallback((): Project[] => {
    return projects.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [projects]);

  // Clear Projects
  const clearProjects = useCallback(() => {
    setProjects([]);
    setCurrentProject(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }, []);

  return {
    currentProject,
    projects,
    loading,
    error,
    createProject,
    saveProject,
    loadProject,
    deleteProject,
    updateProjectMetadata,
    exportProject,
    importProject,
    updateCanvasSettings,
    setProjectLayers,
    addAssetReference,
    removeAssetReference,
    getProjectList,
    clearProjects
  };
}