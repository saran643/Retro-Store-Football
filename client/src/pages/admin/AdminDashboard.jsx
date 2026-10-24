import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert 
} from 'lucide-react';
import { adminService, formatINR } from '../../services/api';
import ProductImage from '../../components/ProductImage';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading administrative dashboard metrics...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Real-time metrics, inventory alerts, and sales performance across India.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatINR(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active / Pending</span>
            <span className="stat-value">{stats.pendingOrders}</span>
          </div>
        </div>

        <div className="stat-card stat-card-gold">
          <div className="stat-icon" style={{ backgroundColor: '#FDF7E7', color: '#B79A63' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Products in Vault</span>
            <span className="stat-value">{stats.totalProducts}</span>
          </div>
        </div>
      </div>

      {/* Inventory Alerts Bar */}
      {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} />
            <span>
              <strong>Inventory Warning:</strong> {stats.lowStockCount} products are low in stock (&lt;10 units) and {stats.outOfStockCount} products are completely sold out.
            </span>
          </div>
          <Link to="/admin/inventory" className="btn btn-black btn-sm">
            Manage Inventory
          </Link>
        </div>
      )}

      {/* Layout Grid: Recent Orders & Top Selling Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Recent Orders Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No orders recorded yet.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((ord) => (
                    <tr key={ord.order_id}>
                      <td style={{ fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                        {ord.order_number}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.shipping_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{ord.user_email}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatINR(ord.total_amount)}</td>
                      <td>
                        <span className={`badge ${
                          ord.order_status === 'Delivered' ? 'badge-success' :
                          ord.order_status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {ord.order_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Vault Performance</h3>
            <Link to="/admin/products" className="btn btn-outline btn-sm">
              <span>Catalog</span>
            </Link>
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats.topProducts.map((p) => (
              <div
                key={p.product_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.65rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-cream-light)'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE7DC', flexShrink: 0 }}>
                  <ProductImage src={p.image_url} alt="" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.product_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {p.category_name} • {formatINR(p.price)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-burgundy">
                    Stock: {p.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
