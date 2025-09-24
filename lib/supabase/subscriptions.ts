import { createClient } from './client'
import type { 
  Subscription, 
  SubscriptionInsert, 
  SubscriptionUpdate,
  LegacySubscription,
  convertToSupabaseFormat,
  convertFromSupabaseFormat 
} from '@/types/supabase'

export class SubscriptionService {
  private supabase = createClient()

  // Get all subscriptions
  async getAll(): Promise<LegacySubscription[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    }

    return data.map(convertFromSupabaseFormat)
  }

  // Get subscription by ID
  async getById(id: number): Promise<LegacySubscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching subscription:', error)
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return convertFromSupabaseFormat(data)
  }

  // Get subscription by IMEI
  async getByImei(imei: string): Promise<LegacySubscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('imei', imei)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching subscription by IMEI:', error)
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return convertFromSupabaseFormat(data)
  }

  // Create new subscription
  async create(subscription: Omit<LegacySubscription, 'id'>): Promise<LegacySubscription> {
    const { data: user } = await this.supabase.auth.getUser()
    
    const insertData: SubscriptionInsert = {
      ...convertToSupabaseFormat({ ...subscription, id: 0 }),
      created_by: user.user?.id,
      updated_by: user.user?.id
    }
    
    // Remove the id since it's auto-generated
    delete insertData.id

    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    return convertFromSupabaseFormat(data)
  }

  // Update subscription
  async update(id: number, updates: Partial<LegacySubscription>): Promise<LegacySubscription> {
    const { data: user } = await this.supabase.auth.getUser()
    
    const updateData: SubscriptionUpdate = {
      ...convertToSupabaseFormat({ id, ...updates } as LegacySubscription),
      updated_by: user.user?.id
    }

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    return convertFromSupabaseFormat(data)
  }

  // Delete subscription
  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
      throw new Error(`Failed to delete subscription: ${error.message}`)
    }
  }

  // Bulk create subscriptions
  async bulkCreate(subscriptions: Omit<LegacySubscription, 'id'>[]): Promise<LegacySubscription[]> {
    const { data: user } = await this.supabase.auth.getUser()
    
    const insertData: SubscriptionInsert[] = subscriptions.map(subscription => {
      const data = convertToSupabaseFormat({ ...subscription, id: 0 })
      delete data.id
      return {
        ...data,
        created_by: user.user?.id,
        updated_by: user.user?.id
      }
    })

    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Error bulk creating subscriptions:', error)
      throw new Error(`Failed to bulk create subscriptions: ${error.message}`)
    }

    return data.map(convertFromSupabaseFormat)
  }

  // Bulk update subscriptions
  async bulkUpdate(updates: { id: number; data: Partial<LegacySubscription> }[]): Promise<LegacySubscription[]> {
    const { data: user } = await this.supabase.auth.getUser()
    const results: LegacySubscription[] = []

    // Process updates in batches to avoid rate limits
    for (const update of updates) {
      try {
        const updateData: SubscriptionUpdate = {
          ...convertToSupabaseFormat({ id: update.id, ...update.data } as LegacySubscription),
          updated_by: user.user?.id
        }

        const { data, error } = await this.supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', update.id)
          .select()
          .single()

        if (error) {
          console.error(`Error updating subscription ${update.id}:`, error)
          continue
        }

        results.push(convertFromSupabaseFormat(data))
      } catch (error) {
        console.error(`Error updating subscription ${update.id}:`, error)
      }
    }

    return results
  }

  // Get subscriptions by status
  async getByStatus(status: 'active' | 'inactive' | 'expired'): Promise<LegacySubscription[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions by status:', error)
      throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    }

    return data.map(convertFromSupabaseFormat)
  }

  // Search subscriptions
  async search(query: string): Promise<LegacySubscription[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .or(`customer.ilike.%${query}%,vendor.ilike.%${query}%,vehicle_no.ilike.%${query}%,imei.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching subscriptions:', error)
      throw new Error(`Failed to search subscriptions: ${error.message}`)
    }

    return data.map(convertFromSupabaseFormat)
  }

  // Get subscriptions with pagination
  async getPaginated(
    page: number = 1, 
    pageSize: number = 20,
    filters?: {
      status?: 'active' | 'inactive' | 'expired'
      vendor?: string
      customer?: string
    }
  ): Promise<{ data: LegacySubscription[]; count: number; totalPages: number }> {
    let query = this.supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.vendor) {
      query = query.ilike('vendor', `%${filters.vendor}%`)
    }
    if (filters?.customer) {
      query = query.ilike('customer', `%${filters.customer}%`)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching paginated subscriptions:', error)
      throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return {
      data: (data || []).map(convertFromSupabaseFormat),
      count: count || 0,
      totalPages
    }
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        callback
      )
      .subscribe()
  }

  // Get statistics
  async getStats(): Promise<{
    total: number
    active: number
    inactive: number
    expired: number
    thisMonth: number
    lastMonth: number
  }> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('status, created_at')

    if (error) {
      console.error('Error fetching subscription stats:', error)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const stats = {
      total: data.length,
      active: data.filter(s => s.status === 'active').length,
      inactive: data.filter(s => s.status === 'inactive').length,
      expired: data.filter(s => s.status === 'expired').length,
      thisMonth: data.filter(s => new Date(s.created_at) >= thisMonth).length,
      lastMonth: data.filter(s => {
        const created = new Date(s.created_at)
        return created >= lastMonth && created <= lastMonthEnd
      }).length
    }

    return stats
  }
}

export const subscriptionService = new SubscriptionService()

