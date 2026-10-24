import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Star, 
  Eye, 
  EyeOff,
  Layers 
} from 'lucide-react';
import { adminService, formatINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProductImage from '../../components/ProductImage';

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    product_name: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    stock_quantity: 0,
    is_featured: 0,
    is_published: 1,
    sizes: 'S, M, L, XL'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        adminService.getProducts({ page, limit: 15, search, category: selectedCat, stockStatus }),
        adminService.getCategories()
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
        setTotal(prodRes.data.pagination.total);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Error loading products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, selectedCat, stockStatus]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories[0]?.category_id || '',
      product_name: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      stock_quantity: 20,
      is_featured: 0,
      is_published: 1,
      sizes: 'S, M, L, XL'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      category_id: p.category_id,
      product_name: p.product_name,
      description: p.description,
      price: p.price,
      original_price: p.original_price || '',
      image_url: p.image_url,
      stock_quantity: p.stock_quantity,
      is_featured: p.is_featured,
      is_published: p.is_published,
      sizes: ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);

      const res = await adminService.uploadImage(data);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image_url: res.data.imageUrl }));
        showToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Image upload failed. Ensure file is JPG/PNG under 5MB.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name || !formData.category_id || !formData.price) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      setSaving(true);

      // Parse sizes into variant objects for new product
      const parsedVariants = formData.sizes
        ? formData.sizes.split(',').map((s) => ({
            size: s.trim(),
            stock_quantity: Math.floor(parseInt(formData.stock_quantity, 10) / (formData.sizes.split(',').length || 1))
          }))
        : [];

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.product_id, {
          category_id: formData.category_id,
          product_name: formData.product_name,
          description: formData.description,
          price: formData.price,
          original_price: formData.original_price || null,
          image_url: formData.image_url,
          stock_quantity: formData.stock_quantity,
          is_featured: formData.is_featured,
          is_published: formData.is_published
        });
        showToast('Product updated successfully!', 'success');
      } else {
        await adminService.createProduct({
          ...formData,
          variants: parsedVariants
        });
        showToast('Product added to vault!', 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete or unpublish "${name}"?`)) return;

    try {
      const res = await adminService.deleteProduct(productId);
      showToast(res.data.message || 'Product removed.', 'info');
      loadData();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Product Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {total} products cataloged in RETRO STORE database.
          </p>
        </div>

        <button type="button" className="btn btn-burgundy" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by product name or keywords..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          </div>

          <select
            className="form-control form-select"
            value={selectedCat}
            onChange={(e) => { setSelectedCat(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>

          <select
            className="form-control form-select"
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock (&lt;10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setSelectedCat(''); setStockStatus(''); setPage(1); }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price (INR)</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE7DC', flexShrink: 0 }}>
                          <ProductImage src={p.image_url} alt="" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                            ID: #{p.product_id} {p.variant_count > 0 && `• ${p.variant_count} Variants`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-outline">{p.category_name}</span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>
                        {formatINR(p.price)}
                      </div>
                      {p.original_price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                          {formatINR(p.original_price)}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${
                        p.stock_quantity === 0 ? 'badge-danger' :
                        p.stock_quantity < 10 ? 'badge-warning' : 'badge-success'
                      }`}>
                        {p.stock_quantity} units
                      </span>
                    </td>

                    <td>
                      {p.is_featured === 1 ? (
                        <span className="badge badge-gold">YES</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-light)' }}>-</span>
                      )}
                    </td>

                    <td>
                      {p.is_published === 1 ? (
                        <span className="badge badge-success">Live</span>
                      ) : (
                        <span className="badge badge-outline">Draft</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(p.product_id, p.product_name)}
                          title="Delete / Unpublish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {editingProduct ? 'Edit Product' : 'Add New Football Product'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                    placeholder="e.g. France 1998 Home Retro Kit - Zidane #10"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control form-select"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Base Stock Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price in INR (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="e.g. 999.00"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original Price (₹) (Optional Discount)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="e.g. 1299.00"
                    />
                  </div>
                </div>

                {/* Image Upload / URL */}
                <div className="form-group">
                  <label className="form-label">Product Image URL or Upload</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {formData.image_url && (
                    <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {!editingProduct && (
                  <div className="form-group">
                    <label className="form-label">Default Available Sizes (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description & Matchday History *</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Describe embroidery, match history, vintage cut, fabric..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_featured)}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                      style={{ accentColor: 'var(--color-burgundy)' }}
                    />
                    <span>Mark as Iconic / Featured</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_published)}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                      style={{ accentColor: 'var(--color-burgundy)' }}
                    />
                    <span>Publish live on website</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-burgundy btn-sm" disabled={saving}>
                  <span>{saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
