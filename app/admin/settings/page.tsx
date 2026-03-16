'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Moon, Sun, Settings, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleThemeChange = () => {
    toggleTheme();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <Settings className="w-8 h-8 text-emerald-500" />
          Admin Settings
        </h1>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-2`}>
          Manage your admin panel preferences and account settings
        </p>
      </div>

      {/* Theme Settings Card */}
      <Card className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <Moon className="w-5 h-5 text-emerald-500" />
            Theme Settings
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Choose between dark and light mode for your admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Theme */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Current Theme
            </p>
            <p className={`text-2xl font-bold mt-2 capitalize flex items-center gap-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {theme === 'dark' ? (
                <>
                  <Moon className="w-6 h-6" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-6 h-6" />
                  Light Mode
                </>
              )}
            </p>
          </div>

          {/* Theme Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Mode Preview */}
            <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'border-emerald-500 bg-slate-700/30' 
                : 'border-slate-300 hover:border-slate-400'
            }`} onClick={theme === 'light' ? handleThemeChange : undefined}>
              <div className="flex items-center justify-between mb-3">
                <p className={`font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </p>
                {theme === 'dark' && (
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">Active</span>
                )}
              </div>
              <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                <div className="h-3 bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Easy on the eyes during low-light conditions
              </p>
            </div>

            {/* Light Mode Preview */}
            <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'light' 
                ? 'border-emerald-500 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400'
            }`} onClick={theme === 'dark' ? handleThemeChange : undefined}>
              <div className="flex items-center justify-between mb-3">
                <p className={`font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </p>
                {theme === 'light' && (
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">Active</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2 border border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Bright and clear interface for daytime use
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleThemeChange}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                Switch to Dark Mode
              </>
            )}
          </button>

          {/* Success Message */}
          {saved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-600 text-sm font-medium">Theme preference saved!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings Card */}
      <Card className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <Shield className="w-5 h-5 text-emerald-500" />
            Account Information
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Your admin account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Admin Name
            </p>
            <p className={`text-lg font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {session?.user?.name || 'Not set'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Email Address
            </p>
            <p className={`text-lg font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {session?.user?.email || 'Not set'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Role
            </p>
            <p className={`text-lg font-semibold mt-1 capitalize flex items-center gap-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <Shield className="w-4 h-4" />
              Superadmin
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support Card */}
      <Card className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
            Need Help?
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            If you need assistance with your admin panel, please contact the administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Admin Panel v1.0 • Last updated: January 22, 2026
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
