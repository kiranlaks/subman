'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Edit, Trash2, Plus, Save, X, ChevronDown, Search, Eye, EyeOff, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { PaginationWithJump } from '@/components/ui/pagination-with-jump';
import { cn } from '@/lib/utils';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { auditLogger } from '@/lib/audit-logger';

interface ExcelSubscriptionTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
}

interface ColumnFilter {
  [key: string]: Set<string>;
}

export function ExcelSubscriptionTable({ data, onDataChange }: ExcelSubscriptionTableProps) {
  const { addAction } = useUndoRedo();
  
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
    { key: 'panicButtons', label: 'PANIC BUTTONS', minWidth: 60, maxWidth: 140, type: 'number', priority: 5 },
    { key: 'recharge', label: 'RECHARGE', minWidth: 80, maxWidth: 120, type: 'number', priority: 4 },
    { key: 'installationDate', label: 'INSTALLATION DATE', minWidth: 100, maxWidth: 160, type: 'text', priority: 3 },
  ];

  // State variables
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<ColumnFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [columnWidth, setColumnWidth] = useState(100); // Percentage: 0-100
  const [installationDateFilter, setInstallationDateFilter] = useState<{
    startDate: string;
    endDate: string;
    active: boolean;
  }>({
    startDate: '',
    endDate: '',
    active: false
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get unique values for each column for filtering
  const getUniqueValues = (columnKey: string) => {
    const values = data.map(row => String(row[columnKey as keyof Subscription] || '')).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  // Filter data based on active filters and search term
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Apply column filters
      const passesFilters = Object.entries(filters).every(([columnKey, selectedValues]) => {
        if (selectedValues.size === 0) return true;
        const cellValue = String(row[columnKey as keyof Subscription] || '');
        return selectedValues.has(cellValue);
      });

      // Apply search filter
      const passesSearch = searchTerm === '' || columns.some(col => {
        const cellValue = String(row[col.key as keyof Subscription] || '').toLowerCase();
        return cellValue.includes(searchTerm.toLowerCase());
      });

      // Apply installation date range filter
      const passesDateFilter = (() => {
        if (!installationDateFilter.active || !installationDateFilter.startDate || !installationDateFilter.endDate) {
          return true;
        }
        
        try {
          const installDate = new Date(row.installationDate);
          const startDate = new Date(installationDateFilter.startDate);
          const endDate = new Date(installationDateFilter.endDate);
          
          return installDate >= startDate && installDate <= endDate;
        } catch {
          return true; // If date parsing fails, include the row
        }
      })();

      return passesFilters && passesSearch && passesDateFilter;
    });
  }, [data, filters, searchTerm, installationDateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, pageSize, installationDateFilter]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = (rowIndex: number, colKey: string, currentValue: any) => {
    const actualRowIndex = data.findIndex(item => item.id === filteredData[rowIndex].id);
    setEditingCell({ row: actualRowIndex, col: colKey });
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy
    const newData = [...data];
    const { row, col } = editingCell;
    const oldValue = newData[row][col as keyof Subscription];
    
    let value: any = editValue;
    if (col === 'recharge' || col === 'slNo' || col === 'panicButtons') {
      value = parseInt(editValue) || 0;
    }
    
    // Only proceed if value actually changed
    if (oldValue !== value) {
      newData[row] = { ...newData[row], [col]: value };
      const finalNewData = JSON.parse(JSON.stringify(newData));
      
      // Log the edit action
      auditLogger.logSubscriptionEdit(
        newData[row].id.toString(),
        newData[row].imei,
        newData[row].vehicleNo,
        newData[row].customer,
        {
          [col]: {
            from: oldValue,
            to: value
          }
        }
      );

      // Add undo action
      addAction({
        type: 'subscription.edit',
        description: `Edited ${col} for ${newData[row].customer} (${newData[row].vehicleNo})`,
        undo: () => {
          console.log('Undoing edit, restoring:', previousData.length, 'records');
          onDataChange(previousData);
        },
        redo: () => {
          console.log('Redoing edit, applying:', finalNewData.length, 'records');
          onDataChange(finalNewData);
        },
        data: {
          subscriptionId: newData[row].id,
          field: col,
          oldValue,
          newValue: value
        },
        previousState: previousData,
        newState: finalNewData
      });
      
      onDataChange(newData);
    }
    
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

  const addNewRow = () => {
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy
    const newRow: Subscription = {
      id: Math.max(...data.map(d => d.id)) + 1,
      slNo: data.length + 1,
      date: new Date().toLocaleDateString('en-GB'),
      imei: '',
      device: 'TRANSIGHT',
      vendor: '',
      vehicleNo: '',
      customer: '',
      phoneNo: '',
      tagPlace: '',
      panicButtons: 1,
      recharge: 0,
      installationDate: new Date().toLocaleDateString('en-GB'),
      status: 'active'
    };
    const newData = [...data, newRow];
    const finalNewData = JSON.parse(JSON.stringify(newData));

    // Log the creation
    auditLogger.log(
      'subscription.create',
      'subscription',
      newRow.id.toString(),
      {
        subscriptionId: newRow.id.toString(),
        action: 'new_row_added',
        createdFrom: 'subscription_table'
      }
    );

    // Add undo action
    addAction({
      type: 'subscription.create',
      description: `Added new subscription row (ID: ${newRow.id})`,
      undo: () => {
        console.log('Undoing row addition, restoring:', previousData.length, 'records');
        onDataChange(previousData);
      },
      redo: () => {
        console.log('Redoing row addition, applying:', finalNewData.length, 'records');
        onDataChange(finalNewData);
      },
      data: {
        subscriptionId: newRow.id.toString(),
        newRow: newRow
      },
      previousState: previousData,
      newState: finalNewData
    });

    onDataChange(newData);
  };

  const deleteSelectedRows = () => {
    const selectedIds = new Set(
      Array.from(selectedRows).map(index => paginatedData[index]?.id).filter(Boolean)
    );
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy
    const deletedRows = data.filter(row => selectedIds.has(row.id));
    const newData = data.filter(row => !selectedIds.has(row.id));
    
    // Log the deletion
    deletedRows.forEach(row => {
      auditLogger.logSubscriptionDeletion(
        row.id.toString(),
        row.imei,
        row.vehicleNo,
        row.customer,
        {
          deletedFrom: 'subscription_table',
          reason: 'bulk_delete'
        }
      );
    });

    // Add undo action
    addAction({
      type: 'subscription.delete',
      description: `Deleted ${deletedRows.length} subscription${deletedRows.length > 1 ? 's' : ''}`,
      undo: () => {
        console.log('Undoing bulk deletion, restoring:', previousData.length, 'records');
        onDataChange(previousData);
      },
      redo: () => {
        console.log('Redoing bulk deletion, applying:', newData.length, 'records');
        onDataChange(newData);
      },
      data: {
        deletedCount: deletedRows.length,
        deletedRows: deletedRows.map(row => ({ id: row.id, customer: row.customer, vehicleNo: row.vehicleNo }))
      },
      previousState: previousData,
      newState: newData
    });

    onDataChange(newData);
    setSelectedRows(new Set());
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
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newVisible = new Set(prev);
      if (newVisible.has(columnKey)) {
        newVisible.delete(columnKey);
      } else {
        newVisible.add(columnKey);
      }
      return newVisible;
    });
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm !== '';
  
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

  return (
    <div className="w-full space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-3 items-center flex-wrap">
          <Button onClick={addNewRow} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          {selectedRows.size > 0 && (
            <Button onClick={deleteSelectedRows} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedRows.size})
            </Button>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {/* Column Visibility Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Columns ({visibleColumnsArray.length}/{columns.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-64 overflow-y-auto">
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
            <DropdownMenuContent align="end">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Rows per page</div>
                <DropdownMenuSeparator />
                {[20, 30, 40, 50, 100].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => setPageSize(size)}
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
            <DropdownMenuContent align="end" className="w-80">
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
                                (filters[col.key] && filters[col.key].size > 0) && "bg-blue-100",
                                (col.key === 'installationDate' && installationDateFilter.active) && "bg-blue-100"
                              )}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                            <div className="p-2">
                              <div className="text-xs font-medium text-gray-600 mb-2">Filter by {col.label}</div>
                              
                              {/* Special date range filter for installation date */}
                              {col.key === 'installationDate' ? (
                                <div className="space-y-3">
                                  {installationDateFilter.active && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => setInstallationDateFilter({
                                          startDate: '',
                                          endDate: '',
                                          active: false
                                        })}
                                        className="text-xs text-red-600"
                                      >
                                        Clear date filter
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">From Date</label>
                                      <Input
                                        type="date"
                                        value={installationDateFilter.startDate}
                                        onChange={(e) => setInstallationDateFilter(prev => ({
                                          ...prev,
                                          startDate: e.target.value
                                        }))}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">To Date</label>
                                      <Input
                                        type="date"
                                        value={installationDateFilter.endDate}
                                        onChange={(e) => setInstallationDateFilter(prev => ({
                                          ...prev,
                                          endDate: e.target.value
                                        }))}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (installationDateFilter.startDate && installationDateFilter.endDate) {
                                          setInstallationDateFilter(prev => ({
                                            ...prev,
                                            active: true
                                          }));
                                        }
                                      }}
                                      disabled={!installationDateFilter.startDate || !installationDateFilter.endDate}
                                      className="w-full h-8 text-xs"
                                    >
                                      Apply Date Filter
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* Regular filter for other columns */
                                <>
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
                                </>
                              )}
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
                      const cellValue = String(row[col.key as keyof Subscription] || '');
                      
                      return (
                        <td
                          key={col.key}
                          className="p-0 border-r border-gray-200 cursor-pointer hover:bg-blue-50 transition-all duration-200"
                          style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                          onClick={() => handleCellClick(rowIndex, col.key, row[col.key as keyof Subscription])}
                        >
                          {editingCell?.row === actualRowIndex && editingCell?.col === col.key ? (
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
                              showText ? "opacity-100" : "opacity-60"
                            )}>
                              <span className="truncate" title={showText ? cellValue : ''}>
                                {showText ? cellValue : (cellValue.length > 0 ? '•••' : '')}
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
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
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
      <PaginationWithJump
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="px-2 py-4"
      />
    </div>
  );
}