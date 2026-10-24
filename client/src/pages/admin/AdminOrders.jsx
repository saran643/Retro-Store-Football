import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, CheckCircle, Clock, Truck, XCircle, X } from 'lucide-react';
import { adminService, orderService, formatINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({ page, limit: 15, search, status });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      showToast('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, search, status]);

  const handleOpenDetails = async (orderId) => {
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.data.success) {
        setSelectedOrder(res.data.order);
        setNewStatus(res.data.order.order_status);
        setIsModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load order details.', 'error');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const res = await adminService.updateOrderStatus(selectedOrder.order_id, {
        order_status: newStatus
      });
      if (res.data.success) {
        showToast(res.data.message || 'Order status updated.', 'success');
        setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
        loadOrders();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Customer Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Monitor, verify, and update delivery statuses for all customer purchases.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by order number, customer name, phone, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          </div>

          <select
            className="form-control form-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setStatus('all'); setPage(1); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (INR)</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    No customer orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                      {o.order_number}
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.shipping_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {o.shipping_phone} • {o.shipping_city}
                      </div>
                    </td>
                    <td>{o.items_count} units</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-black)' }}>
                      {formatINR(o.total_amount)}
                    </td>
                    <td>
                      <span className="badge badge-outline">{o.payment_method}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        o.order_status === 'Delivered' ? 'badge-success' :
                        o.order_status === 'Cancelled' ? 'badge-danger' :
                        o.order_status === 'Shipped' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {o.order_status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenDetails(o.order_id)}
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Status Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                  Order: {selectedOrder.order_number}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Delivery info */}
              <div style={{ backgroundColor: 'var(--color-cream-light)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Customer Shipping Destination:
                </div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.shipping_name} ({selectedOrder.shipping_phone})</div>
                <div>{selectedOrder.shipping_address}</div>
                <div>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pin_code}</div>
              </div>

              {/* Items Purchased */}
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Items in Order ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedOrder.items?.map((it) => (
                  <div key={it.order_item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.product_name_snapshot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {it.variant_snapshot || 'Standard'} • Qty: {it.quantity} @ {formatINR(it.unit_price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>
                      {formatINR(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges:</span>
                  <span>{selectedOrder.delivery_charge === '0.00' ? 'FREE' : formatINR(selectedOrder.delivery_charge)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-burgundy)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span>Total Amount (COD):</span>
                  <span>{formatINR(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <label className="form-label">Update Order Status</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="form-control form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled (Restores Inventory)</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-burgundy"
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedOrder.order_status}
                  >
                    <span>{updatingStatus ? 'Updating...' : 'Update Status'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
