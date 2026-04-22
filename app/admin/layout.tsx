'use client';

import 'react-quill-new/dist/quill.snow.css';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Home,
  DollarSign,
  Newspaper,
  Images,
  LogOut,
  Menu,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  ShoppingCart,
  CreditCard,
  ImageIcon,
  Megaphone,
  LayoutTemplate,
  MessageSquare,
  Award,
  Trophy,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/app/providers/ThemeProvider';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Pricing Plans', href: '/admin/pricing', icon: DollarSign },
  { name: 'Plan Banners', href: '/admin/plan-banners', icon: ImageIcon },
  { name: 'Banners', href: '/admin/banners', icon: Megaphone },
  { name: 'Page Heroes', href: '/admin/page-heroes', icon: LayoutTemplate },
  { name: 'Popups', href: '/admin/popups', icon: MessageSquare },
  { name: 'Transformations', href: '/admin/transformations', icon: Images },
  { name: 'Success Stories', href: '/admin/success-stories', icon: Trophy },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Quote },
  { name: 'Recognition', href: '/admin/recognition', icon: Award },
  { name: 'Blog Posts', href: '/admin/blogs', icon: Newspaper },
  { name: 'Security', href: '/admin/security', icon: ShieldCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  let theme: 'dark' | 'light' = 'dark';
  let toggleTheme: () => void = () => { };

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (e) {
    // Theme provider not available, use defaults
  }

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${theme === 'dark' ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'} border-r`}>
        {/* Logo */}
        <div className={`h-16 flex items-center justify-center border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <Link href="/admin/dashboard" className="flex items-center gap-2 px-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              DP
            </div>
            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>DTPS Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 px-2 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'}`}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${isActive
                    ? `${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-600 border-l-2 border-emerald-500'}`
                    : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`h-16 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'} px-2 py-3`}>
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200/50'}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user.image || ''} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xs">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {session.user.name || 'Admin'}
                    </p>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {session.user.email}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <DropdownMenuItem disabled>
                  <span className="text-xs">{session.user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/admin/settings" className="flex items-center gap-2 w-full">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="text-red-500 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Top Header */}
        <header className={`h-16 border-b ${theme === 'dark' ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900' : 'border-slate-200 bg-gradient-to-r from-white to-slate-50'} px-6 flex items-center justify-between sticky top-0 z-40`}>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className={`p-2 rounded-lg md:hidden ${theme === 'dark' ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}>
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className={`p-0 w-64 ${theme === 'dark' ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-white to-slate-50'}`}>
                <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-white to-slate-50'}`}>
                  {/* Mobile Logo */}
                  <div className={`h-16 flex items-center justify-center border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                        DP
                      </div>
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>DTPS Admin</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className={`flex-1 overflow-y-auto py-4 px-2 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive
                              ? `${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500' : 'bg-emerald-50 text-emerald-600 border-l-2 border-emerald-500'}`
                              : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User */}
                  <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-4`}>
                    {session?.user && (
                      <button
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className={`text-xl font-bold hidden sm:block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Admin Panel
            </h1>
          </div>

          {/* Theme Toggle and User Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu Mobile */}
            <div className="md:hidden">
              {session?.user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={session.user.image || ''} />
                        <AvatarFallback className="bg-emerald-500 text-white text-xs">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                    <DropdownMenuItem disabled>
                      <span className="text-xs">{session.user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/admin/login' })}
                      className="text-red-500"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
