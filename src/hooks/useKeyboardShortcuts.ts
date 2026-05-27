import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onPlayPause?: () => void;
  onEscape?: () => void;
  onSelectAll?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      if (ctrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      if (ctrl && e.key === 'y') {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      if (ctrl && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      if (ctrl && e.key === 'e') {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      if (ctrl && e.key === 'd' && !isInput) {
        e.preventDefault();
        handlers.onDuplicate?.();
        return;
      }

      if (ctrl && e.key === 'g' && !isInput) {
        e.preventDefault();
        handlers.onGroup?.();
        return;
      }

      if (ctrl && e.key === 'a' && !isInput) {
        e.preventDefault();
        handlers.onSelectAll?.();
        return;
      }

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handlers.onPlayPause?.();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handlers.onEscape?.();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}