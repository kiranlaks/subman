import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserActivity, LoginAttempt, SystemHealth } from '@/types/user';
import { 
  Activity, 
  BarChart3, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react';

export function AnalyticsLogs() {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');

  // Mock data for demonstration
  const userActivities: UserActivity[] = [
    {
      id: '1',
      userId: '1',
      action: 'subscription.created',
      resource: 'subscriptions',
      metadata: { subscriptionId: 'sub_123', name: 'Office 365' },
      timestamp: '2024-01-15T14:30:00Z',
      duration: 1200,
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      userId: '2',
      action: 'dashboard.viewed',
      resource: 'dashboard',
      metadata: { view: 'analytics' },
      timestamp: '2024-01-15T14:25:00Z',
      duration: 45000,
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      userId: '1',
      action: 'user.updated',
      resource: 'users',
      metadata: { targetUserId: '3', changes: ['role'] },
      timestamp: '2024-01-15T14:20:00Z',
      duration: 800,
      ipAddress: '192.168.1.100'
    },
    {
      id: '4',
      userId: '3',
      action: 'export.generated',
      resource: 'exports',
      metadata: { format: 'csv', records: 150 },
      timestamp: '2024-01-15T14:15:00Z',
      duration: 3200,
      ipAddress: '192.168.1.102'
    }
  ];

  const loginHistory: LoginAttempt[] = [
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
    },
    {
      id: '4',
      email: 'test@malicious.com',
      ipAddress: '198.51.100.10',
      userAgent: 'curl/7.68.0',
      success: false,
      failureReason: 'Account not found',
      timestamp: '2024-01-15T11:30:00Z',
      location: 'Unknown'
    }
  ];

  const errorLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T14:35:00Z',
      level: 'error',
      message: 'Database connection timeout',
      source: 'database',
      userId: null,
      stackTrace: 'Error: Connection timeout\n  at Database.connect...'
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:20:00Z',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system',
      userId: null,
      stackTrace: null
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:10:00Z',
      level: 'error',
      message: 'Failed to send notification email',
      source: 'notifications',
      userId: '2',
      stackTrace: 'Error: SMTP connection failed...'
    }
  ];

  const systemHealth: SystemHealth = {
    uptime: 99.98,
    memoryUsage: 68.5,
    cpuUsage: 23.7,
    diskUsage: 45.2,
    activeUsers: 12,
    totalRequests: 15420,
    errorRate: 0.02,
    lastUpdated: '2024-01-15T14:45:00Z'
  };

  const subscriptionInsights = {
    totalSubscriptions: 1247,
    activeSubscriptions: 1089,
    expiringSoon: 23,
    expired: 135,
    renewalRate: 87.3,
    averageValue: 156.78,
    monthlyRecurring: 89234.56,
    churnRate: 2.1
  };

  const filteredActivities = userActivities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activityFilter === 'all' || activity.resource === activityFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLoginHistory = loginHistory.filter(attempt => {
    const matchesSearch = attempt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.ipAddress.includes(searchTerm);
    return matchesSearch;
  });

  const filteredErrorLogs = errorLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = logFilter === 'all' || log.level === logFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'activity':
        data = filteredActivities;
        filename = `user-activity-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'logins':
        data = filteredLoginHistory;
        filename = `login-history-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'errors':
        data = filteredErrorLogs;
        filename = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
        break;
      default:
        alert('Unknown export type');
        return;
    }
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    try {
      // Create export object with metadata
      const exportObject = {
        exportType: type,
        exportedAt: new Date().toISOString(),
        dateRange: selectedDateRange,
        totalRecords: data.length,
        data: data
      };
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`${type} data exported successfully (${data.length} records)`);
    } catch (error) {
      alert('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Insights</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Real-time system performance and health metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold">{systemHealth.uptime}%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <p className="text-2xl font-bold">{systemHealth.cpuUsage}%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <p className="text-2xl font-bold">{systemHealth.memoryUsage}%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <p className="text-2xl font-bold">{systemHealth.diskUsage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <p className="text-2xl font-bold mt-2">{systemHealth.activeUsers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Requests</span>
                </div>
                <p className="text-2xl font-bold mt-2">{systemHealth.totalRequests.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Error Rate</span>
                </div>
                <p className="text-2xl font-bold mt-2">{systemHealth.errorRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Last Updated</span>
                </div>
                <p className="text-sm mt-2">{new Date(systemHealth.lastUpdated).toLocaleTimeString()}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor user actions and system interactions.
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportData('activity')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="exports">Exports</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-32">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last Day</SelectItem>
                    <SelectItem value="7d">Last Week</SelectItem>
                    <SelectItem value="30d">Last Month</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>User {activity.userId}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {activity.action}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        {activity.duration ? formatDuration(activity.duration) : '-'}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{activity.ipAddress}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History */}
        <TabsContent value="logins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Login History
                  </CardTitle>
                  <CardDescription>
                    Track login attempts and authentication events.
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportData('logins')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-32">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last Day</SelectItem>
                    <SelectItem value="7d">Last Week</SelectItem>
                    <SelectItem value="30d">Last Month</SelectItem>
                    <SelectItem value="90d">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Login Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoginHistory.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{attempt.email}</TableCell>
                      <TableCell>
                        <code className="text-sm">{attempt.ipAddress}</code>
                      </TableCell>
                      <TableCell>{attempt.location}</TableCell>
                      <TableCell className="max-w-48 truncate">{attempt.userAgent}</TableCell>
                      <TableCell>
                        <Badge variant={attempt.success ? "default" : "destructive"}>
                          {attempt.success ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Success</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Failed</>
                          )}
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
        </TabsContent>

        {/* Error Logs */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Error Logs
                  </CardTitle>
                  <CardDescription>
                    System errors, warnings, and diagnostic information.
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportData('errors')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Logs Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getLogLevelColor(log.level) as any}>
                          {log.level.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell className="max-w-96 truncate">{log.message}</TableCell>
                      <TableCell>{log.userId ? `User ${log.userId}` : 'System'}</TableCell>
                      <TableCell>
                        {log.stackTrace && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Error Details</DialogTitle>
                                <DialogDescription>
                                  Full error message and stack trace
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Message</Label>
                                  <p className="text-sm mt-1">{log.message}</p>
                                </div>
                                <div>
                                  <Label>Stack Trace</Label>
                                  <pre className="text-xs bg-muted p-4 rounded mt-1 overflow-auto max-h-64">
                                    {log.stackTrace}
                                  </pre>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Insights */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Subscriptions</span>
                </div>
                <p className="text-2xl font-bold mt-2">{subscriptionInsights.totalSubscriptions.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold mt-2">{subscriptionInsights.activeSubscriptions.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Expiring Soon</span>
                </div>
                <p className="text-2xl font-bold mt-2">{subscriptionInsights.expiringSoon}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Expired</span>
                </div>
                <p className="text-2xl font-bold mt-2">{subscriptionInsights.expired}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Recurring Revenue</span>
                  <span className="text-lg font-bold">${subscriptionInsights.monthlyRecurring.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Subscription Value</span>
                  <span className="text-lg font-bold">${subscriptionInsights.averageValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Renewal Rate</span>
                  <span className="text-lg font-bold text-green-600">{subscriptionInsights.renewalRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Churn Rate</span>
                  <span className="text-lg font-bold text-red-600">{subscriptionInsights.churnRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Subscription Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                  <div className="h-32 bg-muted rounded flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Subscription Growth Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}