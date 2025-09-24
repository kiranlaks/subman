import { authManager } from './auth';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: {
    subscriptionId?: string;
    imei?: string;
    vehicleNo?: string;
    customer?: string;
    changes?: Record<string, { from: any; to: any }>;
    renewalYears?: number;
    bulkCount?: number;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export type AuditAction = 
  | 'subscription.edit'
  | 'subscription.renew'
  | 'subscription.bulk_renew'
  | 'subscription.create'
  | 'subscription.delete'
  | 'subscription.import'
  | 'subscription.export'
  | 'user.login'
  | 'user.logout'
  | 'user.switch'
  | 'user.profile_update'
  | 'user.avatar_update'
  | 'user.password_change'
  | 'user.2fa_enabled'
  | 'user.2fa_disabled'
  | 'user.session_revoked'
  | 'user.account_connected'
  | 'user.account_disconnected'
  | 'user.device_trusted'
  | 'user.device_removed'
  | 'settings.update'
  | 'data.export'
  | 'data.import'
  | 'system.action'
  | 'system.undo'
  | 'system.redo';

class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  constructor() {
    // Load existing logs from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('audit-logs');
      if (stored) {
        try {
          this.logs = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load audit logs:', error);
        }
      }
    }
  }

  private saveLogs() {
    if (typeof window !== 'undefined') {
      // Keep only the most recent logs to prevent localStorage bloat
      const recentLogs = this.logs.slice(-this.maxLogs);
      localStorage.setItem('audit-logs', JSON.stringify(recentLogs));
      this.logs = recentLogs;
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserInfo() {
    const user = authManager.getCurrentUser();
    return {
      userId: user?.id || 'unknown',
      username: user?.username || 'unknown',
      userRole: user?.role.name || 'unknown'
    };
  }

  private getBrowserInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      // Note: Getting real IP requires server-side implementation
      ipAddress: 'client-side' // Placeholder
    };
  }

  log(
    action: AuditAction,
    resource: string,
    resourceId: string,
    details: AuditLog['details'] = {},
    success: boolean = true,
    errorMessage?: string
  ): void {
    const userInfo = this.getCurrentUserInfo();
    const browserInfo = this.getBrowserInfo();

    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...userInfo,
      action,
      resource,
      resourceId,
      details,
      ...browserInfo,
      success,
      errorMessage
    };

    this.logs.push(auditLog);
    this.saveLogs();

    // Also log to console for development
    console.log('🔍 Audit Log:', auditLog);
  }

  // Convenience methods for common actions
  logSubscriptionEdit(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    changes: Record<string, { from: any; to: any }>
  ): void {
    this.log(
      'subscription.edit',
      'subscription',
      subscriptionId,
      {
        subscriptionId,
        imei,
        vehicleNo,
        customer,
        changes
      }
    );
  }

  logSubscriptionRenewal(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    renewalYears: number
  ): void {
    this.log(
      'subscription.renew',
      'subscription',
      subscriptionId,
      {
        subscriptionId,
        imei,
        vehicleNo,
        customer,
        renewalYears
      }
    );
  }

  logBulkRenewal(
    subscriptionIds: string[],
    renewalYears: number,
    bulkCount: number
  ): void {
    this.log(
      'subscription.bulk_renew',
      'subscriptions',
      subscriptionIds.join(','),
      {
        subscriptionIds,
        renewalYears,
        bulkCount
      }
    );
  }

  logSubscriptionDeletion(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    deletionContext: {
      deletedFrom?: string;
      wasRenewed?: boolean;
      renewalDate?: string;
      reason?: string;
    }
  ): void {
    this.log(
      'subscription.delete',
      'subscription',
      subscriptionId,
      {
        subscriptionId,
        imei,
        vehicleNo,
        customer,
        ...deletionContext
      }
    );
  }

  logDataExport(
    exportType: string,
    recordCount: number,
    filters?: any
  ): void {
    this.log(
      'data.export',
      'data',
      exportType,
      {
        exportType,
        recordCount,
        filters
      }
    );
  }

  logDataImport(
    importType: string,
    recordCount: number,
    fileName?: string,
    additionalDetails?: any
  ): void {
    this.log(
      'data.import',
      'data',
      importType,
      {
        importType,
        recordCount,
        fileName,
        ...additionalDetails
      }
    );
  }

  logImportValidation(
    fileName: string,
    validationResults: {
      totalRecords: number;
      newRecords: number;
      updates: number;
      duplicates: number;
      importType: 'replace' | 'merge';
    }
  ): void {
    this.log(
      'data.import',
      'validation',
      fileName,
      {
        fileName,
        ...validationResults,
        action: 'validation_completed'
      }
    );
  }

  logUserAction(
    action: 'login' | 'logout' | 'switch',
    targetUserId?: string,
    targetUsername?: string
  ): void {
    this.log(
      `user.${action}` as AuditAction,
      'user',
      targetUserId || this.getCurrentUserInfo().userId,
      {
        targetUserId,
        targetUsername
      }
    );
  }

  // Query methods
  getLogs(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      userId?: string;
      action?: AuditAction;
      resource?: string;
      dateFrom?: string;
      dateTo?: string;
      success?: boolean;
    }
  ): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo!);
      }
      if (filters.success !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.success === filters.success);
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filteredLogs.slice(offset, offset + limit);
  }

  getLogsBySubscription(subscriptionId: string): AuditLog[] {
    return this.logs.filter(log => 
      log.details.subscriptionId === subscriptionId ||
      log.resourceId === subscriptionId
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getRecentActivity(hours: number = 24): AuditLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return this.logs.filter(log => log.timestamp >= cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Statistics
  getActionCounts(dateFrom?: string, dateTo?: string): Record<string, number> {
    let logs = this.logs;
    
    if (dateFrom) {
      logs = logs.filter(log => log.timestamp >= dateFrom);
    }
    if (dateTo) {
      logs = logs.filter(log => log.timestamp <= dateTo);
    }

    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });

    return counts;
  }

  getUserActivityCounts(dateFrom?: string, dateTo?: string): Record<string, number> {
    let logs = this.logs;
    
    if (dateFrom) {
      logs = logs.filter(log => log.timestamp >= dateFrom);
    }
    if (dateTo) {
      logs = logs.filter(log => log.timestamp <= dateTo);
    }

    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const key = `${log.username} (${log.userRole})`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }

  // Export logs for external analysis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'ID', 'Timestamp', 'User ID', 'Username', 'User Role', 'Action', 
        'Resource', 'Resource ID', 'Success', 'Details', 'Error Message'
      ];
      
      const rows = this.logs.map(log => [
        log.id,
        log.timestamp,
        log.userId,
        log.username,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId,
        log.success,
        JSON.stringify(log.details),
        log.errorMessage || ''
      ]);

      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs (admin only)
  clearLogs(): boolean {
    const user = authManager.getCurrentUser();
    if (!user || !authManager.isAdmin()) {
      console.warn('Only administrators can clear audit logs');
      return false;
    }

    this.logs = [];
    this.saveLogs();
    
    // Log the clearing action
    this.log('settings.update', 'audit_logs', 'clear', { action: 'clear_all_logs' });
    
    return true;
  }
}

export const auditLogger = new AuditLogger();