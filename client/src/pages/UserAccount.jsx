import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Lock, 
  Heart, 
  LogOut, 
  Check, 
  AlertCircle, 
  Calendar,
  ExternalLink,
  Eye,
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService, orderService, formatINR } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function UserAccount() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile Form
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.full_name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Load orders if on orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      async function fetchOrders() {
        try {
          setLoadingOrders(true);
          const res = await orderService.getMyOrders();
          if (res.data.success) {
            setOrders(res.data.orders);
          }
        } catch (err) {
          console.error('Failed to load orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      }
      fetchOrders();
    }
  }, [currentTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({
        full_name: profileName.trim(),
        phone: profilePhone.trim()
      });
      if (res.data.success) {
        updateUser({ full_name: profileName.trim(), phone: profilePhone.trim() });
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.data.success) {
        setSelectedOrder(res.data.order);
        setOrderModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load order details.', 'error');
    }
  };

  return (
    <div className="section-padding">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">CLUB MEMBER PROFILE</span>
          <h1 style={{ fontSize: '2.25rem' }}>My Account</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Welcome, <strong>{user?.full_name}</strong> ({user?.email})
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Navigation Tabs Sidebar */}
          <div className="retro-box" style={{ padding: '1rem', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn btn-block ${currentTab === 'profile' ? 'btn-burgundy' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', marginBottom: '0.5rem' }}
              onClick={() => setSearchParams({ tab: 'profile' })}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              className={`btn btn-block ${currentTab === 'orders' ? 'btn-burgundy' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', marginBottom: '0.5rem' }}
              onClick={() => setSearchParams({ tab: 'orders' })}
            >
              <Package size={16} />
              <span>Order History</span>
            </button>

            <button
              type="button"
              className={`btn btn-block ${currentTab === 'security' ? 'btn-burgundy' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', marginBottom: '0.5rem' }}
              onClick={() => setSearchParams({ tab: 'security' })}
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ justifyContent: 'flex-start', color: 'var(--color-danger)', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div>
            {/* 1. Profile Tab */}
            {currentTab === 'profile' && (
              <div className="retro-box" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  Personal Profile
                </h3>

                <form onSubmit={handleUpdateProfile} style={{ maxWidth: '480px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#EDE7DC' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-burgundy"
                    disabled={savingProfile}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 2. Orders Tab */}
            {currentTab === 'orders' && (
              <div className="retro-box" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  My Matchday Orders ({orders.length})
                </h3>

                {loadingOrders ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Fetching your order log...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <Package className="empty-state-icon" />
                    <h3>No orders placed yet</h3>
                    <p>Your matchday purchases and order history will appear here.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Destination</th>
                          <th>Total Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((ord) => (
                          <tr key={ord.order_id}>
                            <td style={{ fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                              {ord.order_number}
                            </td>
                            <td>{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                            <td>{ord.shipping_city || 'India'}</td>
                            <td style={{ fontWeight: 700 }}>{formatINR(ord.total_amount)}</td>
                            <td>
                              <span className="badge badge-outline">{ord.payment_method}</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                ord.order_status === 'Delivered' ? 'badge-success' :
                                ord.order_status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {ord.order_status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleViewOrder(ord.order_id)}
                              >
                                <Eye size={14} /> Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Security / Change Password Tab */}
            {currentTab === 'security' && (
              <div className="retro-box" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  Security & Password
                </h3>

                <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-burgundy"
                    disabled={savingPassword}
                  >
                    <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Order Details Modal */}
      {orderModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Order {selectedOrder.order_number}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button type="button" onClick={() => setOrderModalOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Shipping snapshot */}
              <div style={{ backgroundColor: 'var(--color-cream-light)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Delivery To:</div>
                <div>{selectedOrder.shipping_name} ({selectedOrder.shipping_phone})</div>
                <div>{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pin_code}</div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Purchased Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedOrder.items?.map((it) => (
                  <div key={it.order_item_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{it.product_name_snapshot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {it.variant_snapshot || 'Standard'} • Qty: {it.quantity} @ {formatINR(it.unit_price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-burgundy)' }}>
                      {formatINR(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges:</span>
                  <span>{selectedOrder.delivery_charge === '0.00' ? 'FREE' : formatINR(selectedOrder.delivery_charge)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', color: 'var(--color-burgundy)' }}>
                  <span>Total Amount (COD):</span>
                  <span>{formatINR(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setOrderModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
