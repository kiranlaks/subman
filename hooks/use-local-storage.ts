import { useState, useEffect, useCallback } from 'react';

// Simple localStorage hook that works reliably and prevents hydration errors
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Initialize state with default value and track if we've loaded from localStorage
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
        console.log(`Loaded ${key} from localStorage:`, parsed);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      setIsLoaded(true);
    }
  }, [key]);

  // Save to localStorage
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      console.log(`Saved ${key} to localStorage:`, value);
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  // Return default value until localStorage is loaded to prevent hydration mismatch
  return [isLoaded ? storedValue : defaultValue, setValue];
}

// Specific hooks for different settings
export function useTableColumnSettings(tableId: string) {
  const [visibleColumns, setVisibleColumns] = useLocalStorage<string[]>(`${tableId}-visible-columns`, []);
  const [columnWidths, setColumnWidths] = useLocalStorage<Record<string, number>>(`${tableId}-column-widths`, {});
  const [pageSize, setPageSize] = useLocalStorage<number>(`${tableId}-page-size`, 20);
  const [sortSettings, setSortSettings] = useLocalStorage<{sortBy: string; sortOrder: 'asc' | 'desc'} | null>(`${tableId}-sort`, null);

  return {
    visibleColumns,
    setVisibleColumns,
    columnWidths,
    setColumnWidths,
    pageSize,
    setPageSize,
    sortSettings,
    setSortSettings
  };
}

export function useFilterSettings(viewId: string) {
  const [searchTerm, setSearchTerm] = useLocalStorage<string>(`${viewId}-search`, '');
  const [activeFilters, setActiveFilters] = useLocalStorage<Record<string, any>>(`${viewId}-filters`, {});

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters
  };
}

export function useChartSettings(chartId: string) {
  const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>(`${chartId}-sort`, 'desc');
  const [colors, setColors] = useLocalStorage<string[]>(`${chartId}-colors`, []);

  return {
    sortOrder,
    setSortOrder,
    colors,
    setColors
  };
}