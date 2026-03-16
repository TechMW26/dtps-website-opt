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
import { Plus, Edit, Trash2, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';

interface Recognition {
  _id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  page: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormState: Omit<Recognition, '_id'> = {
  title: 'Image',
  issuer: '',
  date: new Date().toISOString().split('T')[0],
  description: 'Recognition image',
  image: '',
  page: 'home',
  isFeatured: false,
  isActive: true,
};

export default function RecognitionPage() {
  const { theme } = useTheme();
  const [recognition, setRecognition] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRecognition();
  }, []);

  const fetchRecognition = async () => {
    try {
      const res = await fetch('/api/recognitions');
      const data = await res.json();
      setRecognition(data.recognition || []);
    } catch (error) {
      console.error('Error fetching recognition:', error);
      setMessage({ type: 'error', text: 'Failed to load recognition items' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/recognitions';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchRecognition();
        closeModal();
        setMessage({
          type: 'success',
          text: editingId ? 'Recognition updated successfully!' : 'Recognition created successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save recognition' });
      }
    } catch (error) {
      console.error('Error saving recognition:', error);
      setMessage({ type: 'error', text: 'Failed to save recognition' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recognition?')) return;

    try {
      const res = await fetch(`/api/recognitions?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchRecognition();
        setMessage({ type: 'success', text: 'Recognition deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete recognition' });
      }
    } catch (error) {
      console.error('Error deleting recognition:', error);
      setMessage({ type: 'error', text: 'Failed to delete recognition' });
    }
  };

  const openEditModal = (item: Recognition) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      issuer: item.issuer,
      date: item.date,
      description: item.description,
      image: item.image,
      page: item.page,
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
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading recognition items...</p>
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
            <Award className="w-8 h-8 text-emerald-500" />
            Recognition & Awards
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Manage your certifications and achievements
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Recognition
            </Button>
          </DialogTrigger>

          <DialogContent className={`${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          } max-w-2xl`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Recognition' : 'Add New Recognition'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId ? 'Update the recognition details' : 'Fill in the recognition details'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <ImageUpload
                  label="Recognition Image"
                  folder="recognition"
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

      {/* Recognition Cards */}
      {recognition.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <Award className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No recognition items found. Add your first recognition!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recognition.map((item) => (
            <Card key={item._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-500'
            } transition-colors overflow-hidden flex flex-col`}>
              {item.image && (
                <div className={`h-32 overflow-hidden ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                      {item.title}
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                      {item.issuer}
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => openEditModal(item)}
                      className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => handleDelete(item._id)}
                      className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={theme === 'dark' ? 'border-slate-600 text-slate-400' : ''}>
                    {new Date(item.date).toLocaleDateString()}
                  </Badge>
                  {item.isFeatured && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Featured
                    </Badge>
                  )}
                  {!item.isActive && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className={`text-sm line-clamp-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
