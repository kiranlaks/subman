import { createClient } from './client'
import { authService } from './auth'
import type { AuditLog, AuditLogInsert } from '@/types/supabase'

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
  | 'settings.update'
  | 'data.export'
  | 'data.import'
  | 'system.action'
  | 'system.undo'
  | 'system.redo'

export class AuditService {
  private supabase = createClient()

  // Log an audit event
  async log(
    action: AuditAction,
    resource: string,
    resourceId: string,
    details: Record<string, any> = {},
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const user = await authService.getCurrentUser()
      const profile = await authService.getCurrentUserProfile()

      // Get client information
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'server'
      
      const auditData: AuditLogInsert = {
        user_id: user?.id || null,
        username: profile?.username || user?.email || 'unknown',
        user_role: profile?.role || 'unknown',
        action,
        resource,
        resource_id: resourceId,
        details,
        user_agent: userAgent,
        success,
        error_message: errorMessage || null
      }

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(auditData)

      if (error) {
        console.error('Failed to log audit event:', error)
        // Don't throw error to avoid breaking the main functionality
      } else {
        console.log('🔍 Audit Log:', auditData)
      }
    } catch (error) {
      console.error('Error creating audit log:', error)
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Convenience methods for common actions
  async logSubscriptionEdit(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    changes: Record<string, { from: any; to: any }>
  ): Promise<void> {
    await this.log(
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
    )
  }

  async logSubscriptionRenewal(
    subscriptionId: string,
    imei: string,
    vehicleNo: string,
    customer: string,
    renewalYears: number
  ): Promise<void> {
    await this.log(
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
    )
  }

  async logBulkRenewal(
    subscriptionIds: string[],
    renewalYears: number,
    bulkCount: number
  ): Promise<void> {
    await this.log(
      'subscription.bulk_renew',
      'subscriptions',
      subscriptionIds.join(','),
      {
        subscriptionIds,
        renewalYears,
        bulkCount
      }
    )
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
    await this.log(
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
    )
  }

  async logDataExport(
    exportType: string,
    recordCount: number,
    filters?: any
  ): Promise<void> {
    await this.log(
      'data.export',
      'data',
      exportType,
      {
        exportType,
        recordCount,
        filters
      }
    )
  }

  async logDataImport(
    importType: string,
    recordCount: number,
    fileName?: string,
    additionalDetails?: any
  ): Promise<void> {
    await this.log(
      'data.import',
      'data',
      importType,
      {
        importType,
        recordCount,
        fileName,
        ...additionalDetails
      }
    )
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
    await this.log(
      'data.import',
      'validation',
      fileName,
      {
        fileName,
        ...validationResults,
        action: 'validation_completed'
      }
    )
  }

  async logUserAction(
    action: 'login' | 'logout' | 'switch',
    targetUserId?: string,
    targetUsername?: string
  ): Promise<void> {
    const user = await authService.getCurrentUser()
    
    await this.log(
      `user.${action}` as AuditAction,
      'user',
      targetUserId || user?.id || 'unknown',
      {
        targetUserId,
        targetUsername
      }
    )
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
  ): Promise<AuditLog[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')

    // Apply filters
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters?.action) {
      query = query.eq('action', filters.action)
    }
    if (filters?.resource) {
      query = query.eq('resource', filters.resource)
    }
    if (filters?.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('timestamp', filters.dateTo)
    }
    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success)
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching audit logs:', error)
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return data || []
  }

  async getLogsBySubscription(subscriptionId: string): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .or(`resource_id.eq.${subscriptionId},details->>subscriptionId.eq.${subscriptionId}`)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching subscription audit logs:', error)
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return data || []
  }

  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching user audit logs:', error)
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return data || []
  }

  async getRecentActivity(hours: number = 24): Promise<AuditLog[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', cutoff)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching recent activity:', error)
      throw new Error(`Failed to fetch recent activity: ${error.message}`)
    }

    return data || []
  }

  // Statistics
  async getActionCounts(dateFrom?: string, dateTo?: string): Promise<Record<string, number>> {
    let query = this.supabase
      .from('audit_logs')
      .select('action')

    if (dateFrom) {
      query = query.gte('timestamp', dateFrom)
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching action counts:', error)
      throw new Error(`Failed to fetch action counts: ${error.message}`)
    }

    const counts: Record<string, number> = {}
    data?.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1
    })

    return counts
  }

  async getUserActivityCounts(dateFrom?: string, dateTo?: string): Promise<Record<string, number>> {
    let query = this.supabase
      .from('audit_logs')
      .select('username, user_role')

    if (dateFrom) {
      query = query.gte('timestamp', dateFrom)
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user activity counts:', error)
      throw new Error(`Failed to fetch user activity counts: ${error.message}`)
    }

    const counts: Record<string, number> = {}
    data?.forEach(log => {
      const key = `${log.username} (${log.user_role})`
      counts[key] = (counts[key] || 0) + 1
    })

    return counts
  }

  // Subscribe to real-time audit log changes
  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        callback
      )
      .subscribe()
  }

  // Clear logs (admin only)
  async clearLogs(): Promise<boolean> {
    const isAdmin = await authService.isAdmin()
    if (!isAdmin) {
      console.warn('Only administrators can clear audit logs')
      return false
    }

    const { error } = await this.supabase
      .from('audit_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (error) {
      console.error('Error clearing audit logs:', error)
      return false
    }

    // Log the clearing action
    await this.log('settings.update', 'audit_logs', 'clear', { action: 'clear_all_logs' })
    
    return true
  }

  // Export logs for external analysis
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = await this.getLogs(10000) // Get up to 10k logs

    if (format === 'csv') {
      const headers = [
        'ID', 'Timestamp', 'User ID', 'Username', 'User Role', 'Action', 
        'Resource', 'Resource ID', 'Success', 'Details', 'Error Message'
      ]
      
      const rows = logs.map(log => [
        log.id,
        log.timestamp,
        log.user_id || '',
        log.username || '',
        log.user_role || '',
        log.action,
        log.resource,
        log.resource_id,
        log.success,
        JSON.stringify(log.details),
        log.error_message || ''
      ])

      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
    }

    return JSON.stringify(logs, null, 2)
  }
}

export const auditService = new AuditService()
// Alias for backward compatibility
export const auditLogger = auditService

