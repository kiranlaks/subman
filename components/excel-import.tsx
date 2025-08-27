'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface ExcelImportProps {
  onImport: (data: Subscription[]) => void;
}

export function ExcelImport({ onImport }: ExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    count?: number;
  }>({ type: null, message: '' });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportStatus({ type: null, message: '' });

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get raw data first to understand the structure
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('Raw Excel data (first 3 rows):', rawData.slice(0, 3));
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (!jsonData || jsonData.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No data found in the Excel file.'
        });
        return;
      }

      console.log('Excel data preview:', jsonData.slice(0, 2));
      const availableColumns = Object.keys(jsonData[0] as any);
      console.log('Available columns:', availableColumns);
      
      // Check for column name variations
      const columnCheck = {
        'IMEI variations': availableColumns.filter(col => col.toLowerCase().includes('imei')),
        'VENDOR variations': availableColumns.filter(col => col.toLowerCase().includes('vendor')),
        'CUSTOMER variations': availableColumns.filter(col => col.toLowerCase().includes('customer')),
        'DATE variations': availableColumns.filter(col => col.toLowerCase().includes('date')),
        'All columns': availableColumns
      };
      console.log('Column analysis:', columnCheck);
      
      // Helper function to convert Excel date serial number to readable date
      const convertExcelDate = (excelDate: any): string => {
        if (typeof excelDate === 'number' && excelDate > 1000) {
          // Excel date serial number conversion
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
        }
        if (typeof excelDate === 'string' && excelDate.trim()) {
          return excelDate.trim();
        }
        return new Date().toLocaleDateString('en-GB');
      };

      // Helper function to find column with flexible matching
      const findColumn = (row: any, possibleNames: string[]): string | null => {
        if (!row || typeof row !== 'object') return null;
        
        const rowKeys = Object.keys(row);
        
        // First try exact match
        for (const name of possibleNames) {
          if (rowKeys.includes(name)) {
            return name;
          }
        }
        
        // Then try case-insensitive match
        for (const name of possibleNames) {
          const found = rowKeys.find(key => key.toLowerCase() === name.toLowerCase());
          if (found) {
            return found;
          }
        }
        
        // Finally try partial match
        for (const name of possibleNames) {
          const found = rowKeys.find(key => 
            key.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(key.toLowerCase())
          );
          if (found) {
            return found;
          }
        }
        
        return null;
      };

      // Helper function to safely get value from row with flexible column matching
      const safeGetValue = (row: any, possibleKeys: string[], defaultValue: any = ''): any => {
        if (!row || typeof row !== 'object') return defaultValue;
        
        const foundKey = findColumn(row, possibleKeys);
        if (!foundKey) return defaultValue;
        
        const value = row[foundKey];
        if (value === undefined || value === null || value === '') {
          return defaultValue;
        }
        return value;
      };

      // Map Excel data to Subscription format
      const subscriptions: Subscription[] = jsonData.map((row: any, index: number) => {
        // Log each row to see what we're working with
        console.log(`Processing row ${index + 1}:`, row);
        
        // Extract values with detailed logging using flexible column matching
        const imeiValue = safeGetValue(row, ['IMEI', 'imei', 'Imei', 'IMEI Number'], '');
        const vendorValue = safeGetValue(row, ['VENDOR', 'vendor', 'Vendor', 'Vendor Name'], '');
        const customerValue = safeGetValue(row, ['CUSTOMER', 'customer', 'Customer', 'Customer Name'], '');
        const dateValue = safeGetValue(row, ['DATE', 'date', 'Date', 'Entry Date'], '');
        
        console.log(`Row ${index + 1} field extraction:`, {
          'IMEI raw': imeiValue,
          'IMEI type': typeof imeiValue,
          'VENDOR raw': vendorValue,
          'VENDOR type': typeof vendorValue,
          'CUSTOMER raw': customerValue,
          'CUSTOMER type': typeof customerValue,
          'DATE raw': dateValue,
          'DATE type': typeof dateValue
        });
        
        const subscription: Subscription = {
          id: Date.now() + index,
          slNo: Number(safeGetValue(row, ['SL NO', 'slNo', 'Serial No', 'S.No'], index + 1)) || (index + 1),
          date: convertExcelDate(dateValue),
          imei: String(imeiValue || '').trim(),
          device: String(safeGetValue(row, ['DEVICE', 'device', 'Device', 'Device Type'], 'TRANSIGHT')).trim(),
          vendor: String(vendorValue || '').trim(),
          vehicleNo: String(safeGetValue(row, ['VEHICLE NO', 'vehicleNo', 'Vehicle No', 'Vehicle Number'], '')).trim(),
          customer: String(customerValue || '').trim(),
          phoneNo: String(safeGetValue(row, ['PHONE NO', 'phoneNo', 'Phone No', 'Phone Number', 'Mobile'], '')).trim(),
          tagPlace: String(safeGetValue(row, ['TAG PLACE', 'tagPlace', 'Tag Place', 'Location'], '')).trim(),
          panicButtons: Number(safeGetValue(row, ['PANIC BUTTONS', 'panicButtons', 'Panic Buttons', 'Panic'], 1)) || 1,
          recharge: Number(safeGetValue(row, ['RECHARGE', 'recharge', 'Recharge', 'Amount'], 0)) || 0,
          installationDate: convertExcelDate(safeGetValue(row, ['INSTALLATION DATE', 'installationDate', 'Installation Date', 'Install Date'], '')),
          status: 'active' as const
        };
        
        console.log(`Mapped row ${index + 1}:`, subscription);
        return subscription;
      });

      // Filter out completely empty rows
      const validSubscriptions = subscriptions.filter(sub => {
        const hasData = sub.imei || sub.customer || sub.vehicleNo || sub.vendor;
        console.log(`Row validation - IMEI: "${sub.imei}", Customer: "${sub.customer}", Vehicle: "${sub.vehicleNo}", Vendor: "${sub.vendor}", Valid: ${hasData}`);
        return hasData;
      });

      console.log(`Total rows processed: ${subscriptions.length}, Valid rows: ${validSubscriptions.length}`);

      if (validSubscriptions.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No valid data found. Please check that your Excel file has data in IMEI, CUSTOMER, VEHICLE NO, or VENDOR columns.'
        });
        return;
      }

      onImport(validSubscriptions);
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${validSubscriptions.length} records from ${jsonData.length} rows`,
        count: validSubscriptions.length
      });

    } catch (error) {
      console.error('Error processing Excel file:', error);
      setImportStatus({
        type: 'error',
        message: `Error processing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setImportStatus({
        type: 'error',
        message: 'Please select a valid Excel file (.xlsx, .xls) or CSV file.'
      });
      return;
    }

    processExcelFile(file);
  };

  const downloadTemplate = () => {
    // Create a sample template with multiple rows matching your image
    const templateData = [
      {
        'SL NO': 1,
        'DATE': '7-Nov-2024',
        'IMEI': '868134077543508',
        'DEVICE': 'TRANSIGHT',
        'VENDOR': 'Venu Shetty',
        'VEHICLE NO': 'KA 51 B 1257',
        'CUSTOMER': 'Manju',
        'PHONE NO': '8453834014',
        'TAG PLACE': 'Hunsur',
        'PANIC BUTTONS': 7,
        'RECHARGE': 1,
        'INSTALLATION DATE': '13-11-2024'
      },
      {
        'SL NO': 2,
        'DATE': '7-Nov-2024',
        'IMEI': '868134077543821',
        'DEVICE': 'TRANSIGHT',
        'VENDOR': 'Venu Shetty',
        'VEHICLE NO': 'KA 02 AC 6707',
        'CUSTOMER': 'Devamma',
        'PHONE NO': '8350881460',
        'TAG PLACE': 'Mysore',
        'PANIC BUTTONS': 7,
        'RECHARGE': 1,
        'INSTALLATION DATE': '13-11-2024'
      },
      {
        'SL NO': 3,
        'DATE': '7-Nov-2024',
        'IMEI': '868134077543854',
        'DEVICE': 'TRANSIGHT',
        'VENDOR': 'Venu Shetty',
        'VEHICLE NO': 'KA 45 A 3023',
        'CUSTOMER': 'Smt Sneha Balaga',
        'PHONE NO': '7496091677',
        'TAG PLACE': 'Mysore',
        'PANIC BUTTONS': 7,
        'RECHARGE': 2,
        'INSTALLATION DATE': '15-11-2024'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
    XLSX.writeFile(wb, 'subscription_template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import from Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleFileSelect}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Select Excel File'}
          </Button>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Template
          </Button>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {importStatus.type && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${importStatus.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{importStatus.message}</span>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Excel files (.xlsx, .xls)</li>
            <li>CSV files (.csv)</li>
          </ul>
          <p className="mt-3 font-medium">Expected columns (exact names):</p>
          <div className="text-xs space-y-1">
            <p><strong>Required:</strong> SL NO, DATE, IMEI, DEVICE, VENDOR, VEHICLE NO, CUSTOMER, PHONE NO, TAG PLACE, PANIC BUTTONS, RECHARGE, INSTALLATION DATE</p>
            <p><strong>Note:</strong> Column names must match exactly (case-sensitive)</p>
            <p><strong>Tip:</strong> Download the template first, then copy your data into it</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Troubleshooting:</strong> If import fails, check the browser console (F12) for detailed logs showing what columns were found in your file.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}