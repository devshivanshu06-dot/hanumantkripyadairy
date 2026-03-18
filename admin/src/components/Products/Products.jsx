import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Package, Plus, Search, Edit2, Trash2, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: 'milk',
    stock: '',
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, formData);
      } else {
        await adminAPI.createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      stock: product.stock,
      image: product.image
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      unit: '',
      category: 'milk',
      stock: '',
      image: ''
    });
    setEditingProduct(null);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your grocery and dairy inventory.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="flex-1 border-none focus:ring-0 p-0"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img src={product.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                </td>
                <td className="font-semibold text-gray-900">{product.name}</td>
                <td className="capitalize text-gray-500">{product.category}</td>
                <td className="font-bold">₹{product.price} / {product.unit}</td>
                <td>
                  <span className={`font-semibold ${product.stock < 10 ? 'text-danger' : 'text-gray-700'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-zoomIn">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Product Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full" placeholder="e.g. Buffalo Milk" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full">
                    <option value="milk">Milk</option>
                    <option value="curd">Curd</option>
                    <option value="paneer">Paneer</option>
                    <option value="ghee">Ghee</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full" rows="3" placeholder="Product details..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Price (₹)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Unit</label>
                  <input required name="unit" value={formData.unit} onChange={handleInputChange} className="w-full" placeholder="L, 500g, etc" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Stock</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Image URL</label>
                <input name="image" value={formData.image} onChange={handleInputChange} className="w-full" placeholder="https://..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
