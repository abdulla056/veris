"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  Moon,
  Sun,
  Check,
  Building2,
} from "lucide-react";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    regulatory: true,
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content with Scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Page Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your account and application preferences
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <CardDescription>
                    Your personal information and company details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="PayNet Digital Sdn Bhd" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="compliance@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="Compliance Officer" disabled />
                  </div>
                  <Button className="mt-2">Save Changes</Button>
                </CardContent>
              </Card>

              {/* Organization Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>Organization</CardTitle>
                  </div>
                  <CardDescription>
                    Company registration and licensing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-number">Registration Number</Label>
                    <Input id="reg-number" placeholder="202001012345" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">BNM License Type</Label>
                    <Input id="license" placeholder="E-Money Issuer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Malaysia</span>
                      <Badge variant="secondary">BNM Regulated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how you receive alerts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive compliance alerts via email</p>
                    </div>
                    <Button
                      variant={notifications.email ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
                    >
                      {notifications.email ? <Check className="h-4 w-4" /> : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Browser notifications for urgent alerts</p>
                    </div>
                    <Button
                      variant={notifications.push ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
                    >
                      {notifications.push ? <Check className="h-4 w-4" /> : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Regulatory Updates</p>
                      <p className="text-xs text-muted-foreground">Get notified when BNM updates regulations</p>
                    </div>
                    <Button
                      variant={notifications.regulatory ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifications(n => ({ ...n, regulatory: !n.regulatory }))}
                    >
                      {notifications.regulatory ? <Check className="h-4 w-4" /> : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Use dark theme for the interface</p>
                    </div>
                    <Button
                      variant={isDarkMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your security settings and access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Badge variant="secondary">Enabled via Clerk</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Session Timeout</p>
                      <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                    <span className="text-sm text-muted-foreground">30 minutes</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* API & Integrations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle>API & Integrations</CardTitle>
                  </div>
                  <CardDescription>
                    Manage API keys and external connections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Convex Database</p>
                      <p className="text-xs text-muted-foreground">Real-time data storage</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Claude AI</p>
                      <p className="text-xs text-muted-foreground">Document analysis engine</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">BNM Data Feed</p>
                      <p className="text-xs text-muted-foreground">Regulatory updates</p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export All Data</p>
                    <p className="text-xs text-muted-foreground">Download all your compliance data</p>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

