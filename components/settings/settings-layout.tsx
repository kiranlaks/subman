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
    label: "User & Account",
    icon: User,
    component: ProfileSettings,
    description: "Profile, security, and account settings"
  },
  {
    id: "admin",
    label: "Admin Management",
    icon: Users,
    component: AdminManagement,
    description: "User management, roles, and organizations",
    requiresPermission: "users.view"
  },
  {
    id: "application",
    label: "Application Settings",
    icon: Settings,
    component: ApplicationSettings,
    description: "General preferences and feature toggles",
    requiresPermission: "settings.view"
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    component: SecuritySettings,
    description: "Password policies and access controls",
    requiresPermission: "settings.edit"
  },
  {
    id: "analytics",
    label: "Analytics & Logs",
    icon: BarChart3,
    component: AnalyticsLogs,
    description: "System monitoring and user activity",
    requiresPermission: "analytics.view"
  },
];

export function SettingsLayout() {
  const [activeSection, setActiveSection] = useState("profile");
  const currentUser = authManager.getCurrentUser();

  // Filter sections based on user permissions
  const availableSections = settingsSections.filter(section => {
    if (!section.requiresPermission) return true;
    return currentUser && authManager.hasPermission(section.requiresPermission);
  });

  const ActiveComponent = availableSections.find(
    (section) => section.id === activeSection
  )?.component || ProfileSettings;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-card border-r min-h-screen">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account and system preferences
            </p>
          </div>

          <nav className="p-4">
            {availableSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start mb-2 h-auto p-4"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-start gap-3 text-left">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* User Info */}
          {currentUser && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser.role.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}