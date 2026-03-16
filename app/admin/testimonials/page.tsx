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
import { Plus, Edit, Trash2, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
  featured: boolean;
  page: string;
  isActive: boolean;
  order: number;
}

const initialFormState: Omit<Testimonial, '_id'> = {
  name: 'Image',
  role: '',
  content: 'Image testimonial',
  image: '',
  rating: 5,
  featured: false,
  page: 'home',
  isActive: true,
  order: 0,
};

export default function TestimonialsPage() {
  const { theme } = useTheme();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setMessage({ type: 'error', text: 'Failed to load testimonials' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/testimonials';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchTestimonials();
        closeModal();
        setMessage({
          type: 'success',
          text: editingId ? 'Testimonial updated successfully!' : 'Testimonial created successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save testimonial' });
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setMessage({ type: 'error', text: 'Failed to save testimonial' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTestimonials();
        setMessage({ type: 'success', text: 'Testimonial deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete testimonial' });
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setMessage({ type: 'error', text: 'Failed to delete testimonial' });
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingId(testimonial._id);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      image: testimonial.image,
      rating: testimonial.rating,
      featured: testimonial.featured,
      page: testimonial.page,
      isActive: testimonial.isActive,
      order: testimonial.order,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh]`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading testimonials...</p>
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
            <Star className="w-8 h-8 text-emerald-500" />
            Testimonials
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Manage customer testimonials across all pages
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>

          <DialogContent className={`${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          } max-w-2xl`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId ? 'Update the testimonial details below' : 'Fill in the testimonial details below'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <ImageUpload
                  label="Testimonial Image"
                  folder="testimonials"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
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

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <Star className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No testimonials found. Add your first testimonial to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-500'
            } transition-colors`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                      {testimonial.role || 'Client'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => openEditModal(testimonial)}
                      className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => handleDelete(testimonial._id)}
                      className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {testimonial.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div className="flex gap-1">
                    {'⭐'.split('').map((star, i) => (
                      <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-slate-600'}>
                        ⭐
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className={theme === 'dark' ? 'border-slate-600 text-slate-400' : ''}>
                      {testimonial.page}
                    </Badge>
                    {testimonial.featured && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                        Featured
                      </Badge>
                    )}
                    {!testimonial.isActive && (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
