import { auditLogger } from './audit-logger';

export interface UndoRedoAction {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  undo: () => void;
  redo: () => void;
  data?: any;
  // Store the actual data states to avoid closure issues
  previousState?: any;
  newState?: any;
}

class UndoRedoManager {
  private undoStack: UndoRedoAction[] = [];
  private redoStack: UndoRedoAction[] = [];
  private maxStackSize = 50; // Limit stack size to prevent memory issues
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        // Only save action metadata, not the functions
        const undoData = this.undoStack.map(action => ({
          id: action.id,
          type: action.type,
          description: action.description,
          timestamp: action.timestamp,
          data: action.data
        }));
        
        localStorage.setItem('undo-stack', JSON.stringify(undoData.slice(-20))); // Keep last 20
      } catch (error) {
        console.error('Failed to save undo stack:', error);
      }
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('undo-stack');
        if (stored) {
          const undoData = JSON.parse(stored);
          // Note: We can't restore the actual undo/redo functions from storage
          // This is mainly for displaying recent action history
          console.log('Loaded undo history:', undoData);
        }
      } catch (error) {
        console.error('Failed to load undo stack:', error);
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addAction(action: UndoRedoAction) {
    // Clear redo stack when new action is added
    this.redoStack = [];
    
    // Add to undo stack
    this.undoStack.push(action);
    
    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    // Log the action
    auditLogger.log(
      'system.action',
      'undo_redo',
      action.id,
      {
        actionType: action.type,
        description: action.description,
        canUndo: true
      }
    );

    this.saveToStorage();
    this.notifyListeners();
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): boolean {
    if (!this.canUndo()) return false;

    const action = this.undoStack.pop()!;
    
    try {
      action.undo();
      this.redoStack.push(action);

      // Log the undo action
      auditLogger.log(
        'system.undo',
        'undo_redo',
        action.id,
        {
          actionType: action.type,
          description: `Undid: ${action.description}`,
          originalTimestamp: action.timestamp
        }
      );

      this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to undo action:', error);
      // Put the action back if undo failed
      this.undoStack.push(action);
      return false;
    }
  }

  redo(): boolean {
    if (!this.canRedo()) return false;

    const action = this.redoStack.pop()!;
    
    try {
      action.redo();
      this.undoStack.push(action);

      // Log the redo action
      auditLogger.log(
        'system.redo',
        'undo_redo',
        action.id,
        {
          actionType: action.type,
          description: `Redid: ${action.description}`,
          originalTimestamp: action.timestamp
        }
      );

      this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to redo action:', error);
      // Put the action back if redo failed
      this.redoStack.push(action);
      return false;
    }
  }

  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.undoStack[this.undoStack.length - 1].description;
  }

  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    return this.redoStack[this.redoStack.length - 1].description;
  }

  getUndoStack(): UndoRedoAction[] {
    return [...this.undoStack];
  }

  getRedoStack(): UndoRedoAction[] {
    return [...this.redoStack];
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  // Utility method to create action IDs
  generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const undoRedoManager = new UndoRedoManager();