'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface Pricing {
  _id: string;
  planName: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationLabel: string;
  features: PricingFeature[];
  badge: string;
  badgeColor: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  category: 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans';
  popular: boolean;
  isActive: boolean;
}

const initialFormState: Omit<Pricing, '_id'> = {
  planName: '',
  price: 0,
  originalPrice: 0,
  duration: '1 month',
  durationLabel: 'monthly',
  features: [],
  badge: '',
  badgeColor: '',
  page: 'weight-loss',
  category: 'weight-loss',
  popular: false,
  isActive: true,
};

export default function PricingPage() {
  const { theme } = useTheme();
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      setPricing(data.pricing || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setMessage({ type: 'error', text: 'Failed to load pricing plans' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planName || formData.price === 0 || formData.originalPrice === 0) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setSaving(true);

    try {
      const url = '/api/pricing';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchPricing();
        closeModal();
        setMessage({
          type: 'success',
          text: editingId ? 'Plan updated successfully!' : 'Plan created successfully!',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save plan' });
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      setMessage({ type: 'error', text: 'Failed to save plan' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      const res = await fetch(`/api/pricing?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchPricing();
        setMessage({ type: 'success', text: 'Plan deleted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete plan' });
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      setMessage({ type: 'error', text: 'Failed to delete plan' });
    }
  };

  const openEditModal = (item: Pricing) => {
    setEditingId(item._id);
    setFormData({
      planName: item.planName,
      price: item.price,
      originalPrice: item.originalPrice,
      duration: item.duration,
      durationLabel: item.durationLabel,
      features: item.features,
      badge: item.badge,
      badgeColor: item.badgeColor,
      page: item.page,
      category: item.category,
      popular: item.popular,
      isActive: item.isActive,
    });
    setFeatureInput('');
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFeatureInput('');
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, { text: featureInput.trim(), included: true }],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh]`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Loading pricing plans...</p>
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
            <DollarSign className="w-8 h-8 text-emerald-500" />
            Pricing Plans
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Manage your service pricing and packages
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Plan
            </Button>
          </DialogTrigger>

          <DialogContent className={`${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          } max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {editingId ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {editingId ? 'Update the plan details below' : 'Fill in the plan details below'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Plan Name *
                  </Label>
                  <Input
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    placeholder="e.g., Starter, Premium"
                    required
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Badge Label
                  </Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Popular, Saving"
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Price *
                  </Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="999"
                    required
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Original Price *
                  </Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                    placeholder="1999"
                    required
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Duration Label
                  </Label>
                  <Input
                    value={formData.durationLabel}
                    onChange={(e) => setFormData({ ...formData, durationLabel: e.target.value })}
                    placeholder="e.g., monthly, quarterly, yearly"
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Duration *
                  </Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 1 month, 3 months, 1 year"
                    required
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Page
                  </Label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="pcod">PCOD</option>
                    <option value="therapeutic">Therapeutic</option>
                    <option value="wedding">Wedding</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    Category *
                  </Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    required
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">Select a category</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="pcod">PCOD</option>
                    <option value="new-wedding-plan">New Wedding Plan</option>
                    <option value="therapeutic-diet-plans">Therapeutic Diet Plans</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                  Add Features
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="e.g., 8 hours of chat support"
                    className={theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
                  />
                  <Button type="button" onClick={addFeature} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    Add
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 rounded border ${
                        theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                          ✓ {feature.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-2 cursor-pointer ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded"
                  />
                  Mark as Popular
                </label>

                <label className={`flex items-center gap-2 cursor-pointer ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active
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

      {/* Pricing Cards */}
      {pricing.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}>
          <CardContent className="pt-12 pb-12 text-center">
            <DollarSign className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`} />
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              No pricing plans found. Create your first plan!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricing.map((plan) => (
            <Card key={plan._id} className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 hover:border-emerald-500'
            } transition-all duration-300 flex flex-col relative ${plan.popular ? (theme === 'dark' ? 'ring-2 ring-emerald-500/50 scale-105' : 'ring-2 ring-emerald-500') : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 shadow-lg">
                    Popular
                  </Badge>
                </div>
              )}

              {plan.badge && (
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className={plan.popular ? 'pt-8' : ''}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                    {plan.planName}
                  </CardTitle>
                  {plan.category && (
                    <Badge className={`text-xs whitespace-nowrap ${
                      plan.category === 'weight-loss' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                      plan.category === 'pcod' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                      plan.category === 'new-wedding-plan' ? 'bg-pink-500/20 text-pink-700 dark:text-pink-400' :
                      'bg-green-500/20 text-green-700 dark:text-green-400'
                    }`}>
                      {plan.category === 'weight-loss' ? '⚖️ Weight Loss' :
                       plan.category === 'pcod' ? '🏥 PCOD' :
                       plan.category === 'new-wedding-plan' ? '💍 Wedding' :
                       '🏋️ Therapeutic'}
                    </Badge>
                  )}
                </div>
                <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  {plan.durationLabel}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      ₹{plan.price}
                    </span>
                    {plan.originalPrice > plan.price && (
                      <span className={`text-lg line-through ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {plan.duration}
                  </p>
                </div>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className={`text-sm flex items-start gap-3 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <span className={`text-lg flex-shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}`}>
                        ●
                      </span>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-2 border-t border-slate-700">
                  <Button className={`w-full font-semibold py-2 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white' 
                      : theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}>
                    BUY NOW
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(plan)}
                      className={`flex-1 ${theme === 'dark' ? 'border-slate-600 text-slate-400 hover:text-slate-300' : ''}`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(plan._id)}
                      className={`flex-1 ${theme === 'dark' ? 'border-red-600 text-red-400 hover:text-red-300' : 'border-red-300 text-red-600 hover:text-red-700'}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {!plan.isActive && (
                  <div className="text-center">
                    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">
                      Inactive
                    </Badge>
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
