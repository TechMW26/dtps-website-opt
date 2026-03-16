'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SiteBanner {
  _id: string;
  type: 'marquee' | 'hero-banner';
  title: string;
  icon: string;
  desktopImage?: string;
  mobileImage?: string;
  link?: string;
  page?: string;
  isActive: boolean;
  order?: number;
}

export default function SiteBannersPage() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SiteBanner | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [formData, setFormData] = useState({
    type: 'marquee' as 'marquee' | 'hero-banner',
    title: '',
    icon: '',
    desktopImage: '',
    mobileImage: '',
    link: '',
    page: '',
    isActive: true,
    order: 0,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/site-banners');
      if (!res.ok) throw new Error('Failed to fetch banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (file: File, deviceType: 'desktop' | 'mobile' | 'icon') => {
    try {
      const setLoading = deviceType === 'desktop' ? setUploadingDesktop : deviceType === 'mobile' ? setUploadingMobile : setUploadingIcon;
      setLoading(true);

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('deviceType', deviceType);

      const res = await fetch('/api/banner-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();
      
      if (deviceType === 'desktop') {
        setFormData({ ...formData, desktopImage: data.optimizedUrl });
      } else if (deviceType === 'mobile') {
        setFormData({ ...formData, mobileImage: data.optimizedUrl });
      } else if (deviceType === 'icon') {
        setFormData({ ...formData, icon: data.optimizedUrl });
      }

      alert(`${deviceType} uploaded and compressed successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload ${deviceType}: ${error.message}`);
    } finally {
      const setLoading = deviceType === 'desktop' ? setUploadingDesktop : deviceType === 'mobile' ? setUploadingMobile : setUploadingIcon;
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Please fill in title');
      return;
    }

    try {
      const url = '/api/site-banners';
      const method = editingBanner ? 'PUT' : 'POST';
      const body = editingBanner
        ? { ...formData, id: editingBanner._id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${editingBanner ? 'update' : 'create'} banner`);
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/site-banners?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete banner');

      alert('Banner deleted successfully!');
      fetchBanners();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      alert(error.message);
    }
  };

  const handleEdit = (banner: SiteBanner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type,
      title: banner.title,
      icon: banner.icon,
      desktopImage: banner.desktopImage || '',
      mobileImage: banner.mobileImage || '',
      link: banner.link || '',
      page: banner.page || '',
      isActive: banner.isActive,
      order: banner.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      type: 'marquee',
      title: '',
      icon: '',
      desktopImage: '',
      mobileImage: '',
      link: '',
      page: '',
      isActive: true,
      order: 0,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Site Banners & Marquee</h1>
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
          + Add Banner
        </button>
      </div>

      {loading ? (
        <p>Loading banners...</p>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '40px', textAlign: 'center' }}>
            <p>No banners created yet. Click "Add Banner" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {banners.map((banner) => (
            <Card key={banner._id}>
              <CardHeader>
                <CardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {banner.icon && banner.icon.startsWith('http') ? (
                      <img src={banner.icon} alt={banner.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>{banner.icon}</span>
                    )}
                    <span>{banner.title}</span>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      backgroundColor: banner.type === 'marquee' ? '#FF9100' : '#009688',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {banner.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Title:</strong> {banner.title}
                </div>
                {banner.type === 'marquee' && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Icon:</strong>
                    {banner.icon && banner.icon.startsWith('http') ? (
                      <div style={{ marginTop: '10px' }}>
                        <img src={banner.icon} alt="Icon" style={{ maxWidth: '100px', borderRadius: '4px', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '32px', marginLeft: '10px' }}>{banner.icon}</span>
                    )}
                  </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <strong>Status:</strong> {banner.isActive ? '✅ Active' : '⭕ Inactive'}
                </div>
                {banner.link && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Link:</strong> {banner.link}
                  </div>
                )}
                {banner.desktopImage && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Desktop Image:</strong>
                    <img
                      src={banner.desktopImage}
                      alt="Desktop"
                      style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  </div>
                )}
                {banner.mobileImage && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Mobile Image:</strong>
                    <img
                      src={banner.mobileImage}
                      alt="Mobile"
                      style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(banner)}
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
                    onClick={() => handleDelete(banner._id)}
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
              <CardTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Banner Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'marquee' | 'hero-banner' })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="marquee">Marquee (Top Ribbon)</option>
                    <option value="hero-banner">Hero Banner</option>
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
                    placeholder="e.g., Republic day sale is live"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {formData.type === 'hero-banner' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Page (for Hero Banners)
                    </label>
                    <select
                      value={formData.page}
                      onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">No specific page</option>
                      <option value="home">Home</option>
                      <option value="weight-loss">Weight Loss</option>
                      <option value="pcod">PCOD</option>
                      <option value="plans-therapeutic">Therapeutic Plans</option>
                      <option value="plans-wedding">Wedding Plans</option>
                      <option value="appointment">Appointment</option>
                      <option value="contact">Contact</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>
                )}

                {formData.type === 'marquee' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Marquee Icon Image * (uploaded to ImageKit with compression)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'icon');
                      }}
                      disabled={uploadingIcon}
                      style={{ width: '100%' }}
                    />
                    {uploadingIcon && <p>Uploading and compressing...</p>}
                    {formData.icon && (formData.icon.startsWith('http') ? (
                      <div style={{ marginTop: '10px' }}>
                        <img src={formData.icon} alt="Icon" style={{ maxWidth: '80px', borderRadius: '4px' }} />
                        <p style={{ fontSize: '12px', color: '#666' }}>✅ Icon image uploaded & compressed</p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {formData.type === 'hero-banner' && (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                        Desktop Banner Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'desktop');
                        }}
                        disabled={uploadingDesktop}
                        style={{ width: '100%' }}
                      />
                      {uploadingDesktop && <p>Uploading...</p>}
                      {formData.desktopImage && (
                        <div style={{ marginTop: '10px' }}>
                          <img src={formData.desktopImage} alt="Desktop" style={{ maxWidth: '200px', borderRadius: '4px' }} />
                          <p style={{ fontSize: '12px', color: '#666' }}>✅ Desktop image uploaded</p>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                        Mobile Banner Image (optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'mobile');
                        }}
                        disabled={uploadingMobile}
                        style={{ width: '100%' }}
                      />
                      {uploadingMobile && <p>Uploading...</p>}
                      {formData.mobileImage && (
                        <div style={{ marginTop: '10px' }}>
                          <img src={formData.mobileImage} alt="Mobile" style={{ maxWidth: '120px', borderRadius: '4px' }} />
                          <p style={{ fontSize: '12px', color: '#666' }}>✅ Mobile image uploaded</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Link (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/weight-loss"
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
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ marginRight: '8px' }}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#014E4E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {editingBanner ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#ccc',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
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
