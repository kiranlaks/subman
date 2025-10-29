'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { PaginationWithJump } from '@/components/ui/pagination-with-jump';
import { Subscription } from '@/types/subscription';
import { auditLogger } from '@/lib/audit-logger';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUndoRedo } from '@/hooks/use-undo-redo';

interface RenewedTableProps {
  data: Subscription[];
  onDataChange: (data: Subscription[]) => void;
}

export function RenewedTable({ data, onDataChange }: RenewedTableProps) {
  const { toast } = useToast();
  const { addAction } = useUndoRedo();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; subscription: Subscription | null }>({
    isOpen: false,
    subscription: null
  });
  const [editValues, setEditValues] = useState<Partial<Subscription>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; subscription: Subscription | null }>({
    isOpen: false,
    subscription: null
  });
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
    console.log('Exporting renewed subscriptions to Excel...');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleEditClick = (subscription: Subscription) => {
    setEditDialog({ isOpen: true, subscription });
    setEditValues({
      vehicleNo: subscription.vehicleNo,
      ownerName: subscription.ownerName || subscription.customer,
      phoneNo: subscription.phoneNo,
      tagPlace: subscription.tagPlace,
      imei: subscription.imei,
      device: subscription.device,
      vendor: subscription.vendor,
      status: subscription.status,
      installationDate: subscription.installationDate,
      renewalDate: subscription.renewalDate
    });
  };

  const handleSaveEdit = () => {
    if (!editDialog.subscription) return;

    const subscription = editDialog.subscription;
    const previousData = JSON.parse(JSON.stringify(data));
    
    // Track changes
    const changes: Record<string, { from: any; to: any }> = {};
    let hasChanges = false;
    
    Object.keys(editValues).forEach(key => {
      const oldValue = subscription[key as keyof Subscription];
      const newValue = editValues[key as keyof Subscription];
      if (oldValue !== newValue) {
        changes[key] = { from: oldValue, to: newValue };
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes were made to the subscription.",
      });
      setEditDialog({ isOpen: false, subscription: null });
      return;
    }

    const updatedData = data.map(sub => 
      sub.id === subscription.id 
        ? { ...sub, ...editValues }
        : sub
    );

    // Log the changes
    auditLogger.logSubscriptionEdit(
      subscription.id.toString(),
      subscription.imei,
      subscription.vehicleNo,
      subscription.customer,
      changes
    );

    const finalUpdatedData = JSON.parse(JSON.stringify(updatedData));
    
    // Add undo action
    addAction({
      type: 'subscription.edit',
      description: `Edited ${Object.keys(changes).length} field(s) for ${subscription.customer} (${subscription.vehicleNo})`,
      undo: () => {
        onDataChange(previousData);
      },
      redo: () => {
        onDataChange(finalUpdatedData);
      },
      data: {
        subscriptionId: subscription.id,
        customer: subscription.customer,
        vehicleNo: subscription.vehicleNo,
        changes
      },
      previousState: previousData,
      newState: finalUpdatedData
    });

    onDataChange(updatedData);
    
    toast({
      title: "Subscription Updated",
      description: `Successfully updated ${Object.keys(changes).length} field(s)`,
    });
    
    setEditDialog({ isOpen: false, subscription: null });
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setDeleteDialog({ isOpen: true, subscription });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.subscription) return;

    const subscriptionToDelete = deleteDialog.subscription;
    const previousData = JSON.parse(JSON.stringify(data));
    
    auditLogger.logSubscriptionDeletion(
      subscriptionToDelete.id.toString(),
      subscriptionToDelete.imei,
      subscriptionToDelete.vehicleNo,
      subscriptionToDelete.customer,
      {
        deletedFrom: 'renewed_table',
        wasRenewed: true,
        renewalDate: subscriptionToDelete.renewalDate,
        reason: 'user_initiated_deletion'
      }
    );

    const updatedData = data.filter(sub => sub.id !== subscriptionToDelete.id);
    const finalUpdatedData = JSON.parse(JSON.stringify(updatedData));
    
    addAction({
      type: 'subscription.delete',
      description: `Deleted subscription for ${subscriptionToDelete.customer} (${subscriptionToDelete.vehicleNo})`,
      undo: () => {
        onDataChange(previousData);
      },
      redo: () => {
        onDataChange(finalUpdatedData);
      },
      data: {
        subscriptionId: subscriptionToDelete.id,
        customer: subscriptionToDelete.customer,
        vehicleNo: subscriptionToDelete.vehicleNo,
        deletedSubscription: subscriptionToDelete
      },
      previousState: previousData,
      newState: finalUpdatedData
    });

    onDataChange(updatedData);
    
    toast({
      title: "Subscription Deleted",
      description: `Successfully deleted subscription for ${subscriptionToDelete.customer}`,
      variant: "destructive"
    });
    
    setDeleteDialog({ isOpen: false, subscription: null });
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

      {/* Excel-like Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Sl No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">IMEI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Vehicle No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Owner Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Phone No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Tag Place</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Recharge</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Install Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Renewal Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">New Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No renewed subscriptions found matching your search.' : 'No renewed subscriptions yet.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((subscription, index) => {
                  const renewalDate = new Date(subscription.renewalDate!);
                  const rechargeYears = subscription.recharge || 1;
                  const newExpiryDate = new Date(renewalDate);
                  newExpiryDate.setFullYear(renewalDate.getFullYear() + rechargeYears);

                  return (
                    <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.slNo}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 border-r">{subscription.imei}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r font-medium">{subscription.vehicleNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.ownerName || subscription.customer}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.phoneNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.vendor}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.tagPlace}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{subscription.recharge} Year{subscription.recharge > 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{formatDate(subscription.installationDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 border-r">{formatDate(subscription.renewalDate!)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r">{formatDate(newExpiryDate.toISOString())}</td>
                      <td className="px-4 py-3 border-r">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Renewed
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(subscription)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(subscription)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <PaginationWithJump
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageInfo={false}
          />
        </div>
      )}

      {/* Edit Subscriber Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, subscription: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Edit Subscriber</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditDialog({ isOpen: false, subscription: null })}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Update subscriber information below
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.subscription && (
            <div className="space-y-6 py-4">
              {/* Two column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Reg No */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Vehicle Reg No</label>
                  <Input
                    value={editValues.vehicleNo || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, vehicleNo: e.target.value }))}
                    className="bg-gray-50"
                  />
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Owner Name</label>
                  <Input
                    value={editValues.ownerName || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="bg-gray-50"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <Input
                    value={editValues.phoneNo || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, phoneNo: e.target.value }))}
                    className="bg-gray-50"
                  />
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">District</label>
                  <Select
                    value={editValues.tagPlace || ''}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, tagPlace: value }))}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Udupi">Udupi</SelectItem>
                      <SelectItem value="Mysore">Mysore</SelectItem>
                      <SelectItem value="Hassan">Hassan</SelectItem>
                      <SelectItem value="Hunsur">Hunsur</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mangalore">Mangalore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Device Type</label>
                  <Select
                    value={editValues.device || ''}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, device: value }))}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROADPOINT">ROADPOINT</SelectItem>
                      <SelectItem value="TRANSIGHT">TRANSIGHT</SelectItem>
                      <SelectItem value="TRACKPOINT">TRACKPOINT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* IMEI */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">IMEI</label>
                  <Input
                    value={editValues.imei || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, imei: e.target.value }))}
                    className="bg-gray-50 font-mono"
                  />
                </div>

                {/* Dealer */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dealer</label>
                  <Select
                    value={editValues.vendor || ''}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, vendor: value }))}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Select dealer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NITESH">NITESH</SelectItem>
                      <SelectItem value="Venu Shetty">Venu Shetty</SelectItem>
                      <SelectItem value="Rajesh">Rajesh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={editValues.status || 'active'}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, status: value as 'active' | 'inactive' | 'expired' }))}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Installation Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Installation Date</label>
                  <Input
                    type="date"
                    value={editValues.installationDate ? new Date(editValues.installationDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, installationDate: e.target.value }))}
                    className="bg-gray-50"
                  />
                </div>

                {/* Renewal Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Renewal Date</label>
                  <Input
                    type="date"
                    value={editValues.renewalDate ? new Date(editValues.renewalDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, renewalDate: e.target.value }))}
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditDialog({ isOpen: false, subscription: null })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, subscription: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this renewed subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.subscription && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Subscription Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>IMEI:</strong> {deleteDialog.subscription.imei}</div>
                  <div><strong>Vehicle:</strong> {deleteDialog.subscription.vehicleNo}</div>
                  <div><strong>Customer:</strong> {deleteDialog.subscription.customer}</div>
                  <div><strong>Vendor:</strong> {deleteDialog.subscription.vendor}</div>
                  <div><strong>Renewal Date:</strong> {formatDate(deleteDialog.subscription.renewalDate!)}</div>
                  <div><strong>Owner:</strong> {deleteDialog.subscription.ownerName}</div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  This will permanently delete the subscription. The action will be logged for audit purposes.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, subscription: null })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
