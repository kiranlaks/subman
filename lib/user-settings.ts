// User Settings Management System
// Handles persistent storage of UI preferences and state

export interface UserSettings {
  // Table settings
  columnWidths: Record<string, Record<string, number>>;
  visibleColumns: Record<string, string[]>;
  sortPreferences: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }>;
  pageSize: Record<string, number>;
  
  // Filter settings
  activeFilters: Record<string, any>;
  searchTerms: Record<string, string>;
  
  // Widget settings
  dashboardWidgets: {
    enabled: string[];
    order: string[];
    sizes: Record<string, { width: number; height: number }>;
  };
  
  // Chart settings
  chartPreferences: {
    colors: Record<string, string[]>;
    sortOrders: Record<string, 'asc' | 'desc'>;
  };
  
  // Layout settings
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Export settings
  defaultExportFormats: Record<string, string>;
  
  // Last updated timestamp
  lastUpdated: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  columnWidths: {},
  visibleColumns: {},
  sortPreferences: {},
  pageSize: {},
  activeFilters: {},
  searchTerms: {},
  dashboardWidgets: {
    enabled: ['stats', 'charts', 'analytics'],
    order: ['stats', 'charts', 'analytics'],
    sizes: {}
  },
  chartPreferences: {
    colors: {},
    sortOrders: {}
  },
  sidebarCollapsed: false,
  theme: 'light',
  defaultExportFormats: {},
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'subscription-dashboard-settings';

export class UserSettingsManager {
  private settings: UserSettings;
  private listeners: Set<(settings: UserSettings) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    // Initialize asynchronously to ensure DOM is ready
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.settings = this.loadSettings();
        this.isInitialized = true;
        this.notifyListeners();
      }, 0);
    }
  }

  private loadSettings(): UserSettings {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        const merged = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          dashboardWidgets: {
            ...DEFAULT_SETTINGS.dashboardWidgets,
            ...parsed.dashboardWidgets
          },
          chartPreferences: {
            ...DEFAULT_SETTINGS.chartPreferences,
            ...parsed.chartPreferences
          }
        };
        
        // Ensure all nested objects exist
        if (!merged.columnWidths) merged.columnWidths = {};
        if (!merged.visibleColumns) merged.visibleColumns = {};
        if (!merged.sortPreferences) merged.sortPreferences = {};
        if (!merged.pageSize) merged.pageSize = {};
        if (!merged.activeFilters) merged.activeFilters = {};
        if (!merged.searchTerms) merged.searchTerms = {};
        
        return merged;
      }
    } catch (error) {
      console.warn('Failed to load user settings:', error);
    }

    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;

    try {
      this.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      console.log('Settings saved to localStorage:', {
        key: STORAGE_KEY,
        settings: this.settings
      });
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current settings
  getSettings(): UserSettings {
    return { ...this.settings };
  }

  // Update table settings
  updateTableSettings(tableId: string, updates: {
    columnWidths?: Record<string, number>;
    visibleColumns?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageSize?: number;
  }): void {
    if (updates.columnWidths) {
      this.settings.columnWidths[tableId] = {
        ...(this.settings.columnWidths[tableId] || {}),
        ...updates.columnWidths
      };
    }

    if (updates.visibleColumns) {
      this.settings.visibleColumns[tableId] = updates.visibleColumns;
    }

    if (updates.sortBy && updates.sortOrder) {
      this.settings.sortPreferences[tableId] = {
        sortBy: updates.sortBy,
        sortOrder: updates.sortOrder
      };
    }

    if (updates.pageSize) {
      this.settings.pageSize[tableId] = updates.pageSize;
    }

    this.saveSettings();
  }

  // Update filter settings
  updateFilterSettings(viewId: string, updates: {
    activeFilters?: any;
    searchTerm?: string;
  }): void {
    if (updates.activeFilters !== undefined) {
      this.settings.activeFilters[viewId] = updates.activeFilters;
    }

    if (updates.searchTerm !== undefined) {
      this.settings.searchTerms[viewId] = updates.searchTerm;
    }

    this.saveSettings();
  }

  // Update widget settings
  updateWidgetSettings(updates: {
    enabled?: string[];
    order?: string[];
    sizes?: Record<string, { width: number; height: number }>;
  }): void {
    if (updates.enabled) {
      this.settings.dashboardWidgets.enabled = updates.enabled;
    }

    if (updates.order) {
      this.settings.dashboardWidgets.order = updates.order;
    }

    if (updates.sizes) {
      this.settings.dashboardWidgets.sizes = {
        ...this.settings.dashboardWidgets.sizes,
        ...updates.sizes
      };
    }

    this.saveSettings();
  }

  // Update chart preferences
  updateChartPreferences(chartId: string, updates: {
    colors?: string[];
    sortOrder?: 'asc' | 'desc';
  }): void {
    console.log('Updating chart preferences:', chartId, updates); // Debug log
    
    if (updates.colors) {
      this.settings.chartPreferences.colors[chartId] = updates.colors;
    }

    if (updates.sortOrder) {
      this.settings.chartPreferences.sortOrders[chartId] = updates.sortOrder;
    }

    this.saveSettings();
  }

  // Update layout settings
  updateLayoutSettings(updates: {
    sidebarCollapsed?: boolean;
    theme?: 'light' | 'dark' | 'system';
  }): void {
    if (updates.sidebarCollapsed !== undefined) {
      this.settings.sidebarCollapsed = updates.sidebarCollapsed;
    }

    if (updates.theme) {
      this.settings.theme = updates.theme;
    }

    this.saveSettings();
  }

  // Get table settings for a specific table
  getTableSettings(tableId: string) {
    return {
      columnWidths: this.settings.columnWidths[tableId] || {},
      visibleColumns: this.settings.visibleColumns[tableId] || [],
      sortPreference: this.settings.sortPreferences[tableId] || null,
      pageSize: this.settings.pageSize[tableId] || 20
    };
  }

  // Get filter settings for a specific view
  getFilterSettings(viewId: string) {
    return {
      activeFilters: this.settings.activeFilters[viewId] || {},
      searchTerm: this.settings.searchTerms[viewId] || ''
    };
  }

  // Reset all settings to defaults
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  // Reset settings for a specific component
  resetComponentSettings(componentType: 'table' | 'filters' | 'widgets' | 'charts', componentId?: string): void {
    switch (componentType) {
      case 'table':
        if (componentId) {
          delete this.settings.columnWidths[componentId];
          delete this.settings.visibleColumns[componentId];
          delete this.settings.sortPreferences[componentId];
          delete this.settings.pageSize[componentId];
        } else {
          this.settings.columnWidths = {};
          this.settings.visibleColumns = {};
          this.settings.sortPreferences = {};
          this.settings.pageSize = {};
        }
        break;
      case 'filters':
        if (componentId) {
          delete this.settings.activeFilters[componentId];
          delete this.settings.searchTerms[componentId];
        } else {
          this.settings.activeFilters = {};
          this.settings.searchTerms = {};
        }
        break;
      case 'widgets':
        this.settings.dashboardWidgets = { ...DEFAULT_SETTINGS.dashboardWidgets };
        break;
      case 'charts':
        if (componentId) {
          delete this.settings.chartPreferences.colors[componentId];
          delete this.settings.chartPreferences.sortOrders[componentId];
        } else {
          this.settings.chartPreferences = { ...DEFAULT_SETTINGS.chartPreferences };
        }
        break;
    }

    this.saveSettings();
  }

  // Export settings as JSON
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings from JSON
  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...imported,
        lastUpdated: new Date().toISOString()
      };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

// Global instance
export const userSettingsManager = new UserSettingsManager();