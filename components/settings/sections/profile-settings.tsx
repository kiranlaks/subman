import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { authManager } from '@/lib/auth';
import { User, UserSession, ConnectedAccount, TrustedDevice } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Camera, Shield, Smartphone, Monitor, Globe, Download, Trash2, Key, Link, AlertTriangle } from 'lucide-react';

export function ProfileSettings() {
  const currentUser = authManager.getCurrentUser();
  const [user, setUser] = useState<User | null>(currentUser);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { success, error } = useToast();

  // Mock data for demonstration
  const activeSessions: UserSession[] = [
    {
      id: '1',
      userId: user?.id || '',
      deviceInfo: 'Chrome on Windows 11',
      ipAddress: '192.168.1.100',
      location: 'New York, NY',
      createdAt: '2024-01-15T10:30:00Z',
      lastActivity: '2024-01-15T14:45:00Z',
      isActive: true
    },
    {
      id: '2',
      userId: user?.id || '',
      deviceInfo: 'Safari on iPhone 15',
      ipAddress: '10.0.0.50',
      location: 'New York, NY',
      createdAt: '2024-01-14T08:15:00Z',
      lastActivity: '2024-01-15T12:20:00Z',
      isActive: true
    }
  ];

  const connectedAccounts: ConnectedAccount[] = [
    {
      id: '1',
      provider: 'google',
      providerAccountId: 'google_123456',
      email: 'user@gmail.com',
      connectedAt: '2024-01-10T00:00:00Z',
      isActive: true
    }
  ];

  const trustedDevices: TrustedDevice[] = [
    {
      id: '1',
      userId: user?.id || '',
      deviceFingerprint: 'fp_desktop_chrome',
      deviceName: 'Work Laptop',
      deviceType: 'desktop',
      browser: 'Chrome 120',
      os: 'Windows 11',
      ipAddress: '192.168.1.100',
      location: 'New York, NY',
      trustedAt: '2024-01-01T00:00:00Z',
      lastSeen: '2024-01-15T14:45:00Z',
      isActive: true
    }
  ];

  const handleProfileUpdate = (field: string, value: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);
      authManager.updateUser(user.id, { [field]: value });
    }
  };

  const handleAvatarUpload = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('File size must be less than 2MB');
          return;
        }
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarUrl = e.target?.result as string;
          if (user) {
            const updatedUser = { ...user, avatar: avatarUrl };
            setUser(updatedUser);
            authManager.updateUser(user.id, { avatar: avatarUrl });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePasswordReset = () => {
    // In a real app, this would validate the current password and update
    const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // Update password change date
    if (user) {
      authManager.updateUser(user.id, { 
        lastPasswordChange: new Date().toISOString() 
      });
    }
    
    alert('Password updated successfully');
    setShowPasswordDialog(false);
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorDialog(true);
    } else {
      setTwoFactorEnabled(false);
      if (user) {
        authManager.updateUser(user.id, { twoFactorEnabled: false });
      }
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session? The user will be logged out from that device.')) {
      // In a real app, this would call an API to revoke the session
      // For now, we'll just remove it from the mock data
      alert(`Session ${sessionId} has been revoked successfully`);
      // You could update the sessions state here if you were managing it
    }
  };

  const handleDisconnectAccount = (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account? You will no longer be able to sign in using this provider.')) {
      // In a real app, this would call an API to disconnect the account
      alert('Account disconnected successfully');
      // You could update the connected accounts state here
    }
  };

  const handleRevokeTrustedDevice = (deviceId: string) => {
    if (confirm('Are you sure you want to revoke trust for this device? The user will need to verify their identity again on this device.')) {
      // In a real app, this would call an API to revoke device trust
      alert('Device trust revoked successfully');
      // You could update the trusted devices state here
    }
  };

  const handleExportData = () => {
    if (!user) return;
    
    // Create a comprehensive data export
    const exportData = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      settings: {
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      },
      exportedAt: new Date().toISOString()
    };
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${user.firstName}-${user.lastName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Your data has been exported successfully');
  };

  const handleDeleteAccount = () => {
    const confirmText = (document.getElementById('confirmDelete') as HTMLInputElement)?.value;
    
    if (confirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }
    
    if (confirm('This action cannot be undone. Are you absolutely sure you want to delete your account?')) {
      // In a real app, this would call an API to delete the account
      alert('Account deletion request has been submitted. You will receive a confirmation email.');
      setShowDeleteDialog(false);
      
      // In a real app, you might redirect to a goodbye page or logout
      // For demo purposes, we'll just close the dialog
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button onClick={handleAvatarUpload} variant="outline">
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={user.firstName}
                onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={user.lastName}
                onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={user.phoneNumber || ''}
              onChange={(e) => handleProfileUpdate('phoneNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={user.department || ''}
              onChange={(e) => handleProfileUpdate('department', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your password and two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Last changed: {user.lastPasswordChange || 'Never'}
              </p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button onClick={handlePasswordReset} className="w-full">
                    Update Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Scan the QR code with your authenticator app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-muted flex items-center justify-center">
                    QR Code Placeholder
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input id="verificationCode" placeholder="Enter 6-digit code" />
                </div>
                <Button 
                  onClick={() => {
                    setTwoFactorEnabled(true);
                    setShowTwoFactorDialog(false);
                    if (user) {
                      authManager.updateUser(user.id, { twoFactorEnabled: true });
                    }
                  }} 
                  className="w-full"
                >
                  Enable 2FA
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active login sessions across devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      {session.deviceInfo}
                    </div>
                  </TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>{new Date(session.lastActivity).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social and work accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium capitalize">{account.provider}</p>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnectAccount(account.id)}
              >
                Disconnect
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Connect New Account
          </Button>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
          <CardDescription>
            Devices you've marked as trusted for faster login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trustedDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{device.deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.browser} on {device.os}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>{new Date(device.lastSeen).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeTrustedDevice(device.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Control your data and privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of your account data
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmDelete">Type "DELETE" to confirm</Label>
                    <Input id="confirmDelete" placeholder="DELETE" />
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                    Delete Account Permanently
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}