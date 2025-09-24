export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: number
          sl_no: number
          date: string
          imei: string
          device: string
          vendor: string
          vehicle_no: string
          customer: string
          phone_no: string
          tag_place: string
          panic_buttons: number
          recharge: number
          installation_date: string
          renewal_date: string | null
          owner_name: string | null
          status: 'active' | 'inactive' | 'expired'
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: number
          sl_no: number
          date: string
          imei: string
          device?: string
          vendor: string
          vehicle_no: string
          customer: string
          phone_no: string
          tag_place: string
          panic_buttons?: number
          recharge?: number
          installation_date: string
          renewal_date?: string | null
          owner_name?: string | null
          status?: 'active' | 'inactive' | 'expired'
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: number
          sl_no?: number
          date?: string
          imei?: string
          device?: string
          vendor?: string
          vehicle_no?: string
          customer?: string
          phone_no?: string
          tag_place?: string
          panic_buttons?: number
          recharge?: number
          installation_date?: string
          renewal_date?: string | null
          owner_name?: string | null
          status?: 'active' | 'inactive' | 'expired'
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'operator' | 'viewer'
          department: string | null
          phone_number: string | null
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          two_factor_enabled: boolean
          email_verified: boolean
          phone_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          first_name: string
          last_name: string
          role?: 'admin' | 'manager' | 'operator' | 'viewer'
          department?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          two_factor_enabled?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'manager' | 'operator' | 'viewer'
          department?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          two_factor_enabled?: boolean
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_info: string | null
          ip_address: string | null
          location: string | null
          user_agent: string | null
          is_active: boolean
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          device_info?: string | null
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: string | null
          ip_address?: string | null
          location?: string | null
          user_agent?: string | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          username: string | null
          user_role: string | null
          action: string
          resource: string
          resource_id: string
          details: Json
          ip_address: string | null
          user_agent: string | null
          success: boolean
          error_message: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          username?: string | null
          user_role?: string | null
          action: string
          resource: string
          resource_id: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          success?: boolean
          error_message?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          username?: string | null
          user_role?: string | null
          action?: string
          resource?: string
          resource_id?: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          success?: boolean
          error_message?: string | null
          timestamp?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          settings_key: string
          settings_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings_key: string
          settings_value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings_key?: string
          settings_value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      application_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: 'active' | 'inactive' | 'expired'
      user_role_type: 'admin' | 'manager' | 'operator' | 'viewer'
      audit_action_type: 
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']
export type ApplicationSettings = Database['public']['Tables']['application_settings']['Row']

// Convert existing Subscription type to match Supabase schema
export interface LegacySubscription {
  id: number
  slNo: number
  date: string
  imei: string
  device: string
  vendor: string
  vehicleNo: string
  customer: string
  phoneNo: string
  tagPlace: string
  panicButtons: number
  recharge: number
  installationDate: string
  status: 'active' | 'inactive' | 'expired'
  renewalDate?: string
  ownerName?: string
}

// Function to convert between legacy and new format
export function convertToSupabaseFormat(legacy: LegacySubscription): SubscriptionInsert {
  return {
    id: legacy.id,
    sl_no: legacy.slNo,
    date: legacy.date,
    imei: legacy.imei,
    device: legacy.device,
    vendor: legacy.vendor,
    vehicle_no: legacy.vehicleNo,
    customer: legacy.customer,
    phone_no: legacy.phoneNo,
    tag_place: legacy.tagPlace,
    panic_buttons: legacy.panicButtons,
    recharge: legacy.recharge,
    installation_date: legacy.installationDate,
    status: legacy.status,
    renewal_date: legacy.renewalDate || null,
    owner_name: legacy.ownerName || null
  }
}

export function convertFromSupabaseFormat(supabase: Subscription): LegacySubscription {
  return {
    id: supabase.id,
    slNo: supabase.sl_no,
    date: supabase.date,
    imei: supabase.imei,
    device: supabase.device,
    vendor: supabase.vendor,
    vehicleNo: supabase.vehicle_no,
    customer: supabase.customer,
    phoneNo: supabase.phone_no,
    tagPlace: supabase.tag_place,
    panicButtons: supabase.panic_buttons,
    recharge: supabase.recharge,
    installationDate: supabase.installation_date,
    status: supabase.status,
    renewalDate: supabase.renewal_date || undefined,
    ownerName: supabase.owner_name || undefined
  }
}

