import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { orderService, formatINR } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderNumber);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '780px' }}>
        <div className="retro-box" style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
          
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle size={40} />
          </div>

          <span className="section-tag">ORDER CONFIRMED</span>
          <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0' }}>
            The Beautiful Game Awaits You!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Thank you for ordering with RETRO STORE. Your matchday gear has been locked in and scheduled for dispatch.
          </p>

          {/* Order Details Badge */}
          <div style={{
            backgroundColor: 'var(--color-cream-light)',
            border: '2px solid var(--color-burgundy)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-light)', fontWeight: 700 }}>
                  Order Number
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-burgundy)', fontFamily: 'var(--font-heading)' }}>
                  {orderNumber}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-light)', fontWeight: 700 }}>
                  Payment Method
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Cash on Delivery (COD)
                </div>
              </div>
            </div>

            {order && (
              <>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 700 }}>
                    Shipping Destination
                  </span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-black)', marginTop: '0.2rem' }}>
                    <strong>{order.shipping_name}</strong> ({order.shipping_phone})<br />
                    {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pin_code}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700 }}>Total Payable at Doorstep:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-burgundy)' }}>
                    {formatINR(order.total_amount)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/account?tab=orders" className="btn btn-burgundy btn-lg">
              <Package size={18} />
              <span>View in My Orders</span>
            </Link>
            <Link to="/shop" className="btn btn-outline btn-lg">
              <span>Continue Shopping</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
