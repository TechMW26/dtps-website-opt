'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, AlertCircle, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin-setup');
      const data = await res.json();
      setAdminExists(data.adminExists);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminExists(true); // Default to login if check fails
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create admin');
      } else {
        setSetupSuccess(true);
        setEmail('');
        setPassword('');
        setName('');
        setTimeout(() => {
          setIsSetup(false);
          setAdminExists(true);
          setSetupSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Loading State */}
      {adminExists === null && (
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm relative z-10">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center flex-col gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300">Checking admin status...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Card (First Admin) */}
      {adminExists === false && !isSetup && (
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">Welcome to DTPS Admin</CardTitle>
            <CardDescription className="text-center text-slate-300">
              Create your first admin account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <button
              onClick={() => setIsSetup(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Create First Admin Account
            </button>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-xs text-slate-400">
                © 2026 Dietitian Poonam Sagar. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Form */}
      {adminExists === false && isSetup && (
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">Create Admin Account</CardTitle>
            <CardDescription className="text-center text-slate-300">
              Set up your superadmin account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {setupSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-emerald-400">Admin created successfully! Redirecting to login...</p>
              </div>
            )}

            {error && !setupSuccess && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSetup} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dtpoonamsagar.com"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password (min 8 characters)
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || setupSuccess}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Admin'}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setIsSetup(false)}
                disabled={loading}
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                Back
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-xs text-slate-400">
                © 2026 Dietitian Poonam Sagar. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Card */}
      {adminExists === true && (
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                DP
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">DTPS Admin</CardTitle>
            <CardDescription className="text-center text-slate-300">
              Sign in to manage your website content
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dtpoonamsagar.com"
                  required
                  autoComplete="email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-xs text-slate-400">
                © 2026 Dietitian Poonam Sagar. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}