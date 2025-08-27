'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, Download, Filter, RefreshCw, Calendar, AlertTriangle } from 'lucide-react';
import { Subscription } from '@/types/subscription';

interface ExpiredTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
  onRenewSubscription?: (subscription: Subscription) => void;
}

interface ExpiredSubscription extends Subscription {
  expiryDate: string;
  daysExpired: number;
}

export function ExpiredTable({ data, onDataChange, onRenewSubscription }: ExpiredTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'daysExpired' | 'expiryDate' | 'customer'>('daysExpired');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const itemsPerPage = 15;

  // Calculate expired subscriptions with expiry details
  const expiredSubscriptions = useMemo(() => {
    const today = new Date();
    
    return data.map(subscription => {
      // Use renewal date if available, otherwise use installation date
      const baseDate = subscription.renewalDate 
        ? new Date(subscription.renewalDate) 
        : new Date(subscription.installationDate);
      
      const rechargeYears = subscription.recharge || 1;
      const expiryDate = new Date(baseDate);
      expiryDate.setFullYear(baseDate.getFullYear() + rechargeYears);
      
      const timeDiff = today.getTime() - expiryDate.getTime();
      const daysExpired = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        ...subscription,
        expiryDate: expiryDate.toLocaleDateString('en-GB'),
        daysExpired
      } as ExpiredSubscription;
    }).filter(sub => sub.daysExpired > 0); // Only expired subscriptions
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = expiredSubscriptions.filter(subscription =>
      Object.values(subscription).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'expiryDate') {
        aValue = new Date(a.expiryDate.split('/').reverse().join('-'));
        bValue = new Date(b.expiryDate.split('/').reverse().join('-'));
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [expiredSubscriptions, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculations
  const stats = useMemo(() => {
    const totalExpired = expiredSubscriptions.length;
    const expiredThisMonth = expiredSubscriptions.filter(sub => {
      const expiryDate = new Date(sub.expiryDate.split('/').reverse().join('-'));
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear;
    }).length;
    
    const criticallyExpired = expiredSubscriptions.filter(sub => sub.daysExpired > 90).length;
    const averageDaysExpired = totalExpired > 0 
      ? Math.round(expiredSubscriptions.reduce((sum, sub) => sum + sub.daysExpired, 0) / totalExpired)
      : 0;

    return {
      totalExpired,
      expiredThisMonth,
      criticallyExpired,
      averageDaysExpired
    };
  }, [expiredSubscriptions]);

  const handleSort = (column: 'daysExpired' | 'expiryDate' | 'customer') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleRenew = (subscription: ExpiredSubscription) => {
    if (onRenewSubscription) {
      onRenewSubscription(subscription);
    }
  };

  // Export functions
  const getExportData = (filterType: string) => {
    let dataToExport = expiredSubscriptions;

    switch (filterType) {
      case 'critical':
        dataToExport = expiredSubscriptions.filter(sub => sub.daysExpired > 90);
        break;
      case 'recent':
        dataToExport = expiredSubscriptions.filter(sub => sub.daysExpired <= 30);
        break;
      case 'this-month':
        dataToExport = expiredSubscriptions.filter(sub => {
          const expiryDate = new Date(sub.expiryDate.split('/').reverse().join('-'));
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear;
        });
        break;
      case 'date-range':
        if (exportStartDate && exportEndDate) {
          const startDate = new Date(exportStartDate);
          const endDate = new Date(exportEndDate);
          dataToExport = expiredSubscriptions.filter(sub => {
            const expiryDate = new Date(sub.expiryDate.split('/').reverse().join('-'));
            return expiryDate >= startDate && expiryDate <= endDate;
          });
        }
        break;
      default:
        dataToExport = expiredSubscriptions;
    }

    return dataToExport.map(sub => ({
      'Sl No': sub.slNo,
      'IMEI': sub.imei,
      'Vehicle No': sub.vehicleNo,
      'Customer Name': sub.customer,
      'Phone No': sub.phoneNo,
      'Vendor': sub.vendor,
      'Tag Place': sub.tagPlace,
      'Installation Date': sub.installationDate,
      'Expiry Date': sub.expiryDate,
      'Days Expired': sub.daysExpired,
      'Recharge Period': `${sub.recharge} Year${sub.recharge > 1 ? 's' : ''}`,
      'Status': 'EXPIRED'
    }));
  };

  const exportToExcel = (filterType: string, fileName: string) => {
    try {
      import('xlsx').then((XLSX) => {
        const exportData = getExportData(filterType);
        
        if (exportData.length === 0) {
          alert('No expired subscriptions found for the selected criteria.');
          return;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expired Subscriptions');
        
        const fileNameWithDate = `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileNameWithDate);
        
        setShowExportOptions(false);
      }).catch((error) => {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality not available.');
    }
  };

  const getDaysExpiredColor = (days: number) => {
    if (days > 180) return 'text-red-700 font-bold';
    if (days > 90) return 'text-red-600 font-semibold';
    if (days > 30) return 'text-orange-600 font-medium';
    return 'text-red-500';
  };

  const getDaysExpiredBadge = (days: number) => {
    if (days > 180) return 'destructive';
    if (days > 90) return 'destructive';
    if (days > 30) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search expired subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sort: {sortBy === 'daysExpired' ? 'Days Expired' : 
                       sortBy === 'expiryDate' ? 'Expiry Date' : 'Customer'} 
                ({sortOrder === 'asc' ? '↑' : '↓'})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('daysExpired')}>
                Days Expired {sortBy === 'daysExpired' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('expiryDate')}>
                Expiry Date {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('customer')}>
                Customer Name {sortBy === 'customer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={showExportOptions} onOpenChange={setShowExportOptions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <div className="text-sm font-medium mb-3">Export Expired Subscriptions</div>
                <div className="text-xs text-muted-foreground mb-3">
                  Choose export criteria for expired subscription data
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToExcel('all', 'all-expired-subscriptions')}
                    className="w-full justify-start p-2 h-auto"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">All Expired ({stats.totalExpired})</div>
                      <div className="text-xs text-muted-foreground">Export all expired subscriptions</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToExcel('critical', 'critical-expired-subscriptions')}
                    className="w-full justify-start p-2 h-auto"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">Critical (90+ days) ({stats.criticallyExpired})</div>
                      <div className="text-xs text-muted-foreground">Expired more than 90 days ago</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToExcel('recent', 'recently-expired-subscriptions')}
                    className="w-full justify-start p-2 h-auto"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">Recently Expired (≤30 days)</div>
                      <div className="text-xs text-muted-foreground">Expired within last 30 days</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToExcel('this-month', 'this-month-expired-subscriptions')}
                    className="w-full justify-start p-2 h-auto"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">This Month ({stats.expiredThisMonth})</div>
                      <div className="text-xs text-muted-foreground">Expired this month</div>
                    </div>
                  </Button>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Custom Date Range Export</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Expired From</label>
                        <Input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Expired To</label>
                        <Input
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (exportStartDate && exportEndDate) {
                            exportToExcel('date-range', 'custom-range-expired-subscriptions');
                          } else {
                            alert('Please select both start and end dates.');
                          }
                        }}
                        disabled={!exportStartDate || !exportEndDate}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Date Range
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Total Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalExpired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-orange-500" />
              Expired This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiredThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-700" />
              Critical (90+ days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.criticallyExpired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Days Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.averageDaysExpired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sl No</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Vehicle No</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('customer')}
              >
                Customer {sortBy === 'customer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Phone No</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Tag Place</TableHead>
              <TableHead>Installation Date</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('expiryDate')}
              >
                Expiry Date {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('daysExpired')}
              >
                Days Expired {sortBy === 'daysExpired' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No expired subscriptions found matching your search.' : 'No expired subscriptions found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((subscription) => (
                <TableRow key={subscription.imei}>
                  <TableCell>{subscription.slNo}</TableCell>
                  <TableCell className="font-mono text-sm">{subscription.imei}</TableCell>
                  <TableCell>{subscription.vehicleNo}</TableCell>
                  <TableCell className="font-medium">{subscription.customer}</TableCell>
                  <TableCell>{subscription.phoneNo}</TableCell>
                  <TableCell>{subscription.vendor}</TableCell>
                  <TableCell>{subscription.tagPlace}</TableCell>
                  <TableCell>{subscription.installationDate}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    {subscription.expiryDate}
                  </TableCell>
                  <TableCell className={getDaysExpiredColor(subscription.daysExpired)}>
                    {subscription.daysExpired} days
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDaysExpiredBadge(subscription.daysExpired)}>
                      {subscription.daysExpired > 180 ? 'Critical' :
                       subscription.daysExpired > 90 ? 'Long Expired' :
                       subscription.daysExpired > 30 ? 'Expired' : 'Recently Expired'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRenew(subscription)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Renew
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} expired subscriptions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}