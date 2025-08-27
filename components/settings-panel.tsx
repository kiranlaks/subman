'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff,
  Palette,
  Layout,
  Filter,
  Table,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { userSettingsManager, UserSettings } from '@/lib/user-settings';
import { toastManager } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  onSaveAsDefault?: () => void;
}

export function SettingsPanel({ onSaveAsDefault }: SettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>(userSettingsManager.getSettings());
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = userSettingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const handleSaveAsDefault = () => {
    if (onSaveAsDefault) {
      onSaveAsDefault();
    }
    
    // Show confirmation toast
    toastManager.show({
      title: "Settings Saved",
      description: "Current settings saved as default!",
      variant: "success"
    });
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      userSettingsManager.resetSettings();
    }
  };

  const handleResetComponent = (componentType: 'table' | 'filters' | 'widgets' | 'charts') => {
    if (confirm(`Are you sure you want to reset all ${componentType} settings?`)) {
      userSettingsManager.resetComponentSettings(componentType);
    }
  };

  const handleExportSettings = () => {
    const exported = userSettingsManager.exportSettings();
    setExportData(exported);
    setShowExportDialog(true);
  };

  const handleImportSettings = () => {
    if (!importData.trim()) {
      setImportStatus('error');
      return;
    }

    const success = userSettingsManager.importSettings(importData);
    setImportStatus(success ? 'success' : 'error');
    
    if (success) {
      setTimeout(() => {
        setShowImportDialog(false);
        setImportData('');
        setImportStatus('idle');
      }, 2000);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toastManager.show({
        title: "Copied!",
        description: "Settings copied to clipboard",
        variant: "success"
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toastManager.show({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadSettings = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSettingsStats = () => {
    const stats = {
      tables: Object.keys(settings.columnWidths).length + Object.keys(settings.visibleColumns).length,
      filters: Object.keys(settings.activeFilters).length + Object.keys(settings.searchTerms).length,
      widgets: settings.dashboardWidgets.enabled.length,
      charts: Object.keys(settings.chartPreferences.colors).length + Object.keys(settings.chartPreferences.sortOrders).length
    };

    return stats;
  };

  const stats = getSettingsStats();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </DialogTitle>
          <DialogDescription>
            Manage your dashboard preferences and save them as defaults for future sessions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Tables ({stats.tables})
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters ({stats.filters})
            </TabsTrigger>
            <TabsTrigger value="widgets" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Widgets ({stats.widgets})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveAsDefault} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Current as Default
                    </Button>
                    <Button onClick={handleExportSettings} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Settings
                    </Button>
                    <Button onClick={() => setShowImportDialog(true)} variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Import Settings
                    </Button>
                    <Button onClick={handleResetAll} variant="destructive" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.tables}</div>
                      <div className="text-sm text-muted-foreground">Table Settings</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.filters}</div>
                      <div className="text-sm text-muted-foreground">Filter Settings</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.widgets}</div>
                      <div className="text-sm text-muted-foreground">Active Widgets</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.charts}</div>
                      <div className="text-sm text-muted-foreground">Chart Settings</div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Updated:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(settings.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Theme:</span>
                      <Badge variant="outline">{settings.theme}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sidebar:</span>
                      <Badge variant={settings.sidebarCollapsed ? "secondary" : "default"}>
                        {settings.sidebarCollapsed ? "Collapsed" : "Expanded"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Table Settings
                    <Button 
                      onClick={() => handleResetComponent('table')} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Tables
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(settings.columnWidths).length === 0 && 
                   Object.keys(settings.visibleColumns).length === 0 && 
                   Object.keys(settings.sortPreferences).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No table settings configured yet. Interact with tables to create settings.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.keys(settings.visibleColumns).map(tableId => (
                        <div key={tableId} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{tableId.replace('-', ' ')} Table</h4>
                            <Button 
                              onClick={() => userSettingsManager.resetComponentSettings('table', tableId)}
                              variant="ghost" 
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Visible Columns:</span>
                              <div className="mt-1">
                                <Badge variant="secondary">
                                  {settings.visibleColumns[tableId]?.length || 0} columns
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Page Size:</span>
                              <div className="mt-1">
                                <Badge variant="outline">
                                  {settings.pageSize[tableId] || 20} rows
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sort:</span>
                              <div className="mt-1">
                                {settings.sortPreferences[tableId] ? (
                                  <Badge variant="outline">
                                    {settings.sortPreferences[tableId].sortBy} ({settings.sortPreferences[tableId].sortOrder})
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Filter Settings
                    <Button 
                      onClick={() => handleResetComponent('filters')} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Filters
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(settings.activeFilters).length === 0 && 
                   Object.keys(settings.searchTerms).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No filter settings saved yet. Apply filters to create settings.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.keys(settings.activeFilters).map(viewId => (
                        <div key={viewId} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{viewId.replace('-', ' ')} View</h4>
                            <Button 
                              onClick={() => userSettingsManager.resetComponentSettings('filters', viewId)}
                              variant="ghost" 
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Active Filters:</span>
                              <div className="mt-1">
                                <Badge variant="secondary">
                                  {Object.keys(settings.activeFilters[viewId] || {}).length} filters
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Search Term:</span>
                              <div className="mt-1">
                                {settings.searchTerms[viewId] ? (
                                  <Badge variant="outline" className="max-w-32 truncate">
                                    "{settings.searchTerms[viewId]}"
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">None</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="widgets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Widget Settings
                    <Button 
                      onClick={() => handleResetComponent('widgets')} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Widgets
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Enabled Widgets</h4>
                      <div className="flex flex-wrap gap-2">
                        {settings.dashboardWidgets.enabled.map(widget => (
                          <Badge key={widget} variant="default" className="gap-1">
                            <Eye className="w-3 h-3" />
                            {widget}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Widget Order</h4>
                      <div className="flex flex-wrap gap-2">
                        {settings.dashboardWidgets.order.map((widget, index) => (
                          <Badge key={widget} variant="outline" className="gap-1">
                            <span className="text-xs bg-muted px-1 rounded">{index + 1}</span>
                            {widget}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {Object.keys(settings.dashboardWidgets.sizes).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Custom Sizes</h4>
                          <div className="space-y-2">
                            {Object.entries(settings.dashboardWidgets.sizes).map(([widget, size]) => (
                              <div key={widget} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm font-medium">{widget}</span>
                                <Badge variant="secondary">
                                  {size.width}×{size.height}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Settings are automatically saved and will persist across sessions
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveAsDefault} className="gap-2">
              <Save className="w-4 h-4" />
              Save as Default
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
            <DialogDescription>
              Copy the settings JSON or download as a file to backup or share your configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-data">Settings JSON</Label>
              <Textarea
                id="export-data"
                value={exportData}
                readOnly
                className="h-64 font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => copyToClipboard(exportData)} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Copy to Clipboard
              </Button>
              <Button onClick={downloadSettings} className="gap-2">
                <Download className="w-4 h-4" />
                Download File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Settings</DialogTitle>
            <DialogDescription>
              Paste your settings JSON to restore a previous configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">Settings JSON</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your settings JSON here..."
                className="h-64 font-mono text-xs"
              />
            </div>
            {importStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Settings imported successfully!
              </div>
            )}
            {importStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                Failed to import settings. Please check the JSON format.
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleImportSettings} 
                disabled={!importData.trim()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Settings
              </Button>
              <Button onClick={() => setShowImportDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}