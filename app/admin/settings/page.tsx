'use client';

import { useSession } from 'next-auth/react';
import { Settings, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
          <Settings className="w-8 h-8 text-emerald-500" />
          Admin Settings
        </h1>
        <p className="text-slate-600 mt-2">
          Manage your admin panel account details and fixed interface preferences
        </p>
      </div>

      {/* Interface Settings Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-emerald-500" />
            Interface Settings
          </CardTitle>
          <CardDescription className="text-slate-600">
            The admin panel now uses a fixed light theme for a consistent editing experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-700">
              Theme Mode
            </p>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              Light Mode Only
            </p>
            <p className="text-sm mt-2 text-slate-600">
              Theme switching has been removed from the admin panel so all pages keep the same white visual language.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Shield className="w-5 h-5 text-emerald-500" />
            Account Information
          </CardTitle>
          <CardDescription className="text-slate-600">
            Your admin account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm font-medium text-slate-600">
              Admin Name
            </p>
            <p className="text-lg font-semibold mt-1 text-slate-900">
              {session?.user?.name || 'Not set'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm font-medium text-slate-600">
              Email Address
            </p>
            <p className="text-lg font-semibold mt-1 text-slate-900">
              {session?.user?.email || 'Not set'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm font-medium text-slate-600">
              Role
            </p>
            <p className="text-lg font-semibold mt-1 capitalize flex items-center gap-2 text-emerald-600">
              <Shield className="w-4 h-4" />
              Superadmin
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Need Help?
          </CardTitle>
          <CardDescription className="text-slate-600">
            If you need assistance with your admin panel, please contact the administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Admin Panel v1.0 • Last updated: January 22, 2026
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
