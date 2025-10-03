import { authService } from '@/lib/supabase/auth'
import type { UserProfile } from '@/types/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Updated auth manager that uses Supabase instead of mock data
class SupabaseAuthManager {
  // Get current user
  async getCurrentUser(): Promise<UserProfile | null> {
    return authService.getCurrentUserProfile()
  }

  // Get current Supabase user
  async getCurrentSupabaseUser(): Promise<SupabaseUser | null> {
    return authService.getCurrentUser()
  }

  // Login
  async login(email: string, password: string): Promise<{ user: SupabaseUser | null; error: string | null }> {
    return authService.signIn(email, password)
  }

  // Logout
  async logout(): Promise<{ error: string | null }> {
    return authService.signOut()
  }

  // Check permissions
  async hasPermission(permissionId: string): Promise<boolean> {
    return authService.hasPermission(permissionId)
  }

  // Check if user has any of the given permissions
  async hasAnyPermission(permissionIds: string[]): Promise<boolean> {
    return authService.hasAnyPermission(permissionIds)
  }

  // Check role
  async hasRole(roleId: 'admin' | 'manager' | 'operator' | 'viewer'): Promise<boolean> {
    return authService.hasRole(roleId)
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    return authService.isAdmin()
  }

  // Check if user can manage users
  async canManageUsers(): Promise<boolean> {
    return this.hasAnyPermission(['users.create', 'users.edit', 'users.delete'])
  }

  // Check if user can manage settings
  async canManageSettings(): Promise<boolean> {
    return this.hasPermission('settings.edit')
  }

  // User management methods (admin only)
  async getUsers(): Promise<UserProfile[]> {
    return authService.getAllUsers()
  }

  async createUser(userData: {
    email: string
    password: string
    username: string
    firstName: string
    lastName: string
    role: 'admin' | 'manager' | 'operator' | 'viewer'
    department?: string
  }): Promise<{ user: SupabaseUser | null; error: string | null }> {
    return authService.createUser(userData)
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    return authService.updateUser(userId, updates)
  }

  async deactivateUser(userId: string): Promise<{ error: string | null }> {
    return authService.deactivateUser(userId)
  }

  // Profile management
  async updateProfile(updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    return authService.updateProfile(updates)
  }

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    return authService.updatePassword(newPassword)
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    return authService.resetPassword(email)
  }

  // Session management
  async getSession() {
    return authService.getSession()
  }

  async refreshSession() {
    return authService.refreshSession()
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return authService.onAuthStateChange(callback)
  }
}

export const authManager = new SupabaseAuthManager()

// Export legacy interface for backward compatibility
export interface User extends Omit<UserProfile, 'role'> {
  role: {
    id: string
    name: string
    description: string
    permissions: Permission[]
    isSystemRole: boolean
  }
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

// Convert Supabase profile to legacy format for backward compatibility
export function convertToLegacyUser(profile: UserProfile): User {
  const roleMap = {
    admin: { id: 'admin', name: 'Administrator', description: 'Full system access', isSystemRole: true },
    manager: { id: 'manager', name: 'Manager', description: 'Management access', isSystemRole: true },
    operator: { id: 'operator', name: 'Operator', description: 'Standard user access', isSystemRole: true },
    viewer: { id: 'viewer', name: 'Viewer', description: 'Read-only access', isSystemRole: true }
  }

  const permissionMap = {
    admin: [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard', category: 'dashboard', resource: 'dashboard', action: 'read' },
      { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'read' },
      { id: 'subscriptions.edit', name: 'Edit Subscriptions', description: 'Edit subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'update' },
      { id: 'users.view', name: 'View Users', description: 'View users', category: 'users', resource: 'users', action: 'read' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Edit settings', category: 'settings', resource: 'settings', action: 'update' },
    ],
    manager: [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard', category: 'dashboard', resource: 'dashboard', action: 'read' },
      { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'read' },
      { id: 'subscriptions.edit', name: 'Edit Subscriptions', description: 'Edit subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'update' },
    ],
    operator: [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard', category: 'dashboard', resource: 'dashboard', action: 'read' },
      { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'read' },
    ],
    viewer: [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard', category: 'dashboard', resource: 'dashboard', action: 'read' },
      { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'read' },
    ]
  }

  const role = roleMap[profile.role]
  const permissions = permissionMap[profile.role] || []

  return {
    ...profile,
    role: {
      ...role,
      permissions
    },
    permissions
  }
}

