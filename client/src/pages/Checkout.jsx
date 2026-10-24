import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService, formatINR } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function Checkout() {
  const { items, summary, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Shipping form state
  const [formData, setFormData] = useState({
    shipping_name: user?.full_name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pin_code: '',
    payment_method: 'COD'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi (NCT)', 'Chandigarh', 'Jammu and Kashmir', 'Ladakh'
  ];

  const validate = () => {
    const errs = {};
    if (!formData.shipping_name.trim()) errs.shipping_name = 'Full name is required.';
    if (!formData.shipping_phone.trim()) {
      errs.shipping_phone = 'Phone number is required.';
    } else if (!/^[0-9+ -]{10,14}$/.test(formData.shipping_phone.trim())) {
      errs.shipping_phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.shipping_address.trim()) errs.shipping_address = 'Delivery address is required.';
    if (!formData.shipping_city.trim()) errs.shipping_city = 'City is required.';
    if (!formData.shipping_state.trim()) errs.shipping_state = 'State is required.';

    if (!formData.shipping_pin_code.trim()) {
      errs.shipping_pin_code = 'PIN code is required.';
    } else if (!/^[0-9]{6}$/.test(formData.shipping_pin_code.trim())) {
      errs.shipping_pin_code = 'Please enter a valid 6-digit Indian PIN code.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the delivery form.', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty.', 'error');
      navigate('/cart');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderService.createOrder(formData);
      if (res.data.success) {
        showToast('Order confirmed! Cash on Delivery booked.', 'success');
        const orderNumber = res.data.order.orderNumber;
        navigate(`/order-success/${orderNumber}`);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      const msg = err.response?.data?.message || 'Could not place order. Please review your cart.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-padding">
        <div className="container">
          <div className="empty-state" style={{ maxWidth: '500px', margin: '3rem auto' }}>
            <h3>No items in kit bag</h3>
            <p>Please add products to your cart before proceeding to checkout.</p>
            <Link to="/shop" className="btn btn-burgundy">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">FINAL MATCHDAY STEP</span>
          <h1 style={{ fontSize: '2.25rem' }}>Checkout & Delivery</h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Left: Delivery Address Form */}
            <div>
              <div className="retro-box" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  1. Shipping & Delivery Address
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Recipient Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.shipping_name}
                      onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                    />
                    {errors.shipping_name && <div className="form-error">{errors.shipping_name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.shipping_phone}
                      onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                    />
                    {errors.shipping_phone && <div className="form-error">{errors.shipping_phone}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address & Landmark *</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    placeholder="Flat/House No., Building, Street, Landmark"
                  />
                  {errors.shipping_address && <div className="form-error">{errors.shipping_address}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                      placeholder="e.g. Mumbai"
                    />
                    {errors.shipping_city && <div className="form-error">{errors.shipping_city}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select
                      className="form-control form-select"
                      value={formData.shipping_state}
                      onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.shipping_state && <div className="form-error">{errors.shipping_state}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control"
                      value={formData.shipping_pin_code}
                      onChange={(e) => setFormData({ ...formData, shipping_pin_code: e.target.value })}
                      placeholder="e.g. 400001"
                    />
                    {errors.shipping_pin_code && <div className="form-error">{errors.shipping_pin_code}</div>}
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="retro-box" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  2. Payment Method
                </h3>

                <div style={{
                  border: '2px solid var(--color-burgundy)',
                  backgroundColor: 'var(--color-cream-light)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ marginTop: '0.2rem' }}>
                    <CheckCircle2 size={22} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-black)' }}>
                      Cash on Delivery (COD)
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                      Pay in cash or via UPI to the delivery courier when your matchday package arrives at your doorstep. Zero online payment gateway hassle.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Breakdown */}
            <div className="retro-box" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Kit Review ({items.length} items)
              </h3>

              {/* Mini Item List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem' }}>
                {items.map((it) => (
                  <div key={it.cart_item_id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE7DC', flexShrink: 0 }}>
                      <ProductImage src={it.image_url} alt="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {it.product_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>
                      {formatINR(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 700 }}>{formatINR(summary.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges:</span>
                  <span>
                    {summary.deliveryCharge === 0 ? (
                      <strong style={{ color: 'var(--color-success)' }}>FREE</strong>
                    ) : (
                      formatINR(summary.deliveryCharge)
                    )}
                  </span>
                </div>
                <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Final Amount:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                    {formatINR(summary.total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-burgundy btn-lg btn-block"
                disabled={submitting}
              >
                <Lock size={16} />
                <span>{submitting ? 'Confirming Order...' : 'Place Order (Cash on Delivery)'}</span>
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/cart" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  &larr; Back to Cart Modification
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
