import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Boxes, 
  ExternalLink, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    logout();
    showToast('Administrator session ended.', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" style={{ color: 'inherit' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFCF6' }}>
              RETRO STORE
            </span>
          </Link>
          <div>
            <span className="admin-badge">ADMIN CONSOLE</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Layers size={18} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Boxes size={18} />
            <span>Inventory</span>
          </NavLink>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(216, 210, 200, 0.15)' }}>
            <Link to="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={18} />
              <span>Live Storefront</span>
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="admin-nav-item"
              style={{ width: '100%', color: '#E57373', marginTop: '0.25rem' }}
            >
              <LogOut size={18} />
              <span>Admin Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-title-wrap">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Management Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user?.full_name || 'Administrator'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>Verified Administrator</div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-burgundy)', color: '#FFFCF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
