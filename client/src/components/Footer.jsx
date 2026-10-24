import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, ShieldCheck, Truck, RefreshCw, Trophy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed! Welcome to the RETRO STORE Matchday Newsletter.', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Trust Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '3.5rem',
          borderBottom: '1px solid rgba(216, 210, 200, 0.15)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#721C32', padding: '0.75rem', borderRadius: '4px', color: '#FFFCF6' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFCF6', fontWeight: 700, fontSize: '0.9rem' }}>PAN-INDIA DELIVERY</div>
              <div style={{ color: '#8C8478', fontSize: '0.75rem' }}>Free shipping on orders above ₹999</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#721C32', padding: '0.75rem', borderRadius: '4px', color: '#FFFCF6' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFCF6', fontWeight: 700, fontSize: '0.9rem' }}>CASH ON DELIVERY</div>
              <div style={{ color: '#8C8478', fontSize: '0.75rem' }}>Pay securely at your doorstep</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#721C32', padding: '0.75rem', borderRadius: '4px', color: '#FFFCF6' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFCF6', fontWeight: 700, fontSize: '0.9rem' }}>AUTHENTIC HERITAGE</div>
              <div style={{ color: '#8C8478', fontSize: '0.75rem' }}>Inspired by legendary football culture</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#721C32', padding: '0.75rem', borderRadius: '4px', color: '#FFFCF6' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFCF6', fontWeight: 700, fontSize: '0.9rem' }}>EASY REPLACEMENTS</div>
              <div style={{ color: '#8C8478', fontSize: '0.75rem' }}>7-day hassle-free size exchange</div>
            </div>
          </div>
        </div>

        {/* Footer Main Links */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/">
              <span className="brand-title">RETRO STORE</span>
              <div className="brand-tagline">THE BEAUTIFUL GAME. FOREVER.</div>
            </Link>
            <p className="footer-bio">
              India's premier football heritage destination. Curating iconic retro shirts, match-grade boots, anti-slip grip socks, and training equipment at affordable prices tailored for true fans, grassroots ballers, and university athletes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Shop Gear</h4>
            <ul className="footer-links">
              <li><Link to="/shop">All Collections</Link></li>
              <li><Link to="/shop?category=Classic+Football+Jerseys">Classic Kits</Link></li>
              <li><Link to="/shop?category=Retro+Football+Jerseys">Retro Jerseys</Link></li>
              <li><Link to="/shop?category=Football+Boots">Football Boots</Link></li>
              <li><Link to="/shop?category=Grip+Socks">Grip Socks</Link></li>
              <li><Link to="/shop?category=Goalkeeper+Gloves">Goalkeeper Gloves</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="footer-heading">Support & Info</h4>
            <ul className="footer-links">
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/account?tab=orders">Track Orders</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/shop?featured=true">Iconic Vault</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h4 className="footer-heading">Matchday Dispatch</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#D8D2C8' }}>
              Subscribe for early drops of rare restocks, tournament specials, and student discounts.
            </p>
            {subscribed ? (
              <div className="alert alert-success" style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}>
                <Check size={16} /> Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    background: '#242120',
                    border: '1px solid #3E3835',
                    color: '#FFFCF6',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}
                />
                <button type="submit" className="btn btn-burgundy btn-sm">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} RETRO STORE. All rights reserved. The Beautiful Game. Forever.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Prices in Indian Rupees (₹)</span>
            <span>•</span>
            <Link to="/admin/login" style={{ color: '#8C8478' }}>Administrator Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
