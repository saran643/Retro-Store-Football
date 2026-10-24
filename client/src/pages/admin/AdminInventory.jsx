import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Check, Edit2, Boxes, X } from 'lucide-react';
import { adminService, formatINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProductImage from '../../components/ProductImage';

export default function AdminInventory() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Edit stock inline/modal
  const [editingItem, setEditingItem] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventory({ search, lowStockOnly });
      if (res.data.success) {
        setInventory(res.data.inventory);
      }
    } catch (err) {
      showToast('Failed to load inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search, lowStockOnly]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setNewStock(item.stock_quantity);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const res = await adminService.updateVariantStock(editingItem.variant_id, newStock);
      if (res.data.success) {
        showToast(res.data.message || 'Stock updated successfully!', 'success');
        setEditingItem(null);
        loadInventory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Inventory & Stock Control</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Real-time variant-level SKU quantities, low stock alerts, and instant stock adjustments.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr auto auto', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by product, SKU (e.g. FRA98-M), or size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              style={{ accentColor: 'var(--color-burgundy)' }}
            />
            <span>Show Low Stock Only (&lt;10 units)</span>
          </label>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setLowStockOnly(false); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product & Division</th>
                <th>Size / Variant</th>
                <th>SKU</th>
                <th>Price (INR)</th>
                <th>Current Stock</th>
                <th>Alert Status</th>
                <th>Adjust Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    No variants match current criteria.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.variant_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE7DC', flexShrink: 0 }}>
                          <ProductImage src={item.image_url} alt="" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                            {item.category_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-burgundy)' }}>{item.size}</strong>
                      {item.color && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}> ({item.color})</span>}
                    </td>

                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-black)' }}>
                      {item.SKU}
                    </td>

                    <td>{formatINR(item.price)}</td>

                    <td style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {item.stock_quantity}
                    </td>

                    <td>
                      {item.is_out_of_stock ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : item.is_low_stock ? (
                        <span className="badge badge-warning">Low Stock ({item.stock_quantity})</span>
                      ) : (
                        <span className="badge badge-success">Optimal</span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit2 size={13} /> Edit Quantity
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Edit Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Update Stock Level</h3>
              <button type="button" onClick={() => setEditingItem(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStock}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700 }}>{editingItem.product_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Variant: <strong>{editingItem.size}</strong> • SKU: {editingItem.SKU}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Units in Warehouse</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                    min="0"
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.35rem' }}>
                    Note: Updating this variant automatically recalibrates total product stock.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-burgundy btn-sm" disabled={saving}>
                  <span>{saving ? 'Updating...' : 'Save Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
