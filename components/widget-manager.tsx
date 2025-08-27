'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  ArrowUp,
  ArrowDown,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useWidgetSettings } from '@/hooks/use-persistent-state';
import { cn } from '@/lib/utils';

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'analytics' | 'charts' | 'tables' | 'stats';
  defaultEnabled: boolean;
}

const availableWidgets: Widget[] = [
  {
    id: 'stats',
    name: 'Dashboard Stats',
    description: 'Key metrics and statistics overview',
    icon: BarChart3,
    category: 'stats',
    defaultEnabled: true
  },
  {
    id: 'charts',
    name: 'Charts & Graphs',
    description: 'Visual data representation',
    icon: PieChart,
    category: 'charts',
    defaultEnabled: true
  },
  {
    id: 'analytics',
    name: 'Modern Analytics',
    description: 'Advanced analytics dashboard',
    icon: TrendingUp,
    category: 'analytics',
    defaultEnabled: true
  },
  {
    id: 'subscription-table',
    name: 'Subscription Table',
    description: 'Detailed subscription data table',
    icon: Users,
    category: 'tables',
    defaultEnabled: false
  },
  {
    id: 'expiry-alerts',
    name: 'Expiry Alerts',
    description: 'Upcoming expiry notifications',
    icon: Calendar,
    category: 'stats',
    defaultEnabled: false
  },
  {
    id: 'critical-alerts',
    name: 'Critical Alerts',
    description: 'Important system alerts',
    icon: AlertTriangle,
    category: 'stats',
    defaultEnabled: false
  }
];

interface WidgetManagerProps {
  onWidgetToggle?: (widgetId: string, enabled: boolean) => void;
  onWidgetReorder?: (newOrder: string[]) => void;
}

export function WidgetManager({ onWidgetToggle, onWidgetReorder }: WidgetManagerProps) {
  const { settings, updateSettings } = useWidgetSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleWidget = (widgetId: string, enabled: boolean) => {
    const newEnabled = enabled 
      ? [...settings.enabled, widgetId]
      : settings.enabled.filter(id => id !== widgetId);
    
    updateSettings({ enabled: newEnabled });
    
    if (onWidgetToggle) {
      onWidgetToggle(widgetId, enabled);
    }
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newOrder = Array.from(settings.order);
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);

    updateSettings({ order: newOrder });
    
    if (onWidgetReorder) {
      onWidgetReorder(newOrder);
    }
  };

  const moveWidgetUp = (index: number) => {
    if (index > 0) {
      moveWidget(index, index - 1);
    }
  };

  const moveWidgetDown = (index: number) => {
    if (index < enabledWidgets.length - 1) {
      moveWidget(index, index + 1);
    }
  };

  const getWidgetById = (id: string) => availableWidgets.find(w => w.id === id);

  const enabledWidgets = settings.order
    .map(id => getWidgetById(id))
    .filter(Boolean) as Widget[];

  const disabledWidgets = availableWidgets.filter(
    widget => !settings.enabled.includes(widget.id)
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'bg-blue-100 text-blue-800';
      case 'charts': return 'bg-green-100 text-green-800';
      case 'tables': return 'bg-purple-100 text-purple-800';
      case 'stats': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Widgets ({settings.enabled.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Widget Manager
          </DialogTitle>
          <DialogDescription>
            Customize your dashboard by enabling, disabling, and reordering widgets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
          {/* Enabled Widgets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enabled Widgets</h3>
              <Badge variant="secondary">{enabledWidgets.length} active</Badge>
            </div>

            <div className="space-y-2 min-h-[200px] p-3 rounded-lg border-2 border-dashed border-gray-200">
              {enabledWidgets.map((widget, index) => (
                <Card key={widget.id} className="transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveWidgetUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveWidgetDown(index)}
                          disabled={index === enabledWidgets.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <widget.icon className="w-5 h-5 text-gray-600" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{widget.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getCategoryColor(widget.category))}
                          >
                            {widget.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Switch
                          checked={true}
                          onCheckedChange={(checked) => handleToggleWidget(widget.id, checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {enabledWidgets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No widgets enabled</p>
                  <p className="text-xs">Enable widgets from the available list</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Widgets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Widgets</h3>
              <Badge variant="outline">{disabledWidgets.length} available</Badge>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {disabledWidgets.map((widget) => (
                <Card key={widget.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <widget.icon className="w-5 h-5 text-gray-400" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{widget.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getCategoryColor(widget.category))}
                          >
                            {widget.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                      
                      <Switch
                        checked={false}
                        onCheckedChange={(checked) => handleToggleWidget(widget.id, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {disabledWidgets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All widgets are enabled</p>
                  <p className="text-xs">Disable widgets to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Use arrow buttons to reorder enabled widgets
          </div>
          <Button onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}