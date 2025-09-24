import { createClient } from './client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/supabase'

export class AuthService {
  private supabase = createClient()

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return data
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in:', error)
      return { user: null, error: error.message }
    }

    // Update last login
    if (data.user) {
      await this.updateLastLogin(data.user.id)
    }

    return { user: data.user, error: null }
  }

  // Sign up with email and password
  async signUp(
    email: string, 
    password: string, 
    userData: {
      username: string
      firstName: string
      lastName: string
      role?: 'admin' | 'manager' | 'operator' | 'viewer'
      department?: string
    }
  ): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || 'viewer',
          department: userData.department
        }
      }
    })

    if (error) {
      console.error('Error signing up:', error)
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      console.error('Error resetting password:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Error updating password:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Update profile
  async updateProfile(updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    const user = await this.getCurrentUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Check permissions
  async hasPermission(permission: string): Promise<boolean> {
    const profile = await this.getCurrentUserProfile()
    if (!profile) return false

    // Map roles to permissions (simplified version)
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      manager: [
        'dashboard.view', 'dashboard.customize',
        'subscriptions.view', 'subscriptions.create', 'subscriptions.edit', 'subscriptions.renew',
        'analytics.view', 'analytics.export',
        'settings.view', 'data.export', 'data.import'
      ],
      operator: [
        'dashboard.view', 'dashboard.customize',
        'subscriptions.view', 'subscriptions.edit', 'subscriptions.renew',
        'analytics.view'
      ],
      viewer: [
        'dashboard.view',
        'subscriptions.view',
        'analytics.view'
      ]
    }

    const userPermissions = rolePermissions[profile.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Check if user has any of the given permissions
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(permission)) {
        return true
      }
    }
    return false
  }

  // Check role
  async hasRole(role: 'admin' | 'manager' | 'operator' | 'viewer'): Promise<boolean> {
    const profile = await this.getCurrentUserProfile()
    return profile?.role === role || false
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin')
  }

  // Update last login timestamp
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    const isAdmin = await this.isAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return data || []
  }

  // Create user (admin only)
  async createUser(userData: {
    email: string
    password: string
    username: string
    firstName: string
    lastName: string
    role: 'admin' | 'manager' | 'operator' | 'viewer'
    department?: string
  }): Promise<{ user: User | null; error: string | null }> {
    const isAdmin = await this.isAdmin()
    if (!isAdmin) {
      return { user: null, error: 'Unauthorized: Admin access required' }
    }

    return this.signUp(userData.email, userData.password, {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      department: userData.department
    })
  }

  // Update user (admin only)
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    const isAdmin = await this.isAdmin()
    if (!isAdmin) {
      return { error: 'Unauthorized: Admin access required' }
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Deactivate user (admin only)
  async deactivateUser(userId: string): Promise<{ error: string | null }> {
    const isAdmin = await this.isAdmin()
    if (!isAdmin) {
      return { error: 'Unauthorized: Admin access required' }
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', userId)

    if (error) {
      console.error('Error deactivating user:', error)
      return { error: error.message }
    }

    return { error: null }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  // Get session
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  }

  // Refresh session
  async refreshSession() {
    const { data: { session }, error } = await this.supabase.auth.refreshSession()
    
    if (error) {
      console.error('Error refreshing session:', error)
      return null
    }

    return session
  }
}

export const authService = new AuthService()

