import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { items, itemCount, summary, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading your matchday kit bag...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-padding">
        <div className="container">
          <div className="empty-state" style={{ maxWidth: '600px', margin: '3rem auto' }}>
            <ShoppingBag className="empty-state-icon" />
            <h2 className="empty-state-title">Your shopping cart is empty</h2>
            <p className="empty-state-desc">
              Explore our vintage football kits, boots, anti-slip grip socks, and training gear.
            </p>
            <Link to="/shop" className="btn btn-burgundy btn-lg">
              Explore Football Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">KIT BAG</span>
          <h1 style={{ fontSize: '2.25rem' }}>Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
          {/* Cart Items List */}
          <div className="retro-box" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item) => {
                const maxQty = item.availableStock || 99;
                return (
                  <div
                    key={item.cart_item_id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr auto auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      paddingBottom: '1.5rem',
                      borderBottom: '1px solid var(--color-border)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#EDE7DC', border: '1px solid var(--color-border)' }}>
                      <ProductImage src={item.image_url} alt={item.product_name} />
                    </div>

                    {/* Details */}
                    <div>
                      <span className="product-category-tag" style={{ fontSize: '0.65rem' }}>{item.category_name}</span>
                      <Link to={`/product/${item.product_id}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-black)' }}>
                        <div>{item.product_name}</div>
                      </Link>
                      {item.size && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                          Size: <strong style={{ color: 'var(--color-burgundy)' }}>{item.size}</strong>
                          {item.color && <span> • Color: {item.color}</span>}
                        </div>
                      )}
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-burgundy)', marginTop: '0.35rem' }}>
                        {formatINR(item.price)} each
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-warm-white)' }}>
                      <button
                        type="button"
                        style={{ padding: '0.4rem 0.65rem', fontWeight: 700, fontSize: '0.9rem' }}
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ padding: '0.4rem 0.65rem', fontWeight: 700, minWidth: '30px', textAlign: 'center', fontSize: '0.85rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        style={{ padding: '0.4rem 0.65rem', fontWeight: 700, fontSize: '0.9rem' }}
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        disabled={item.quantity >= maxQty}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-black)', fontFamily: 'var(--font-heading)' }}>
                        {formatINR(item.subtotal)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cart_item_id)}
                        style={{ color: 'var(--color-danger)', padding: '0.25rem', opacity: 0.8 }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/shop" className="btn btn-outline btn-sm">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="retro-box" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal:</span>
                <span style={{ fontWeight: 700 }}>{formatINR(summary.subtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery Charges:</span>
                <span>
                  {summary.deliveryCharge === 0 ? (
                    <strong style={{ color: 'var(--color-success)' }}>FREE</strong>
                  ) : (
                    formatINR(summary.deliveryCharge)
                  )}
                </span>
              </div>

              {summary.deliveryCharge > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', backgroundColor: 'var(--color-cream-light)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                  Add {formatINR(summary.freeDeliveryThreshold - summary.subtotal)} more to qualify for <strong>FREE DELIVERY</strong>!
                </div>
              )}

              <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                  {formatINR(summary.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-burgundy btn-lg btn-block"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--color-burgundy)" />
                <span>Cash on Delivery (COD) supported</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={14} color="var(--color-burgundy)" />
                <span>Fast 3-5 days dispatch across all Indian PIN codes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
