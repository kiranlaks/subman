import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authManager } from '@/lib/auth';
import { User, UserRole, Permission, AuditLog, Organization } from '@/types/user';
import { 
  Users, 
  Shield, 
  Building, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  UserPlus, 
  Settings, 
  Activity,
  Search,
  Filter,
  Download,
  Upload,
  Crown,
  AlertTriangle
} from 'lucide-react';

export function AdminManagement() {
  const currentUser = authManager.getCurrentUser();
  const [users, setUsers] = useState<User[]>(authManager.getUsers());
  const [roles, setRoles] = useState<UserRole[]>(authManager.getRoles());
  const [permissions] = useState<Permission[]>(authManager.getPermissions());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Audit logs
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      userName: 'System Administrator',
      action: 'user.created',
      resource: 'users',
      details: { targetUserId: '3', targetUserName: 'Jane Operator' },
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      timestamp: '2024-01-15T14:30:00Z',
      severity: 'medium'
    },
    {
      id: '2',
      userId: '2',
      userName: 'John Manager',
      action: 'subscription.updated',
      resource: 'subscriptions',
      details: { subscriptionId: 'sub_123', changes: ['status'] },
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/121.0.0.0',
      timestamp: '2024-01-15T13:15:00Z',
      severity: 'low'
    }
  ];

  // Organizations for multi-tenant
  const organizations: Organization[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      logo: undefined,
      settings: {} as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      isActive: true,
      subscriptionPlan: 'Enterprise',
      maxUsers: 100,
      currentUsers: 25
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`)) {
      const success = authManager.deleteUser(userId);
      if (success) {
        setUsers(authManager.getUsers());
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    }
  };

  const handleSaveUser = (userData: Partial<User>) => {
    // Validation
    if (!userData.firstName?.trim() || !userData.lastName?.trim()) {
      alert('First name and last name are required');
      return;
    }
    
    if (!userData.email?.trim()) {
      alert('Email is required');
      return;
    }
    
    if (!userData.username?.trim()) {
      alert('Username is required');
      return;
    }
    
    // Check for duplicate email/username
    const existingUsers = authManager.getUsers();
    const duplicateEmail = existingUsers.find(u => 
      u.email === userData.email && u.id !== selectedUser?.id
    );
    const duplicateUsername = existingUsers.find(u => 
      u.username === userData.username && u.id !== selectedUser?.id
    );
    
    if (duplicateEmail) {
      alert('A user with this email already exists');
      return;
    }
    
    if (duplicateUsername) {
      alert('A user with this username already exists');
      return;
    }
    
    try {
      if (selectedUser) {
        // Update existing user
        const updatedUser = authManager.updateUser(selectedUser.id, userData);
        if (updatedUser) {
          alert('User updated successfully');
        } else {
          alert('Failed to update user');
          return;
        }
      } else {
        // Create new user
        const role = roles.find(r => r.id === userData.role?.id) || roles[0];
        const newUser = authManager.createUser({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role,
          permissions: role.permissions,
          isActive: userData.isActive ?? true,
          department: userData.department,
          phoneNumber: userData.phoneNumber
        });
        
        if (newUser) {
          alert('User created successfully');
        } else {
          alert('Failed to create user');
          return;
        }
      }
      
      setUsers(authManager.getUsers());
      setShowUserDialog(false);
    } catch (error) {
      alert('An error occurred while saving the user');
      console.error('Error saving user:', error);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: UserRole) => {
    if (role.isSystemRole) {
      alert('System roles cannot be edited');
      return;
    }
    setSelectedRole(role);
    setShowRoleDialog(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (!roleToDelete) return;
    
    if (roleToDelete.isSystemRole) {
      alert('System roles cannot be deleted');
      return;
    }
    
    // Check if any users are assigned to this role
    const usersWithRole = users.filter(u => u.role.id === roleId);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete role "${roleToDelete.name}" because ${usersWithRole.length} user(s) are assigned to it. Please reassign these users first.`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete the role "${roleToDelete.name}"? This action cannot be undone.`)) {
      const success = authManager.deleteRole(roleId);
      if (success) {
        setRoles(authManager.getRoles());
        alert('Role deleted successfully');
      } else {
        alert('Failed to delete role');
      }
    }
  };

  const handleSaveRole = (roleData: Partial<UserRole>) => {
    // Validation
    if (!roleData.name?.trim()) {
      alert('Role name is required');
      return;
    }
    
    if (!roleData.description?.trim()) {
      alert('Role description is required');
      return;
    }
    
    if (!roleData.permissions || roleData.permissions.length === 0) {
      alert('At least one permission must be selected');
      return;
    }
    
    // Check for duplicate role name
    const existingRoles = authManager.getRoles();
    const duplicateName = existingRoles.find(r => 
      roleData.name && r.name.toLowerCase() === roleData.name.toLowerCase() && r.id !== selectedRole?.id
    );
    
    if (duplicateName) {
      alert('A role with this name already exists');
      return;
    }
    
    try {
      if (selectedRole) {
        // Update existing role
        const updatedRole = authManager.updateRole(selectedRole.id, roleData);
        if (updatedRole) {
          alert('Role updated successfully');
        } else {
          alert('Failed to update role');
          return;
        }
      } else {
        // Create new role
        const newRole = authManager.createRole({
          name: roleData.name || '',
          description: roleData.description || '',
          permissions: roleData.permissions || [],
          isSystemRole: false
        });
        
        if (newRole) {
          alert('Role created successfully');
        } else {
          alert('Failed to create role');
          return;
        }
      }
      
      setRoles(authManager.getRoles());
      setShowRoleDialog(false);
    } catch (error) {
      alert('An error occurred while saving the role');
      console.error('Error saving role:', error);
    }
  };

  const handleImpersonate = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot impersonate yourself');
      return;
    }
    
    if (!user.isActive) {
      alert('Cannot impersonate an inactive user');
      return;
    }
    
    if (confirm(`Are you sure you want to impersonate ${user.firstName} ${user.lastName}? You will be logged in as this user and all actions will be performed on their behalf.`)) {
      // Log the impersonation for audit purposes
      console.log(`Admin ${currentUser?.firstName} ${currentUser?.lastName} is impersonating user ${user.firstName} ${user.lastName}`);
      
      const success = authManager.switchUser(user.id);
      if (success) {
        alert(`You are now impersonating ${user.firstName} ${user.lastName}. Remember that all actions will be logged under their account.`);
        window.location.reload();
      } else {
        alert('Failed to impersonate user');
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentUser || !authManager.canManageUsers()) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to access admin management features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Create, edit, and manage user accounts and permissions.
                  </CardDescription>
                </div>
                <Button onClick={handleCreateUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role.isSystemRole ? "default" : "secondary"}>
                          {user.role.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {authManager.isAdmin() && user.id !== currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleImpersonate(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {user.id !== currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Management */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>
                    Define roles and assign permissions to control access.
                  </CardDescription>
                </div>
                <Button onClick={handleCreateRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    const userCount = users.filter(u => u.role.id === role.id).length;
                    return (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{role.name}</p>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{userCount}</TableCell>
                        <TableCell>{role.permissions.length}</TableCell>
                        <TableCell>
                          <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                            {role.isSystemRole ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!role.isSystemRole && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organization Management
                  </CardTitle>
                  <CardDescription>
                    Manage multiple organizations and tenant settings.
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Building className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(org.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{org.domain}</TableCell>
                      <TableCell>
                        <Badge>{org.subscriptionPlan}</Badge>
                      </TableCell>
                      <TableCell>{org.currentUsers} / {org.maxUsers}</TableCell>
                      <TableCell>
                        <Badge variant={org.isActive ? "default" : "destructive"}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>
                    Track all system activities and user actions.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {log.action}
                        </code>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(log.severity)}`} />
                          <span className="capitalize">{log.severity}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <UserDialog
        user={selectedUser}
        roles={roles}
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        onSave={handleSaveUser}
      />

      {/* Role Dialog */}
      <RoleDialog
        role={selectedRole}
        permissions={permissions}
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        onSave={handleSaveRole}
      />
    </div>
  );
}

// User Dialog Component
function UserDialog({ 
  user, 
  roles, 
  open, 
  onOpenChange, 
  onSave 
}: {
  user: User | null;
  roles: UserRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Partial<User>) => void;
}) {
  const [formData, setFormData] = useState<Partial<User>>({});

  React.useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        department: '',
        phoneNumber: '',
        isActive: true,
        role: roles[0]
      });
    }
  }, [user, roles]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create User'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and permissions.' : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role?.id}
              onValueChange={(value) => {
                const role = roles.find(r => r.id === value);
                setFormData({ ...formData, role });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Role Dialog Component
function RoleDialog({ 
  role, 
  permissions, 
  open, 
  onOpenChange, 
  onSave 
}: {
  role: UserRole | null;
  permissions: Permission[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (role: Partial<UserRole>) => void;
}) {
  const [formData, setFormData] = useState<Partial<UserRole>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  React.useEffect(() => {
    if (role) {
      setFormData(role);
      setSelectedPermissions(role.permissions.map(p => p.id));
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
        isSystemRole: false
      });
      setSelectedPermissions([]);
    }
  }, [role]);

  const handleSubmit = () => {
    const rolePermissions = permissions.filter(p => selectedPermissions.includes(p.id));
    onSave({
      ...formData,
      permissions: rolePermissions
    });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Edit Role' : 'Create Role'}
          </DialogTitle>
          <DialogDescription>
            {role ? 'Update role information and permissions.' : 'Create a new role with specific permissions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Permissions</h4>
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="space-y-2">
                <h5 className="font-medium capitalize text-sm">{category}</h5>
                <div className="grid grid-cols-2 gap-2">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}