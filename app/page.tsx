'use client';

import { useState, useMemo } from 'react';
import { DashboardStatsCards } from '@/components/dashboard-stats';
import { ModernAnalytics } from '@/components/modern-analytics';

import { Charts } from '@/components/charts';
import { ExcelSubscriptionTable } from '@/components/excel-subscription-table';
import { ExpiryTable } from '@/components/expiry-table';
import { RenewedTable } from '@/components/renewed-table';
import { ExpiredTable } from '@/components/expired-table';
import { ExcelImport } from '@/components/excel-import';
import { Sidebar } from '@/components/sidebar';
import { SettingsPanel } from '@/components/settings-panel';
import { WidgetManager } from '@/components/widget-manager';
import { SettingsTest } from '@/components/settings-test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleSubscriptions } from '@/data/sample-data';
import { Subscription, DashboardStats } from '@/types/subscription';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(sampleSubscriptions);
  const [activeView, setActiveView] = useState('overview');

  const handleExcelImport = (importedData: Subscription[]) => {
    // Option 1: Replace all data
    // setSubscriptions(importedData);

    // Option 2: Append to existing data (avoiding duplicates by IMEI)
    const existingImeis = new Set(subscriptions.map(s => s.imei));
    const newSubscriptions = importedData.filter(s => !existingImeis.has(s.imei));
    const updatedSubscriptions = [...subscriptions, ...newSubscriptions];

    // Update serial numbers
    const reindexedSubscriptions = updatedSubscriptions.map((sub, index) => ({
      ...sub,
      slNo: index + 1
    }));

    setSubscriptions(reindexedSubscriptions);
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    const updatedSubscriptions = subscriptions.map(sub => {
      if (sub.id === subscription.id) {
        return {
          ...sub,
          renewalDate: new Date().toISOString().split('T')[0], // Today's date
          status: 'active' as const,
          ownerName: sub.customer, // Copy customer name to ownerName for renewed table
          recharge: sub.recharge || 1 // Ensure recharge period is maintained
        };
      }
      return sub;
    });
    
    setSubscriptions(updatedSubscriptions);
    
    // Optionally show a success message
    alert(`Subscription for ${subscription.customer} (${subscription.vehicleNo}) has been renewed successfully!`);
  };

  const handleBulkRenewSubscriptions = (subscriptionsToRenew: Subscription[], renewalYears: number) => {
    const renewalDate = new Date().toISOString().split('T')[0]; // Today's date
    
    const updatedSubscriptions = subscriptions.map(sub => {
      const subscriptionToRenew = subscriptionsToRenew.find(s => s.id === sub.id);
      if (subscriptionToRenew) {
        return {
          ...sub,
          renewalDate,
          status: 'active' as const,
          ownerName: sub.customer,
          recharge: renewalYears // Update the recharge period
        };
      }
      return sub;
    });
    
    setSubscriptions(updatedSubscriptions);
    
    // Show success message
    alert(`${subscriptionsToRenew.length} subscription${subscriptionsToRenew.length > 1 ? 's' : ''} renewed successfully for ${renewalYears} year${renewalYears > 1 ? 's' : ''}!`);
  };

  // Calculate dashboard stats from current data
  const stats: DashboardStats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter(s => s.status === 'active').length;
    const expired = subscriptions.filter(s => s.status === 'expired').length;


    // Calculate monthly growth based on installation dates
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthSubs = subscriptions.filter(s => {
      try {
        const date = new Date(s.installationDate);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).length;

    const lastMonthSubs = subscriptions.filter(s => {
      try {
        const date = new Date(s.installationDate);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      } catch {
        return false;
      }
    }).length;

    const monthlyGrowth = lastMonthSubs > 0
      ? ((currentMonthSubs - lastMonthSubs) / lastMonthSubs * 100)
      : currentMonthSubs > 0 ? 100 : 0;

    const uniqueVendors = new Set(subscriptions.map(s => s.vendor).filter(Boolean)).size;
    const uniqueLocations = new Set(subscriptions.map(s => s.tagPlace).filter(Boolean)).size;

    // Calculate next month expiry count
    const nextMonthExpiry = subscriptions.filter(s => {
      try {
        // Use renewal date if available, otherwise use installation date
        const baseDate = s.renewalDate 
          ? new Date(s.renewalDate) 
          : new Date(s.installationDate);
        const rechargeYears = s.recharge || 1;
        const expiryDate = new Date(baseDate);
        expiryDate.setFullYear(baseDate.getFullYear() + rechargeYears);

        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Count subscriptions expiring within next 30 days
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
      } catch {
        return false;
      }
    }).length;

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      expiredSubscriptions: expired,
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      uniqueVendors,
      uniqueLocations,
      nextMonthExpiry
    };
  }, [subscriptions]);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <ModernAnalytics stats={stats} />
            <Charts subscriptions={subscriptions} />
            <SettingsTest />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <DashboardStatsCards stats={stats} />
            <Charts subscriptions={subscriptions} />
          </div>
        );
      case 'subscriptions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ExcelSubscriptionTable
                data={subscriptions}
                onDataChange={setSubscriptions}
              />
            </CardContent>
          </Card>
        );
      case 'expiry':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Expiry Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track subscription expiry dates based on recharge periods (1 = 1 year, 2 = 2 years)
              </p>
            </CardHeader>
            <CardContent>
              <ExpiryTable
                data={subscriptions}
                onDataChange={setSubscriptions}
                onRenewSubscription={handleRenewSubscription}
                onBulkRenewSubscriptions={handleBulkRenewSubscriptions}
              />
            </CardContent>
          </Card>
        );
      case 'renewed':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Renewed Subscriptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all renewed subscriptions and their new expiry dates
              </p>
            </CardHeader>
            <CardContent>
              <RenewedTable
                data={subscriptions}
                onDataChange={setSubscriptions}
              />
            </CardContent>
          </Card>
        );
      case 'expired':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Expired Subscriptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage expired subscriptions with detailed analytics and export options
              </p>
            </CardHeader>
            <CardContent>
              <ExpiredTable
                data={subscriptions}
                onDataChange={setSubscriptions}
                onRenewSubscription={handleRenewSubscription}
              />
            </CardContent>
          </Card>
        );
      case 'import':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExcelImport onImport={handleExcelImport} />
            <Card>
              <CardHeader>
                <CardTitle>Import Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Step 1: Download Template</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Download Template" to get the correct Excel format
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Step 2: Fill Your Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Add your subscription data following the template format
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Step 3: Import</h4>
                    <p className="text-sm text-muted-foreground">
                      Select your Excel file to import the data
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Current Data Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Records:</span>
                      <span className="ml-2 font-medium">{subscriptions.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {subscriptions.filter(s => s.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto py-8 px-[14px] md:px-[18px] max-w-7xl space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {activeView === 'overview' && 'Dashboard'}
                {activeView === 'analytics' && 'Analytics'}
                {activeView === 'subscriptions' && 'Subscription'}
                {activeView === 'expiry' && 'Expiry'}
                {activeView === 'renewed' && 'Renewed'}
                {activeView === 'expired' && 'Expired'}
                {activeView === 'import' && 'Import Data'}
              </h1>
              <p className="text-muted-foreground">
                {activeView === 'overview' && 'Monitor your vehicle tracking subscriptions'}
                {activeView === 'analytics' && 'Deep dive into your subscription metrics'}
                {activeView === 'subscriptions' && 'Manage and edit subscription data'}
                {activeView === 'expiry' && 'Track and manage subscription expiry dates'}
                {activeView === 'renewed' && 'View all renewed subscriptions and their updated expiry dates'}
                {activeView === 'expired' && 'Manage expired subscriptions with comprehensive export and renewal options'}
                {activeView === 'import' && 'Import subscription data from Excel files'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeView === 'overview' && (
                <WidgetManager 
                  onWidgetToggle={(widgetId, enabled) => {
                    console.log('Widget toggled:', widgetId, enabled);
                  }}
                  onWidgetReorder={(newOrder) => {
                    console.log('Widgets reordered:', newOrder);
                  }}
                />
              )}
              <SettingsPanel onSaveAsDefault={() => {
                // This will be called when user clicks "Save as Default"
                console.log('Settings saved as default for current view:', activeView);
              }} />
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}