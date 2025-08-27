'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Edit, Trash2, Plus, Save, X, ChevronDown, Search, Eye, EyeOff, ChevronLeft, ChevronRight, Settings, Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTableColumnSettings, useFilterSettings } from '@/hooks/use-local-storage';

interface ExpiryTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
  onRenewSubscription?: (subscription: Subscription) => void;
  onBulkRenewSubscriptions?: (subscriptions: Subscription[], renewalYears: number) => void;
}

interface ColumnFilter {
  [key: string]: Set<string>;
}

interface ExpirySubscription extends Subscription {
  expiryDate: string;
  daysUntilExpiry: number;
  expiryStatus: 'expired' | 'expiring-soon' | 'active';
}

export function ExpiryTable({ data, onDataChange, onRenewSubscription, onBulkRenewSubscriptions }: ExpiryTableProps) {
  // Define columns first
  const columns = [
    { key: 'slNo', label: 'SL NO', minWidth: 50, maxWidth: 100, type: 'number', priority: 1 },
    { key: 'date', label: 'DATE', minWidth: 80, maxWidth: 120, type: 'text', priority: 3 },
    { key: 'imei', label: 'IMEI', minWidth: 100, maxWidth: 180, type: 'text', priority: 2 },
    { key: 'device', label: 'DEVICE', minWidth: 80, maxWidth: 120, type: 'text', priority: 4 },
    { key: 'vendor', label: 'VENDOR', minWidth: 100, maxWidth: 160, type: 'text', priority: 2 },
    { key: 'vehicleNo', label: 'VEHICLE NO', minWidth: 100, maxWidth: 150, type: 'text', priority: 2 },
    { key: 'customer', label: 'CUSTOMER', minWidth: 120, maxWidth: 200, type: 'text', priority: 1 },
    { key: 'phoneNo', label: 'PHONE NO', minWidth: 100, maxWidth: 140, type: 'text', priority: 3 },
    { key: 'tagPlace', label: 'TAG PLACE', minWidth: 80, maxWidth: 120, type: 'text', priority: 4 },
    { key: 'installationDate', label: 'INSTALLATION DATE', minWidth: 100, maxWidth: 160, type: 'text', priority: 3 },
    { key: 'recharge', label: 'RECHARGE', minWidth: 80, maxWidth: 120, type: 'number', priority: 4 },
    { key: 'expiryDate', label: 'EXPIRY DATE', minWidth: 100, maxWidth: 160, type: 'text', priority: 1 },
    { key: 'daysUntilExpiry', label: 'DAYS LEFT', minWidth: 80, maxWidth: 120, type: 'number', priority: 1 },
    { key: 'expiryStatus', label: 'STATUS', minWidth: 80, maxWidth: 120, type: 'text', priority: 1 },
  ];

  // Persistent settings hooks
  const { 
    visibleColumns: savedVisibleColumns, 
    setVisibleColumns: setSavedVisibleColumns,
    pageSize: savedPageSize,
    setPageSize: setSavedPageSize
  } = useTableColumnSettings('expiry-table');
  
  const { 
    searchTerm: savedSearchTerm, 
    setSearchTerm: setSavedSearchTerm,
    activeFilters: savedActiveFilters,
    setActiveFilters: setSavedActiveFilters
  } = useFilterSettings('expiry-view');

  // State variables with persistent defaults
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<ColumnFilter>(savedActiveFilters || {});
  const [searchTerm, setSearchTerm] = useState(savedSearchTerm || '');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(savedVisibleColumns.length > 0 ? savedVisibleColumns : columns.map(col => col.key))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(savedPageSize || 20);
  const [columnWidth, setColumnWidth] = useState(100);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showExpiryFilter, setShowExpiryFilter] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [showBulkRenewOptions, setShowBulkRenewOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate expiry data
  const expiryData = useMemo(() => {
    return data.map(subscription => {
      // Use renewal date if available, otherwise use installation date
      const baseDate = subscription.renewalDate 
        ? new Date(subscription.renewalDate) 
        : new Date(subscription.installationDate);
      
      const rechargeYears = subscription.recharge || 1; // Default to 1 year if no recharge
      const expiryDate = new Date(baseDate);
      expiryDate.setFullYear(baseDate.getFullYear() + rechargeYears);
      
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let expiryStatus: 'expired' | 'expiring-soon' | 'active';
      if (daysUntilExpiry < 0) {
        expiryStatus = 'expired';
      } else if (daysUntilExpiry <= 30) {
        expiryStatus = 'expiring-soon';
      } else {
        expiryStatus = 'active';
      }

      return {
        ...subscription,
        expiryDate: expiryDate.toLocaleDateString('en-GB'),
        daysUntilExpiry,
        expiryStatus
      } as ExpirySubscription;
    });
  }, [data]);

  // Get unique values for each column for filtering
  const getUniqueValues = (columnKey: string) => {
    const values = expiryData.map(row => String(row[columnKey as keyof ExpirySubscription] || '')).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  // Filter data based on active filters, search term, and expiry filter
  const filteredData = useMemo(() => {
    return expiryData.filter(row => {
      // Apply column filters
      const passesFilters = Object.entries(filters).every(([columnKey, selectedValues]) => {
        if (selectedValues.size === 0) return true;
        const cellValue = String(row[columnKey as keyof ExpirySubscription] || '');
        return selectedValues.has(cellValue);
      });

      // Apply search filter
      const passesSearch = searchTerm === '' || columns.some(col => {
        const cellValue = String(row[col.key as keyof ExpirySubscription] || '').toLowerCase();
        return cellValue.includes(searchTerm.toLowerCase());
      });

      // Apply expiry filter
      const passesExpiryFilter = (() => {
        const daysLeft = row.daysUntilExpiry;
        
        switch (expiryFilter) {
          case 'all':
            return true;
          case '30days':
            return daysLeft >= 0 && daysLeft <= 30;
          case '2months':
            return daysLeft >= 0 && daysLeft <= 60;
          case '3months':
            return daysLeft >= 0 && daysLeft <= 90;
          case '6months':
            return daysLeft >= 0 && daysLeft <= 180;
          case '1year':
            return daysLeft >= 0 && daysLeft <= 365;
          case 'expired':
            return daysLeft < 0;
          case 'custom':
            if (!customStartDate || !customEndDate) return true;
            
            try {
              const expiryDate = new Date(row.expiryDate.split('-').reverse().join('-')); // Convert DD-MM-YYYY to YYYY-MM-DD
              const startDate = new Date(customStartDate);
              const endDate = new Date(customEndDate);
              
              return expiryDate >= startDate && expiryDate <= endDate;
            } catch {
              return true;
            }
          default:
            return true;
        }
      })();

      return passesFilters && passesSearch && passesExpiryFilter;
    });
  }, [expiryData, filters, searchTerm, expiryFilter, customStartDate, customEndDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, pageSize]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Calculate responsive column widths and visibility
  const getColumnWidth = (column: typeof columns[0]) => {
    const range = column.maxWidth - column.minWidth;
    const width = column.minWidth + (range * columnWidth / 100);
    return Math.round(width);
  };

  const shouldShowColumnText = (column: typeof columns[0]) => {
    const currentWidth = getColumnWidth(column);
    const threshold = column.minWidth + (column.maxWidth - column.minWidth) * 0.3;
    return currentWidth >= threshold;
  };

  // Filter columns based on visibility and responsive priority
  const getVisibleColumns = () => {
    let availableColumns = columns.filter(col => visibleColumns.has(col.key));
    
    // On smaller screens, hide lower priority columns
    if (columnWidth < 50) {
      availableColumns = availableColumns.filter(col => col.priority <= 2);
    } else if (columnWidth < 75) {
      availableColumns = availableColumns.filter(col => col.priority <= 3);
    }
    
    return availableColumns;
  };

  const visibleColumnsArray = getVisibleColumns();

  const handleCellClick = (rowIndex: number, colKey: string, currentValue: any) => {
    // Only allow editing of original subscription fields, not calculated expiry fields
    if (['expiryDate', 'daysUntilExpiry', 'expiryStatus'].includes(colKey)) return;
    
    const actualRowIndex = data.findIndex(item => item.id === paginatedData[rowIndex].id);
    setEditingCell({ row: actualRowIndex, col: colKey });
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const newData = [...data];
    const { row, col } = editingCell;
    
    let value: any = editValue;
    if (col === 'recharge' || col === 'slNo' || col === 'panicButtons') {
      value = parseInt(editValue) || 0;
    }
    
    newData[row] = { ...newData[row], [col]: value };
    onDataChange(newData);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleFilterChange = (columnKey: string, value: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[columnKey]) {
        newFilters[columnKey] = new Set();
      }
      
      if (checked) {
        newFilters[columnKey].add(value);
      } else {
        newFilters[columnKey].delete(value);
      }
      
      if (newFilters[columnKey].size === 0) {
        delete newFilters[columnKey];
      }
      
      // Save to persistent settings
      setSavedActiveFilters(newFilters);
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setExpiryFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newVisible = new Set(prev);
      if (newVisible.has(columnKey)) {
        newVisible.delete(columnKey);
      } else {
        newVisible.add(columnKey);
      }
      
      // Save to persistent settings
      setSavedVisibleColumns(Array.from(newVisible));
      
      return newVisible;
    });
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm !== '' || expiryFilter !== 'all';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-50';
      case 'expiring-soon': return 'text-orange-600 bg-orange-50';
      case 'active': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return 'text-red-600 font-semibold';
    if (days <= 30) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  // Export functions
  const getExportData = (exportFilter: string) => {
    const today = new Date();
    let filterFunction: (row: ExpirySubscription) => boolean;

    switch (exportFilter) {
      case 'next-week':
        filterFunction = (row) => {
          const daysLeft = row.daysUntilExpiry;
          return daysLeft >= 0 && daysLeft <= 7;
        };
        break;
      case 'next-month':
        filterFunction = (row) => {
          const daysLeft = row.daysUntilExpiry;
          return daysLeft >= 0 && daysLeft <= 30;
        };
        break;
      case '2-months':
        filterFunction = (row) => {
          const daysLeft = row.daysUntilExpiry;
          return daysLeft >= 0 && daysLeft <= 60;
        };
        break;
      case '3-months':
        filterFunction = (row) => {
          const daysLeft = row.daysUntilExpiry;
          return daysLeft >= 0 && daysLeft <= 90;
        };
        break;
      case 'date-range':
        filterFunction = (row) => {
          if (!exportStartDate || !exportEndDate) return false;
          try {
            const expiryDate = new Date(row.expiryDate.split('-').reverse().join('-'));
            const startDate = new Date(exportStartDate);
            const endDate = new Date(exportEndDate);
            return expiryDate >= startDate && expiryDate <= endDate;
          } catch {
            return false;
          }
        };
        break;
      default:
        filterFunction = () => true;
    }

    return expiryData.filter(filterFunction).map(row => ({
      'Vendor Name': row.vendor,
      'Customer Name': row.customer,
      'Phone No': row.phoneNo,
      'Vehicle Number': row.vehicleNo,
      'Expiry Date': row.expiryDate,
      'Days Left': row.daysUntilExpiry,
      'Status': row.expiryStatus.replace('-', ' ').toUpperCase()
    }));
  };

  const handleBulkRenewal = (renewalYears: number) => {
    if (selectedRows.size === 0) {
      alert('Please select subscriptions to renew.');
      return;
    }

    const selectedSubscriptions = paginatedData.filter((_, index) => selectedRows.has(index));
    
    if (onBulkRenewSubscriptions) {
      onBulkRenewSubscriptions(selectedSubscriptions, renewalYears);
      setSelectedRows(new Set()); // Clear selection after renewal
      setShowBulkRenewOptions(false);
    }
  };

  const exportToExcel = (exportFilter: string, templateName: string) => {
    try {
      // Dynamic import to avoid SSR issues
      import('xlsx').then((XLSX) => {
        const exportData = getExportData(exportFilter);
        
        if (exportData.length === 0) {
          alert('No data found for the selected export criteria.');
          return;
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expiry Report');
        
        const fileName = `expiry-report-${templateName}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
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

  return (
    <div className="w-full space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-3 items-center flex-wrap">
          {/* Export Button */}
          <DropdownMenu open={showExportOptions} onOpenChange={setShowExportOptions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-80 max-h-96 overflow-y-auto z-50"
              avoidCollisions={true}
              collisionPadding={10}
            >
              <div className="p-3">
                <div className="text-sm font-medium mb-3">Export Expiry Report</div>
                <div className="text-xs text-muted-foreground mb-3">
                  Exports: Vendor Name, Customer Name, Phone No, Vehicle Number, Expiry Date
                </div>
                
                <div className="space-y-2">
                  {[
                    { value: 'next-week', label: 'Next Week', desc: 'Expiring within 7 days' },
                    { value: 'next-month', label: 'Next Month', desc: 'Expiring within 30 days' },
                    { value: '2-months', label: '2 Months', desc: 'Expiring within 60 days' },
                    { value: '3-months', label: '3 Months', desc: 'Expiring within 90 days' },
                  ].map((template) => (
                    <Button
                      key={template.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => exportToExcel(template.value, template.label.toLowerCase().replace(' ', '-'))}
                      className="w-full justify-start p-2 h-auto"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">{template.label}</div>
                        <div className="text-xs text-muted-foreground">{template.desc}</div>
                      </div>
                    </Button>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Custom Date Range Export</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">From Date</label>
                        <Input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">To Date</label>
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
                            exportToExcel('date-range', 'custom-range');
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

          {/* Bulk Renew Button */}
          {selectedRows.size > 0 && (
            <DropdownMenu open={showBulkRenewOptions} onOpenChange={setShowBulkRenewOptions}>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew Selected ({selectedRows.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 z-50"
                avoidCollisions={true}
                collisionPadding={10}
              >
                <div className="p-3">
                  <div className="text-sm font-medium mb-3">Bulk Renewal Options</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Select renewal period for {selectedRows.size} selected subscription{selectedRows.size > 1 ? 's' : ''}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkRenewal(1)}
                      className="w-full justify-start p-2 h-auto hover:bg-green-50"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">1 Year Renewal</div>
                        <div className="text-xs text-muted-foreground">Extend subscription by 1 year</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkRenewal(2)}
                      className="w-full justify-start p-2 h-auto hover:bg-green-50"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">2 Year Renewal</div>
                        <div className="text-xs text-muted-foreground">Extend subscription by 2 years</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {selectedRows.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.size} selected
            </div>
          )}
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex gap-3 items-center flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSavedSearchTerm(e.target.value);
              }}
              className="pl-10 h-9"
            />
          </div>

          {/* Expiry Filter */}
          <DropdownMenu open={showExpiryFilter} onOpenChange={setShowExpiryFilter}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={expiryFilter !== 'all' ? 'bg-blue-50 border-blue-200' : ''}>
                <Filter className="w-4 h-4 mr-2" />
                {expiryFilter === 'all' ? 'All Expiry' : 
                 expiryFilter === '30days' ? '30 Days' :
                 expiryFilter === '2months' ? '2 Months' :
                 expiryFilter === '3months' ? '3 Months' :
                 expiryFilter === '6months' ? '6 Months' :
                 expiryFilter === '1year' ? '1 Year' :
                 expiryFilter === 'expired' ? 'Expired' :
                 expiryFilter === 'custom' ? 'Custom' : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="bottom" 
              className="w-72 sm:w-80 max-h-96 overflow-y-auto z-50" 
              sideOffset={5}
              avoidCollisions={true}
              collisionPadding={10}
            >
              <div className="p-3">
                <div className="text-sm font-medium mb-3">Filter by Expiry Period</div>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Records', desc: 'Show all subscriptions' },
                    { value: '30days', label: '30 Days', desc: 'Expiring within 30 days' },
                    { value: '2months', label: '2 Months', desc: 'Expiring within 60 days' },
                    { value: '3months', label: '3 Months', desc: 'Expiring within 90 days' },
                    { value: '6months', label: '6 Months', desc: 'Expiring within 180 days' },
                    { value: '1year', label: '1 Year', desc: 'Expiring within 365 days' },
                    { value: 'expired', label: 'Expired', desc: 'Already expired subscriptions' },
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        setExpiryFilter(option.value);
                        setShowExpiryFilter(false);
                      }}
                      className={cn(
                        "cursor-pointer p-2 rounded",
                        expiryFilter === option.value && "bg-blue-50"
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Custom Date Range</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">From Date</label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">To Date</label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (customStartDate && customEndDate) {
                            setExpiryFilter('custom');
                            setShowExpiryFilter(false);
                          }
                        }}
                        disabled={!customStartDate || !customEndDate}
                        className="w-full"
                      >
                        Apply Custom Filter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Column Visibility Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Columns ({visibleColumnsArray.length}/{columns.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 max-h-64 overflow-y-auto z-50"
              avoidCollisions={true}
              collisionPadding={10}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Show/Hide Columns</div>
                <DropdownMenuSeparator />
                {columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={visibleColumns.has(col.key)}
                    onCheckedChange={() => toggleColumnVisibility(col.key)}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {visibleColumns.has(col.key) ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {col.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page Size Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {pageSize} per page
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              avoidCollisions={true}
              collisionPadding={10}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Rows per page</div>
                <DropdownMenuSeparator />
                {[20, 30, 40, 50, 100].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setSavedPageSize(size);
                    }}
                    className={cn(
                      "text-xs cursor-pointer",
                      pageSize === size && "bg-muted"
                    )}
                  >
                    {size} rows
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Width Control */}
          <DropdownMenu open={showColumnSettings} onOpenChange={setShowColumnSettings}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-72 sm:w-80 max-h-96 overflow-y-auto z-50"
              avoidCollisions={true}
              collisionPadding={10}
            >
              <div className="p-4">
                <div className="text-sm font-medium mb-3">Column Width</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12">Narrow</span>
                    <Slider
                      value={[columnWidth]}
                      onValueChange={(value) => setColumnWidth(value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12">Wide</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Adjust column widths. Text auto-hides on narrow columns.
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Visible columns:</span> {visibleColumnsArray.length}
                    </div>
                    <div>
                      <span className="font-medium">Width:</span> {columnWidth}%
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} records
        </div>
      </div>

      <div className="border border-gray-300 rounded-sm overflow-hidden bg-white">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="border-collapse" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="w-12 p-0 border-r border-gray-300 bg-gray-200">
                  <div className="p-2">
                    <Checkbox
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(new Set(paginatedData.map((_, i) => i)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    />
                  </div>
                </th>
                {visibleColumnsArray.map((col) => {
                  const width = getColumnWidth(col);
                  const showText = shouldShowColumnText(col);
                  return (
                    <th
                      key={col.key}
                      className="p-0 text-left font-medium text-gray-800 border-r border-gray-300 bg-gray-100 relative transition-all duration-200"
                      style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                    >
                      <div className="flex items-center justify-between p-2 overflow-hidden">
                        <span className={cn(
                          "text-xs font-semibold transition-opacity duration-200 truncate",
                          showText ? "opacity-100" : "opacity-0"
                        )}>
                          {showText ? col.label : ''}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-6 w-6 p-0 hover:bg-gray-200 flex-shrink-0",
                                filters[col.key] && filters[col.key].size > 0 && "bg-blue-100"
                              )}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="start" 
                            className="w-56 max-h-64 overflow-y-auto z-50"
                            avoidCollisions={true}
                            collisionPadding={10}
                          >
                            <div className="p-2">
                              <div className="text-xs font-medium text-gray-600 mb-2">Filter by {col.label}</div>
                              {filters[col.key] && filters[col.key].size > 0 && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => setFilters(prev => {
                                      const newFilters = { ...prev };
                                      delete newFilters[col.key];
                                      return newFilters;
                                    })}
                                    className="text-xs text-red-600"
                                  >
                                    Clear filter
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {getUniqueValues(col.key).map((value) => (
                                <DropdownMenuCheckboxItem
                                  key={value}
                                  checked={filters[col.key]?.has(value) || false}
                                  onCheckedChange={(checked) => handleFilterChange(col.key, value, checked)}
                                  className="text-xs"
                                >
                                  {value}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  );
                })}
                <th className="p-2 text-left font-medium text-gray-800 bg-gray-100 text-xs">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => {
                const actualRowIndex = data.findIndex(item => item.id === row.id);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-gray-200 hover:bg-blue-50 transition-colors",
                      selectedRows.has(rowIndex) && "bg-blue-100",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                    )}
                  >
                    <td className="p-0 border-r border-gray-200 bg-gray-50">
                      <div className="p-2">
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                        />
                      </div>
                    </td>
                    {visibleColumnsArray.map((col) => {
                      const width = getColumnWidth(col);
                      const showText = shouldShowColumnText(col);
                      const cellValue = String(row[col.key as keyof ExpirySubscription] || '');
                      const isReadOnly = ['expiryDate', 'daysUntilExpiry', 'expiryStatus'].includes(col.key);
                      
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "p-0 border-r border-gray-200 transition-all duration-200",
                            !isReadOnly && "cursor-pointer hover:bg-blue-50"
                          )}
                          style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                          onClick={() => !isReadOnly && handleCellClick(rowIndex, col.key, row[col.key as keyof ExpirySubscription])}
                        >
                          {editingCell?.row === actualRowIndex && editingCell?.col === col.key && !isReadOnly ? (
                            <div className="flex items-center gap-1 p-1">
                              <Input
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-7 text-xs border-blue-500 focus:border-blue-600"
                                type={col.type === 'number' ? 'number' : 'text'}
                              />
                              {showText && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-7 w-7 p-0">
                                    <Save className="w-3 h-3 text-green-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                                    <X className="w-3 h-3 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className={cn(
                              "p-2 min-h-[32px] flex items-center text-xs font-medium overflow-hidden transition-opacity duration-200",
                              showText ? "opacity-100" : "opacity-60",
                              col.key === 'expiryStatus' && getStatusColor(cellValue),
                              col.key === 'daysUntilExpiry' && getDaysLeftColor(Number(cellValue))
                            )}>
                              <span className="truncate" title={showText ? cellValue : ''}>
                                {showText ? (
                                  col.key === 'expiryStatus' ? (
                                    <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor(cellValue))}>
                                      {cellValue.replace('-', ' ').toUpperCase()}
                                    </span>
                                  ) : cellValue
                                ) : (cellValue.length > 0 ? '•••' : '')}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCellClick(rowIndex, 'customer', row.customer)}
                          className="h-7 w-7 p-0"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {(row.expiryStatus === 'expired' || row.expiryStatus === 'expiring-soon') && onRenewSubscription && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRenewSubscription(row)}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Renew Subscription"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}