'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, Download, Filter, Eye, Calendar, User, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { PaginationWithJump } from '@/components/ui/pagination-with-jump';
import { auditLogger, AuditLog, AuditAction } from '@/lib/audit-logger';
import { authManager } from '@/lib/auth';

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const itemsPerPage = 20;

  // Get logs with filters
  const logs = useMemo(() => {
    let dateFrom: string | undefined;
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    return auditLogger.getLogs(1000, 0, {
      action: selectedAction !== 'all' ? selectedAction : undefined,
      userId: selectedUser !== 'all' ? selectedUser : undefined,
      dateFrom
    });
  }, [selectedAction, selectedUser, dateFilter]);

  // Filter logs by search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    
    return logs.filter(log =>
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Get unique users and actions for filters
  const uniqueUsers = useMemo(() => {
    const users = new Set(logs.map(log => `${log.userId}:${log.username}`));
    return Array.from(users).map(user => {
      const [id, name] = user.split(':');
      return { id, name };
    });
  }, [logs]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.action)));
  }, [logs]);

  // Statistics
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const successfulActions = logs.filter(log => log.success).length;
    const failedActions = logs.filter(log => !log.success).length;
    const uniqueUsersCount = new Set(logs.map(log => log.userId)).size;
    
    return {
      totalLogs,
      successfulActions,
      failedActions,
      uniqueUsersCount
    };
  }, [logs]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('edit') || action.includes('update')) return 'secondary';
    if (action.includes('renew')) return 'default';
    if (action.includes('delete')) return 'destructive';
    if (action.includes('export') || action.includes('import')) return 'outline';
    return 'secondary';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  const formatDetails = (details: AuditLog['details']) => {
    if (details.changes) {
      const changes = Object.entries(details.changes).map(([field, change]) => 
        `${field}: ${change.from} → ${change.to}`
      ).join(', ');
      return changes;
    }
    
    if (details.renewalYears) {
      return `Renewed for ${details.renewalYears} year${details.renewalYears > 1 ? 's' : ''}`;
    }
    
    if (details.bulkCount) {
      return `Bulk operation on ${details.bulkCount} items`;
    }
    
    if (details.recordCount) {
      return `${details.recordCount} records`;
    }
    
    return JSON.stringify(details);
  };

  const exportLogs = (format: 'json' | 'csv') => {
    const exportData = auditLogger.exportLogs(format);
    const blob = new Blob([exportData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      const success = auditLogger.clearLogs();
      if (success) {
        alert('Audit logs cleared successfully.');
        // Force re-render by updating state
        setCurrentPage(1);
      } else {
        alert('Only administrators can clear audit logs.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsersCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Action: {selectedAction === 'all' ? 'All' : selectedAction}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedAction('all')}>
                All Actions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueActions.map(action => (
                <DropdownMenuItem key={action} onClick={() => setSelectedAction(action as AuditAction)}>
                  {action}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                User: {selectedUser === 'all' ? 'All' : uniqueUsers.find(u => u.id === selectedUser)?.name || 'All'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedUser('all')}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueUsers.map(user => (
                <DropdownMenuItem key={user.id} onClick={() => setSelectedUser(user.id)}>
                  {user.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Time: {dateFilter === 'all' ? 'All Time' : 
                       dateFilter === 'today' ? 'Today' :
                       dateFilter === 'week' ? 'Last Week' : 'Last Month'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDateFilter('all')}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter('week')}>Last Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter('month')}>Last Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <DropdownMenu open={showExportOptions} onOpenChange={setShowExportOptions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportLogs('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {authManager.isAdmin() && (
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          )}
        </div>
      </div>

      {/* Logs table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedAction !== 'all' || selectedUser !== 'all' || dateFilter !== 'all' 
                    ? 'No logs found matching your filters.' 
                    : 'No audit logs available.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.username}</div>
                      <div className="text-sm text-muted-foreground">{log.userRole}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.resource}</div>
                      <div className="text-sm text-muted-foreground font-mono">{log.resourceId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm truncate" title={formatDetails(log.details)}>
                      {formatDetails(log.details)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.success)}
                      {!log.success && log.errorMessage && (
                        <span className="text-sm text-red-600" title={log.errorMessage}>
                          Error
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </div>
          <PaginationWithJump
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageInfo={false}
          />
        </div>
      )}
    </div>
  );
}