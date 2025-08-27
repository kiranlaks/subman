'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Target, TrendingUp, Users, DollarSign, 
  BarChart3, Settings, Zap 
} from 'lucide-react';

export function AnalyticsSummary() {
  const features = [
    {
      icon: Sparkles,
      title: 'Modern Design',
      description: 'Clean, professional analytics cards matching your reference style',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Settings,
      title: 'Customizable Widgets',
      description: 'Add, remove, and create custom analytics widgets',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Target,
      title: 'Smart Metrics',
      description: 'Intelligent calculations with trend indicators',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live data updates as your subscription data changes',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const availableMetrics = [
    'Total Revenue', 'New Customers', 'Active Accounts', 'Growth Rate',
    'Conversion Rate', 'Churn Rate', 'Avg Revenue per User', 'Active Locations',
    'Partner Vendors', 'Expiry Alerts', 'Custom Formulas'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Available Analytics Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableMetrics.map((metric, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {metric}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Mix and match these metrics to create your perfect analytics dashboard. 
            Use the "Create Custom Widget" button to build your own calculations and formulas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}