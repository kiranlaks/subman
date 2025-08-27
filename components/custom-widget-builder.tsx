'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BarChart3, PieChart, LineChart, TrendingUp, Users, DollarSign, 
  Activity, Target, Zap, Building2, MapPin, Calendar, AlertCircle,
  Plus, Save
} from 'lucide-react';

interface CustomWidget {
  id: string;
  title: string;
  description: string;
  value: string;
  formula: string;
  icon: string;
  color: string;
  category: string;
}

interface CustomWidgetBuilderProps {
  onSave: (widget: CustomWidget) => void;
}

const iconOptions = [
  { value: 'BarChart3', label: 'Bar Chart', icon: BarChart3 },
  { value: 'PieChart', label: 'Pie Chart', icon: PieChart },
  { value: 'LineChart', label: 'Line Chart', icon: LineChart },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'DollarSign', label: 'Dollar Sign', icon: DollarSign },
  { value: 'Activity', label: 'Activity', icon: Activity },
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Building2', label: 'Building', icon: Building2 },
  { value: 'MapPin', label: 'Map Pin', icon: MapPin },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
  { value: 'AlertCircle', label: 'Alert', icon: AlertCircle },
];

const colorOptions = [
  { value: 'text-blue-600', label: 'Blue', color: 'bg-blue-600' },
  { value: 'text-green-600', label: 'Green', color: 'bg-green-600' },
  { value: 'text-red-600', label: 'Red', color: 'bg-red-600' },
  { value: 'text-purple-600', label: 'Purple', color: 'bg-purple-600' },
  { value: 'text-orange-600', label: 'Orange', color: 'bg-orange-600' },
  { value: 'text-pink-600', label: 'Pink', color: 'bg-pink-600' },
  { value: 'text-indigo-600', label: 'Indigo', color: 'bg-indigo-600' },
  { value: 'text-cyan-600', label: 'Cyan', color: 'bg-cyan-600' },
];

const formulaTemplates = [
  { 
    label: 'Total Count', 
    value: 'COUNT(subscriptions)', 
    description: 'Count total number of subscriptions' 
  },
  { 
    label: 'Active Percentage', 
    value: '(COUNT(active) / COUNT(total)) * 100', 
    description: 'Percentage of active subscriptions' 
  },
  { 
    label: 'Average Revenue', 
    value: 'SUM(revenue) / COUNT(subscriptions)', 
    description: 'Average revenue per subscription' 
  },
  { 
    label: 'Growth Rate', 
    value: '((current_month - last_month) / last_month) * 100', 
    description: 'Month-over-month growth percentage' 
  },
  { 
    label: 'Custom Formula', 
    value: 'custom_formula', 
    description: 'Write your own formula' 
  },
];

export function CustomWidgetBuilder({ onSave }: CustomWidgetBuilderProps) {
  const [open, setOpen] = useState(false);
  const [widget, setWidget] = useState<Partial<CustomWidget>>({
    title: '',
    description: '',
    value: '0',
    formula: '',
    icon: 'BarChart3',
    color: 'text-blue-600',
    category: 'custom',
  });

  const handleSave = () => {
    if (!widget.title || !widget.description) return;
    
    const newWidget: CustomWidget = {
      id: `custom-${Date.now()}`,
      title: widget.title!,
      description: widget.description!,
      value: widget.value || '0',
      formula: widget.formula || '',
      icon: widget.icon || 'BarChart3',
      color: widget.color || 'text-blue-600',
      category: 'custom',
    };

    onSave(newWidget);
    setOpen(false);
    setWidget({
      title: '',
      description: '',
      value: '0',
      formula: '',
      icon: 'BarChart3',
      color: 'text-blue-600',
      category: 'custom',
    });
  };

  const selectedIcon = iconOptions.find(opt => opt.value === widget.icon);
  const selectedColor = colorOptions.find(opt => opt.value === widget.color);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Analytics Widget</DialogTitle>
          <DialogDescription>
            Build a custom widget to track specific metrics for your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                placeholder="e.g., Customer Satisfaction"
                value={widget.title}
                onChange={(e) => setWidget({ ...widget, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Display Value</Label>
              <Input
                id="value"
                placeholder="e.g., 4.8/5"
                value={widget.value}
                onChange={(e) => setWidget({ ...widget, value: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Average customer rating this month"
              value={widget.description}
              onChange={(e) => setWidget({ ...widget, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={widget.icon} onValueChange={(value) => setWidget({ ...widget, icon: value })}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center">
                      {selectedIcon && <selectedIcon.icon className="h-4 w-4 mr-2" />}
                      {selectedIcon?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <option.icon className="h-4 w-4 mr-2" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={widget.color} onValueChange={(value) => setWidget({ ...widget, color: value })}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center">
                      {selectedColor && <div className={`h-4 w-4 rounded mr-2 ${selectedColor.color}`} />}
                      {selectedColor?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <div className={`h-4 w-4 rounded mr-2 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formula Template</Label>
            <Select 
              value={widget.formula || 'custom_formula'} 
              onValueChange={(value) => setWidget({ ...widget, formula: value === 'custom_formula' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a formula template" />
              </SelectTrigger>
              <SelectContent>
                {formulaTemplates.map((template, index) => (
                  <SelectItem key={index} value={template.value}>
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">Custom Formula</Label>
            <Textarea
              id="formula"
              placeholder="Enter your custom calculation formula..."
              value={widget.formula}
              onChange={(e) => setWidget({ ...widget, formula: e.target.value })}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Use variables like: subscriptions, active, expired, revenue, etc.
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {widget.title || 'Widget Title'}
                  </p>
                  <div className="text-2xl font-bold">
                    {widget.value || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {widget.description || 'Widget description'}
                  </p>
                </div>
                {selectedIcon && (
                  <selectedIcon.icon className={`h-8 w-8 ${widget.color}`} />
                )}
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!widget.title || !widget.description}>
            <Save className="h-4 w-4 mr-2" />
            Save Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}