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

interface SuccessStory {
  _id: string;
  clientName: string;
  transformation: string;
  results: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  rating: number;
  testimonial: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormState: Omit<SuccessStory, '_id'> = {
  clientName: 'Image',
  transformation: '',
  results: '',
  beforeImage: '',
  afterImage: '',
  category: 'weight-loss',
  rating: 5,
  testimonial: '',
  isFeatured: false,
  isActive: true,
};

export default function SuccessStoriesPage() {
  const { theme } = useTheme();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/success-stories');
      const data = await res.json();
      setStories(data.successStories || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      setMessage({ type: 'error', text: 'Failed to load success stories' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/success-stories';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchStories();
        closeModal();
        setMessage({
          type: 'success',
          text: editingId ? 'Story updated successfully!' : 'Story created successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save story' });
      }
    } catch (error) {
      console.error('Error saving story:', error);
      setMessage({ type: 'error', text: 'Failed to save story' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;

    try {
      const res = await fetch(`/api/success-stories?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchStories();
        setMessage({ type: 'success', text: 'Story deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete story' });
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      setMessage({ type: 'error', text: 'Failed to delete story' });
    }
  };

  const openEditModal = (item: SuccessStory) => {
    setEditingId(item._id);
    setFormData({
      clientName: item.clientName,
      transformation: item.transformation,
      results: item.results,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      category: item.category,
      rating: item.rating,
      testimonial: item.testimonial,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
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
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading success stories...</p>
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
            Success Stories
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Showcase client transformations and success journeys
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Story
            </Button>
          </DialogTrigger>

          <DialogContent className={`${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          } max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Success Story' : 'Add New Success Story'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId ? 'Update the story details' : 'Fill in the client success story details'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <ImageUpload
                    label="Before Image"
                    folder="success-stories"
                    value={formData.beforeImage}
                    onChange={(url) => setFormData({ ...formData, beforeImage: url })}
                  />
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    label="After Image"
                    folder="success-stories"
                    value={formData.afterImage}
                    onChange={(url) => setFormData({ ...formData, afterImage: url })}
                  />
                </div>
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

      {/* Success Stories Grid */}
      {stories.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <Star className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No success stories found. Add your first success story!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((story) => (
            <Card key={story._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-500'
            } transition-colors overflow-hidden flex flex-col`}>
              {/* Before/After Images */}
              {(story.beforeImage || story.afterImage) && (
                <div className="grid grid-cols-2 gap-2 p-3">
                  {story.beforeImage && (
                    <div className={`h-24 rounded overflow-hidden ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <img
                        src={story.beforeImage}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {story.afterImage && (
                    <div className={`h-24 rounded overflow-hidden ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <img
                        src={story.afterImage}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                      {story.clientName}
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                      {story.transformation}
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => openEditModal(story)}
                      className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => handleDelete(story._id)}
                      className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={theme === 'dark' ? 'border-slate-600 text-slate-400' : ''}>
                    {story.category}
                  </Badge>
                  <div className="flex gap-0.5">
                    {Array.from({ length: story.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  {story.isFeatured && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Featured
                    </Badge>
                  )}
                  {!story.isActive && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-2">
                <div>
                  <p className={`text-xs font-semibold ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Results
                  </p>
                  <p className={`text-sm line-clamp-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {story.results}
                  </p>
                </div>

                {story.testimonial && (
                  <div>
                    <p className={`text-xs font-semibold ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Testimonial
                    </p>
                    <p className={`text-sm line-clamp-2 italic ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      "{story.testimonial}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
