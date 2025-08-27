import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ApplicationSettings as AppSettings, ApiKey, WebhookConfig } from '@/types/user';
import {
    Settings,
    Globe,
    Palette,
    ToggleLeft,
    Key,
    Webhook,
    Database,
    Shield,
    Download,
    Upload,
    Calendar,
    Clock,
    DollarSign,
    Languages,
    Building,
    Camera,
    Plus,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    AlertTriangle,
    Save,
    RotateCcw
} from 'lucide-react';

export function ApplicationSettings() {
    const [settings, setSettings] = useState<AppSettings>({
        general: {
            organizationName: 'Acme Corporation',
            organizationLogo: undefined,
            defaultTimezone: 'America/New_York',
            defaultLanguage: 'en',
            defaultCurrency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h'
        },
        features: {
            enableAnalytics: true,
            enableNotifications: true,
            enableExports: true,
            enableImports: true,
            enableApiAccess: true,
            enableMobileApp: false,
            enableIntegrations: true
        },
        dataRetention: {
            logRetentionDays: 90,
            auditLogRetentionDays: 365,
            sessionRetentionDays: 30,
            autoDeleteInactiveUsers: false,
            inactiveUserThresholdDays: 180
        },
        backup: {
            autoBackupEnabled: true,
            backupFrequency: 'daily',
            backupRetentionCount: 7,
            includeUserData: true,
            includeSystemLogs: false
        }
    });

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Production API',
            key: 'sk_live_1234567890abcdef',
            permissions: ['read', 'write'],
            createdAt: '2024-01-01T00:00:00Z',
            lastUsed: '2024-01-15T10:30:00Z',
            isActive: true
        },
        {
            id: '2',
            name: 'Analytics Integration',
            key: 'sk_test_abcdef1234567890',
            permissions: ['read'],
            createdAt: '2024-01-10T00:00:00Z',
            isActive: true
        }
    ]);

    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
        {
            id: '1',
            name: 'Subscription Updates',
            url: 'https://api.example.com/webhooks/subscriptions',
            events: ['subscription.created', 'subscription.updated', 'subscription.expired'],
            secret: 'whsec_1234567890abcdef',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            lastTriggered: '2024-01-15T09:15:00Z'
        }
    ]);

    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [showWebhookDialog, setShowWebhookDialog] = useState(false);
    const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
    const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

    const timezones = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney'
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese' }
    ];

    const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'
    ];

    const updateGeneralSetting = (key: keyof AppSettings['general'], value: any) => {
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev.general,
                [key]: value
            }
        }));
    };

    const updateFeatureSetting = (key: keyof AppSettings['features'], value: boolean) => {
        setSettings(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [key]: value
            }
        }));
    };

    const updateDataRetentionSetting = (key: keyof AppSettings['dataRetention'], value: any) => {
        setSettings(prev => ({
            ...prev,
            dataRetention: {
                ...prev.dataRetention,
                [key]: value
            }
        }));
    };

    const updateBackupSetting = (key: keyof AppSettings['backup'], value: any) => {
        setSettings(prev => ({
            ...prev,
            backup: {
                ...prev.backup,
                [key]: value
            }
        }));
    };

    const handleLogoUpload = () => {
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

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const logoUrl = e.target?.result as string;
                    updateGeneralSetting('organizationLogo', logoUrl);
                    alert('Logo uploaded successfully');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSaveSettings = () => {
        try {
            // In a real app, this would save to a backend API
            localStorage.setItem('applicationSettings', JSON.stringify(settings));
            alert('Settings saved successfully');
        } catch (error) {
            alert('Failed to save settings');
            console.error('Error saving settings:', error);
        }
    };

    const handleResetSettings = () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            // Reset to default settings
            const defaultSettings: AppSettings = {
                general: {
                    organizationName: 'My Organization',
                    organizationLogo: undefined,
                    defaultTimezone: 'America/New_York',
                    defaultLanguage: 'en',
                    defaultCurrency: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                    timeFormat: '12h'
                },
                features: {
                    enableAnalytics: true,
                    enableNotifications: true,
                    enableExports: true,
                    enableImports: true,
                    enableApiAccess: false,
                    enableMobileApp: false,
                    enableIntegrations: true
                },
                dataRetention: {
                    logRetentionDays: 90,
                    auditLogRetentionDays: 365,
                    sessionRetentionDays: 30,
                    autoDeleteInactiveUsers: false,
                    inactiveUserThresholdDays: 180
                },
                backup: {
                    autoBackupEnabled: false,
                    backupFrequency: 'weekly',
                    backupRetentionCount: 5,
                    includeUserData: true,
                    includeSystemLogs: false
                }
            };

            setSettings(defaultSettings);
            localStorage.removeItem('applicationSettings');
            alert('Settings reset to defaults');
        }
    };

    const handleCreateApiKey = () => {
        setSelectedApiKey(null);
        setShowApiKeyDialog(true);
    };

    const handleEditApiKey = (apiKey: ApiKey) => {
        setSelectedApiKey(apiKey);
        setShowApiKeyDialog(true);
    };

    const handleDeleteApiKey = (keyId: string) => {
        const keyToDelete = apiKeys.find(k => k.id === keyId);
        if (!keyToDelete) return;

        if (confirm(`Are you sure you want to delete the API key "${keyToDelete.name}"? This action cannot be undone and will immediately revoke access for any applications using this key.`)) {
            setApiKeys(prev => prev.filter(key => key.id !== keyId));
            alert('API key deleted successfully');
        }
    };

    const handleSaveApiKey = (keyData: { name: string; permissions: string[] }) => {
        if (!keyData.name.trim()) {
            alert('API key name is required');
            return;
        }

        if (keyData.permissions.length === 0) {
            alert('At least one permission must be selected');
            return;
        }

        if (selectedApiKey) {
            // Update existing key
            setApiKeys(prev => prev.map(key =>
                key.id === selectedApiKey.id
                    ? { ...key, name: keyData.name, permissions: keyData.permissions }
                    : key
            ));
            alert('API key updated successfully');
        } else {
            // Create new key
            const newKey: ApiKey = {
                id: Date.now().toString(),
                name: keyData.name,
                key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                permissions: keyData.permissions,
                createdAt: new Date().toISOString(),
                isActive: true
            };
            setApiKeys(prev => [...prev, newKey]);
            alert('API key created successfully');
        }
        setShowApiKeyDialog(false);
    };

    const handleCreateWebhook = () => {
        setSelectedWebhook(null);
        setShowWebhookDialog(true);
    };

    const handleEditWebhook = (webhook: WebhookConfig) => {
        setSelectedWebhook(webhook);
        setShowWebhookDialog(true);
    };

    const handleDeleteWebhook = (webhookId: string) => {
        const webhookToDelete = webhooks.find(w => w.id === webhookId);
        if (!webhookToDelete) return;

        if (confirm(`Are you sure you want to delete the webhook "${webhookToDelete.name}"? This will stop sending events to ${webhookToDelete.url}.`)) {
            setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
            alert('Webhook deleted successfully');
        }
    };

    const handleSaveWebhook = (webhookData: { name: string; url: string; events: string[] }) => {
        if (!webhookData.name.trim()) {
            alert('Webhook name is required');
            return;
        }

        if (!webhookData.url.trim()) {
            alert('Webhook URL is required');
            return;
        }

        // Basic URL validation
        try {
            new URL(webhookData.url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        if (webhookData.events.length === 0) {
            alert('At least one event must be selected');
            return;
        }

        if (selectedWebhook) {
            // Update existing webhook
            setWebhooks(prev => prev.map(webhook =>
                webhook.id === selectedWebhook.id
                    ? {
                        ...webhook,
                        name: webhookData.name,
                        url: webhookData.url,
                        events: webhookData.events
                    }
                    : webhook
            ));
            alert('Webhook updated successfully');
        } else {
            // Create new webhook
            const newWebhook: WebhookConfig = {
                id: Date.now().toString(),
                name: webhookData.name,
                url: webhookData.url,
                events: webhookData.events,
                secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            setWebhooks(prev => [...prev, newWebhook]);
            alert('Webhook created successfully');
        }
        setShowWebhookDialog(false);
    };

    const toggleApiKeyVisibility = (keyId: string) => {
        setShowApiKey(prev => ({
            ...prev,
            [keyId]: !prev[keyId]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const maskApiKey = (key: string) => {
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    return (
        <>
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

                <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="api">API & Webhooks</TabsTrigger>
                    <TabsTrigger value="data">Data & Backup</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Organization
                            </CardTitle>
                            <CardDescription>
                                Basic organization information and branding.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                                    {settings.general.organizationLogo ? (
                                        <img src={settings.general.organizationLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Camera className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <Button onClick={handleLogoUpload} variant="outline">
                                        Upload Logo
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        PNG, JPG or SVG. Max size 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    value={settings.general.organizationName}
                                    onChange={(e) => updateGeneralSetting('organizationName', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Localization
                            </CardTitle>
                            <CardDescription>
                                Default timezone, language, and regional settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Default Timezone</Label>
                                    <Select
                                        value={settings.general.defaultTimezone}
                                        onValueChange={(value) => updateGeneralSetting('defaultTimezone', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezones.map((tz) => (
                                                <SelectItem key={tz} value={tz}>
                                                    {tz}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language">Default Language</Label>
                                    <Select
                                        value={settings.general.defaultLanguage}
                                        onValueChange={(value) => updateGeneralSetting('defaultLanguage', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map((lang) => (
                                                <SelectItem key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Default Currency</Label>
                                    <Select
                                        value={settings.general.defaultCurrency}
                                        onValueChange={(value) => updateGeneralSetting('defaultCurrency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateFormat">Date Format</Label>
                                    <Select
                                        value={settings.general.dateFormat}
                                        onValueChange={(value) => updateGeneralSetting('dateFormat', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timeFormat">Time Format</Label>
                                    <Select
                                        value={settings.general.timeFormat}
                                        onValueChange={(value) => updateGeneralSetting('timeFormat', value as '12h' | '24h')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12h">12 Hour</SelectItem>
                                            <SelectItem value="24h">24 Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme & Branding
                            </CardTitle>
                            <CardDescription>
                                Customize the appearance and branding of your application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Color Scheme</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted">
                                        <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                                        <p className="text-sm font-medium">Default</p>
                                    </div>
                                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted">
                                        <div className="w-full h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                                        <p className="text-sm font-medium">Nature</p>
                                    </div>
                                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted">
                                        <div className="w-full h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded mb-2"></div>
                                        <p className="text-sm font-medium">Sunset</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Custom Branding</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="primaryColor"
                                                type="color"
                                                value="#3b82f6"
                                                className="w-16 h-10 p-1"
                                            />
                                            <Input value="#3b82f6" className="flex-1" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="secondaryColor"
                                                type="color"
                                                value="#64748b"
                                                className="w-16 h-10 p-1"
                                            />
                                            <Input value="#64748b" className="flex-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feature Toggles */}
                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ToggleLeft className="h-5 w-5" />
                                Feature Toggles
                            </CardTitle>
                            <CardDescription>
                                Enable or disable specific features and modules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(settings.features).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {getFeatureDescription(key)}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={value}
                                        onCheckedChange={(checked) => updateFeatureSetting(key as keyof AppSettings['features'], checked)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API & Webhooks */}
                <TabsContent value="api" className="space-y-6">
                    {/* API Keys */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        API Keys
                                    </CardTitle>
                                    <CardDescription>
                                        Manage API keys for external integrations.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleCreateApiKey}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create API Key
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiKeys.map((apiKey) => (
                                        <TableRow key={apiKey.id}>
                                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm">
                                                        {showApiKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                                                    >
                                                        {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(apiKey.key)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {apiKey.permissions.map((perm) => (
                                                        <Badge key={perm} variant="secondary" className="text-xs">
                                                            {perm}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={apiKey.isActive ? "default" : "destructive"}>
                                                    {apiKey.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditApiKey(apiKey)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteApiKey(apiKey.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Webhooks */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Webhook className="h-5 w-5" />
                                        Webhooks
                                    </CardTitle>
                                    <CardDescription>
                                        Configure webhook endpoints for real-time notifications.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleCreateWebhook}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Webhook
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Events</TableHead>
                                        <TableHead>Last Triggered</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks.map((webhook) => (
                                        <TableRow key={webhook.id}>
                                            <TableCell className="font-medium">{webhook.name}</TableCell>
                                            <TableCell>
                                                <code className="text-sm">{webhook.url}</code>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {webhook.events.slice(0, 2).map((event) => (
                                                        <Badge key={event} variant="outline" className="text-xs">
                                                            {event}
                                                        </Badge>
                                                    ))}
                                                    {webhook.events.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{webhook.events.length - 2} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleDateString() : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={webhook.isActive ? "default" : "destructive"}>
                                                    {webhook.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditWebhook(webhook)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteWebhook(webhook.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

                {/* Data & Backup */}
                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Data Retention
                            </CardTitle>
                            <CardDescription>
                                Configure how long different types of data are kept.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Log Retention: {settings.dataRetention.logRetentionDays} days</Label>
                                    <Slider
                                        value={[settings.dataRetention.logRetentionDays]}
                                        onValueChange={([value]) => updateDataRetentionSetting('logRetentionDays', value)}
                                        max={365}
                                        min={7}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Audit Log Retention: {settings.dataRetention.auditLogRetentionDays} days</Label>
                                    <Slider
                                        value={[settings.dataRetention.auditLogRetentionDays]}
                                        onValueChange={([value]) => updateDataRetentionSetting('auditLogRetentionDays', value)}
                                        max={1095}
                                        min={30}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Session Retention: {settings.dataRetention.sessionRetentionDays} days</Label>
                                    <Slider
                                        value={[settings.dataRetention.sessionRetentionDays]}
                                        onValueChange={([value]) => updateDataRetentionSetting('sessionRetentionDays', value)}
                                        max={90}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Auto-delete Inactive Users</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically remove users who haven't logged in for a specified period
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.dataRetention.autoDeleteInactiveUsers}
                                        onCheckedChange={(checked) => updateDataRetentionSetting('autoDeleteInactiveUsers', checked)}
                                    />
                                </div>

                                {settings.dataRetention.autoDeleteInactiveUsers && (
                                    <div className="space-y-2">
                                        <Label>Inactive Threshold: {settings.dataRetention.inactiveUserThresholdDays} days</Label>
                                        <Slider
                                            value={[settings.dataRetention.inactiveUserThresholdDays]}
                                            onValueChange={([value]) => updateDataRetentionSetting('inactiveUserThresholdDays', value)}
                                            max={365}
                                            min={30}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Backup & Restore
                            </CardTitle>
                            <CardDescription>
                                Configure automatic backups and data recovery options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Automatic Backups</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Enable scheduled backups of your data
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.backup.autoBackupEnabled}
                                    onCheckedChange={(checked) => updateBackupSetting('autoBackupEnabled', checked)}
                                />
                            </div>

                            {settings.backup.autoBackupEnabled && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                                        <Select
                                            value={settings.backup.backupFrequency}
                                            onValueChange={(value) => updateBackupSetting('backupFrequency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Backup Retention: {settings.backup.backupRetentionCount} backups</Label>
                                        <Slider
                                            value={[settings.backup.backupRetentionCount]}
                                            onValueChange={([value]) => updateBackupSetting('backupRetentionCount', value)}
                                            max={30}
                                            min={1}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Include User Data</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Include user profiles and preferences in backups
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.backup.includeUserData}
                                                onCheckedChange={(checked) => updateBackupSetting('includeUserData', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Include System Logs</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Include system and audit logs in backups
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.backup.includeSystemLogs}
                                                onCheckedChange={(checked) => updateBackupSetting('includeSystemLogs', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="flex gap-4">
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Backup
                                </Button>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Restore Backup
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* API Key Dialog */}
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {selectedApiKey ? 'Edit API Key' : 'Create API Key'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedApiKey ? 'Update API key settings' : 'Create a new API key for external integrations'}
                    </DialogDescription>
                </DialogHeader>
                <ApiKeyForm
                    apiKey={selectedApiKey}
                    onSave={handleSaveApiKey}
                    onCancel={() => setShowApiKeyDialog(false)}
                />
            </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {selectedWebhook ? 'Edit Webhook' : 'Create Webhook'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedWebhook ? 'Update webhook configuration' : 'Create a new webhook endpoint'}
                    </DialogDescription>
                </DialogHeader>
                <WebhookForm
                    webhook={selectedWebhook}
                    onSave={handleSaveWebhook}
                    onCancel={() => setShowWebhookDialog(false)}
                />
            </DialogContent>
        </Dialog>
        </>
    );
}

// API Key Form Component
function ApiKeyForm({
    apiKey,
    onSave,
    onCancel
}: {
    apiKey: ApiKey | null;
    onSave: (data: { name: string; permissions: string[] }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(apiKey?.name || '');
    const [permissions, setPermissions] = useState<string[]>(apiKey?.permissions || []);

    const availablePermissions = ['read', 'write', 'admin', 'analytics', 'webhooks'];

    const handleSubmit = () => {
        onSave({ name, permissions });
    };

    const togglePermission = (permission: string) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                    id="keyName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter API key name"
                />
            </div>

            <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                                id={permission}
                                checked={permissions.includes(permission)}
                                onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label htmlFor={permission} className="capitalize">
                                {permission}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                    {apiKey ? 'Update' : 'Create'} API Key
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// Webhook Form Component
function WebhookForm({
    webhook,
    onSave,
    onCancel
}: {
    webhook: WebhookConfig | null;
    onSave: (data: { name: string; url: string; events: string[] }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(webhook?.name || '');
    const [url, setUrl] = useState(webhook?.url || '');
    const [events, setEvents] = useState<string[]>(webhook?.events || []);

    const availableEvents = [
        'user.created',
        'user.updated',
        'user.deleted',
        'subscription.created',
        'subscription.updated',
        'subscription.expired',
        'security.login_failed',
        'security.password_changed'
    ];

    const handleSubmit = () => {
        onSave({ name, url, events });
    };

    const toggleEvent = (event: string) => {
        setEvents(prev =>
            prev.includes(event)
                ? prev.filter(e => e !== event)
                : [...prev, event]
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="webhookName">Webhook Name</Label>
                <Input
                    id="webhookName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter webhook name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                    id="webhookUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/webhooks"
                />
            </div>

            <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {availableEvents.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                            <Checkbox
                                id={event}
                                checked={events.includes(event)}
                                onCheckedChange={() => toggleEvent(event)}
                            />
                            <Label htmlFor={event} className="text-sm">
                                {event}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                    {webhook ? 'Update' : 'Create'} Webhook
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function getFeatureDescription(key: string): string {
    const descriptions: Record<string, string> = {
        enableAnalytics: 'Enable analytics tracking and reporting features',
        enableNotifications: 'Allow system to send notifications to users',
        enableExports: 'Enable data export functionality',
        enableImports: 'Enable data import functionality',
        enableApiAccess: 'Allow external API access to the system',
        enableMobileApp: 'Enable mobile application features',
        enableIntegrations: 'Allow third-party integrations'
    };
    return descriptions[key] || 'Feature toggle description';
}