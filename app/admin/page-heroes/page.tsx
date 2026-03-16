'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageHero {
  _id: string;
  page: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
  isActive: boolean;
}

export default function PageHeroesPage() {
  const [heroes, setHeroes] = useState<PageHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<PageHero | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    page: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Buy Plan',
    buttonLink: '/appointment',
    image: '',
    isActive: true,
  });

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const pages = ['weight-loss', 'pcod']; // Add more pages as needed
      const results: PageHero[] = [];

      for (const page of pages) {
        const res = await fetch(`/api/page-heroes?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hero) {
            results.push(data.hero);
          }
        }
      }
      setHeroes(results);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('deviceType', 'desktop');

      const res = await fetch('/api/banner-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      setFormData({ ...formData, image: data.optimizedUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.page || !formData.title || !formData.subtitle || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const url = editingHero ? '/api/page-heroes' : '/api/page-heroes';
      const method = editingHero ? 'PUT' : 'POST';
      const body = editingHero
        ? { ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${editingHero ? 'update' : 'create'} hero`);
      }

      setIsModalOpen(false);
      setEditingHero(null);
      setFormData({
        page: '',
        title: '',
        subtitle: '',
        description: '',
        buttonText: 'Buy Plan',
        buttonLink: '/appointment',
        image: '',
        isActive: true,
      });
      fetchHeroes();
    } catch (error: any) {
      console.error('Error saving hero:', error);
      alert(error.message);
    }
  };

  const handleEdit = (hero: PageHero) => {
    setEditingHero(hero);
    setFormData({
      page: hero.page,
      title: hero.title,
      subtitle: hero.subtitle,
      description: hero.description,
      buttonText: hero.buttonText,
      buttonLink: hero.buttonLink,
      image: hero.image || '',
      isActive: hero.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (page: string) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    try {
      const res = await fetch(`/api/page-heroes?page=${page}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete hero');

      fetchHeroes();
    } catch (error: any) {
      console.error('Error deleting hero:', error);
      alert(error.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHero(null);
    setFormData({
      page: '',
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Buy Plan',
      buttonLink: '/appointment',
      image: '',
      isActive: true,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Page Heroes (Dynamic Hero Sections)</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#014E4E',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Add Hero
        </button>
      </div>

      {loading ? (
        <p>Loading heroes...</p>
      ) : heroes.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '40px', textAlign: 'center' }}>
            <p>No heroes created yet. Click "Add Hero" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {heroes.map((hero) => (
            <Card key={hero._id}>
              <CardHeader>
                <CardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span>{hero.page}</span> - <strong>{hero.title}</strong>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      backgroundColor: hero.isActive ? '#4CAF50' : '#999',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {hero.isActive ? 'Active' : 'Inactive'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Subtitle:</strong> {hero.subtitle}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Description:</strong> {hero.description}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Button:</strong> {hero.buttonText} → {hero.buttonLink}
                </div>
                {hero.image && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Image:</strong>
                    <img
                      src={hero.image}
                      alt="Hero"
                      style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(hero)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#009688',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hero.page)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
          }}
        >
          <Card style={{ width: '100%', maxWidth: '600px', margin: '20px' }}>
            <CardHeader>
              <CardTitle>{editingHero ? 'Edit Hero' : 'Add New Hero'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Page *
                  </label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    disabled={!!editingHero}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select Page</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="pcod">PCOD</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Guaranteed Weight Loss"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Subtitle (Badge Text) *
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., Upto 5 Kg in a Month"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter hero description..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="e.g., Buy Plan"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="e.g., /appointment"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Hero Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={uploadingImage}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {uploadingImage && <p style={{ color: '#666', fontSize: '12px' }}>Uploading...</p>}
                  {formData.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.image} alt="Preview" style={{ maxWidth: '150px', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#999',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#014E4E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {editingHero ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
