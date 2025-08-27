
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { useChartSettings } from '@/hooks/use-local-storage';

interface ChartsProps {
  subscriptions: Subscription[];
}

export function Charts({ subscriptions }: ChartsProps) {
  const { sortOrder: vendorSortOrder, setSortOrder: setVendorSortOrder } = useChartSettings('vendor-chart');
  const { sortOrder: deviceSortOrder, setSortOrder: setDeviceSortOrder } = useChartSettings('device-chart');

  // Save sort order changes to persistent settings
  const handleVendorSortChange = (newOrder: 'asc' | 'desc') => {
    setVendorSortOrder(newOrder);
  };

  const handleDeviceSortChange = (newOrder: 'asc' | 'desc') => {
    setDeviceSortOrder(newOrder);
  };

  // Multi-color palette for vendors
  const vendorColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
    '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316',
    '#84cc16', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'
  ];
  // Generate dynamic data from subscriptions
  const chartData = useMemo(() => {
    // Monthly data based on installation dates
    const monthlyStats = subscriptions.reduce((acc, sub) => {
      try {
        const date = new Date(sub.installationDate);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, subscriptions: 0, revenue: 0 };
        }

        acc[monthKey].subscriptions += 1;
        acc[monthKey].revenue += sub.recharge * 1000; // Assuming recharge is in thousands
      } catch (error) {
        // Handle invalid dates
      }
      return acc;
    }, {} as Record<string, { month: string; subscriptions: number; revenue: number }>);

    const monthlyData = Object.values(monthlyStats).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Device distribution
    const deviceStats = subscriptions.reduce((acc, sub) => {
      const device = sub.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceData = Object.entries(deviceStats)
      .map(([name, value], index) => ({
        name,
        value,
        color: vendorColors[index % vendorColors.length]
      }))
      .sort((a, b) => deviceSortOrder === 'desc' ? b.value - a.value : a.value - b.value);

    // Vendor distribution
    const vendorStats = subscriptions.reduce((acc, sub) => {
      const vendor = sub.vendor || 'Unknown';
      acc[vendor] = (acc[vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vendorData = Object.entries(vendorStats)
      .map(([vendor, count], index) => ({
        vendor,
        count,
        color: vendorColors[index % vendorColors.length]
      }))
      .sort((a, b) => vendorSortOrder === 'desc' ? b.count - a.count : a.count - b.count);

    // Tag place distribution
    const tagPlaceStats = subscriptions.reduce((acc, sub) => {
      const place = sub.tagPlace || 'Unknown';
      acc[place] = (acc[place] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tagPlaceData = Object.entries(tagPlaceStats)
      .map(([place, count]) => ({ place, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 places

    return {
      monthlyData: monthlyData.length > 0 ? monthlyData : [
        { month: 'Current', subscriptions: subscriptions.length, revenue: subscriptions.reduce((sum, s) => sum + (s.recharge * 1000), 0) }
      ],
      deviceData,
      vendorData,
      tagPlaceData
    };
  }, [subscriptions]);
  return (
    <div className="space-y-6">
      {/* Top row - smaller charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Subscriptions</CardTitle>
            <p className="text-xs text-muted-foreground">Based on installation dates</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="subscriptions" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Location Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Top installation locations</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.tagPlaceData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="place" fontSize={10} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Panic Button Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Panic button counts</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={
                Object.entries(
                  subscriptions.reduce((acc, sub) => {
                    const count = sub.panicButtons || 0;
                    acc[count] = (acc[count] || 0) + 1;
                    return acc;
                  }, {} as Record<number, number>)
                ).map(([buttons, count]) => ({ buttons: `${buttons}`, count }))
              }>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="buttons" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [`${value} subscriptions`, `${name} buttons`]}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full width Top Vendors */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Vendors</CardTitle>
              <p className="text-xs text-muted-foreground">Most active vendors (showing top 30)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVendorSortChange(vendorSortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2"
            >
              {vendorSortOrder === 'desc' ? (
                <>
                  <ArrowDown className="w-4 h-4" />
                  High to Low
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Low to High
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {chartData.vendorData.slice(0, 30).map((vendor, index) => {
              const maxCount = Math.max(...chartData.vendorData.map(v => v.count));
              const percentage = (vendor.count / maxCount) * 100;
              return (
                <div key={vendor.vendor} className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-medium flex-shrink-0"
                      style={{ backgroundColor: vendor.color }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate" title={vendor.vendor}>
                      {vendor.vendor}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: vendor.color
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-8 text-right">
                      {vendor.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full width Device Distribution */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Device Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Current device types breakdown</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeviceSortChange(deviceSortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2"
            >
              {deviceSortOrder === 'desc' ? (
                <>
                  <ArrowDown className="w-4 h-4" />
                  High to Low
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Low to High
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chartData.deviceData.map((device, index) => {
              const total = chartData.deviceData.reduce((sum, d) => sum + d.value, 0);
              const percentage = ((device.value / total) * 100).toFixed(1);
              return (
                <div key={device.name} className="flex items-center justify-between p-4 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium truncate" title={device.name}>
                      {device.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="w-24 bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: device.color
                        }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{device.value}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}