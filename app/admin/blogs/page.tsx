'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Newspaper, AlertCircle, CheckCircle, Eye, X, Sparkles, BarChart3, Search, Clock, ImageIcon, Hash, User, Globe } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

const BLOG_AUTHORS = [
  'Priya Sharma', 'Meera Patel', 'Ananya Gupta', 'Kavita Singh', 'Nisha Verma',
  'Ritu Agarwal', 'Sunita Reddy', 'Deepa Joshi', 'Pooja Mehta', 'Shalini Nair',
  'Aditi Kapoor', 'Neha Malhotra', 'Swati Tiwari', 'Anjali Deshmukh', 'Divya Iyer',
];
function randomAuthor() { return BLOG_AUTHORS[Math.floor(Math.random() * BLOG_AUTHORS.length)]; }

// ── SEO Helper Functions ──
function wordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function readingTime(html: string): number {
  const wc = wordCount(html);
  return Math.max(1, Math.ceil(wc / 200));
}

function headingCount(html: string): number {
  const matches = html.match(/<h[1-6][^>]*>/gi);
  return matches ? matches.length : 0;
}

function seoScore(form: typeof initialFormState): {
  score: number;
  color: string;
  barColor: string;
  tips: string[];
} {
  let score = 0;
  const tips: string[] = [];

  if (form.title.length >= 40 && form.title.length <= 60) { score += 25; }
  else if (form.title.length > 0) { score += 15; tips.push('Title should be 40-60 characters for best SEO'); }
  else { tips.push('Add a blog title'); }

  if (form.description.length >= 120 && form.description.length <= 160) { score += 20; }
  else if (form.description.length > 0) { score += 10; tips.push('Meta description should be 120-160 characters'); }
  else { tips.push('Add a meta description for search results'); }

  if (form.featuredImage) { score += 15; }
  else { tips.push('Add a featured image for social sharing'); }

  if (form.tags.length >= 2) { score += 15; }
  else if (form.tags.length > 0) { score += 8; tips.push('Add at least 2 tags for better discoverability'); }
  else { tips.push('Add tags to help readers find your content'); }

  const wc = wordCount(form.content);
  if (wc >= 600) { score += 15; }
  else if (wc > 0) { score += 5; tips.push(`Content is short (${wc} words). Aim for 600+ words for good SEO`); }
  else { tips.push('Start writing your blog content'); }

  if (form.excerpt) { score += 5; }
  if (form.slug) { score += 5; }

  if (score >= 80) return { score, color: 'text-emerald-500', barColor: 'bg-emerald-500', tips };
  if (score >= 50) return { score, color: 'text-amber-500', barColor: 'bg-amber-500', tips };
  return { score, color: 'text-red-400', barColor: 'bg-red-400', tips };
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

const initialFormState: Omit<Blog, '_id' | 'createdAt'> = {
  title: '',
  slug: '',
  excerpt: '',
  description: '',
  content: '',
  featuredImage: '',
  author: randomAuthor(),
  category: 'Health & Nutrition',
  tags: [],
  views: 0,
  published: false,
  featured: false,
};

export default function BlogsPage() {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setMessage({ type: 'error', text: 'Failed to load blogs' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Content is required' });
      return;
    }

    setSaving(true);

    try {
      const url = '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchBlogs();
        closeModal();
        setMessage({
          type: 'success',
          text: editingId ? 'Blog updated successfully!' : 'Blog created successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save blog' });
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setMessage({ type: 'error', text: 'Failed to save blog' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchBlogs();
        setMessage({ type: 'success', text: 'Blog deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete blog' });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setMessage({ type: 'error', text: 'Failed to delete blog' });
    }
  };

  const openEditModal = (blog: Blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      description: blog.description || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      author: blog.author || randomAuthor(),
      category: blog.category || 'Health & Nutrition',
      tags: blog.tags || [],
      views: blog.views || 0,
      published: blog.published ?? false,
      featured: blog.featured ?? false,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setTagInput('');
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh]`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            <Newspaper className="w-8 h-8 text-emerald-500" />
            Blog Posts
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Manage your blog articles and content
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Write Blog
            </Button>
          </DialogTrigger>

          <DialogContent 
            className={`${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-gray-50 border-slate-200'
            } !w-screen !h-screen !max-w-none !max-h-screen !rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0 overflow-hidden flex flex-col p-0`}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* ── Sticky Header ── */}
            <div className={`sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-4">
                <DialogClose asChild>
                  <button className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-slate-500'
                  }`}>
                    <X className="w-5 h-5" />
                  </button>
                </DialogClose>
                <div>
                  <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h2>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {editingId ? 'Update and optimize your content' : 'Write and optimize your content for search'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={closeModal} size="sm">
                  Cancel
                </Button>
                <button
                  type="submit"
                  form="blog-editor-form"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </div>

            {/* ── Two-Column Body ── */}
            <form id="blog-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
              {/* ── LEFT: Main Editor (65%) ── */}
              <div className="w-[65%] overflow-y-auto p-6 space-y-5 border-r ${
                theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
              }">
                {/* Featured Image */}
                <div className="space-y-2">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <ImageIcon className="w-3.5 h-3.5" /> Featured Image
                  </label>
                  <ImageUpload
                    label="Upload Featured Image"
                    folder="blogs"
                    value={formData.featuredImage}
                    onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                  />
                  {formData.featuredImage && (
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 mt-2"
                      onClick={() => setLightboxImage(formData.featuredImage)}
                    />
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Title *
                    </label>
                    <span className={`text-xs ${formData.title.length > 60 ? 'text-amber-500' : formData.title.length >= 40 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {formData.title.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter a compelling blog title"
                    className={`w-full px-4 py-2.5 rounded-lg border text-base font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Globe className="w-3.5 h-3.5" /> Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className={`w-full px-4 py-2 rounded-lg border text-sm font-mono ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-600 text-slate-400'
                        : 'bg-gray-100 border-slate-300 text-slate-500'
                    } cursor-not-allowed`}
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Excerpt
                    </label>
                    <span className={`text-xs ${(formData.excerpt?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {formData.excerpt?.length || 0}/160
                    </span>
                  </div>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary shown in blog listings and search results"
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                  />
                </div>

                {/* Description (meta) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Meta Description
                    </label>
                    <span className={`text-xs ${(formData.description?.length || 0) > 160 ? 'text-amber-500' : (formData.description?.length || 0) >= 120 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {formData.description?.length || 0}/160
                    </span>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="SEO meta description — shown in Google search results"
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                  />
                </div>

                {/* Content (Rich Text) */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Content * (Rich Text)
                    </label>
                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {wordCount(formData.content)} words · {readingTime(formData.content)} min read
                    </span>
                  </div>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    size="lg"
                  />
                </div>
              </div>

              {/* ── RIGHT: SEO & Settings Sidebar (35%) ── */}
              <div className={`w-[35%] overflow-y-auto p-6 space-y-5 ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'
              }`}>
                {/* SEO Score */}
                <div className={`p-4 rounded-xl border ${seoScore(formData).color} border-current/20`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4" />
                    <span className="text-sm font-semibold">SEO Score</span>
                    <span className="ml-auto text-lg font-bold">{seoScore(formData).score}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-current/10 mb-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${seoScore(formData).barColor}`} style={{ width: `${seoScore(formData).score}%` }} />
                  </div>
                  <ul className="space-y-1 text-xs">
                    {seoScore(formData).tips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SERP Preview */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Globe className="w-3.5 h-3.5" /> Google Preview
                  </label>
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-900' : 'border-slate-200 bg-gray-50'}`}>
                    <p className="text-xs text-blue-600 truncate">www.dtpoonamsagar.com › blog › {formData.slug || '...'}</p>
                    <p className="text-sm font-medium text-blue-700 truncate mt-0.5">
                      {formData.title || 'Blog Title'} | Dietitian Poonam Sagar
                    </p>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {formData.description || formData.excerpt || 'Meta description will appear here...'}
                    </p>
                  </div>
                </div>

                {/* Content Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-gray-50'}`}>
                    <p className="text-xs text-slate-500">Words</p>
                    <p className="text-lg font-bold">{wordCount(formData.content)}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-gray-50'}`}>
                    <p className="text-xs text-slate-500">Reading Time</p>
                    <p className="text-lg font-bold">{readingTime(formData.content)} min</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-gray-50'}`}>
                    <p className="text-xs text-slate-500">Headings</p>
                    <p className="text-lg font-bold">{headingCount(formData.content)}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-gray-50'}`}>
                    <p className="text-xs text-slate-500">Has Image</p>
                    <p className="text-lg font-bold">{formData.featuredImage ? '✅' : '❌'}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  >
                    <option>Health & Nutrition</option>
                    <option>Weight Loss</option>
                    <option>PCOD Management</option>
                    <option>Wellness</option>
                    <option>Fitness</option>
                    <option>Recipes</option>
                    <option>Tips & Tricks</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Hash className="w-3.5 h-3.5" /> Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer text-xs"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <User className="w-3.5 h-3.5" /> Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>

                {/* Publish Settings */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  theme === 'dark' ? 'border-slate-600' : 'border-slate-200'
                }`}>
                  <h4 className="text-sm font-semibold">Publish Settings</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      Publish immediately
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      Mark as featured
                    </span>
                  </label>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border ${
          message.type === 'success'
            ? theme === 'dark'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <Newspaper className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No blogs found. Start writing your first blog post!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <Card key={blog._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-500'
            } transition-colors`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {blog.featuredImage && (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-75"
                      onClick={() => setLightboxImage(blog.featuredImage)}
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          {blog.title}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          By {blog.author || 'Unknown'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="md"
                          variant="outline"
                          onClick={() => openEditModal(blog)}
                          className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="md"
                          variant="outline"
                          onClick={() => handleDelete(blog._id)}
                          className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 line-clamp-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {blog.description || blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className={theme === 'dark' ? 'border-slate-600 text-slate-400' : ''}>
                          {blog.category}
                        </Badge>
                        {blog.published && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                            Published
                          </Badge>
                        )}
                        {blog.featured && (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className={`flex items-center gap-1 text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <Eye className="w-4 h-4" />
                        {blog.views} views
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={lightboxImage}
              alt="Blog Featured Image"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
