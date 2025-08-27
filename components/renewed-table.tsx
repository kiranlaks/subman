'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter } from 'lucide-react';
import { Subscription } from '@/types/subscription';

interface RenewedTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
}

export function RenewedTable({ data, onDataChange }: RenewedTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter renewed subscriptions (those with renewalDate)
  const renewedSubscriptions = data.filter(sub => sub.renewalDate);

  // Filter based on search term
  const filteredData = renewedSubscriptions.filter(subscription =>
    Object.values(subscription).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    // Implementation for Excel export
    console.log('Exporting renewed subscriptions to Excel...');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search renewed subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Renewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewedSubscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renewedSubscriptions.filter(sub => {
                if (!sub.renewalDate) return false;
                const renewalDate = new Date(sub.renewalDate);
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                return renewalDate.getMonth() === currentMonth && renewalDate.getFullYear() === currentYear;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Renewal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.length > 0 ? Math.round((renewedSubscriptions.length / data.length) * 100) : 0}%
            </div>
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
              <TableHead>Owner Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Original Install Date</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>New Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No renewed subscriptions found matching your search.' : 'No renewed subscriptions yet.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((subscription) => {
                // Calculate new expiry date based on renewal
                const renewalDate = new Date(subscription.renewalDate!);
                const rechargeYears = subscription.recharge || 1;
                const newExpiryDate = new Date(renewalDate);
                newExpiryDate.setFullYear(renewalDate.getFullYear() + rechargeYears);

                return (
                  <TableRow key={subscription.imei}>
                    <TableCell>{subscription.slNo}</TableCell>
                    <TableCell className="font-mono text-sm">{subscription.imei}</TableCell>
                    <TableCell>{subscription.vehicleNo}</TableCell>
                    <TableCell>{subscription.ownerName}</TableCell>
                    <TableCell>{subscription.vendor}</TableCell>
                    <TableCell>{formatDate(subscription.installationDate)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatDate(subscription.renewalDate!)}
                    </TableCell>
                    <TableCell>{formatDate(newExpiryDate.toISOString())}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Renewed
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
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