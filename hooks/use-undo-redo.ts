import { useState, useEffect, useCallback } from 'react';
import { undoRedoManager, UndoRedoAction } from '@/lib/undo-redo-manager';

export function useUndoRedo() {
  const [canUndo, setCanUndo] = useState(undoRedoManager.canUndo());
  const [canRedo, setCanRedo] = useState(undoRedoManager.canRedo());
  const [undoDescription, setUndoDescription] = useState(undoRedoManager.getUndoDescription());
  const [redoDescription, setRedoDescription] = useState(undoRedoManager.getRedoDescription());

  useEffect(() => {
    const updateState = () => {
      setCanUndo(undoRedoManager.canUndo());
      setCanRedo(undoRedoManager.canRedo());
      setUndoDescription(undoRedoManager.getUndoDescription());
      setRedoDescription(undoRedoManager.getRedoDescription());
    };

    const unsubscribe = undoRedoManager.subscribe(updateState);
    
    // Initial state update
    updateState();

    return unsubscribe;
  }, []);

  const addAction = useCallback((action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => {
    const fullAction: UndoRedoAction = {
      ...action,
      id: undoRedoManager.generateActionId(),
      timestamp: new Date().toISOString()
    };
    undoRedoManager.addAction(fullAction);
  }, []);

  const undo = useCallback(() => {
    return undoRedoManager.undo();
  }, []);

  const redo = useCallback(() => {
    return undoRedoManager.redo();
  }, []);

  const clear = useCallback(() => {
    undoRedoManager.clear();
  }, []);

  return {
    canUndo,
    canRedo,
    undoDescription,
    redoDescription,
    addAction,
    undo,
    redo,
    clear,
    getUndoStack: () => undoRedoManager.getUndoStack(),
    getRedoStack: () => undoRedoManager.getRedoStack()
  };
}

// Keyboard shortcut hook
export function useUndoRedoKeyboard() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        if (canUndo) {
          event.preventDefault();
          undo();
        }
      }
      
      // Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') ||
        (event.ctrlKey && event.key === 'y')
      ) {
        if (canRedo) {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return { undo, redo, canUndo, canRedo };
}