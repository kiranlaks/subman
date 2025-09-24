import { auditService } from '@/lib/supabase/audit'
import type { AuditAction } from '@/lib/supabase/audit'

// Updated audit logger that uses Supabase instead of localStorage
class SupabaseAuditLogger {
  // Main logging method
  async log(
    action: AuditAction,
    resource: string,
    resourceId: string,
    details: Record<string, any> = {},
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    return auditService.log(action, resource, resourceId, details, success, errorMessage)
  }

  // Convenience methods for common actions
  async logSubscriptionEdit(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    changes: Record<string, { from: any; to: any }>
  ): Promise<void> {
    return auditService.logSubscriptionEdit(subscriptionId, imei, vehicleNo, customer, changes)
  }

  async logSubscriptionRenewal(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    renewalYears: number
  ): Promise<void> {
    return auditService.logSubscriptionRenewal(subscriptionId, imei, vehicleNo, customer, renewalYears)
  }

  async logBulkRenewal(
    subscriptionIds: string[],
    renewalYears: number,
    bulkCount: number
  ): Promise<void> {
    return auditService.logBulkRenewal(subscriptionIds, renewalYears, bulkCount)
  }

  async logSubscriptionDeletion(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    deletionContext: {
      deletedFrom?: string
      wasRenewed?: boolean
      renewalDate?: string
      reason?: string
    }
  ): Promise<void> {
    return auditService.logSubscriptionDeletion(subscriptionId, imei, vehicleNo, customer, deletionContext)
  }

  async logDataExport(
    exportType: string,
    recordCount: number,
    filters?: any
  ): Promise<void> {
    return auditService.logDataExport(exportType, recordCount, filters)
  }

  async logDataImport(
    importType: string,
    recordCount: number,
    fileName?: string,
    additionalDetails?: any
  ): Promise<void> {
    return auditService.logDataImport(importType, recordCount, fileName, additionalDetails)
  }

  async logImportValidation(
    fileName: string,
    validationResults: {
      totalRecords: number
      newRecords: number
      updates: number
      duplicates: number
      importType: 'replace' | 'merge'
    }
  ): Promise<void> {
    return auditService.logImportValidation(fileName, validationResults)
  }

  async logUserAction(
    action: 'login' | 'logout' | 'switch',
    targetUserId?: string,
    targetUsername?: string
  ): Promise<void> {
    return auditService.logUserAction(action, targetUserId, targetUsername)
  }

  // Query methods
  async getLogs(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      userId?: string
      action?: AuditAction
      resource?: string
      dateFrom?: string
      dateTo?: string
      success?: boolean
    }
  ) {
    return auditService.getLogs(limit, offset, filters)
  }

  async getLogsBySubscription(subscriptionId: string) {
    return auditService.getLogsBySubscription(subscriptionId)
  }

  async getLogsByUser(userId: string) {
    return auditService.getLogsByUser(userId)
  }

  async getRecentActivity(hours: number = 24) {
    return auditService.getRecentActivity(hours)
  }

  // Statistics
  async getActionCounts(dateFrom?: string, dateTo?: string) {
    return auditService.getActionCounts(dateFrom, dateTo)
  }

  async getUserActivityCounts(dateFrom?: string, dateTo?: string) {
    return auditService.getUserActivityCounts(dateFrom, dateTo)
  }

  // Export logs for external analysis
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    return auditService.exportLogs(format)
  }

  // Clear logs (admin only)
  async clearLogs(): Promise<boolean> {
    return auditService.clearLogs()
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return auditService.subscribeToChanges(callback)
  }
}

export const auditLogger = new SupabaseAuditLogger()

// Export the interface for backward compatibility
export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  username: string
  userRole: string
  action: string
  resource: string
  resourceId: string
  details: {
    subscriptionId?: string
    imei?: string
    vehicleNo?: string
    customer?: string
    changes?: Record<string, { from: any; to: any }>
    renewalYears?: number
    bulkCount?: number
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

