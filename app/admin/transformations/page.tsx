'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Zap, AlertCircle, CheckCircle, X, Upload } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';

type PageScope = 'all' | 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';

interface Transformation {
  _id: string;
  clientName: string;
  beforeImage: string;
  afterImage: string;
  weightLost: string;
  daysToAchieve: string;
  testimonial: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  targetPages?: PageScope[];
  setName?: string;
  featured: boolean;
  isActive: boolean;
  order: number;
}

const initialFormState: Omit<Transformation, '_id'> = {
  clientName: '',
  beforeImage: '',
  afterImage: '',
  weightLost: '',
  daysToAchieve: '',
  testimonial: '',
  page: 'weight-loss',
  targetPages: ['weight-loss'],
  setName: '',
  featured: false,
  isActive: true,
  order: 0,
};

const pageOptions: Array<{ value: PageScope; label: string }> = [
  { value: 'all', label: 'All Pages' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'pcod', label: 'PCOD' },
  { value: 'therapeutic', label: 'Therapeutic' },
  { value: 'wedding', label: 'Wedding' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function slugToLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function TransformationsPage() {
  const { theme } = useTheme();
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isCreateMode = !editingId;

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    try {
      const res = await fetch('/api/transformations');
      const data = await res.json();
      setTransformations(data.transformations || []);
    } catch (error) {
      console.error('Error fetching transformations:', error);
      setMessage({ type: 'error', text: 'Failed to load transformations' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetPage = (page: PageScope) => {
    setFormData((prev) => {
      const current = prev.targetPages || [];

      if (page === 'all') {
        return { ...prev, targetPages: ['all'] };
      }

      let next = current.includes('all') ? [] : [...current];
      if (next.includes(page)) {
        next = next.filter((p) => p !== page);
      } else {
        next.push(page);
      }

      if (next.length === 0) {
        next = ['weight-loss'];
      }

      return { ...prev, targetPages: next };
    });
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBulkFiles(files);
  };

  const uploadImage = async (file: File) => {
    const base64 = await fileToBase64(file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        fileName: file.name.replace(/\.[^.]+$/, ''),
        folder: 'transformations',
        compress: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Upload failed for ${file.name}`);
    }

    return data.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTargets = formData.targetPages && formData.targetPages.length > 0
      ? formData.targetPages
      : ['weight-loss'];

    if (isCreateMode && bulkFiles.length === 0 && !formData.afterImage.trim()) {
      setMessage({ type: 'error', text: 'Please upload at least one transformation image' });
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const updatePayload = {
          id: editingId,
          ...formData,
          clientName: formData.clientName.trim() || 'Transformation',
          weightLost: formData.weightLost.trim() || '0',
          daysToAchieve: formData.daysToAchieve.trim() || '0',
          testimonial: '',
          setName: '',
          targetPages: selectedTargets,
        };

        const res = await fetch('/api/transformations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to update transformation');
        }

        setMessage({ type: 'success', text: 'Transformation updated successfully!' });
      } else {
        let items: Array<Record<string, any>> = [];

        if (bulkFiles.length > 0) {
          const uploadedUrls = await Promise.all(bulkFiles.map((file) => uploadImage(file)));

          items = uploadedUrls.map((url, index) => {
            const file = bulkFiles[index];
            const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();

            return {
              ...formData,
              clientName: cleanName || 'Transformation',
              afterImage: url,
              weightLost: '0',
              daysToAchieve: '0',
              testimonial: '',
              setName: '',
              targetPages: selectedTargets,
            };
          });
        } else {
          items = [
            {
              ...formData,
              clientName: formData.clientName.trim() || 'Transformation',
              weightLost: '0',
              daysToAchieve: '0',
              testimonial: '',
              setName: '',
              targetPages: selectedTargets,
            },
          ];
        }

        const res = await fetch('/api/transformations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create transformations');
        }

        setMessage({
          type: 'success',
          text: bulkFiles.length > 0
            ? `Created ${bulkFiles.length} transformations successfully!`
            : 'Transformation created successfully!',
        });
      }

      await fetchTransformations();
      closeModal();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving transformation:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to save transformation' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transformation?')) return;

    try {
      const res = await fetch(`/api/transformations?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTransformations();
        setMessage({ type: 'success', text: 'Transformation deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete transformation' });
      }
    } catch (error) {
      console.error('Error deleting transformation:', error);
      setMessage({ type: 'error', text: 'Failed to delete transformation' });
    }
  };

  const openEditModal = (item: Transformation) => {
    setEditingId(item._id);
    setBulkFiles([]);
    setFormData({
      clientName: item.clientName,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      weightLost: '0',
      daysToAchieve: '0',
      testimonial: '',
      page: item.page,
      targetPages: item.targetPages && item.targetPages.length > 0 ? item.targetPages : [item.page],
      setName: '',
      featured: item.featured,
      isActive: item.isActive,
      order: item.order,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setBulkFiles([]);
    setFormData(initialFormState);
  };

  const selectedTargetPages = useMemo(() => formData.targetPages || ['weight-loss'], [formData.targetPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading transformations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <Zap className="w-8 h-8 text-emerald-500" />
            Transformation Sliders
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Choose pages and upload one or many images for the slider.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Slider Images
            </Button>
          </DialogTrigger>

          <DialogContent
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} max-w-3xl max-h-[90vh] overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Slider Image' : 'Add Slider Images'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId
                  ? 'Update the image and its target pages.'
                  : 'Upload one or many images. All uploaded images will appear in the same page slider.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Target Pages *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {pageOptions.map((option) => {
                      const checked = selectedTargetPages.includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTargetPage(option.value)}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500">
                    Selecting All Pages will show this transformation everywhere and it will be mixed with page-specific transformations.
                  </p>
                </div>
              </div>

              {isCreateMode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Slider Images (bulk upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkFileChange}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {bulkFiles.length > 0 ? (
                    <div className="rounded-md border p-2 max-h-32 overflow-auto text-xs space-y-1">
                      {bulkFiles.map((file) => (
                        <div key={file.name}>{file.name}</div>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Every uploaded image will become one slide in the same selected page slider.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <ImageUpload
                  label={isCreateMode ? 'Single Slider Image (used when bulk is empty)' : 'Slider Image'}
                  folder="transformations"
                  value={formData.afterImage}
                  onChange={(url) => setFormData({ ...formData, afterImage: url })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {saving ? 'Saving...' : editingId ? 'Update' : bulkFiles.length > 0 ? `Create ${bulkFiles.length} Slides` : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      {transformations.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <Zap className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No transformations found. Add your first transformation!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transformations.map((transformation) => {
            const pages = transformation.targetPages && transformation.targetPages.length > 0
              ? transformation.targetPages
              : [transformation.page];

            return (
              <Card
                key={transformation._id}
                className={`${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                    : 'bg-white border-slate-200 hover:border-emerald-500'
                } transition-colors overflow-hidden flex flex-col`}
              >
                <div className="relative h-40 overflow-hidden bg-slate-900">
                  {transformation.afterImage && (
                    <div
                      className="relative overflow-hidden cursor-pointer group h-full"
                      onClick={() => setLightboxImage(transformation.afterImage)}
                    >
                      <img
                        src={transformation.afterImage}
                        alt="Transformation"
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <span className="text-white text-xs font-medium">Click to View</span>
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Slider Image
                      </CardTitle>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="md"
                        variant="outline"
                        onClick={() => openEditModal(transformation)}
                        className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="md"
                        variant="outline"
                        onClick={() => handleDelete(transformation._id)}
                        className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {pages.map((page) => (
                      <span key={`${transformation._id}-${page}`} className="text-[10px] rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
                        {page === 'all' ? 'All Pages' : slugToLabel(page)}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-2">
                  {transformation.testimonial && (
                    <p className={`text-sm line-clamp-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {transformation.testimonial}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Full size" className="w-full h-full object-contain max-h-[90vh]" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
