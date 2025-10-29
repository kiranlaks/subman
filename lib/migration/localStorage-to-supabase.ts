import { createClient } from '@/lib/supabase/client'
import { subscriptionService } from '@/lib/supabase/subscriptions'
import type { LegacySubscription } from '@/types/supabase'

export class LocalStorageToSupabaseMigration {
  private supabase = createClient()
  
  async migrate(): Promise<{
    success: boolean
    migratedCount: number
    errors: string[]
  }> {
    const errors: string[] = []
    let migratedCount = 0

    try {
      // Check if user is authenticated
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          migratedCount: 0,
          errors: ['User must be authenticated to migrate data']
        }
      }

      // Get data from localStorage
      const localSubscriptions = this.getLocalStorageData()
      
      if (!localSubscriptions || localSubscriptions.length === 0) {
        return {
          success: true,
          migratedCount: 0,
          errors: ['No data found in localStorage to migrate']
        }
      }

      console.log(`Found ${localSubscriptions.length} subscriptions to migrate`)

      // Check for existing data in Supabase
      const existingSubscriptions = await subscriptionService.getAll()
      
      if (existingSubscriptions.length > 0) {
        const confirmMigration = window.confirm(
          `Found ${existingSubscriptions.length} existing subscriptions in Supabase. ` +
          `Do you want to continue with migration? This will add ${localSubscriptions.length} more subscriptions.`
        )
        
        if (!confirmMigration) {
          return {
            success: false,
            migratedCount: 0,
            errors: ['Migration cancelled by user']
          }
        }
      }

      // Migrate subscriptions in batches
      const batchSize = 50
      for (let i = 0; i < localSubscriptions.length; i += batchSize) {
        const batch = localSubscriptions.slice(i, i + batchSize)
        
        try {
          // Remove id field as it will be auto-generated
          const subscriptionsToCreate = batch.map(sub => {
            const { id, ...subWithoutId } = sub
            return subWithoutId
          })

          const created = await subscriptionService.bulkCreate(subscriptionsToCreate)
          migratedCount += created.length
          
          console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}: ${created.length} subscriptions`)
        } catch (error) {
          const errorMsg = `Failed to migrate batch starting at index ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      // Create backup of localStorage data
      this.createBackup(localSubscriptions)

      // Optionally clear localStorage after successful migration
      if (migratedCount > 0) {
        const clearLocal = window.confirm(
          `Successfully migrated ${migratedCount} subscriptions. ` +
          `Do you want to clear the localStorage data? (A backup has been created)`
        )
        
        if (clearLocal) {
          localStorage.removeItem('subscriptions')
          localStorage.removeItem('subman_subscriptions')
        }
      }

      return {
        success: true,
        migratedCount,
        errors
      }

    } catch (error) {
      return {
        success: false,
        migratedCount,
        errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  private getLocalStorageData(): LegacySubscription[] {
    try {
      // Try different possible localStorage keys
      const possibleKeys = ['subscriptions', 'subman_subscriptions', 'subscription-data']
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          
          // Handle different data structures
          if (Array.isArray(parsed)) {
            return parsed
          } else if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
            return parsed.subscriptions
          }
        }
      }
      
      return []
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return []
    }
  }

  private createBackup(data: LegacySubscription[]): void {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        count: data.length,
        data
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subman-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('Backup created successfully')
    } catch (error) {
      console.error('Error creating backup:', error)
    }
  }

  // Check if migration is needed
  async checkMigrationNeeded(): Promise<boolean> {
    const localData = this.getLocalStorageData()
    return localData.length > 0
  }

  // Get migration status
  async getMigrationStatus(): Promise<{
    localCount: number
    supabaseCount: number
    migrationNeeded: boolean
  }> {
    const localData = this.getLocalStorageData()
    let supabaseCount = 0

    try {
      const supabaseData = await subscriptionService.getAll()
      supabaseCount = supabaseData.length
    } catch (error) {
      console.error('Error checking Supabase data:', error)
    }

    return {
      localCount: localData.length,
      supabaseCount,
      migrationNeeded: localData.length > 0
    }
  }
}

export const migrationService = new LocalStorageToSupabaseMigration()

