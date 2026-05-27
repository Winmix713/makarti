import { useState, useCallback, useRef, useEffect } from 'react';

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
const DEBOUNCE_MS = 300;

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

  // Refs to keep latest values accessible inside timers
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const historyRef = useRef(history);
  historyRef.current = history;

  // Debounce mechanism
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<{ state: T; description: string } | null>(null);

  const commitPendingState = useCallback(() => {
    const pending = pendingStateRef.current;
    if (pending === null) return;

    pendingStateRef.current = null;

    const { state, description } = pending;

    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndexRef.current + 1);
      newHistory.push({
        state,
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
      return Math.min(prev + 1, MAX_HISTORY - 1);
    });
  }, []);

  // Flush any pending debounced state before undo/redo
  const flushPending = useCallback(() => {
    if (pendingStateRef.current !== null) {
      commitPendingState();
    }
  }, [commitPendingState]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const pushState = useCallback(
    (state: T, description: string = 'Change') => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      // Store the pending state (coalescing — replaces previous pending)
      pendingStateRef.current = {
        state: JSON.parse(JSON.stringify(state)),
        description
      };

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer — only commits after 300ms of inactivity
      debounceTimerRef.current = setTimeout(() => {
        commitPendingState();
      }, DEBOUNCE_MS);
    },
    [commitPendingState]
  );

  const undo = useCallback((): T | null => {
    // Flush any pending state first so undo operates on complete history
    flushPending();

    if (currentIndexRef.current <= 0) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndexRef.current - 1;
    setCurrentIndex(newIndex);

    return JSON.parse(JSON.stringify(historyRef.current[newIndex].state));
  }, [flushPending]);

  const redo = useCallback((): T | null => {
    // Flush any pending state first
    flushPending();

    if (currentIndexRef.current >= historyRef.current.length - 1) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndexRef.current + 1;
    setCurrentIndex(newIndex);

    return JSON.parse(JSON.stringify(historyRef.current[newIndex].state));
  }, [flushPending]);

  const clear = useCallback(() => {
    // Clear any pending debounced state
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingStateRef.current = null;

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