'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Image as ImageIcon, AlertCircle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import ImageUpload from '@/components/admin/ImageUpload';
import { getPricingByCategory, type Pricing } from '@/lib/api';

interface PlanBanner {
  _id: string;
  planId: string;
  planName: string;
  title: string;
  image: string;
  mobileImage?: string;
  link?: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  isActive: boolean;
  order: number;
}

type PageType = 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';

interface FormState {
  planId: string;
  planName: string;
  page: PageType;
  title: string;
  image: string;
  mobileImage: string;
  link: string;
  isActive: boolean;
  order: number;
}

const initialFormState: FormState = {
  planId: '',
  planName: '',
  page: 'weight-loss',
  title: '',
  image: '',
  mobileImage: '',
  link: '',
  isActive: true,
  order: 0,
};

const pageOptions = [
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'pcod', label: 'PCOD' },
  { value: 'therapeutic', label: 'Therapeutic' },
  { value: 'wedding', label: 'Wedding' },
];

export default function PlanBannersPage() {
  const { theme } = useTheme();
  const [banners, setBanners] = useState<PlanBanner[]>([]);
  const [plans, setPlans] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
    fetchPlans();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/plan-banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Error fetching plan banners:', error);
      setMessage({ type: 'error', text: 'Failed to load plan banners' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const categories = ['weight-loss', 'pcod', 'therapeutic-diet-plans', 'new-wedding-plan'] as const;
      let allPlans: Pricing[] = [];

      for (const category of categories) {
        try {
          const categoryPlans = await getPricingByCategory(category);
          allPlans = [...allPlans, ...categoryPlans];
        } catch (error) {
          console.error(`Error fetching plans for ${category}:`, error);
        }
      }

      setPlans(allPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const categoryToPage: Record<string, PageType> = {
      'weight-loss': 'weight-loss',
      'pcod': 'pcod',
      'therapeutic-diet-plans': 'therapeutic',
      'new-wedding-plan': 'wedding',
    };
    return categoryToPage[plan.category || ''] === formData.page;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image.trim()) {
      setMessage({ type: 'error', text: 'Please upload an image' });
      return;
    }

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }

    if (!formData.planId) {
      setMessage({ type: 'error', text: 'Please select a plan' });
      return;
    }

    setSaving(true);

    try {
      const url = '/api/plan-banners';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save banner');
      }

      const data = await res.json();
      setMessage({ 
        type: 'success', 
        text: editingId 
          ? 'Banner updated!' 
          : data.message || 'Banner created! (Previous banner deleted if existed)'
      });
      setOpen(false);
      setFormData(initialFormState);
      setEditingId(null);
      fetchBanners();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/plan-banners?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete banner');
      setMessage({ type: 'success', text: 'Banner deleted!' });
      fetchBanners();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete banner' });
    }
  };

  const toggleActive = async (banner: PlanBanner) => {
    try {
      const res = await fetch('/api/plan-banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner._id, isActive: !banner.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update banner');
      setMessage({ type: 'success', text: `Banner ${!banner.isActive ? 'activated' : 'deactivated'}!` });
      fetchBanners();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update banner status' });
    }
  };

  const openEditModal = (banner: PlanBanner) => {
    setFormData({
      planId: banner.planId,
      planName: banner.planName,
      page: banner.page,
      title: banner.title,
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      link: banner.link || '',
      isActive: banner.isActive,
      order: banner.order,
    });
    setEditingId(banner._id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Plan Banners
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage banners for each pricing plan (One banner per plan)
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData(initialFormState);
                setEditingId(null);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>

          <DialogContent className={`${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          } max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Plan Banner' : 'Add Plan Banner'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId 
                  ? `Update banner for: ${formData.planName}` 
                  : 'Add a new banner to a specific plan (Old banner will be replaced)'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Page Selection */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Page
                </label>
                <select
                  value={formData.page}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      page: e.target.value as PageType,
                      planId: '',
                      planName: ''
                    });
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {pageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Plan
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => {
                    const selectedPlan = filteredPlans.find(p => p._id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      planId: e.target.value,
                      planName: selectedPlan?.planName || ''
                    });
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">-- Select a plan --</option>
                  {filteredPlans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} (₹{plan.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Plan Info */}
              {formData.planName && (
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  <p className="text-sm">
                    <strong>Selected Plan:</strong> {pageOptions.find(p => p.value === formData.page)?.label} → {formData.planName}
                  </p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Banner Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Special Offer"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUpload
                  label="Banner Image"
                  folder="plan-banners"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>

              {/* Link (optional) */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Link (optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g., /checkout"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
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
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banners List */}
      {banners.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No plan banners found. Add your first banner!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white border-slate-200'
            } overflow-hidden`}>
              {/* Image */}
              <div 
                className="relative h-40 overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => setLightboxImage(banner.image)}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
                {/* Active/Inactive Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className={`text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {banner.title}
                </CardTitle>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {pageOptions.find(p => p.value === banner.page)?.label} • {banner.planName}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  {/* Toggle Active Button */}
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => toggleActive(banner)}
                    className={`flex-1 ${
                      banner.isActive
                        ? theme === 'dark' 
                          ? 'border-orange-600 text-orange-400 hover:bg-orange-500/10' 
                          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                        : theme === 'dark'
                          ? 'border-emerald-600 text-emerald-400 hover:bg-emerald-500/10'
                          : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>

                  {/* Edit Button */}
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => openEditModal(banner)}
                    className={theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  {/* Delete Button */}
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleDelete(banner._id)}
                    className={theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Full size"
              className="w-full h-full object-contain max-h-[90vh]"
            />
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
