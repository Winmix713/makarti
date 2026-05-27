// ============================================================================
// ASSET LIBRARY HOOK
// Phase 1: Image and font asset management with upload and storage
// ============================================================================

import { useState, useCallback } from 'react';
import type {
  Asset,
  ImageAsset,
  FontAsset,
  AssetType,
  AssetFilters } from
'../types';

interface UseAssetLibraryReturn {
  assets: Asset[];
  loading: boolean;
  error: string | null;

  // Upload & Management
  uploadAsset: (file: File) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  getAsset: (id: string) => Asset | undefined;
  getAssetUrl: (id: string) => string;
  getThumbnailUrl: (id: string) => string;

  // Search & Filter
  searchAssets: (query: string, filters?: AssetFilters) => Asset[];
  getAssetsByType: (type: AssetType) => Asset[];

  // Import/Export
  importFromUrl: (url: string, name?: string) => Promise<Asset>;
  exportAll: () => Promise<Blob>;

  // Google Fonts Integration
  loadGoogleFont: (family: string) => Promise<FontAsset>;
  searchGoogleFonts: (query: string) => Promise<FontAsset[]>;

  // Utilities
  clearAssets: () => void;
  getStorageUsage: () => number;
}

const STORAGE_KEY = 'superellipse-assets';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB

// Generate unique ID
const generateId = () => {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Generate thumbnail from image
const generateThumbnail = (
imageUrl: string,
maxWidth: number = 200,
maxHeight: number = 200)
: Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = height * maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

// Get image dimensions
const getImageDimensions = (
url: string)
: Promise<{width: number;height: number;}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

// Detect image format from data URL
const detectImageFormat = (
dataUrl: string)
: 'png' | 'jpg' | 'webp' | 'svg' | 'gif' => {
  if (dataUrl.includes('image/png')) return 'png';
  if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg'))
  return 'jpg';
  if (dataUrl.includes('image/webp')) return 'webp';
  if (dataUrl.includes('image/svg')) return 'svg';
  if (dataUrl.includes('image/gif')) return 'gif';
  return 'png'; // default
};

export function useAssetLibrary(): UseAssetLibraryReturn {
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback((newAssets: Asset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
    } catch (err) {
      console.error('Failed to save assets:', err);
      setError('Storage quota exceeded');
    }
  }, []);

  // Upload Asset
  const uploadAsset = useCallback(
    async (file: File): Promise<Asset> => {
      setLoading(true);
      setError(null);

      try {
        // Check file size
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        // Check storage usage
        const currentUsage = getStorageUsage();
        if (currentUsage + file.size > MAX_STORAGE_SIZE) {
          throw new Error('Storage quota exceeded');
        }

        const dataUrl = await fileToBase64(file);
        const format = detectImageFormat(dataUrl);

        // Create image asset
        const dimensions = await getImageDimensions(dataUrl);
        const thumbnail = await generateThumbnail(dataUrl);

        const asset: ImageAsset = {
          id: generateId(),
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          type: 'image',
          originalName: file.name,
          url: dataUrl,
          thumbnailUrl: thumbnail,
          width: dimensions.width,
          height: dimensions.height,
          size: file.size,
          format,
          usedIn: [],
          createdAt: new Date()
        };

        const newAssets = [...assets, asset];
        setAssets(newAssets);
        saveToStorage(newAssets);

        setLoading(false);
        return asset;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [assets, saveToStorage]
  );

  // Delete Asset
  const deleteAsset = useCallback(
    async (id: string): Promise<void> => {
      const newAssets = assets.filter((a) => a.id !== id);
      setAssets(newAssets);
      saveToStorage(newAssets);
    },
    [assets, saveToStorage]
  );

  // Get Asset
  const getAsset = useCallback(
    (id: string): Asset | undefined => {
      return assets.find((a) => a.id === id);
    },
    [assets]
  );

  // Get Asset URL
  const getAssetUrl = useCallback(
    (id: string): string => {
      const asset = assets.find((a) => a.id === id);
      if (!asset) return '';
      if (asset.type === 'image') {
        return (asset as ImageAsset).url;
      }
      return '';
    },
    [assets]
  );

  // Get Thumbnail URL
  const getThumbnailUrl = useCallback(
    (id: string): string => {
      const asset = assets.find((a) => a.id === id);
      if (!asset || asset.type !== 'image') return '';
      return (asset as ImageAsset).thumbnailUrl;
    },
    [assets]
  );

  // Search Assets
  const searchAssets = useCallback(
    (query: string, filters?: AssetFilters): Asset[] => {
      let filtered = assets;

      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(lowerQuery)
        );
      }

      // Type filter
      if (filters?.type) {
        filtered = filtered.filter((a) => a.type === filters.type);
      }

      // Format filter (for images)
      if (filters?.format) {
        filtered = filtered.filter(
          (a) =>
          a.type === 'image' && (a as ImageAsset).format === filters.format
        );
      }

      // Tags filter
      if (filters?.tags && filters.tags.length > 0) {

        // Future implementation when tags are added
      }
      // Date range filter
      if (filters?.dateRange) {
        filtered = filtered.filter((a) => {
          const date = new Date(a.createdAt);
          return (
            date >= filters.dateRange!.start && date <= filters.dateRange!.end);

        });
      }

      return filtered;
    },
    [assets]
  );

  // Get Assets By Type
  const getAssetsByType = useCallback(
    (type: AssetType): Asset[] => {
      return assets.filter((a) => a.type === type);
    },
    [assets]
  );

  // Import From URL
  const importFromUrl = useCallback(
    async (url: string, name?: string): Promise<Asset> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], name || 'imported-image', {
          type: blob.type
        });

        const asset = await uploadAsset(file);
        setLoading(false);
        return asset;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Import failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [uploadAsset]
  );

  // Export All
  const exportAll = useCallback(async (): Promise<Blob> => {
    const data = JSON.stringify(assets, null, 2);
    return new Blob([data], { type: 'application/json' });
  }, [assets]);

  // Load Google Font
  const loadGoogleFont = useCallback(
    async (family: string): Promise<FontAsset> => {
      setLoading(true);
      setError(null);

      try {
        // Load font from Google Fonts API
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const fontAsset: FontAsset = {
          id: generateId(),
          name: family,
          type: 'font',
          family,
          category: 'sans-serif', // Default, should be fetched from API
          variants: [
          { weight: 400, style: 'normal', url: link.href },
          { weight: 700, style: 'normal', url: link.href }],

          source: 'google',
          createdAt: new Date()
        };

        const newAssets = [...assets, fontAsset];
        setAssets(newAssets);
        saveToStorage(newAssets);

        setLoading(false);
        return fontAsset;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Font load failed';
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [assets, saveToStorage]
  );

  // Search Google Fonts (mock implementation)
  const searchGoogleFonts = useCallback(
    async (query: string): Promise<FontAsset[]> => {
      // In production, this would call Google Fonts API
      // For now, return popular fonts
      const popularFonts = [
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Poppins',
      'Inter',
      'Playfair Display',
      'Raleway'];


      const filtered = popularFonts.filter((font) =>
      font.toLowerCase().includes(query.toLowerCase())
      );

      return filtered.map((family) => ({
        id: generateId(),
        name: family,
        type: 'font' as const,
        family,
        category: 'sans-serif' as const,
        variants: [{ weight: 400, style: 'normal' as const, url: '' }],
        source: 'google' as const,
        createdAt: new Date()
      }));
    },
    []
  );

  // Clear Assets
  const clearAssets = useCallback(() => {
    setAssets([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get Storage Usage
  const getStorageUsage = useCallback((): number => {
    return assets.reduce((total, asset) => {
      if (asset.type === 'image') {
        return total + (asset as ImageAsset).size;
      }
      return total;
    }, 0);
  }, [assets]);

  return {
    assets,
    loading,
    error,
    uploadAsset,
    deleteAsset,
    getAsset,
    getAssetUrl,
    getThumbnailUrl,
    searchAssets,
    getAssetsByType,
    importFromUrl,
    exportAll,
    loadGoogleFont,
    searchGoogleFonts,
    clearAssets,
    getStorageUsage
  };
}