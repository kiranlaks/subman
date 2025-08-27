import { User, UserRole, Permission, UserSession } from '@/types/user';

// Mock data for demonstration
const mockPermissions: Permission[] = [
  // Dashboard permissions
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'dashboard', resource: 'dashboard', action: 'read' },
  { id: 'dashboard.customize', name: 'Customize Dashboard', description: 'Customize dashboard widgets and layout', category: 'dashboard', resource: 'dashboard', action: 'update' },
  
  // Subscription permissions
  { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscription data', category: 'subscriptions', resource: 'subscriptions', action: 'read' },
  { id: 'subscriptions.create', name: 'Create Subscriptions', description: 'Add new subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'create' },
  { id: 'subscriptions.edit', name: 'Edit Subscriptions', description: 'Modify existing subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'update' },
  { id: 'subscriptions.delete', name: 'Delete Subscriptions', description: 'Remove subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'delete' },
  { id: 'subscriptions.renew', name: 'Renew Subscriptions', description: 'Renew expired subscriptions', category: 'subscriptions', resource: 'subscriptions', action: 'update' },
  
  // Analytics permissions
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports', category: 'analytics', resource: 'analytics', action: 'read' },
  { id: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data', category: 'analytics', resource: 'analytics', action: 'export' },
  
  // User management permissions
  { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'users', resource: 'users', action: 'read' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'users', resource: 'users', action: 'create' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user accounts', category: 'users', resource: 'users', action: 'update' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove user accounts', category: 'users', resource: 'users', action: 'delete' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'users', resource: 'roles', action: 'update' },
  
  // Settings permissions
  { id: 'settings.view', name: 'View Settings', description: 'Access system settings', category: 'settings', resource: 'settings', action: 'read' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'settings', resource: 'settings', action: 'update' },
  { id: 'settings.backup', name: 'Backup Settings', description: 'Create and restore backups', category: 'settings', resource: 'settings', action: 'backup' },
  
  // Export/Import permissions
  { id: 'data.export', name: 'Export Data', description: 'Export system data', category: 'exports', resource: 'data', action: 'export' },
  { id: 'data.import', name: 'Import Data', description: 'Import system data', category: 'imports', resource: 'data', action: 'import' },
];

const mockRoles: UserRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystemRole: true,
    permissions: mockPermissions
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management access with most permissions except user management',
    isSystemRole: true,
    permissions: mockPermissions.filter(p => !p.id.startsWith('users.') || p.id === 'users.view')
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Standard user with view and basic edit permissions',
    isSystemRole: true,
    permissions: mockPermissions.filter(p => 
      p.action === 'read' || 
      p.id === 'subscriptions.edit' || 
      p.id === 'subscriptions.renew' ||
      p.id === 'dashboard.customize'
    )
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboard and data',
    isSystemRole: true,
    permissions: mockPermissions.filter(p => p.action === 'read')
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@subman.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: mockRoles[0],
    permissions: mockRoles[0].permissions,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    department: 'IT',
    phoneNumber: '+1234567890'
  },
  {
    id: '2',
    username: 'manager1',
    email: 'manager@subman.com',
    firstName: 'John',
    lastName: 'Manager',
    role: mockRoles[1],
    permissions: mockRoles[1].permissions,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    department: 'Operations',
    phoneNumber: '+1234567891'
  },
  {
    id: '3',
    username: 'operator1',
    email: 'operator@subman.com',
    firstName: 'Jane',
    lastName: 'Operator',
    role: mockRoles[2],
    permissions: mockRoles[2].permissions,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    department: 'Operations',
    phoneNumber: '+1234567892'
  }
];

class AuthManager {
  private currentUser: User | null = null;
  private users: User[] = mockUsers;
  private roles: UserRole[] = mockRoles;
  private permissions: Permission[] = mockPermissions;

  constructor() {
    // Load current user from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('current-user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load current user:', error);
        }
      }
      
      // Default to admin user for demo
      if (!this.currentUser) {
        this.currentUser = mockUsers[0];
        this.saveCurrentUser();
      }
    }
  }

  private saveCurrentUser() {
    if (typeof window !== 'undefined' && this.currentUser) {
      localStorage.setItem('current-user', JSON.stringify(this.currentUser));
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  login(username: string, password: string): Promise<UserSession> {
    return new Promise((resolve, reject) => {
      // Mock authentication
      const user = this.users.find(u => u.username === username);
      if (user && user.isActive) {
        this.currentUser = user;
        this.saveCurrentUser();
        
        const session: UserSession = {
          user,
          token: 'mock-jwt-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        
        resolve(session);
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current-user');
    }
  }

  switchUser(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.saveCurrentUser();
      return true;
    }
    return false;
  }

  hasPermission(permissionId: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.some(p => p.id === permissionId);
  }

  hasAnyPermission(permissionIds: string[]): boolean {
    return permissionIds.some(id => this.hasPermission(id));
  }

  hasRole(roleId: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role.id === roleId;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canManageUsers(): boolean {
    return this.hasPermission('users.create') || this.hasPermission('users.edit') || this.hasPermission('users.delete');
  }

  canManageSettings(): boolean {
    return this.hasPermission('settings.edit');
  }

  // User management methods
  getUsers(): User[] {
    return this.users;
  }

  getRoles(): UserRole[] {
    return this.roles;
  }

  getPermissions(): Permission[] {
    return this.permissions;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Update current user if it's the same user
    if (this.currentUser?.id === userId) {
      this.currentUser = this.users[userIndex];
      this.saveCurrentUser();
    }
    
    return this.users[userIndex];
  }

  deleteUser(userId: string): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  createRole(roleData: Omit<UserRole, 'id'>): UserRole {
    const newRole: UserRole = {
      ...roleData,
      id: Date.now().toString()
    };
    
    this.roles.push(newRole);
    return newRole;
  }

  updateRole(roleId: string, updates: Partial<UserRole>): UserRole | null {
    const roleIndex = this.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return null;
    
    this.roles[roleIndex] = {
      ...this.roles[roleIndex],
      ...updates
    };
    
    return this.roles[roleIndex];
  }

  deleteRole(roleId: string): boolean {
    const role = this.roles.find(r => r.id === roleId);
    if (!role || role.isSystemRole) return false;
    
    const roleIndex = this.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return false;
    
    this.roles.splice(roleIndex, 1);
    return true;
  }
}

export const authManager = new AuthManager();
export { mockPermissions, mockRoles, mockUsers };