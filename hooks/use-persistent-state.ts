import { useState, useEffect, useCallback } from 'react';
import { userSettingsManager } from '@/lib/user-settings';

// Hook for table-specific persistent state
export function useTableSettings(tableId: string) {
  // Always start with default values to prevent hydration mismatch
  const [settings, setSettings] = useState({
    columnWidths: {} as Record<string, number>,
    visibleColumns: [] as string[],
    sortPreference: null as { sortBy: string; sortOrder: 'asc' | 'desc' } | null,
    pageSize: 20
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings
    const currentSettings = userSettingsManager.getTableSettings(tableId);
    setSettings({
      columnWidths: currentSettings.columnWidths || {},
      visibleColumns: currentSettings.visibleColumns || [],
      sortPreference: currentSettings.sortPreference || null,
      pageSize: currentSettings.pageSize || 20
    });
    setIsLoaded(true);
    
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings(userSettingsManager.getTableSettings(tableId));
    });

    return unsubscribe;
  }, [tableId]);

  const updateSettings = useCallback((updates: {
    columnWidths?: Record<string, number>;
    visibleColumns?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageSize?: number;
  }) => {
    userSettingsManager.updateTableSettings(tableId, updates);
  }, [tableId]);

  return {
    settings: isLoaded ? settings : {
      columnWidths: {} as Record<string, number>,
      visibleColumns: [] as string[],
      sortPreference: null as { sortBy: string; sortOrder: 'asc' | 'desc' } | null,
      pageSize: 20
    },
    updateSettings
  };
}

// Hook for filter-specific persistent state
export function useFilterSettings(viewId: string) {
  // Always start with default values to prevent hydration mismatch
  const [settings, setSettings] = useState({
    activeFilters: {} as Record<string, any>,
    searchTerm: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings
    const currentSettings = userSettingsManager.getFilterSettings(viewId);
    setSettings({
      activeFilters: currentSettings.activeFilters || {},
      searchTerm: currentSettings.searchTerm || ''
    });
    setIsLoaded(true);
    
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings(userSettingsManager.getFilterSettings(viewId));
    });

    return unsubscribe;
  }, [viewId]);

  const updateSettings = useCallback((updates: {
    activeFilters?: any;
    searchTerm?: string;
  }) => {
    userSettingsManager.updateFilterSettings(viewId, updates);
  }, [viewId]);

  return {
    settings: isLoaded ? settings : {
      activeFilters: {} as Record<string, any>,
      searchTerm: ''
    },
    updateSettings
  };
}

// Hook for widget settings
export function useWidgetSettings() {
  // Always start with default values to prevent hydration mismatch
  const [settings, setSettings] = useState({
    enabled: [] as string[],
    order: [] as string[],
    sizes: {} as Record<string, { width: number; height: number }>
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings
    setSettings(userSettingsManager.getSettings().dashboardWidgets);
    setIsLoaded(true);
    
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings(newSettings.dashboardWidgets);
    });

    return unsubscribe;
  }, []);

  const updateSettings = useCallback((updates: {
    enabled?: string[];
    order?: string[];
    sizes?: Record<string, { width: number; height: number }>;
  }) => {
    userSettingsManager.updateWidgetSettings(updates);
  }, []);

  return {
    settings: isLoaded ? settings : {
      enabled: [] as string[],
      order: [] as string[],
      sizes: {} as Record<string, { width: number; height: number }>
    },
    updateSettings
  };
}

// Hook for chart preferences
export function useChartSettings(chartId: string) {
  // Always start with default values to prevent hydration mismatch
  const [settings, setSettings] = useState({
    colors: [] as string[],
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings
    const allSettings = userSettingsManager.getSettings();
    setSettings({
      colors: allSettings.chartPreferences.colors[chartId] || [],
      sortOrder: allSettings.chartPreferences.sortOrders[chartId] || 'desc'
    });
    setIsLoaded(true);
    
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings({
        colors: newSettings.chartPreferences.colors[chartId] || [],
        sortOrder: newSettings.chartPreferences.sortOrders[chartId] || 'desc'
      });
    });

    return unsubscribe;
  }, [chartId]);

  const updateSettings = useCallback((updates: {
    colors?: string[];
    sortOrder?: 'asc' | 'desc';
  }) => {
    userSettingsManager.updateChartPreferences(chartId, updates);
  }, [chartId]);

  return {
    settings: isLoaded ? settings : {
      colors: [] as string[],
      sortOrder: 'desc' as 'asc' | 'desc'
    },
    updateSettings
  };
}

// Hook for layout settings
export function useLayoutSettings() {
  // Always start with default values to prevent hydration mismatch
  const [settings, setSettings] = useState({
    sidebarCollapsed: false,
    theme: 'system' as 'light' | 'dark' | 'system'
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings
    const allSettings = userSettingsManager.getSettings();
    setSettings({
      sidebarCollapsed: allSettings.sidebarCollapsed,
      theme: allSettings.theme
    });
    setIsLoaded(true);
    
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings({
        sidebarCollapsed: newSettings.sidebarCollapsed,
        theme: newSettings.theme
      });
    });

    return unsubscribe;
  }, []);

  const updateSettings = useCallback((updates: {
    sidebarCollapsed?: boolean;
    theme?: 'light' | 'dark' | 'system';
  }) => {
    userSettingsManager.updateLayoutSettings(updates);
  }, []);

  return {
    settings: isLoaded ? settings : {
      sidebarCollapsed: false,
      theme: 'system' as 'light' | 'dark' | 'system'
    },
    updateSettings
  };
}

// Generic hook for any persistent state
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  category: 'table' | 'filter' | 'widget' | 'chart' | 'layout' = 'table'
): [T, (value: T) => void] {
  // Always start with default value to prevent hydration mismatch
  const [state, setState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  const setValue = useCallback((value: T) => {
    setState(value);
    
    // Update the settings manager based on category
    switch (category) {
      case 'table':
        userSettingsManager.updateTableSettings(key, { columnWidths: { [key]: value as number } });
        break;
      case 'filter':
        userSettingsManager.updateFilterSettings(key, { activeFilters: value });
        break;
      case 'widget':
        userSettingsManager.updateWidgetSettings({ [key]: value } as any);
        break;
      case 'chart':
        userSettingsManager.updateChartPreferences(key, value as any);
        break;
      case 'layout':
        userSettingsManager.updateLayoutSettings({ [key]: value } as any);
        break;
    }
  }, [key, category]);

  useEffect(() => {
    // Load initial value from settings manager
    const allSettings = userSettingsManager.getSettings();
    let initialValue: T;
    
    switch (category) {
      case 'table':
        initialValue = (allSettings.columnWidths[key] as T) || defaultValue;
        break;
      case 'filter':
        initialValue = (allSettings.activeFilters[key] as T) || defaultValue;
        break;
      case 'widget':
        initialValue = (allSettings.dashboardWidgets as any)[key] || defaultValue;
        break;
      case 'chart':
        initialValue = (allSettings.chartPreferences as any)[key] || defaultValue;
        break;
      case 'layout':
        initialValue = (allSettings as any)[key] || defaultValue;
        break;
      default:
        initialValue = defaultValue;
    }
    
    setState(initialValue);
    setIsLoaded(true);

    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      let newValue: T;
      
      switch (category) {
        case 'table':
          newValue = (newSettings.columnWidths[key] as T) || defaultValue;
          break;
        case 'filter':
          newValue = (newSettings.activeFilters[key] as T) || defaultValue;
          break;
        case 'widget':
          newValue = (newSettings.dashboardWidgets as any)[key] || defaultValue;
          break;
        case 'chart':
          newValue = (newSettings.chartPreferences as any)[key] || defaultValue;
          break;
        case 'layout':
          newValue = (newSettings as any)[key] || defaultValue;
          break;
        default:
          newValue = defaultValue;
      }
      
      setState(newValue);
    });

    return unsubscribe;
  }, [key, category, defaultValue]);

  // Return default value until loaded to prevent hydration mismatch
  return [isLoaded ? state : defaultValue, setValue];
}