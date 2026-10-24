import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Truck, 
  Settings,
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Top Banner */}
      <div className="top-announcement">
        <span><Truck size={14} color="#B79A63" /> FREE SHIPPING ACROSS INDIA ON ORDERS OVER ₹999</span>
        <span style={{ display: 'none', md: 'inline-flex' }}>•</span>
        <span><ShieldCheck size={14} color="#B79A63" /> CASH ON DELIVERY AVAILABLE</span>
      </div>

      <div className="container">
        <div className="nav-main">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand">
            <span className="brand-title">RETRO STORE</span>
            <span className="brand-tagline">THE BEAUTIFUL GAME. FOREVER.</span>
          </Link>

          {/* Desktop Search */}
          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search classic kits, boots, grip socks..."
              className="nav-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Desktop Nav Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop?category=Classic+Football+Jerseys" className="nav-link">
                  Jerseys
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop?category=Football+Boots" className="nav-link">
                  Boots
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop?category=Football+Accessories" className="nav-link">
                  Accessories
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop?featured=true" className="nav-link">
                  Iconic
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="nav-action-btn" title="Saved Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-action-btn" title="Shopping Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
            </Link>

            {/* User Account / Menu */}
            <div className="user-menu-wrapper" style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                className="nav-action-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                title={isAuthenticated ? user?.full_name : 'Account'}
              >
                <User size={20} />
              </button>

              {userDropdownOpen && (
                <div className="user-menu-dropdown">
                  {isAuthenticated ? (
                    <>
                      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{user.email}</div>
                        {isAdmin && (
                          <span className="badge badge-burgundy" style={{ marginTop: '0.35rem' }}>
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="user-menu-item"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ color: 'var(--color-burgundy)', fontWeight: 700 }}
                        >
                          <Settings size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/account"
                        className="user-menu-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/account?tab=orders"
                        className="user-menu-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Package size={16} />
                        <span>My Orders</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="user-menu-item"
                        style={{ width: '100%', borderTop: '1px solid var(--color-border)', color: 'var(--color-danger)' }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="user-menu-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>User Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="user-menu-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>Create Account</span>
                      </Link>
                      <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.3rem 0' }} />
                      <Link
                        to="/admin/login"
                        className="user-menu-item"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ color: 'var(--color-burgundy)', fontSize: '0.8rem' }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Login</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="nav-action-btn mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu Drawer */}
        {mobileMenuOpen && (
          <div style={{ padding: '1rem 0 1.5rem 0', borderTop: '1px solid var(--color-border)' }}>
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search football gear..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Shop All Collection</Link>
              <Link to="/shop?category=Classic+Football+Jerseys" onClick={() => setMobileMenuOpen(false)}>Classic Jerseys</Link>
              <Link to="/shop?category=Retro+Football+Jerseys" onClick={() => setMobileMenuOpen(false)}>Retro Kits</Link>
              <Link to="/shop?category=Football+Boots" onClick={() => setMobileMenuOpen(false)}>Football Boots</Link>
              <Link to="/shop?category=Grip+Socks" onClick={() => setMobileMenuOpen(false)}>Grip Socks</Link>
              <Link to="/shop?category=Goalkeeper+Gloves" onClick={() => setMobileMenuOpen(false)}>Goalkeeper Gloves</Link>
              <Link to="/shop?category=Football+Accessories" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>

              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--color-border)' }} />

              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                  <Link to="/account?tab=orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-burgundy)', fontWeight: 700 }}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{ textAlign: 'left', color: 'var(--color-danger)' }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>User Login</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-burgundy)' }}>Admin Portal</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
