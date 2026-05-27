import React, { useCallback, useState, useRef } from 'react';
import {
  UploadCloudIcon,
  SearchIcon,
  Trash2Icon,
  ImageIcon,
  TypeIcon,
  HardDriveIcon,
  XIcon,
  LoaderIcon,
  AlertCircleIcon } from
'lucide-react';
import type { Asset, ImageAsset, FontAsset } from '../../types';
interface AssetPanelProps {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  onUpload: (file: File) => Promise<Asset>;
  onDelete: (id: string) => Promise<void>;
  onLoadGoogleFont: (family: string) => Promise<FontAsset>;
  storageUsage: number;
}
const MAX_STORAGE = 50 * 1024 * 1024;
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
export function AssetPanel({
  assets,
  loading,
  error,
  onUpload,
  onDelete,
  onLoadGoogleFont,
  storageUsage
}: AssetPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'font'>(
    'all'
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.
    toLowerCase().
    includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
    return matchesSearch && matchesFilter;
  });
  const imageAssets = filteredAssets.filter(
    (a) => a.type === 'image'
  ) as ImageAsset[];
  const fontAssets = filteredAssets.filter(
    (a) => a.type === 'font'
  ) as FontAsset[];
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await onUpload(file);
        }
      }
    },
    [onUpload]
  );
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        await onUpload(file);
      }
      e.target.value = '';
    },
    [onUpload]
  );
  const popularFonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Raleway',
  'Oswald'];

  const filteredFonts = fontSearch ?
  popularFonts.filter((f) =>
  f.toLowerCase().includes(fontSearch.toLowerCase())
  ) :
  popularFonts;
  const storagePercent = Math.round(storageUsage / MAX_STORAGE * 100);
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Error */}
      {error &&
      <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
          <AlertCircleIcon className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <p className="text-[10px] text-destructive">{error}</p>
        </div>
      }

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'}`}>
        
        {loading ?
        <LoaderIcon className="w-6 h-6 text-muted-foreground animate-spin" /> :

        <UploadCloudIcon
          className={`w-6 h-6 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />

        }
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">
            {isDragOver ? 'Drop files here' : 'Upload Assets'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Drag & drop or click to browse
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden" />
        
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets..."
          className="w-full h-8 pl-8 pr-8 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        
        {searchQuery &&
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-accent">
          
            <XIcon className="w-3 h-3 text-muted-foreground" />
          </button>
        }
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors ${activeFilter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          
          All ({assets.length})
        </button>
        <button
          onClick={() => setActiveFilter('image')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${activeFilter === 'image' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          
          <ImageIcon className="w-3 h-3" />
          Images
        </button>
        <button
          onClick={() => setActiveFilter('font')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${activeFilter === 'font' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          
          <TypeIcon className="w-3 h-3" />
          Fonts
        </button>
      </div>

      {/* Asset Grid */}
      {(activeFilter === 'all' || activeFilter === 'image') &&
      imageAssets.length > 0 &&
      <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground px-1">
              Images
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {imageAssets.map((asset) =>
          <div
            key={asset.id}
            className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:border-primary/50 transition-colors">
            
                  <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.name}
              className="w-full h-full object-cover" />
            
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                onClick={() => onDelete(asset.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-destructive text-destructive-foreground transition-opacity"
                title="Delete">
                
                      <Trash2Icon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[8px] text-white truncate">
                      {asset.name}
                    </p>
                  </div>
                </div>
          )}
            </div>
          </div>
      }

      {/* Font Assets */}
      {(activeFilter === 'all' || activeFilter === 'font') &&
      fontAssets.length > 0 &&
      <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground px-1">
              Fonts
            </p>
            <div className="space-y-1">
              {fontAssets.map((asset) =>
          <div
            key={asset.id}
            className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {asset.family}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {asset.source}
                    </p>
                  </div>
                  <button
              onClick={() => onDelete(asset.id)}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              
                    <Trash2Icon className="w-3 h-3" />
                  </button>
                </div>
          )}
            </div>
          </div>
      }

      {/* Empty State */}
      {filteredAssets.length === 0 &&
      <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No assets found</p>
        </div>
      }

      {/* Google Fonts */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-medium text-muted-foreground px-1">
          Google Fonts
        </p>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={fontSearch}
            onChange={(e) => setFontSearch(e.target.value)}
            placeholder="Search fonts..."
            className="w-full h-7 pl-7 pr-2 bg-muted border border-border rounded-md text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          
        </div>
        <div className="grid grid-cols-2 gap-1">
          {filteredFonts.slice(0, 8).map((font) =>
          <button
            key={font}
            onClick={() => onLoadGoogleFont(font)}
            className="px-2 py-1.5 text-[10px] font-medium text-foreground bg-secondary hover:bg-accent rounded-md transition-colors text-left truncate">
            
              {font}
            </button>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <HardDriveIcon className="w-3 h-3" />
            Storage
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatBytes(storageUsage)} / {formatBytes(MAX_STORAGE)}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${storagePercent > 80 ? 'bg-destructive' : 'bg-primary'}`}
            style={{
              width: `${Math.min(storagePercent, 100)}%`
            }} />
          
        </div>
      </div>
    </div>);

}