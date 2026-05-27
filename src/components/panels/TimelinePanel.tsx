import React, { useCallback, useState, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SquareIcon as StopIcon,
  RepeatIcon,
  PlusIcon,
  ChevronRightIcon,
  DiamondIcon,
  GaugeIcon } from
'lucide-react';
import type { Layer } from '../../types';
interface TimelinePanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onAddKeyframe: (layerId: string, time: number) => void;
}
const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const frames = Math.floor(ms % 1000 / (1000 / 60));
  return `${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};
const SPEEDS = [0.25, 0.5, 1, 1.5, 2];
export function TimelinePanel({
  layers,
  selectedLayerId,
  isPlaying,
  currentTime,
  duration,
  loop,
  playbackSpeed,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onToggleLoop,
  onSetPlaybackSpeed,
  onAddKeyframe
}: TimelinePanelProps) {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const progress = duration > 0 ? currentTime / duration * 100 : 0;
  const handleScrub = useCallback(
    (clientX: number) => {
      if (!scrubberRef.current) return;
      const rect = scrubberRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      onSeek(percent * duration);
    },
    [duration, onSeek]
  );
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrub(e.clientX);
    const handleMouseMove = (e: MouseEvent) => handleScrub(e.clientX);
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  // Generate tick marks
  const tickCount = Math.max(1, Math.floor(duration / 1000));
  const ticks = Array.from(
    {
      length: tickCount + 1
    },
    (_, i) => i
  );
  return (
    <div className="flex flex-col h-full bg-card border-t border-border">
      {/* Transport Controls */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        {/* Play/Pause/Stop */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onStop}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Stop">
            
            <StopIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}>
            
            {isPlaying ?
            <PauseIcon className="w-3.5 h-3.5" /> :

            <PlayIcon className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
          <span className="text-[10px] font-mono font-medium text-foreground">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        {/* Loop */}
        <button
          onClick={onToggleLoop}
          className={`p-1.5 rounded-md transition-colors ${loop ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
          title="Loop">
          
          <RepeatIcon className="w-3.5 h-3.5" />
        </button>

        {/* Speed */}
        <div className="flex items-center gap-1">
          <GaugeIcon className="w-3 h-3 text-muted-foreground" />
          <select
            value={playbackSpeed}
            onChange={(e) => onSetPlaybackSpeed(parseFloat(e.target.value))}
            className="h-6 bg-muted border border-border rounded-md text-[10px] text-foreground px-1 focus:outline-none">
            
            {SPEEDS.map((speed) =>
            <option key={speed} value={speed}>
                {speed}x
              </option>
            )}
          </select>
        </div>

        <div className="flex-1" />

        {/* Add Keyframe */}
        {selectedLayerId &&
        <button
          onClick={() => onAddKeyframe(selectedLayerId, currentTime)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-accent transition-colors">
          
            <PlusIcon className="w-3 h-3" />
            Keyframe
          </button>
        }
      </div>

      {/* Timeline Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track Labels */}
        <div className="w-36 flex-shrink-0 border-r border-border overflow-y-auto scrollbar-none">
          {/* Ruler header */}
          <div className="h-6 border-b border-border" />

          {/* Track labels */}
          {layers.map((layer) =>
          <div
            key={layer.id}
            className={`h-7 flex items-center gap-1.5 px-2 border-b border-border text-[10px] truncate ${layer.id === selectedLayerId ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}>
            
              <ChevronRightIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{layer.name}</span>
            </div>
          )}
        </div>

        {/* Timeline Tracks */}
        <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-none">
          {/* Time Ruler */}
          <div
            ref={scrubberRef}
            className="h-6 border-b border-border relative cursor-pointer bg-muted/30"
            onMouseDown={handleMouseDown}>
            
            {/* Tick marks */}
            {ticks.map((tick) =>
            <div
              key={tick}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{
                left: `${tick / tickCount * 100}%`
              }}>
              
                <div className="w-px h-2 bg-border" />
                <span className="text-[8px] text-muted-foreground mt-0.5">
                  {tick}s
                </span>
              </div>
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary z-10 pointer-events-none"
              style={{
                left: `${progress}%`
              }}>
              
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>

          {/* Track Rows */}
          {layers.map((layer) =>
          <div
            key={layer.id}
            className={`h-7 border-b border-border relative ${layer.id === selectedLayerId ? 'bg-accent/30' : 'hover:bg-muted/20'}`}
            onClick={() => {
              if (selectedLayerId === layer.id) {
                onAddKeyframe(layer.id, currentTime);
              }
            }}>
            
              {/* Track background bar */}
              <div className="absolute inset-y-1 left-0 right-0 mx-1 rounded-sm bg-muted/40" />

              {/* Playhead line */}
              <div
              className="absolute top-0 h-full w-px bg-primary/30 z-10 pointer-events-none"
              style={{
                left: `${progress}%`
              }} />
            
            </div>
          )}

          {/* Empty state */}
          {layers.length === 0 &&
          <div className="flex items-center justify-center h-20 text-[10px] text-muted-foreground">
              Add layers to create animation tracks
            </div>
          }
        </div>
      </div>
    </div>);

}