'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DashboardStatsCards } from '@/components/dashboard-stats';
import { ModernAnalytics } from '@/components/modern-analytics';

import { Charts } from '@/components/charts';
import { ExcelSubscriptionTable } from '@/components/excel-subscription-table';
import { ExpiryTable } from '@/components/expiry-table';
import { RenewedTable } from '@/components/renewed-table';
import { ExpiredTable } from '@/components/expired-table';
import { ExcelImport } from '@/components/excel-import';
import { Sidebar } from '@/components/sidebar';

import { WidgetManager } from '@/components/widget-manager';
import { SettingsContent } from '@/components/settings/settings-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleSubscriptions } from '@/data/sample-data';
import { Subscription, DashboardStats } from '@/types/subscription';
import { auditLogger } from '@/lib/audit-logger';
import { UndoRedoToolbar } from '@/components/ui/undo-redo-toolbar';
import { useUndoRedo, useUndoRedoKeyboard } from '@/hooks/use-undo-redo';
import { DEFAULT_DASHBOARD_VIEW, DashboardView, isDashboardView } from '@/types/dashboard-view';

// Mark as dynamic to allow useSearchParams
export const dynamic = 'force-dynamic';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(sampleSubscriptions);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const viewParam = searchParams.get('view');
  const activeView: DashboardView = isDashboardView(viewParam)
    ? viewParam
    : DEFAULT_DASHBOARD_VIEW;
  const { addAction } = useUndoRedo();
  
  const handleViewChange = useCallback(
    (nextView: DashboardView) => {
      if (nextView === activeView) {
        return;
      }
      const params = new URLSearchParams(searchParamsString);
      if (nextView === DEFAULT_DASHBOARD_VIEW) {
        params.delete('view');
      } else {
        params.set('view', nextView);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [activeView, pathname, router, searchParamsString]
  );
  
  // Enable keyboard shortcuts
  useUndoRedoKeyboard();

  // Create a wrapper function for setSubscriptions that can be used in undo/redo
  const updateSubscriptions = (newData: Subscription[]) => {
    setSubscriptions(newData);
  };

  const handleExcelImport = async (importedData: Subscription[], importType: 'replace' | 'merge') => {
    const previousData = JSON.parse(JSON.stringify(subscriptions)); // Deep copy
    let finalSubscriptions: Subscription[];

    try {
      if (importType === 'replace') {
        // Replace all existing data
        finalSubscriptions = importedData.map((sub, index) => ({
          ...sub,
          slNo: index + 1
        }));

        // TODO: When Supabase is configured, uncomment this:
        // 1. Delete all existing subscriptions from Supabase
        // 2. Bulk create new subscriptions in Supabase
        // Example:
        // const { subscriptionService } = await import('@/lib/supabase/subscriptions');
        // await subscriptionService.bulkCreate(finalSubscriptions);
        
      } else {
        // Merge with existing data
        const existingImeis = new Map(subscriptions.map(s => [s.imei, s]));
        const mergedSubscriptions: Subscription[] = [];
        const toCreate: Subscription[] = [];
        const toUpdate: { id: number; data: Partial<Subscription> }[] = [];
        
        // Add/update from imported data
        importedData.forEach(importedSub => {
          const existing = existingImeis.get(importedSub.imei);
          if (existing) {
            // Update existing record
            const updated = {
              ...existing,
              ...importedSub,
              id: existing.id, // Preserve original ID
            };
            mergedSubscriptions.push(updated);
            toUpdate.push({ id: existing.id, data: importedSub });
            existingImeis.delete(importedSub.imei); // Mark as processed
          } else {
            // Add new record
            mergedSubscriptions.push(importedSub);
            toCreate.push(importedSub);
          }
        });
        
        // Add remaining existing records that weren't in import
        existingImeis.forEach(existingSub => {
          mergedSubscriptions.push(existingSub);
        });

        // Update serial numbers
        finalSubscriptions = mergedSubscriptions.map((sub, index) => ({
          ...sub,
          slNo: index + 1
        }));

        // TODO: When Supabase is configured, uncomment this:
        // const { subscriptionService } = await import('@/lib/supabase/subscriptions');
        // if (toCreate.length > 0) {
        //   await subscriptionService.bulkCreate(toCreate);
        // }
        // if (toUpdate.length > 0) {
        //   await subscriptionService.bulkUpdate(toUpdate);
        // }
      }

      const finalData = JSON.parse(JSON.stringify(finalSubscriptions)); // Deep copy

      // Add undo action with proper state management
      addAction({
        type: 'data.import',
        description: `${importType === 'replace' ? 'Replaced' : 'Imported'} ${importedData.length} subscriptions`,
        undo: () => {
          console.log('Undoing import, restoring:', previousData.length, 'records');
          setSubscriptions(previousData);
          // TODO: When Supabase is configured, sync undo to database
        },
        redo: () => {
          console.log('Redoing import, applying:', finalData.length, 'records');
          setSubscriptions(finalData);
          // TODO: When Supabase is configured, sync redo to database
        },
        data: {
          importType,
          recordCount: importedData.length,
          previousCount: previousData.length
        },
        previousState: previousData,
        newState: finalData
      });

      setSubscriptions(finalSubscriptions);
      
      console.log('✅ Data imported successfully. To enable Supabase sync, configure your .env.local with Supabase credentials.');
    } catch (error) {
      console.error('Error importing data:', error);
      // Revert to previous data on error
      setSubscriptions(previousData);
      throw error;
    }
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    const previousData = JSON.parse(JSON.stringify(subscriptions)); // Deep copy
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
    
    const finalData = JSON.parse(JSON.stringify(updatedSubscriptions)); // Deep copy
    
    // Log individual renewal action
    auditLogger.logSubscriptionRenewal(
      subscription.id.toString(),
      subscription.imei,
      subscription.vehicleNo,
      subscription.customer,
      subscription.recharge || 1
    );

    // Add undo action with proper state management
    addAction({
      type: 'subscription.renew',
      description: `Renewed subscription for ${subscription.customer} (${subscription.vehicleNo})`,
      undo: () => {
        console.log('Undoing renewal, restoring:', previousData.length, 'records');
        setSubscriptions(previousData);
      },
      redo: () => {
        console.log('Redoing renewal, applying:', finalData.length, 'records');
        setSubscriptions(finalData);
      },
      data: {
        subscriptionId: subscription.id,
        customer: subscription.customer,
        vehicleNo: subscription.vehicleNo
      },
      previousState: previousData,
      newState: finalData
    });
    
    setSubscriptions(updatedSubscriptions);
    
    // Optionally show a success message
    alert(`Subscription for ${subscription.customer} (${subscription.vehicleNo}) has been renewed successfully!`);
  };

  const handleBulkRenewSubscriptions = (subscriptionsToRenew: Subscription[], renewalYears: number) => {
    const previousData = JSON.parse(JSON.stringify(subscriptions)); // Deep copy
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
    
    const finalData = JSON.parse(JSON.stringify(updatedSubscriptions)); // Deep copy
    
    // Log bulk renewal action (this will also be logged in the expiry table, but this is from the main handler)
    auditLogger.logBulkRenewal(
      subscriptionsToRenew.map(sub => sub.id.toString()),
      renewalYears,
      subscriptionsToRenew.length
    );

    // Add undo action with proper state management
    addAction({
      type: 'subscription.bulk_renew',
      description: `Bulk renewed ${subscriptionsToRenew.length} subscriptions for ${renewalYears} year${renewalYears > 1 ? 's' : ''}`,
      undo: () => {
        console.log('Undoing bulk renewal, restoring:', previousData.length, 'records');
        setSubscriptions(previousData);
      },
      redo: () => {
        console.log('Redoing bulk renewal, applying:', finalData.length, 'records');
        setSubscriptions(finalData);
      },
      data: {
        renewalYears,
        subscriptionCount: subscriptionsToRenew.length,
        subscriptionIds: subscriptionsToRenew.map(sub => sub.id)
      },
      previousState: previousData,
      newState: finalData
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
            <ExcelImport onImport={handleExcelImport} existingData={subscriptions} />
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
      case 'settings':
        return <SettingsContent />;
      default:
        return null;
    }
  };

  // Settings is now handled in the regular content flow

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto py-8 px-[14px] md:px-[18px] max-w-screen-2xl space-y-8">
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
                {activeView === 'settings' && 'Settings'}
              </h1>
              <p className="text-muted-foreground">
                {activeView === 'overview' && 'Monitor your vehicle tracking subscriptions'}
                {activeView === 'analytics' && 'Deep dive into your subscription metrics'}
                {activeView === 'subscriptions' && 'Manage and edit subscription data'}
                {activeView === 'expiry' && 'Track and manage subscription expiry dates'}
                {activeView === 'renewed' && 'View all renewed subscriptions and their updated expiry dates'}
                {activeView === 'expired' && 'Manage expired subscriptions with comprehensive export and renewal options'}
                {activeView === 'import' && 'Import subscription data from Excel files'}
                {activeView === 'settings' && 'Configure your account and system preferences'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UndoRedoToolbar size="sm" />
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
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
