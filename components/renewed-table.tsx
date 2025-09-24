'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { PaginationWithJump } from '@/components/ui/pagination-with-jump';
import { Subscription } from '@/types/subscription';
import { auditLogger } from '@/lib/audit-logger';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [editingRow, setEditingRow] = useState<number | null>(null);
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

  const handleEdit = (subscription: Subscription) => {
    setEditingRow(subscription.id);
    setEditValues({
      customer: subscription.customer,
      vehicleNo: subscription.vehicleNo,
      phoneNo: subscription.phoneNo,
      vendor: subscription.vendor,
      tagPlace: subscription.tagPlace,
      recharge: subscription.recharge,
      ownerName: subscription.ownerName
    });
  };

  const handleSaveEdit = (subscription: Subscription) => {
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues
    
    // Track changes for logging and undo/redo
    let changes: Record<string, { from: any; to: any }> = {};
    let hasChanges = false;
    
    const updatedData = data.map(sub => {
      if (sub.id === subscription.id) {
        const oldValues = { ...sub };
        const newValues = { ...sub, ...editValues };
        
        // Log the changes
        Object.keys(editValues).forEach(key => {
          const oldValue = oldValues[key as keyof Subscription];
          const newValue = editValues[key as keyof Subscription];
          if (oldValue !== newValue) {
            changes[key] = { from: oldValue, to: newValue };
            hasChanges = true;
          }
        });

        return newValues;
      }
      return sub;
    });

    // Handle logging and undo/redo after the data transformation
    if (hasChanges) {
      auditLogger.logSubscriptionEdit(
        subscription.id.toString(),
        subscription.imei,
        subscription.vehicleNo,
        subscription.customer,
        changes
      );

      // Add undo action with proper state management
      const finalUpdatedData = JSON.parse(JSON.stringify(updatedData));
      addAction({
        type: 'subscription.edit',
        description: `Edited ${Object.keys(changes).length} field(s) for ${subscription.customer} (${subscription.vehicleNo})`,
        undo: () => {
          console.log('Undoing edit, restoring:', previousData.length, 'records');
          onDataChange(previousData);
        },
        redo: () => {
          console.log('Redoing edit, applying:', finalUpdatedData.length, 'records');
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

      toast({
        title: "Subscription Updated",
        description: `Successfully updated ${Object.keys(changes).length} field(s) for ${subscription.customer} (${subscription.vehicleNo})`,
      });
    } else {
      toast({
        title: "No Changes",
        description: "No changes were made to the subscription.",
        variant: "default"
      });
    }

    onDataChange(updatedData);
    setEditingRow(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValues({});
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setDeleteDialog({ isOpen: true, subscription });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.subscription) return;

    const subscriptionToDelete = deleteDialog.subscription;
    const previousData = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues
    
    // Log the deletion
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

    // Remove from data
    const updatedData = data.filter(sub => sub.id !== subscriptionToDelete.id);
    const finalUpdatedData = JSON.parse(JSON.stringify(updatedData));
    
    // Add undo action with proper state management
    addAction({
      type: 'subscription.delete',
      description: `Deleted subscription for ${subscriptionToDelete.customer} (${subscriptionToDelete.vehicleNo})`,
      undo: () => {
        console.log('Undoing deletion, restoring:', previousData.length, 'records');
        onDataChange(previousData);
      },
      redo: () => {
        console.log('Redoing deletion, applying:', finalUpdatedData.length, 'records');
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
      description: `Successfully deleted subscription for ${subscriptionToDelete.customer} (${subscriptionToDelete.vehicleNo})`,
      variant: "destructive"
    });
    
    setDeleteDialog({ isOpen: false, subscription: null });
  };

  const handleDeleteCancel = () => {
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sl No</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Vehicle No</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead>Phone No</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Tag Place</TableHead>
              <TableHead>Recharge Period</TableHead>
              <TableHead>Original Install Date</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>New Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
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

                const isEditing = editingRow === subscription.id;

                return (
                  <TableRow key={subscription.imei}>
                    <TableCell>{subscription.slNo}</TableCell>
                    <TableCell className="font-mono text-sm">{subscription.imei}</TableCell>
                    
                    {/* Vehicle No - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.vehicleNo || subscription.vehicleNo}
                          onChange={(e) => setEditValues(prev => ({ ...prev, vehicleNo: e.target.value }))}
                          className="h-8 w-full"
                        />
                      ) : (
                        subscription.vehicleNo
                      )}
                    </TableCell>
                    
                    {/* Owner Name - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.ownerName || subscription.ownerName || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, ownerName: e.target.value }))}
                          className="h-8 w-full"
                        />
                      ) : (
                        subscription.ownerName
                      )}
                    </TableCell>
                    
                    {/* Phone No - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.phoneNo || subscription.phoneNo}
                          onChange={(e) => setEditValues(prev => ({ ...prev, phoneNo: e.target.value }))}
                          className="h-8 w-full"
                        />
                      ) : (
                        subscription.phoneNo
                      )}
                    </TableCell>
                    
                    {/* Vendor - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.vendor || subscription.vendor}
                          onChange={(e) => setEditValues(prev => ({ ...prev, vendor: e.target.value }))}
                          className="h-8 w-full"
                        />
                      ) : (
                        subscription.vendor
                      )}
                    </TableCell>
                    
                    {/* Tag Place - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.tagPlace || subscription.tagPlace}
                          onChange={(e) => setEditValues(prev => ({ ...prev, tagPlace: e.target.value }))}
                          className="h-8 w-full"
                        />
                      ) : (
                        subscription.tagPlace
                      )}
                    </TableCell>
                    
                    {/* Recharge Period - Editable */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={editValues.recharge || subscription.recharge}
                          onChange={(e) => setEditValues(prev => ({ ...prev, recharge: parseInt(e.target.value) || 1 }))}
                          className="h-8 w-20"
                        />
                      ) : (
                        `${subscription.recharge} Year${subscription.recharge > 1 ? 's' : ''}`
                      )}
                    </TableCell>
                    
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
                    
                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveEdit(subscription)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-gray-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(subscription)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(subscription)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this renewed subscription? This action cannot be undone and will remove the record from the entire database.
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
                  This will permanently delete the subscription from all tables and views. 
                  The action will be logged for audit purposes.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleDeleteCancel}>
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