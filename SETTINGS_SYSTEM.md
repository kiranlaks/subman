# Persistent User Settings System

This document describes the comprehensive user settings system implemented in the subscription dashboard that remembers all UI preferences across sessions.

## Overview

The system automatically saves and restores user preferences including:
- Table column widths, visibility, and sorting
- Filter states and search terms
- Widget configurations and layouts
- Chart preferences and sort orders
- Dashboard layout settings

## Architecture

### Core Components

1. **UserSettingsManager** (`lib/user-settings.ts`)
   - Central settings management class
   - Handles localStorage persistence
   - Provides subscription-based updates
   - Manages settings validation and defaults

2. **Persistent State Hooks** (`hooks/use-persistent-state.ts`)
   - React hooks for different setting types
   - Automatic synchronization with settings manager
   - Type-safe interfaces for each setting category

3. **Settings Panel** (`components/settings-panel.tsx`)
   - User interface for managing settings
   - Export/import functionality
   - Reset options for different components
   - Visual overview of current settings

4. **Widget Manager** (`components/widget-manager.tsx`)
   - Dashboard widget configuration
   - Drag-and-drop reordering
   - Enable/disable widgets
   - Category-based organization

## Settings Categories

### Table Settings
- **Column Widths**: Individual column width preferences
- **Visible Columns**: Which columns to show/hide
- **Sort Preferences**: Default sorting column and direction
- **Page Size**: Number of rows per page

### Filter Settings
- **Active Filters**: Applied column filters
- **Search Terms**: Current search queries
- **Date Ranges**: Custom date filter ranges
- **Filter Presets**: Saved filter combinations

### Widget Settings
- **Enabled Widgets**: Which dashboard widgets are active
- **Widget Order**: Custom arrangement of widgets
- **Widget Sizes**: Custom dimensions for resizable widgets

### Chart Settings
- **Color Preferences**: Custom color schemes
- **Sort Orders**: Default chart sorting preferences
- **Display Options**: Chart-specific display settings

### Layout Settings
- **Sidebar State**: Collapsed/expanded preference
- **Theme**: Light/dark/system theme preference
- **View Preferences**: Default view selections

## Usage Examples

### Using Table Settings Hook

```typescript
import { useTableSettings } from '@/hooks/use-persistent-state';

function MyTable() {
  const { settings, updateSettings } = useTableSettings('my-table-id');
  
  // Access current settings
  const { columnWidths, visibleColumns, sortPreference, pageSize } = settings;
  
  // Update settings
  const handleColumnResize = (columnId: string, width: number) => {
    updateSettings({ 
      columnWidths: { [columnId]: width } 
    });
  };
  
  const handleColumnToggle = (columnId: string, visible: boolean) => {
    const newVisible = visible 
      ? [...visibleColumns, columnId]
      : visibleColumns.filter(id => id !== columnId);
    
    updateSettings({ visibleColumns: newVisible });
  };
}
```

### Using Filter Settings Hook

```typescript
import { useFilterSettings } from '@/hooks/use-persistent-state';

function MyFilterableView() {
  const { settings, updateSettings } = useFilterSettings('my-view-id');
  
  // Access current filters
  const { activeFilters, searchTerm } = settings;
  
  // Update search term
  const handleSearch = (term: string) => {
    updateSettings({ searchTerm: term });
  };
  
  // Update filters
  const handleFilterChange = (filters: any) => {
    updateSettings({ activeFilters: filters });
  };
}
```

### Using Widget Settings Hook

```typescript
import { useWidgetSettings } from '@/hooks/use-persistent-state';

function Dashboard() {
  const { settings, updateSettings } = useWidgetSettings();
  
  // Access widget configuration
  const { enabled, order, sizes } = settings;
  
  // Toggle widget
  const toggleWidget = (widgetId: string, enabled: boolean) => {
    const newEnabled = enabled 
      ? [...settings.enabled, widgetId]
      : settings.enabled.filter(id => id !== widgetId);
    
    updateSettings({ enabled: newEnabled });
  };
  
  // Reorder widgets
  const reorderWidgets = (newOrder: string[]) => {
    updateSettings({ order: newOrder });
  };
}
```

## Settings Panel Features

### Quick Actions
- **Save as Default**: Saves current state as default for new sessions
- **Export Settings**: Download settings as JSON file
- **Import Settings**: Restore settings from JSON file
- **Reset All**: Clear all settings and return to defaults

### Component-Specific Resets
- Reset table settings only
- Reset filter settings only
- Reset widget configurations only
- Reset chart preferences only

### Settings Overview
- Visual summary of active settings
- Statistics for each setting category
- Last updated timestamps
- Current theme and layout preferences

## Data Storage

### Local Storage Structure
```json
{
  "columnWidths": {
    "table-id": { "column1": 150, "column2": 200 }
  },
  "visibleColumns": {
    "table-id": ["column1", "column2", "column3"]
  },
  "sortPreferences": {
    "table-id": { "sortBy": "column1", "sortOrder": "desc" }
  },
  "pageSize": {
    "table-id": 25
  },
  "activeFilters": {
    "view-id": { "status": ["active"], "vendor": ["vendor1"] }
  },
  "searchTerms": {
    "view-id": "search query"
  },
  "dashboardWidgets": {
    "enabled": ["stats", "charts", "analytics"],
    "order": ["stats", "charts", "analytics"],
    "sizes": { "chart1": { "width": 400, "height": 300 } }
  },
  "chartPreferences": {
    "colors": { "chart-id": ["#ff0000", "#00ff00"] },
    "sortOrders": { "chart-id": "desc" }
  },
  "sidebarCollapsed": false,
  "theme": "light",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Storage Key
Settings are stored under the key: `subscription-dashboard-settings`

## Implementation Details

### Automatic Persistence
- Settings are automatically saved to localStorage on every change
- No manual save action required from users
- Debounced updates prevent excessive storage writes

### Default Values
- Comprehensive default settings ensure the app works without saved preferences
- Graceful fallback when localStorage is unavailable
- Validation ensures settings integrity

### Cross-Session Persistence
- Settings persist across browser sessions
- Survive browser restarts and tab closures
- Work across different browser tabs

### Error Handling
- Graceful degradation when localStorage is disabled
- Automatic recovery from corrupted settings
- Console warnings for debugging

## Best Practices

### Component Integration
1. Use appropriate hooks for your component type
2. Update settings immediately when user makes changes
3. Provide visual feedback for setting changes
4. Include reset options for user convenience

### Performance Considerations
1. Settings updates are debounced to prevent excessive writes
2. Only changed settings are updated, not entire objects
3. Subscription system prevents unnecessary re-renders

### User Experience
1. Settings changes take effect immediately
2. Visual indicators show current setting states
3. Export/import allows settings backup and sharing
4. Reset options provide easy recovery

## Troubleshooting

### Common Issues

1. **Settings not persisting**
   - Check if localStorage is enabled in browser
   - Verify settings key is correct
   - Check browser console for errors

2. **Settings not loading**
   - Clear localStorage and refresh
   - Check for JSON parsing errors
   - Verify default settings are properly defined

3. **Performance issues**
   - Check for excessive setting updates
   - Verify debouncing is working
   - Monitor localStorage size

### Debug Tools

```typescript
// Access settings manager directly
import { userSettingsManager } from '@/lib/user-settings';

// Get current settings
console.log(userSettingsManager.getSettings());

// Export settings for debugging
console.log(userSettingsManager.exportSettings());

// Reset specific component
userSettingsManager.resetComponentSettings('table', 'table-id');
```

## Future Enhancements

### Planned Features
- Cloud synchronization across devices
- User profiles with different setting sets
- Setting templates and presets
- Advanced import/export with validation
- Settings history and versioning

### Extension Points
- Custom setting categories
- Plugin-based setting extensions
- API for third-party integrations
- Advanced validation rules

## Migration Guide

### From Non-Persistent to Persistent
1. Identify current state variables
2. Replace with appropriate persistent hooks
3. Update state change handlers to use updateSettings
4. Test settings persistence across sessions
5. Add reset functionality for user convenience

### Example Migration
```typescript
// Before (non-persistent)
const [columnWidth, setColumnWidth] = useState(100);
const [visibleColumns, setVisibleColumns] = useState(['col1', 'col2']);

// After (persistent)
const { settings, updateSettings } = useTableSettings('my-table');
const { columnWidths, visibleColumns } = settings;

const setColumnWidth = (width: number) => {
  updateSettings({ columnWidths: { myColumn: width } });
};

const setVisibleColumns = (columns: string[]) => {
  updateSettings({ visibleColumns: columns });
};
```

This comprehensive settings system ensures that users never lose their UI preferences and can customize the dashboard exactly to their needs, with all changes automatically saved and restored across sessions.