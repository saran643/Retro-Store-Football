import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both administrator email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminLogin(email, password);
      if (res.success) {
        showToast('Administrator authenticated. Welcome to Control Center.', 'success');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || 'Access denied: Invalid administrator credentials.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#171717',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFCF6',
        borderRadius: 'var(--radius-md)',
        border: '3px solid #721C32',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        padding: '2.5rem 2rem'
      }}>
        {/* Admin Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#721C32',
            color: '#FFFCF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            border: '2px solid #B79A63'
          }}>
            <ShieldCheck size={32} />
          </div>

          <span style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#721C32',
            fontWeight: 800
          }}>
            RESTRICTED ACCESS
          </span>
          <h1 style={{ fontSize: '1.85rem', margin: '0.35rem 0' }}>Admin Console</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            RETRO STORE Administration & Management Portal
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="admin@retrostore.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-burgundy btn-lg btn-block"
            disabled={submitting}
            style={{ marginTop: '1.75rem' }}
          >
            <span>{submitting ? 'Verifying Credentials...' : 'Authenticate & Enter'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.25rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={14} />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
