import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Layers, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    image_url: ''
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      showToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCat(null);
    setFormData({ category_name: '', description: '', image_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCat(cat);
    setFormData({
      category_name: cat.category_name,
      description: cat.description || '',
      image_url: cat.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingCat) {
        await adminService.updateCategory(editingCat.category_id, formData);
        showToast('Category updated.', 'success');
      } else {
        await adminService.createCategory(formData);
        showToast('Category created.', 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId, name) => {
    if (!window.confirm(`Delete category "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await adminService.deleteCategory(categoryId);
      showToast(res.data.message || 'Category deleted.', 'info');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete category with active products.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Category Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Organize products into football divisions and archive categories.
          </p>
        </div>

        <button type="button" className="btn btn-burgundy" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Products Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No categories found.</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.category_id}>
                    <td>
                      <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE7DC' }}>
                        {c.image_url ? (
                          <img src={c.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={16} color="#8C8478" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.category_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>ID: #{c.category_id}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '380px' }}>
                        {c.description || 'No description provided.'}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-burgundy">
                        {c.product_count} products
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(c)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(c.category_id, c.category_name)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    required
                    placeholder="e.g. Vintage Track Jackets"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of products in this category..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-burgundy btn-sm" disabled={saving}>
                  <span>{saving ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
