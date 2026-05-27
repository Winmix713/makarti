import { useState, useCallback, useRef } from 'react';

interface HistoryEntry<T> {
  state: T;
  description: string;
  timestamp: number;
}

interface UseUndoRedoReturn<T> {
  pushState: (state: T, description?: string) => void;
  undo: () => T | null;
  redo: () => T | null;
  canUndo: boolean;
  canRedo: boolean;
  currentDescription: string;
  undoDescription: string;
  redoDescription: string;
  historyLength: number;
  clear: () => void;
}

const MAX_HISTORY = 50;

export function useUndoRedo<T>(initialState?: T): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<HistoryEntry<T>[]>(
    initialState ?
    [
    {
      state: initialState,
      description: 'Initial state',
      timestamp: Date.now()
    }] :

    []
  );
  const [currentIndex, setCurrentIndex] = useState(initialState ? 0 : -1);
  const isUndoRedoAction = useRef(false);

  const pushState = useCallback(
    (state: T, description: string = 'Change') => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          state: JSON.parse(JSON.stringify(state)),
          description,
          timestamp: Date.now()
        });

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }

        return newHistory;
      });

      setCurrentIndex((prev) => {
        const newIndex = Math.min(prev + 1, MAX_HISTORY - 1);
        return newIndex;
      });
    },
    [currentIndex]
  );

  const undo = useCallback((): T | null => {
    if (currentIndex <= 0) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);

    return JSON.parse(JSON.stringify(history[newIndex].state));
  }, [currentIndex, history]);

  const redo = useCallback((): T | null => {
    if (currentIndex >= history.length - 1) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    return JSON.parse(JSON.stringify(history[newIndex].state));
  }, [currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const currentDescription =
  currentIndex >= 0 && currentIndex < history.length ?
  history[currentIndex].description :
  '';

  const undoDescription =
  currentIndex > 0 ? history[currentIndex - 1].description : '';

  const redoDescription =
  currentIndex < history.length - 1 ?
  history[currentIndex + 1].description :
  '';

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentDescription,
    undoDescription,
    redoDescription,
    historyLength: history.length,
    clear
  };
}