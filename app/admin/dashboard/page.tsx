'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Users, FileText, Award, TrendingUp, Eye, Zap } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 190 },
  { name: 'Jun', value: 239 },
];

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    testimonials: 0,
    blogs: 0,
    recognitions: 0,
    pricing: 0,
    successStories: 0,
    transformations: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [testimonials, blogs, recognitions, pricing, successStories, transformations] = await Promise.all([
        fetch('/api/testimonials').then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/recognitions').then(r => r.json()),
        fetch('/api/pricing').then(r => r.json()),
        fetch('/api/success-stories').then(r => r.json()),
        fetch('/api/transformations').then(r => r.json()),
      ]);

      const totalViews = blogs.blogs?.reduce((acc: number, blog: any) => acc + (blog.views || 0), 0) || 0;

      setStats({
        testimonials: testimonials.testimonials?.length || 0,
        blogs: blogs.blogs?.length || 0,
        recognitions: recognitions.recognitions?.length || 0,
        pricing: pricing.pricing?.length || 0,
        successStories: successStories.successStories?.length || 0,
        transformations: transformations.transformations?.length || 0,
        totalViews,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    description,
    trend,
  }: {
    icon: any;
    title: string;
    value: number;
    description: string;
    trend?: string;
  }) => (
    <Card className={`transition-colors border-2 ${
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
        : 'bg-white border-slate-200 hover:border-emerald-500'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
        }`}>{title}</CardTitle>
        <Icon className="h-4 w-4 text-emerald-500" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>{value}</div>
        <p className={`text-xs mt-1 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>{description}</p>
        {trend && (
          <Badge className={`mt-2 ${
            theme === 'dark'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh]`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>Dashboard</h1>
        <p className={`mt-1 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>Welcome to your admin panel. Manage your website content here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          title="Testimonials"
          value={stats.testimonials}
          description="Customer testimonials"
          trend="+5 this month"
        />
        <StatCard
          icon={FileText}
          title="Blog Posts"
          value={stats.blogs}
          description="Published articles"
          trend="+2 this month"
        />
        <StatCard
          icon={Award}
          title="Recognitions"
          value={stats.recognitions}
          description="Awards & certifications"
          trend="Active"
        />
        <StatCard
          icon={TrendingUp}
          title="Pricing Plans"
          value={stats.pricing}
          description="Active plans"
          trend="All active"
        />
        <StatCard
          icon={Users}
          title="Success Stories"
          value={stats.successStories}
          description="Client stories"
          trend="+3 this month"
        />
        <StatCard
          icon={TrendingUp}
          title="Transformations"
          value={stats.transformations}
          description="Before/after"
          trend="+4 this month"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Line Chart */}
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Blog Views Over Time</CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Content Performance</CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Total Views and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total Views */}
        <Card className={`bg-gradient-to-br ${
          theme === 'dark'
            ? 'from-emerald-900/20 to-slate-800 border-emerald-500/30'
            : 'from-emerald-50 to-white border-emerald-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              <Eye className="w-5 h-5 text-emerald-500" />
              Total Blog Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>{stats.totalViews.toLocaleString()}</div>
            <p className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>Across all blog posts</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {[
                { label: 'Write New Blog', href: '/admin/blogs', icon: '📝' },
                { label: 'Add Testimonial', href: '/admin/testimonials', icon: '⭐' },
                { label: 'Update Pricing', href: '/admin/pricing', icon: '💰' },
                { label: 'Add Recognition', href: '/admin/recognition', icon: '🏆' },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors border ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600 hover:border-emerald-500'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections Info */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Managed Sections</CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Dynamic content areas across your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { page: '/weight-loss', items: 'Testimonials, Pricing, Success Stories, Transformations' },
              { page: '/pcod', items: 'Pricing, Success Stories' },
              { page: '/plans/wedding', items: 'Pricing, Transformations' },
              { page: '/plans/therapeutic', items: 'Success Stories, Pricing' },
              { page: '/blog', items: 'All Blog Posts' },
              { page: 'Home Page', items: 'Testimonials, Recognition' },
            ].map((section) => (
              <div key={section.page} className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`font-semibold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}>{section.page}</h4>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>{section.items}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
