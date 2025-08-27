'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/types/subscription';
import { 
  Users, Activity, AlertCircle, TrendingUp, Building2, MapPin, Calendar, 
  Plus, Settings, X, DollarSign, Target, Zap, BarChart3, PieChart, 
  TrendingDown, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CustomWidgetBuilder } from '@/components/custom-widget-builder';
import React from 'react';

interface AnalyticsWidget {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: any;
  color: string;
  category: 'customers' | 'performance' | 'growth' | 'custom';
}

interface ModernAnalyticsProps {
  stats: DashboardStats;
}

export function ModernAnalytics({ stats }: ModernAnalyticsProps) {
  const availableWidgets: AnalyticsWidget[] = [
    {
      id: 'new-customers',
      title: 'New Customers',
      value: stats.totalSubscriptions - stats.expiredSubscriptions,
      subtitle: 'Down 20% this period',
      trend: { value: 20, isPositive: false, label: '20%' },
      icon: Users,
      color: 'text-blue-600',
      category: 'customers'
    },
    {
      id: 'active-accounts',
      title: 'Active Accounts',
      value: stats.activeSubscriptions.toLocaleString(),
      subtitle: 'Strong user retention',
      trend: { value: 12.5, isPositive: true, label: '+12.5%' },
      icon: Activity,
      color: 'text-green-600',
      category: 'performance'
    },
    {
      id: 'growth-rate',
      title: 'Growth Rate',
      value: `${Math.abs(stats.monthlyGrowth)}%`,
      subtitle: stats.monthlyGrowth >= 0 ? 'Steady performance' : 'Needs attention',
      trend: { value: Math.abs(stats.monthlyGrowth), isPositive: stats.monthlyGrowth >= 0, label: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%` },
      icon: TrendingUp,
      color: stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      category: 'growth'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '3.2%',
      subtitle: 'Above industry average',
      trend: { value: 8.3, isPositive: true, label: '+8.3%' },
      icon: Target,
      color: 'text-purple-600',
      category: 'performance'
    },
    {
      id: 'churn-rate',
      title: 'Churn Rate',
      value: '2.1%',
      subtitle: 'Improved retention',
      trend: { value: 15.2, isPositive: false, label: '-15.2%' },
      icon: TrendingDown,
      color: 'text-orange-600',
      category: 'performance'
    },
    {
      id: 'locations',
      title: 'Active Locations',
      value: stats.uniqueLocations,
      subtitle: 'Geographic coverage',
      trend: { value: 2.3, isPositive: true, label: '+2.3%' },
      icon: MapPin,
      color: 'text-pink-600',
      category: 'performance'
    },
    {
      id: 'vendors',
      title: 'Partner Vendors',
      value: stats.uniqueVendors,
      subtitle: 'Strategic partnerships',
      trend: { value: 1.2, isPositive: true, label: '+1.2%' },
      icon: Building2,
      color: 'text-cyan-600',
      category: 'performance'
    },
    {
      id: 'expiry-alerts',
      title: 'Expiry Alerts',
      value: stats.nextMonthExpiry,
      subtitle: 'Renewal opportunities',
      trend: { value: 8.9, isPositive: false, label: '+8.9%' },
      icon: AlertCircle,
      color: 'text-red-600',
      category: 'performance'
    }
  ];

  const [activeWidgets, setActiveWidgets] = useState<AnalyticsWidget[]>(
    availableWidgets.slice(0, 4) // Show first 4 by default
  );
  const [customWidgets, setCustomWidgets] = useState<any[]>([]);

  const addWidget = (widget: AnalyticsWidget) => {
    if (!activeWidgets.find(w => w.id === widget.id)) {
      setActiveWidgets([...activeWidgets, widget]);
    }
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  };

  const getAvailableWidgets = () => {
    return availableWidgets.filter(w => !activeWidgets.find(aw => aw.id === w.id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customers': return Users;
      case 'performance': return Zap;
      case 'growth': return TrendingUp;
      default: return BarChart3;
    }
  };

  const iconMap: Record<string, any> = {
    BarChart3, PieChart, TrendingUp, Users, DollarSign, Activity, 
    Target, Zap, Building2, MapPin, Calendar, AlertCircle
  };

  const handleCustomWidget = (widget: any) => {
    const IconComponent = iconMap[widget.icon] || BarChart3;
    const newWidget: AnalyticsWidget = {
      id: widget.id,
      title: widget.title,
      value: widget.value,
      subtitle: widget.description,
      trend: { value: 0, isPositive: true, label: 'Custom' },
      icon: IconComponent,
      color: widget.color,
      category: 'custom'
    };
    setCustomWidgets([...customWidgets, widget]);
    setActiveWidgets([...activeWidgets, newWidget]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">Key performance indicators and metrics</p>
        </div>
        
        <div className="flex gap-2">
          <CustomWidgetBuilder onSave={handleCustomWidget} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {Object.entries(
              getAvailableWidgets().reduce((acc, widget) => {
                if (!acc[widget.category]) acc[widget.category] = [];
                acc[widget.category].push(widget);
                return acc;
              }, {} as Record<string, AnalyticsWidget[]>)
            ).map(([category, widgets]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize flex items-center">
                  {React.createElement(getCategoryIcon(category), { className: "h-4 w-4 mr-2" })}
                  {category}
                </div>
                {widgets.map((widget) => (
                  <DropdownMenuItem
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    className="cursor-pointer"
                  >
                    <widget.icon className={`h-4 w-4 mr-2 ${widget.color}`} />
                    {widget.title}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeWidgets.map((widget) => {
          const Icon = widget.icon;
          const TrendIcon = widget.trend.isPositive ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={widget.id} className="relative group hover:shadow-lg transition-all duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={() => removeWidget(widget.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {widget.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <TrendIcon className={`h-4 w-4 ${widget.trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${widget.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {widget.trend.label}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-3xl font-bold tracking-tight">
                    {widget.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {widget.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeWidgets.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No widgets selected</h3>
              <p className="text-muted-foreground">Add some analytics widgets to get started</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {availableWidgets.slice(0, 5).map((widget) => (
                  <DropdownMenuItem
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    className="cursor-pointer"
                  >
                    <widget.icon className={`h-4 w-4 mr-2 ${widget.color}`} />
                    {widget.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      )}
    </div>
  );
}