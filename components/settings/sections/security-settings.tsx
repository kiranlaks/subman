import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { SecuritySettings as SecurityConfig, TrustedDevice, LoginAttempt } from '@/types/user';
import { 
  Shield, 
  Lock, 
  Globe, 
  Smartphone, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Eye, 
  Clock,
  Users,
  Key,
  Wifi,
  Monitor,
  Save,
  RotateCcw
} from 'lucide-react';

export function SecuritySettings() {
  const [settings, setSettings] = useState<SecurityConfig>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
      preventReuse: 5
    },
    sessionTimeout: 480, // 8 hours in minutes
    maxConcurrentSessions: 3,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    twoFactorRequired: false,
    deviceTrustDuration: 30 // days
  });

  const [showAddIpDialog, setShowAddIpDialog] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  // Mock data for demonstration
  const recentLoginAttempts: LoginAttempt[] = [
    {
      id: '1',
      email: 'admin@subman.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      success: true,
      timestamp: '2024-01-15T14:30:00Z',
      location: 'New York, NY'
    },
    {
      id: '2',
      email: 'unknown@example.com',
      ipAddress: '203.0.113.45',
      userAgent: 'Firefox/121.0.0.0',
      success: false,
      failureReason: 'Invalid credentials',
      timestamp: '2024-01-15T13:45:00Z',
      location: 'Unknown'
    },
    {
      id: '3',
      email: 'manager@subman.com',
      ipAddress: '192.168.1.101',
      userAgent: 'Safari/17.0',
      success: true,
      timestamp: '2024-01-15T12:15:00Z',
      location: 'New York, NY'
    }
  ];

  const trustedDevices: TrustedDevice[] = [
    {
      id: '1',
      userId: '1',
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
    },
    {
      id: '2',
      userId: '2',
      deviceFingerprint: 'fp_mobile_safari',
      deviceName: 'iPhone 15',
      deviceType: 'mobile',
      browser: 'Safari 17',
      os: 'iOS 17',
      ipAddress: '10.0.0.50',
      location: 'New York, NY',
      trustedAt: '2024-01-10T00:00:00Z',
      lastSeen: '2024-01-15T10:30:00Z',
      isActive: true
    }
  ];

  const updatePasswordPolicy = (key: keyof SecurityConfig['passwordPolicy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [key]: value
      }
    }));
  };

  const updateSecuritySetting = (key: keyof SecurityConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddIpAddress = () => {
    const ip = newIpAddress.trim();
    if (!ip) {
      alert('Please enter an IP address');
      return;
    }
    
    // Basic IP/CIDR validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    if (!ipRegex.test(ip)) {
      alert('Please enter a valid IP address or CIDR range (e.g., 192.168.1.100 or 192.168.1.0/24)');
      return;
    }
    
    // Check for duplicates
    if (settings.ipWhitelist.includes(ip)) {
      alert('This IP address is already in the whitelist');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      ipWhitelist: [...prev.ipWhitelist, ip]
    }));
    setNewIpAddress('');
    setShowAddIpDialog(false);
    alert('IP address added to whitelist successfully');
  };

  const handleRemoveIpAddress = (ip: string) => {
    if (confirm(`Are you sure you want to remove ${ip} from the IP whitelist? Users from this IP will no longer be able to access the system.`)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: prev.ipWhitelist.filter(address => address !== ip)
      }));
      alert('IP address removed from whitelist');
    }
  };

  const handleRevokeTrustedDevice = (deviceId: string) => {
    const device = trustedDevices.find(d => d.id === deviceId);
    if (!device) return;
    
    if (confirm(`Are you sure you want to revoke trust for "${device.deviceName}"? The user will need to verify their identity again on this device.`)) {
      // In a real app, this would call an API to revoke device trust
      alert(`Trust revoked for device "${device.deviceName}"`);
      // You could update the trusted devices state here
    }
  };

  const handleSaveSettings = () => {
    try {
      // Validate settings before saving
      if (settings.passwordPolicy.minLength < 6 || settings.passwordPolicy.minLength > 20) {
        alert('Password minimum length must be between 6 and 20 characters');
        return;
      }
      
      if (settings.sessionTimeout < 15) {
        alert('Session timeout must be at least 15 minutes');
        return;
      }
      
      if (settings.maxConcurrentSessions < 1) {
        alert('Maximum concurrent sessions must be at least 1');
        return;
      }
      
      // In a real app, this would save to a backend API
      localStorage.setItem('securitySettings', JSON.stringify(settings));
      alert('Security settings saved successfully');
    } catch (error) {
      alert('Failed to save security settings');
      console.error('Error saving security settings:', error);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all security settings to defaults? This action cannot be undone.')) {
      const defaultSettings: SecurityConfig = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90,
          preventReuse: 3
        },
        sessionTimeout: 480, // 8 hours
        maxConcurrentSessions: 5,
        ipWhitelist: [],
        twoFactorRequired: false,
        deviceTrustDuration: 30
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('securitySettings');
      alert('Security settings reset to defaults');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Policy
          </CardTitle>
          <CardDescription>
            Configure password requirements and security rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Length: {settings.passwordPolicy.minLength} characters</Label>
              <Slider
                value={[settings.passwordPolicy.minLength]}
                onValueChange={([value]) => updatePasswordPolicy('minLength', value)}
                max={20}
                min={6}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Uppercase</h4>
                  <p className="text-sm text-muted-foreground">At least one uppercase letter</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Lowercase</h4>
                  <p className="text-sm text-muted-foreground">At least one lowercase letter</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Numbers</h4>
                  <p className="text-sm text-muted-foreground">At least one numeric digit</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Special Characters</h4>
                  <p className="text-sm text-muted-foreground">At least one special character</p>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Password Expiry: {settings.passwordPolicy.maxAge} days</Label>
              <Slider
                value={[settings.passwordPolicy.maxAge]}
                onValueChange={([value]) => updatePasswordPolicy('maxAge', value)}
                max={365}
                min={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Prevent Reuse: Last {settings.passwordPolicy.preventReuse} passwords</Label>
              <Slider
                value={[settings.passwordPolicy.preventReuse]}
                onValueChange={([value]) => updatePasswordPolicy('preventReuse', value)}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Configure session timeouts and concurrent session limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Session Timeout: {Math.floor(settings.sessionTimeout / 60)}h {settings.sessionTimeout % 60}m</Label>
            <Slider
              value={[settings.sessionTimeout]}
              onValueChange={([value]) => updateSecuritySetting('sessionTimeout', value)}
              max={1440} // 24 hours
              min={15}
              step={15}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Concurrent Sessions: {settings.maxConcurrentSessions}</Label>
            <Slider
              value={[settings.maxConcurrentSessions]}
              onValueChange={([value]) => updateSecuritySetting('maxConcurrentSessions', value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Require Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Force all users to enable 2FA
              </p>
            </div>
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => updateSecuritySetting('twoFactorRequired', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Device Trust Duration: {settings.deviceTrustDuration} days</Label>
            <Slider
              value={[settings.deviceTrustDuration]}
              onValueChange={([value]) => updateSecuritySetting('deviceTrustDuration', value)}
              max={90}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelisting */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                IP Whitelisting
              </CardTitle>
              <CardDescription>
                Restrict access to specific IP addresses or ranges.
              </CardDescription>
            </div>
            <Dialog open={showAddIpDialog} onOpenChange={setShowAddIpDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add IP Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add IP Address</DialogTitle>
                  <DialogDescription>
                    Enter an IP address or CIDR range to whitelist.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Address or Range</Label>
                    <Input
                      id="ipAddress"
                      placeholder="192.168.1.0/24 or 203.0.113.45"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddIpAddress} className="w-full">
                    Add IP Address
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settings.ipWhitelist.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <code className="text-sm">{ip}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveIpAddress(ip)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {settings.ipWhitelist.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No IP addresses whitelisted. All IPs are allowed.
              </p>
            )}
          </div>
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
            Manage devices that are trusted for faster authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Trusted Since</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trustedDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.deviceType)}
                      <div>
                        <p className="font-medium">{device.deviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {device.browser} on {device.os}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>User {device.userId}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>{new Date(device.trustedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(device.lastSeen).toLocaleDateString()}</TableCell>
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

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Login Attempts
          </CardTitle>
          <CardDescription>
            Monitor recent login attempts and security events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLoginAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{attempt.email}</TableCell>
                  <TableCell>
                    <code className="text-sm">{attempt.ipAddress}</code>
                  </TableCell>
                  <TableCell>{attempt.location}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.success ? "default" : "destructive"}>
                      {attempt.success ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {attempt.failureReason && (
                      <span className="text-sm text-muted-foreground">
                        {attempt.failureReason}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Configure when and how to receive security notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Failed Login Attempts</h4>
              <p className="text-sm text-muted-foreground">
                Alert when multiple failed login attempts are detected
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New Device Login</h4>
              <p className="text-sm text-muted-foreground">
                Alert when login occurs from a new device
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Suspicious IP Activity</h4>
              <p className="text-sm text-muted-foreground">
                Alert when login occurs from suspicious IP addresses
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password Changes</h4>
              <p className="text-sm text-muted-foreground">
                Alert when user passwords are changed
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Permission Changes</h4>
              <p className="text-sm text-muted-foreground">
                Alert when user permissions are modified
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}