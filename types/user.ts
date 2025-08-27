export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  department?: string;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastPasswordChange?: string;
  loginAttempts?: number;
  lockedUntil?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  resource: string;
  action: string;
}

export type PermissionCategory = 
  | 'dashboard'
  | 'subscriptions'
  | 'analytics'
  | 'users'
  | 'settings'
  | 'exports'
  | 'imports'
  | 'reports';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: string;
    refreshInterval: number;
  };
}

// Security & Session Types
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: 'google' | 'microsoft' | 'github' | 'apple';
  providerAccountId: string;
  email: string;
  connectedAt: string;
  isActive: boolean;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // last N passwords
  };
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  ipWhitelist: string[];
  twoFactorRequired: boolean;
  deviceTrustDuration: number; // days
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
  location?: string;
}

// Application Settings Types
export interface ApplicationSettings {
  general: {
    organizationName: string;
    organizationLogo?: string;
    defaultTimezone: string;
    defaultLanguage: string;
    defaultCurrency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableExports: boolean;
    enableImports: boolean;
    enableApiAccess: boolean;
    enableMobileApp: boolean;
    enableIntegrations: boolean;
  };
  dataRetention: {
    logRetentionDays: number;
    auditLogRetentionDays: number;
    sessionRetentionDays: number;
    autoDeleteInactiveUsers: boolean;
    inactiveUserThresholdDays: number;
  };
  backup: {
    autoBackupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupRetentionCount: number;
    includeUserData: boolean;
    includeSystemLogs: boolean;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

// Organization & Multi-tenant Types
export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  settings: ApplicationSettings;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  subscriptionPlan: string;
  maxUsers: number;
  currentUsers: number;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  trustedAt: string;
  lastSeen: string;
  isActive: boolean;
}

// Analytics & Reporting Types
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  timestamp: string;
  duration?: number;
  ipAddress: string;
}

export interface SystemHealth {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  lastUpdated: string;
}