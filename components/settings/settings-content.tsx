"use client";

import { useState } from "react";
import { 
  User, 
  Settings, 
  Users,
  Shield,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authManager } from "@/lib/auth";

// Import all settings sections
import { ProfileSettings } from "./sections/profile-settings";
import { AdminManagement } from "./sections/admin-management";
import { ApplicationSettings } from "./sections/application-settings";
import { SecuritySettings } from "./sections/security-settings";
import { AnalyticsLogs } from "./sections/analytics-logs";

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    fullLabel: "User & Account",
    icon: User,
    component: ProfileSettings,
    description: "Profile, security, and account settings"
  },
  {
    id: "admin",
    label: "Admin",
    fullLabel: "Admin Management",
    icon: Users,
    component: AdminManagement,
    description: "User management, roles, and organizations",
    requiresPermission: "users.view"
  },
  {
    id: "application",
    label: "App",
    fullLabel: "Application Settings",
    icon: Settings,
    component: ApplicationSettings,
    description: "General preferences and feature toggles",
    requiresPermission: "settings.view"
  },
  {
    id: "security",
    label: "Security",
    fullLabel: "Security Settings",
    icon: Shield,
    component: SecuritySettings,
    description: "Password policies and access controls",
    requiresPermission: "settings.edit"
  },
  {
    id: "analytics",
    label: "Analytics",
    fullLabel: "Analytics & Logs",
    icon: BarChart3,
    component: AnalyticsLogs,
    description: "System monitoring and user activity",
    requiresPermission: "analytics.view"
  },
];

export function SettingsContent() {
  const [activeSection, setActiveSection] = useState("profile");
  const currentUser = authManager.getCurrentUser();

  // Filter sections based on user permissions
  const availableSections = settingsSections.filter(section => {
    if (!section.requiresPermission) return true;
    return currentUser && authManager.hasPermission(section.requiresPermission);
  });

  const activeTabData = availableSections.find(section => section.id === activeSection);

  return (
    <div className="space-y-6">
      {/* User Role Badge */}
      {currentUser && (
        <div className="flex justify-end">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Logged in as {currentUser.role.name}
          </Badge>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className={`grid w-full mb-6 ${
          availableSections.length <= 3 ? 'grid-cols-3' : 
          availableSections.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {availableSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Settings Content */}
        {availableSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-0">
            <div className="min-h-[600px]">
              <section.component />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}