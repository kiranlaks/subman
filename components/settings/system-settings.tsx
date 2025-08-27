'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { authManager } from '@/lib/auth';
import { toastManager } from '@/components/ui/toast';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowRegistration: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    expiryAlerts: boolean;
    systemAlerts: boolean;
    alertDaysBefore: number;
  };
  database: {
    backupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
    compressionEnabled: boolean;
  };
  appearance: {
    defaultTheme: string;
    allowThemeChange: boolean;
    customLogo: string;
    primaryColor: string;
    accentColor: string;
  };
  integrations: {
    apiEnabled: boolean;
    webhooksEnabled: boolean;
    exportFormats: string[];
    maxExportRecords: number;
  };
}

const defaultConfig: SystemConfig = {
  general: {
    siteName: 'SubMan Dashboard',
    siteDescription: 'Subscription Management System',
    adminEmail: 'admin@subman.com',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    language: 'en'
  },
  security: {
    sessionTimeout: 480, // 8 hours in minutes
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowRegistration: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30 // minutes
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    expiryAlerts: true,
    systemAlerts: true,
    alertDaysBefore: 30
  },
  database: {
    backupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    compressionEnabled: true
  },
  appearance: {
    defaultTheme: 'light',
    allowThemeChange: true,
    customLogo: '',
    primaryColor: '#3b82f6',
    accentColor: '#10b981'
  },
  integrations: {
    apiEnabled: true,
    webhooksEnabled: false,
    exportFormats: ['xlsx', 'csv', 'pdf'],
    maxExportRecords: 10000
  }
};

export function SystemSettings() {
  const [config, setConfig] = useLocalStorage<SystemConfig>('system-config', defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    api: 'healthy',
    notifications: 'healthy',
    storage: 'healthy'
  });

  const currentUser = authManager.getCurrentUser();
  const canManageSettings = authManager.canManageSettings();
  const isAdmin = authManager.isAdmin();

  useEffect(() => {
    // Simulate loading system status
    setLastBackup(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }, []);

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!canManageSettings) return;
    
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!canManageSettings) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toastManager.show({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toastManager.show({
        title: 'Save Failed',
        description: 'Failed to save system settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackup = async () => {
    if (!isAdmin) return;
    
    try {
      // Simulate backup process
      toastManager.show({
        title: 'Backup Started',
        description: 'Database backup is in progress...',
        variant: 'default'
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastBackup(new Date().toISOString());
      toastManager.show({
        title: 'Backup Complete',
        description: 'Database backup completed successfully',
        variant: 'success'
      });
    } catch (error) {
      toastManager.show({
        title: 'Backup Failed',
        description: 'Failed to create database backup',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <div key={service} className="flex items-center gap-3 p-3 border rounded-lg">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(status)}`} />
                  <div>
                    <div className="font-medium capitalize">{service}</div>
                    <div className={`text-sm capitalize ${getStatusColor(status)}`}>{status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config.general.siteName}
                    onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={config.general.adminEmail}
                    onChange={(e) => updateConfig('general', 'adminEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={config.general.siteDescription}
                  onChange={(e) => updateConfig('general', 'siteDescription', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={config.general.timezone} onValueChange={(value) => updateConfig('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={config.general.dateFormat} onValueChange={(value) => updateConfig('general', 'dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={config.general.language} onValueChange={(value) => updateConfig('general', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={config.security.lockoutDuration}
                    onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                  </div>
                  <Switch
                    id="requireTwoFactor"
                    checked={config.security.requireTwoFactor}
                    onCheckedChange={(checked) => updateConfig('security', 'requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={config.security.allowRegistration}
                    onCheckedChange={(checked) => updateConfig('security', 'allowRegistration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailEnabled">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailEnabled"
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'emailEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsEnabled">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsEnabled"
                    checked={config.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'smsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushEnabled">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="pushEnabled"
                    checked={config.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'pushEnabled', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="expiryAlerts">Expiry Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when subscriptions are expiring</p>
                  </div>
                  <Switch
                    id="expiryAlerts"
                    checked={config.notifications.expiryAlerts}
                    onCheckedChange={(checked) => updateConfig('notifications', 'expiryAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert for system events and errors</p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={config.notifications.systemAlerts}
                    onCheckedChange={(checked) => updateConfig('notifications', 'systemAlerts', checked)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="alertDaysBefore">Alert Days Before Expiry</Label>
                  <Input
                    id="alertDaysBefore"
                    type="number"
                    value={config.notifications.alertDaysBefore}
                    onChange={(e) => updateConfig('notifications', 'alertDaysBefore', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupEnabled">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic database backups</p>
                </div>
                <Switch
                  id="backupEnabled"
                  checked={config.database.backupEnabled}
                  onCheckedChange={(checked) => updateConfig('database', 'backupEnabled', checked)}
                />
              </div>
              
              {config.database.backupEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={config.database.backupFrequency} onValueChange={(value) => updateConfig('database', 'backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="retentionDays">Retention Days</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={config.database.retentionDays}
                      onChange={(e) => updateConfig('database', 'retentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compressionEnabled">Backup Compression</Label>
                  <p className="text-sm text-muted-foreground">Compress backup files to save space</p>
                </div>
                <Switch
                  id="compressionEnabled"
                  checked={config.database.compressionEnabled}
                  onCheckedChange={(checked) => updateConfig('database', 'compressionEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label>Last Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    {lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}
                  </p>
                </div>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button onClick={handleBackup} className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Create Backup Now
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Backup
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Restore Backup
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select value={config.appearance.defaultTheme} onValueChange={(value) => updateConfig('appearance', 'defaultTheme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowThemeChange">Allow Theme Change</Label>
                    <p className="text-sm text-muted-foreground">Let users change their theme</p>
                  </div>
                  <Switch
                    id="allowThemeChange"
                    checked={config.appearance.allowThemeChange}
                    onCheckedChange={(checked) => updateConfig('appearance', 'allowThemeChange', checked)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) => updateConfig('appearance', 'primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.appearance.primaryColor}
                      onChange={(e) => updateConfig('appearance', 'primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={config.appearance.accentColor}
                      onChange={(e) => updateConfig('appearance', 'accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.appearance.accentColor}
                      onChange={(e) => updateConfig('appearance', 'accentColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="customLogo">Custom Logo URL</Label>
                <Input
                  id="customLogo"
                  value={config.appearance.customLogo}
                  onChange={(e) => updateConfig('appearance', 'customLogo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="apiEnabled">API Access</Label>
                    <p className="text-sm text-muted-foreground">Enable REST API access</p>
                  </div>
                  <Switch
                    id="apiEnabled"
                    checked={config.integrations.apiEnabled}
                    onCheckedChange={(checked) => updateConfig('integrations', 'apiEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="webhooksEnabled">Webhooks</Label>
                    <p className="text-sm text-muted-foreground">Enable webhook notifications</p>
                  </div>
                  <Switch
                    id="webhooksEnabled"
                    checked={config.integrations.webhooksEnabled}
                    onCheckedChange={(checked) => updateConfig('integrations', 'webhooksEnabled', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="maxExportRecords">Max Export Records</Label>
                <Input
                  id="maxExportRecords"
                  type="number"
                  value={config.integrations.maxExportRecords}
                  onChange={(e) => updateConfig('integrations', 'maxExportRecords', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              
              <div>
                <Label>Export Formats</Label>
                <div className="flex gap-2 mt-2">
                  {['xlsx', 'csv', 'pdf', 'json'].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={format}
                        checked={config.integrations.exportFormats.includes(format)}
                        onChange={(e) => {
                          const formats = e.target.checked
                            ? [...config.integrations.exportFormats, format]
                            : config.integrations.exportFormats.filter(f => f !== format);
                          updateConfig('integrations', 'exportFormats', formats);
                        }}
                      />
                      <Label htmlFor={format} className="uppercase">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}