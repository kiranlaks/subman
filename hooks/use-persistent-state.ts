import { useState, useEffect, useCallback } from 'react';
import { userSettingsManager } from '@/lib/user-settings';

// Hook for table-specific persistent state
export function useTableSettings(tableId: string) {
  const [settings, setSettings] = useState(() => {
    // Ensure we have default values even if settings aren't loaded yet
    const currentSettings = userSettingsManager.getTableSettings(tableId);
    return {
      columnWidths: currentSettings.columnWidths || {},
      visibleColumns: currentSettings.visibleColumns || [],
      sortPreference: currentSettings.sortPreference || null,
      pageSize: currentSettings.pageSize || 20
    };
  });

  useEffect(() => {
    // Update settings immediately on mount
    setSettings(userSettingsManager.getTableSettings(tableId));
    
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
    settings,
    updateSettings
  };
}

// Hook for filter-specific persistent state
export function useFilterSettings(viewId: string) {
  const [settings, setSettings] = useState(() => {
    const currentSettings = userSettingsManager.getFilterSettings(viewId);
    return {
      activeFilters: currentSettings.activeFilters || {},
      searchTerm: currentSettings.searchTerm || ''
    };
  });

  useEffect(() => {
    // Update settings immediately on mount
    setSettings(userSettingsManager.getFilterSettings(viewId));
    
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
    settings,
    updateSettings
  };
}

// Hook for widget settings
export function useWidgetSettings() {
  const [settings, setSettings] = useState(() => 
    userSettingsManager.getSettings().dashboardWidgets
  );

  useEffect(() => {
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
    settings,
    updateSettings
  };
}

// Hook for chart preferences
export function useChartSettings(chartId: string) {
  const [settings, setSettings] = useState(() => {
    const allSettings = userSettingsManager.getSettings();
    return {
      colors: allSettings.chartPreferences.colors[chartId] || [],
      sortOrder: allSettings.chartPreferences.sortOrders[chartId] || 'desc'
    };
  });

  useEffect(() => {
    // Update settings immediately on mount
    const allSettings = userSettingsManager.getSettings();
    setSettings({
      colors: allSettings.chartPreferences.colors[chartId] || [],
      sortOrder: allSettings.chartPreferences.sortOrders[chartId] || 'desc'
    });
    
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
    settings,
    updateSettings
  };
}

// Hook for layout settings
export function useLayoutSettings() {
  const [settings, setSettings] = useState(() => {
    const allSettings = userSettingsManager.getSettings();
    return {
      sidebarCollapsed: allSettings.sidebarCollapsed,
      theme: allSettings.theme
    };
  });

  useEffect(() => {
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
    settings,
    updateSettings
  };
}

// Generic hook for any persistent state
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  category: 'table' | 'filter' | 'widget' | 'chart' | 'layout' = 'table'
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const allSettings = userSettingsManager.getSettings();
    
    switch (category) {
      case 'table':
        return (allSettings.columnWidths[key] as T) || defaultValue;
      case 'filter':
        return (allSettings.activeFilters[key] as T) || defaultValue;
      case 'widget':
        return (allSettings.dashboardWidgets as any)[key] || defaultValue;
      case 'chart':
        return (allSettings.chartPreferences as any)[key] || defaultValue;
      case 'layout':
        return (allSettings as any)[key] || defaultValue;
      default:
        return defaultValue;
    }
  });

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

  return [state, setValue];
}