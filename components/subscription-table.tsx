'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { auditLogger } from '@/lib/audit-logger';

interface SubscriptionTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
}

export function SubscriptionTable({ data, onDataChange }: SubscriptionTableProps) {
  const { addAction } = useUndoRedo();
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const columns = [
    { key: 'slNo', label: 'SL NO', width: '80px' },
    { key: 'imei', label: 'IMEI', width: '150px' },
    { key: 'device', label: 'DEVICE', width: '120px' },
    { key: 'vendor', label: 'VENDOR', width: '120px' },
    { key: 'vehicleNo', label: 'VEHICLE NO', width: '130px' },
    { key: 'customer', label: 'CUSTOMER', width: '150px' },
    { key: 'phoneNo', label: 'PHONE NO', width: '120px' },
    { key: 'tagPlace', label: 'TAG PLACE', width: '120px' },
    { key: 'recharge', label: 'RECHARGE', width: '100px' },
    { key: 'installDate', label: 'INSTALL DATE', width: '120px' },
  ];

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = (rowIndex: number, colKey: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, col: colKey });
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy
    const newData = [...data];
    const { row, col } = editingCell;
    const oldValue = newData[row][col as keyof Subscription];

    // Type conversion based on column
    let value: any = editValue;
    if (col === 'recharge' || col === 'slNo') {
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
      panicButtons: 0,
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
        createdFrom: 'basic_subscription_table'
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
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy
    const deletedRows = Array.from(selectedRows).map(index => data[index]).filter(Boolean);
    const newData = data.filter((_, index) => !selectedRows.has(index));
    const finalNewData = JSON.parse(JSON.stringify(newData));
    
    // Log the deletion
    deletedRows.forEach(row => {
      auditLogger.logSubscriptionDeletion(
        row.id.toString(),
        row.imei,
        row.vehicleNo,
        row.customer,
        {
          deletedFrom: 'basic_subscription_table',
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
        console.log('Redoing bulk deletion, applying:', finalNewData.length, 'records');
        onDataChange(finalNewData);
      },
      data: {
        deletedCount: deletedRows.length,
        deletedRows: deletedRows.map(row => ({ id: row.id, customer: row.customer, vehicleNo: row.vehicleNo }))
      },
      previousState: previousData,
      newState: finalNewData
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

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-3">
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
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-12 p-3 border-r">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRows(new Set(data.map((_, i) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === data.length && data.length > 0}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 text-left text-sm font-medium text-muted-foreground border-r"
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b hover:bg-muted/50 transition-colors",
                    selectedRows.has(rowIndex) && "bg-muted"
                  )}
                >
                  <td className="p-3 border-r">
                    <Checkbox
                      checked={selectedRows.has(rowIndex)}
                      onCheckedChange={() => toggleRowSelection(rowIndex)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-2 border-r cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleCellClick(rowIndex, col.key, row[col.key as keyof Subscription])}
                    >
                      {editingCell?.row === rowIndex && editingCell?.col === col.key ? (
                        <div className="flex items-center gap-2">
                          <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm"
                          />
                          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="p-2 min-h-[36px] flex items-center text-sm">
                          {String(row[col.key as keyof Subscription] || '')}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCellClick(rowIndex, 'customer', row.customer)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}