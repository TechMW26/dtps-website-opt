'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PopupBanner {
  _id: string;
  title?: string;
  image: string;
  pages: string[];
  isActive: boolean;
}

const pageOptions = [
  { value: 'home', label: 'Home' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'pcod', label: 'PCOD' },
  { value: 'plans-therapeutic', label: 'Therapeutic Plans' },
  { value: 'plans-wedding', label: 'Wedding Plans' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'contact', label: 'Contact' },
  { value: 'blog', label: 'Blog' },
];

export default function PopupsPage() {
  const [popups, setPopups] = useState<PopupBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    pages: [] as string[],
    isActive: true,
  });

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/popups');
      if (!res.ok) throw new Error('Failed to fetch popups');
      const data = await res.json();
      setPopups(data.popups || []);
    } catch (error) {
      console.error('Error fetching popups:', error);
      alert('Failed to fetch popups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('deviceType', 'desktop');

      const res = await fetch('/api/banner-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData({ ...formData, image: data.optimizedUrl });
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image || formData.pages.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const url = editingPopup ? '/api/popups' : '/api/popups';
      const method = editingPopup ? 'PUT' : 'POST';
      const payload = editingPopup
        ? { ...formData, _id: editingPopup._id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save popup');
      
      alert(editingPopup ? 'Popup updated successfully!' : 'Popup created successfully!');
      handleModalClose();
      fetchPopups();
    } catch (error: any) {
      console.error('Error saving popup:', error);
      alert(`Failed to save popup: ${error.message}`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPopup(null);
    setFormData({
      title: '',
      image: '',
      pages: [],
      isActive: true,
    });
  };

  const handleEdit = (popup: PopupBanner) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title || '',
      image: popup.image,
      pages: popup.pages,
      isActive: popup.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      const res = await fetch(`/api/popups?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete popup');
      alert('Popup deleted successfully!');
      fetchPopups();
    } catch (error: any) {
      console.error('Error deleting popup:', error);
      alert(`Failed to delete popup: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Popup Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 20px',
            background: '#FF850B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Create New Popup
        </button>
      </div>

      {loading ? (
        <p>Loading popups...</p>
      ) : popups.length === 0 ? (
        <p>No popups found. Create one to get started!</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {popups.map((popup) => (
            <Card key={popup._id}>
              <CardContent style={{ padding: '20px' }}>
                {popup.image && (
                  <img
                    src={popup.image}
                    alt={popup.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '15px',
                    }}
                  />
                )}
                <h3>{popup.title}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  <strong>Pages:</strong> {popup.pages.join(', ')}
                </p>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                  <strong>Status:</strong> {popup.isActive ? 'Active' : 'Inactive'}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(popup)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#0d4043',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(popup._id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
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
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Card style={{ width: '90%', maxWidth: '500px' }}>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>{editingPopup ? 'Edit Popup' : 'Create New Popup'}</CardTitle>
              <button
                onClick={handleModalClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Special Offer"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Popup Image</label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '10px',
                      }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={uploading}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Select Pages</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {pageOptions.map((page) => (
                      <label key={page.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.pages.includes(page.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                pages: [...formData.pages, page.value],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                pages: formData.pages.filter((p) => p !== page.value),
                              });
                            }
                          }}
                        />
                        {page.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={uploading || !formData.image}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#FF850B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {uploading ? 'Uploading...' : editingPopup ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#ddd',
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
