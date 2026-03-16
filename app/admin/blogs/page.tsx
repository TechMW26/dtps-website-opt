'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Newspaper, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

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
  author: 'DTPS Admin',
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
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      description: blog.description,
      content: blog.content,
      featuredImage: blog.featuredImage,
      author: blog.author,
      category: blog.category,
      tags: blog.tags,
      views: blog.views,
      published: blog.published,
      featured: blog.featured,
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
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            } max-w-4xl max-h-[90vh] overflow-y-auto`}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId ? 'Update the blog details below' : 'Fill in the blog details below'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Featured Image */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Featured Image
                </label>
                <ImageUpload
                  label="Upload Featured Image"
                  folder="blogs"
                  value={formData.featuredImage}
                  onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                />
                {formData.featuredImage && (
                  <div className="mt-2">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-75"
                      onClick={() => setLightboxImage(formData.featuredImage)}
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog title"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* Slug (Auto-generated) */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-slate-400'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  } cursor-not-allowed`}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of the blog post (for SEO and listings)"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the blog"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                />
              </div>

              {/* Content (Rich Text) */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Content * (Rich Text)
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
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
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  <Button type="button" onClick={handleAddTag} className="bg-emerald-500 hover:bg-emerald-600">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
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
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded"
                  />
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Publish this blog
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded"
                  />
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Mark as featured
                  </span>
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
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
