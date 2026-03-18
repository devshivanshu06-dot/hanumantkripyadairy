import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Image as ImageIcon, Plus, Trash2, X, Edit2 } from 'lucide-react';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await adminAPI.getBanners();
      setBanners(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await adminAPI.updateBanner(editingBanner._id, formData);
      } else {
        await adminAPI.createBanner(formData);
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      alert('Error saving banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await adminAPI.deleteBanner(id);
        fetchBanners();
      } catch (error) {
        alert('Error deleting banner');
      }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: banner.image,
      isActive: banner.isActive,
      order: banner.order
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', image: '', isActive: true, order: 0 });
    setEditingBanner(null);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Banners</h1>
          <p className="text-gray-500 mt-1">Upload and manage rotating image banners for the mobile app.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner._id}>
                <td>
                  <img src={banner.image} alt={banner.title} className="w-24 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                </td>
                <td className="font-semibold text-gray-900">{banner.title}</td>
                <td className="font-semibold">{banner.order}</td>
                <td>
                  <span className={`badge ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(banner)} className="text-gray-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(banner._id)} className="text-gray-400 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400">No banners found</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-zoomIn">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Banner Title</label>
                <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full" placeholder="e.g. Subscribe offer" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Upload Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full border p-2 rounded-xl" 
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-full h-32 object-cover mt-2 rounded-lg border border-gray-200" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-full" />
                </div>
                
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" id="isActive" />
                  <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Live / Active</label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="btn-primary">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
