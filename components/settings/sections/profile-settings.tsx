import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authManager } from '@/lib/auth';
import { User, UserSession, ConnectedAccount, TrustedDevice } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { auditLogger } from '@/lib/audit-logger';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { Camera, Shield, Smartphone, Monitor, Globe, Download, Trash2, Key, Link, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';

export function ProfileSettings() {
  const currentUser = authManager.getCurrentUser();
  const [user, setUser] = useState<User | null>(currentUser);
  const [originalUser, setOriginalUser] = useState<User | null>(currentUser);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { toast } = useToast();
  const { addAction } = useUndoRedo();

  // Check for unsaved changes
  useEffect(() => {
    if (user && originalUser) {
      const hasChanges = JSON.stringify(user) !== JSON.stringify(originalUser);
      setHasUnsavedChanges(hasChanges);
    }
  }, [user, originalUser]);

  // Mock data for demonstration - moved to useState below



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
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const saveProfileChanges = async () => {
    if (!user || !originalUser) return;

    // Validation
    if (!user.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive"
      });
      return;
    }

    if (!user.lastName.trim()) {
      toast({
        title: "Validation Error", 
        description: "Last name is required",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(user.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (user.phoneNumber && !validatePhone(user.phoneNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate changes
      const changes: Record<string, { from: any; to: any }> = {};
      Object.keys(user).forEach(key => {
        if (user[key as keyof User] !== originalUser[key as keyof User]) {
          changes[key] = {
            from: originalUser[key as keyof User],
            to: user[key as keyof User]
          };
        }
      });

      // Update user
      const success = authManager.updateUser(user.id, user);
      
      if (success) {
        // Log the changes
        if (Object.keys(changes).length > 0) {
          auditLogger.log(
            'user.profile_update',
            'user',
            user.id,
            {
              userId: user.id,
              changes,
              updatedFields: Object.keys(changes)
            }
          );

          // Add undo action
          addAction({
            type: 'user.profile_update',
            description: `Updated profile (${Object.keys(changes).length} field${Object.keys(changes).length > 1 ? 's' : ''})`,
            undo: () => {
              setUser(originalUser);
              authManager.updateUser(user.id, originalUser);
            },
            redo: () => {
              setUser(user);
              authManager.updateUser(user.id, user);
            },
            data: {
              userId: user.id,
              changes
            }
          });
        }

        setOriginalUser({ ...user });
        setHasUnsavedChanges(false);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discardChanges = () => {
    if (originalUser) {
      setUser({ ...originalUser });
      setHasUnsavedChanges(false);
      toast({
        title: "Changes Discarded",
        description: "All unsaved changes have been discarded",
      });
    }
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 2MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPEG, PNG, GIF, or WebP image",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarUrl = e.target?.result as string;
          const previousAvatar = user.avatar;
          
          // Update user avatar
          const updatedUser = { ...user, avatar: avatarUrl };
          setUser(updatedUser);

          // Log the avatar change
          auditLogger.log(
            'user.avatar_update',
            'user',
            user.id,
            {
              userId: user.id,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            }
          );

          // Add undo action
          addAction({
            type: 'user.avatar_update',
            description: `Updated profile picture`,
            undo: () => {
              const revertedUser = { ...user, avatar: previousAvatar };
              setUser(revertedUser);
              authManager.updateUser(user.id, { avatar: previousAvatar });
            },
            redo: () => {
              setUser(updatedUser);
              authManager.updateUser(user.id, { avatar: avatarUrl });
            },
            data: {
              userId: user.id,
              previousAvatar,
              newAvatar: avatarUrl
            }
          });

          toast({
            title: "Avatar Updated",
            description: "Your profile picture has been updated successfully",
          });

          setIsLoading(false);
        };
        
        reader.onerror = () => {
          toast({
            title: "Upload Failed",
            description: "Failed to read the image file",
            variant: "destructive"
          });
          setIsLoading(false);
        };

        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload avatar. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    input.click();
  };

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handlePasswordReset = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Requirements",
        description: passwordValidation.errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would verify the current password with the server
    if (currentPassword !== 'demo123') { // Mock validation
      toast({
        title: "Authentication Error",
        description: "Current password is incorrect",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Update password change date
      if (user) {
        const updatedUser = { 
          ...user, 
          lastPasswordChange: new Date().toISOString() 
        };
        
        authManager.updateUser(user.id, updatedUser);
        setUser(updatedUser);
        setOriginalUser(updatedUser);

        // Log password change
        auditLogger.log(
          'user.password_change',
          'user',
          user.id,
          {
            userId: user.id,
            timestamp: new Date().toISOString()
          }
        );

        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully",
        });

        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordDialog(false);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorDialog(true);
    } else {
      // Disable 2FA
      const previousState = twoFactorEnabled;
      setTwoFactorEnabled(false);
      
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: false };
        authManager.updateUser(user.id, updatedUser);
        setUser(updatedUser);
        setOriginalUser(updatedUser);

        // Log 2FA disable
        auditLogger.log(
          'user.2fa_disabled',
          'user',
          user.id,
          {
            userId: user.id,
            timestamp: new Date().toISOString()
          }
        );

        // Add undo action
        addAction({
          type: 'user.2fa_toggle',
          description: 'Disabled two-factor authentication',
          undo: () => {
            setTwoFactorEnabled(true);
            const revertedUser = { ...user, twoFactorEnabled: true };
            authManager.updateUser(user.id, revertedUser);
            setUser(revertedUser);
          },
          redo: () => {
            setTwoFactorEnabled(false);
            authManager.updateUser(user.id, updatedUser);
            setUser(updatedUser);
          },
          data: {
            userId: user.id,
            previousState,
            newState: false
          }
        });

        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    }
  };

  const handleTwoFactorEnable = () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    // Mock verification - in real app, verify with server
    if (twoFactorCode !== '123456') {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setTwoFactorEnabled(true);
    setShowTwoFactorDialog(false);
    setTwoFactorCode('');
    
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: true };
      authManager.updateUser(user.id, updatedUser);
      setUser(updatedUser);
      setOriginalUser(updatedUser);

      // Log 2FA enable
      auditLogger.log(
        'user.2fa_enabled',
        'user',
        user.id,
        {
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      );

      // Add undo action
      addAction({
        type: 'user.2fa_toggle',
        description: 'Enabled two-factor authentication',
        undo: () => {
          setTwoFactorEnabled(false);
          const revertedUser = { ...user, twoFactorEnabled: false };
          authManager.updateUser(user.id, revertedUser);
          setUser(revertedUser);
        },
        redo: () => {
          setTwoFactorEnabled(true);
          authManager.updateUser(user.id, updatedUser);
          setUser(updatedUser);
        },
        data: {
          userId: user.id,
          previousState: false,
          newState: true
        }
      });

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
      });
    }
  };

  const [activeSessions, setActiveSessions] = useState<UserSession[]>([
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
  ]);

  const handleRevokeSession = (sessionId: string) => {
    const sessionToRevoke = activeSessions.find(s => s.id === sessionId);
    if (!sessionToRevoke) return;

    if (confirm(`Are you sure you want to revoke the session on ${sessionToRevoke.deviceInfo}? The user will be logged out from that device.`)) {
      const previousSessions = [...activeSessions];
      const updatedSessions = activeSessions.filter(s => s.id !== sessionId);
      
      setActiveSessions(updatedSessions);

      // Log session revocation
      auditLogger.log(
        'user.session_revoked',
        'user_session',
        sessionId,
        {
          userId: user?.id,
          sessionId,
          deviceInfo: sessionToRevoke.deviceInfo,
          ipAddress: sessionToRevoke.ipAddress
        }
      );

      // Add undo action
      addAction({
        type: 'user.session_revoke',
        description: `Revoked session on ${sessionToRevoke.deviceInfo}`,
        undo: () => setActiveSessions(previousSessions),
        redo: () => setActiveSessions(updatedSessions),
        data: {
          sessionId,
          deviceInfo: sessionToRevoke.deviceInfo
        }
      });

      toast({
        title: "Session Revoked",
        description: `Session on ${sessionToRevoke.deviceInfo} has been revoked`,
      });
    }
  };

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      provider: 'google',
      providerAccountId: 'google_123456',
      email: 'user@gmail.com',
      connectedAt: '2024-01-10T00:00:00Z',
      isActive: true
    }
  ]);

  const handleDisconnectAccount = (accountId: string) => {
    const accountToDisconnect = connectedAccounts.find(a => a.id === accountId);
    if (!accountToDisconnect) return;

    if (confirm(`Are you sure you want to disconnect your ${accountToDisconnect.provider} account? You will no longer be able to sign in using this provider.`)) {
      const previousAccounts = [...connectedAccounts];
      const updatedAccounts = connectedAccounts.filter(a => a.id !== accountId);
      
      setConnectedAccounts(updatedAccounts);

      // Log account disconnection
      auditLogger.log(
        'user.account_disconnected',
        'connected_account',
        accountId,
        {
          userId: user?.id,
          provider: accountToDisconnect.provider,
          email: accountToDisconnect.email
        }
      );

      // Add undo action
      addAction({
        type: 'user.account_disconnect',
        description: `Disconnected ${accountToDisconnect.provider} account`,
        undo: () => setConnectedAccounts(previousAccounts),
        redo: () => setConnectedAccounts(updatedAccounts),
        data: {
          accountId,
          provider: accountToDisconnect.provider,
          email: accountToDisconnect.email
        }
      });

      toast({
        title: "Account Disconnected",
        description: `Your ${accountToDisconnect.provider} account has been disconnected`,
      });
    }
  };

  const handleConnectNewAccount = (provider: 'google' | 'microsoft' | 'github' | 'apple') => {
    // Mock connecting a new account
    const newAccount: ConnectedAccount = {
      id: Date.now().toString(),
      provider,
      providerAccountId: `${provider}_${Date.now()}`,
      email: `user@${provider}.com`,
      connectedAt: new Date().toISOString(),
      isActive: true
    };

    const previousAccounts = [...connectedAccounts];
    const updatedAccounts = [...connectedAccounts, newAccount];
    
    setConnectedAccounts(updatedAccounts);

    // Log account connection
    auditLogger.log(
      'user.account_connected',
      'connected_account',
      newAccount.id,
      {
        userId: user?.id,
        provider: newAccount.provider,
        email: newAccount.email
      }
    );

    // Add undo action
    addAction({
      type: 'user.account_connect',
      description: `Connected ${provider} account`,
      undo: () => setConnectedAccounts(previousAccounts),
      redo: () => setConnectedAccounts(updatedAccounts),
      data: {
        accountId: newAccount.id,
        provider: newAccount.provider,
        email: newAccount.email
      }
    });

    toast({
      title: "Account Connected",
      description: `Your ${provider} account has been connected successfully`,
    });
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