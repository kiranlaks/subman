'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  ArrowRight,
  FileText,
  Users,
  Database
} from 'lucide-react';
import { auditLogger } from '@/lib/audit-logger';

interface ImportValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (importData: Subscription[], importType: 'replace' | 'merge') => void;
  existingData: Subscription[];
  importData: Subscription[];
  fileName: string;
}

interface DataComparison {
  newRecords: Subscription[];
  duplicates: Array<{
    existing: Subscription;
    imported: Subscription;
    differences: Array<{
      field: string;
      existingValue: any;
      importedValue: any;
    }>;
  }>;
  updates: Array<{
    existing: Subscription;
    imported: Subscription;
    differences: Array<{
      field: string;
      existingValue: any;
      importedValue: any;
    }>;
  }>;
}

export function ImportValidationDialog({
  isOpen,
  onClose,
  onConfirm,
  existingData,
  importData,
  fileName
}: ImportValidationDialogProps) {
  const [selectedImportType, setSelectedImportType] = useState<'replace' | 'merge'>('merge');

  // Log when validation dialog opens
  useEffect(() => {
    if (isOpen && importData.length > 0) {
      auditLogger.log(
        'data.import',
        'validation',
        fileName,
        {
          fileName,
          action: 'validation_started',
          recordCount: importData.length,
          existingRecords: existingData.length
        }
      );
    }
  }, [isOpen, importData.length, fileName, existingData.length]);

  // Analyze the data differences
  const comparison = useMemo((): DataComparison => {
    const existingImeis = new Map(existingData.map(sub => [sub.imei, sub]));
    const newRecords: Subscription[] = [];
    const duplicates: DataComparison['duplicates'] = [];
    const updates: DataComparison['updates'] = [];

    importData.forEach(importedSub => {
      const existing = existingImeis.get(importedSub.imei);
      
      if (!existing) {
        // New record
        newRecords.push(importedSub);
      } else {
        // Check for differences
        const differences: Array<{
          field: string;
          existingValue: any;
          importedValue: any;
        }> = [];

        const fieldsToCompare = [
          'customer', 'vehicleNo', 'phoneNo', 'vendor', 'tagPlace', 
          'device', 'recharge', 'installationDate', 'date'
        ];

        fieldsToCompare.forEach(field => {
          const existingValue = existing[field as keyof Subscription];
          const importedValue = importedSub[field as keyof Subscription];
          
          if (existingValue !== importedValue) {
            differences.push({
              field,
              existingValue,
              importedValue
            });
          }
        });

        if (differences.length > 0) {
          updates.push({
            existing,
            imported: importedSub,
            differences
          });
        } else {
          duplicates.push({
            existing,
            imported: importedSub,
            differences: []
          });
        }
      }
    });

    return { newRecords, duplicates, updates };
  }, [existingData, importData]);

  const stats = {
    totalImported: importData.length,
    newRecords: comparison.newRecords.length,
    duplicates: comparison.duplicates.length,
    updates: comparison.updates.length,
    totalExisting: existingData.length
  };

  const handleConfirm = () => {
    // Log the validation completion and user's choice
    auditLogger.logImportValidation(fileName, {
      totalRecords: stats.totalImported,
      newRecords: stats.newRecords,
      updates: stats.updates,
      duplicates: stats.duplicates,
      importType: selectedImportType
    });

    onConfirm(importData, selectedImportType);
  };

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      customer: 'Customer Name',
      vehicleNo: 'Vehicle Number',
      phoneNo: 'Phone Number',
      vendor: 'Vendor',
      tagPlace: 'Tag Place',
      device: 'Device',
      recharge: 'Recharge Period',
      installationDate: 'Installation Date',
      date: 'Entry Date'
    };
    return fieldNames[field] || field;
  };

  const getChangeTypeColor = (field: string) => {
    const criticalFields = ['customer', 'vehicleNo', 'phoneNo'];
    const importantFields = ['vendor', 'recharge', 'installationDate'];
    
    if (criticalFields.includes(field)) return 'text-red-600';
    if (importantFields.includes(field)) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Data Validation
          </DialogTitle>
          <DialogDescription>
            Review the changes before importing data from "{fileName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">New Records</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.newRecords}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Updates</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{stats.updates}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Duplicates</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.duplicates}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Total Import</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalImported}</p>
              </CardContent>
            </Card>
          </div>

          {/* Import Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="merge"
                    name="importType"
                    value="merge"
                    checked={selectedImportType === 'merge'}
                    onChange={(e) => setSelectedImportType(e.target.value as 'merge')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="merge" className="text-sm font-medium">
                    Merge with existing data (Recommended)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Add new records and update existing ones. Existing data will be preserved where no conflicts exist.
                </p>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="replace"
                    name="importType"
                    value="replace"
                    checked={selectedImportType === 'replace'}
                    onChange={(e) => setSelectedImportType(e.target.value as 'replace')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="replace" className="text-sm font-medium text-red-600">
                    Replace all existing data (Destructive)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  ⚠️ This will completely replace all existing data with the imported data. Use with caution!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="new" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New ({stats.newRecords})
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Updates ({stats.updates})
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Duplicates ({stats.duplicates})
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            {/* New Records */}
            <TabsContent value="new" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    New Records ({stats.newRecords})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comparison.newRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IMEI</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle No</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparison.newRecords.slice(0, 10).map((record, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{record.imei}</TableCell>
                              <TableCell>{record.customer}</TableCell>
                              <TableCell>{record.vehicleNo}</TableCell>
                              <TableCell>{record.vendor}</TableCell>
                              <TableCell>{record.phoneNo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {comparison.newRecords.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ... and {comparison.newRecords.length - 10} more records
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No new records to add.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Updates */}
            <TabsContent value="updates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit className="h-5 w-5 text-orange-600" />
                    Records with Updates ({stats.updates})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comparison.updates.length > 0 ? (
                    <div className="space-y-4">
                      {comparison.updates.slice(0, 5).map((update, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">IMEI: {update.existing.imei}</Badge>
                            <Badge variant="secondary">{update.existing.customer}</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {update.differences.map((diff, diffIndex) => (
                              <div key={diffIndex} className="flex items-center gap-2 text-sm">
                                <span className="font-medium w-32">{formatFieldName(diff.field)}:</span>
                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                  {String(diff.existingValue || 'Empty')}
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                  {String(diff.importedValue || 'Empty')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {comparison.updates.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {comparison.updates.length - 5} more records with updates
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No records need updates.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Duplicates */}
            <TabsContent value="duplicates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Duplicate Records ({stats.duplicates})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comparison.duplicates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IMEI</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle No</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparison.duplicates.slice(0, 10).map((duplicate, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{duplicate.existing.imei}</TableCell>
                              <TableCell>{duplicate.existing.customer}</TableCell>
                              <TableCell>{duplicate.existing.vehicleNo}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">No changes needed</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {comparison.duplicates.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ... and {comparison.duplicates.length - 10} more duplicate records
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No duplicate records found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Database</h4>
                      <p className="text-2xl font-bold">{stats.totalExisting} records</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">After Import</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedImportType === 'replace' 
                          ? stats.totalImported 
                          : stats.totalExisting + stats.newRecords} records
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Changes to be made:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>New records to add:</span>
                        <Badge variant="outline" className="text-green-600">+{stats.newRecords}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Records to update:</span>
                        <Badge variant="outline" className="text-orange-600">{stats.updates}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Duplicate records (no change):</span>
                        <Badge variant="outline" className="text-blue-600">{stats.duplicates}</Badge>
                      </div>
                      {selectedImportType === 'replace' && (
                        <div className="flex justify-between">
                          <span className="text-red-600">Records to be removed:</span>
                          <Badge variant="destructive">
                            -{Math.max(0, stats.totalExisting - stats.totalImported)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedImportType === 'replace' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Warning: Destructive Operation</span>
                      </div>
                      <p className="text-sm text-red-700 mt-2">
                        You have selected to replace all existing data. This will permanently delete 
                        {stats.totalExisting} existing records and replace them with {stats.totalImported} imported records.
                        This action cannot be undone.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel Import
            </Button>
            <Button 
              onClick={handleConfirm}
              className={selectedImportType === 'replace' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {selectedImportType === 'replace' ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Replace All Data
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}