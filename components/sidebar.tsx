'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardView } from '@/types/dashboard-view';

import {
  LayoutDashboard,
  BarChart3,
  Users,
  Calendar,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Target,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const mainNavItems: Array<{ id: DashboardView; label: string; icon: LucideIcon }> = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'subscriptions',
    label: 'Subscription',
    icon: Users
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    id: 'expiry',
    label: 'Expiry',
    icon: Calendar
  },
  {
    id: 'renewed',
    label: 'Renewed',
    icon: RefreshCw
  },
  {
    id: 'expired',
    label: 'Expired',
    icon: AlertTriangle
  },
  {
    id: 'import',
    label: 'Import Data',
    icon: Upload
  }
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-gray-50 dark:bg-gray-900/50 transition-all duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">SubMan Inc.</span>
          </div>



          {/* Main Navigation */}
          <nav className="space-y-1 mb-8 mt-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-9 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-normal",
                    isActive && "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  )}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>



          {/* Bottom Section */}
          <div className="mt-auto space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-9 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-normal",
                activeView === 'settings' && "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
              )}
              onClick={() => {
                onViewChange('settings');
                setIsMobileOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-3" />
              <span>Settings</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-normal"
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              <span>Get Help</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 font-normal"
            >
              <Search className="h-4 w-4 mr-3" />
              <span>Search</span>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 px-3 py-3 mt-4 rounded-md bg-white dark:bg-gray-800">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  CN
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">shadcn</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">m@example.com</div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for main content */}
      <div className="w-64" />
    </>
  );
}
