import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        showToast(res.message || 'Logged in successfully!', 'success');
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="retro-box" style={{ padding: '2.5rem 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">CLUB MEMBER ACCESS</span>
            <h1 style={{ fontSize: '2rem', margin: '0.4rem 0' }}>User Login</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Sign in to manage your kit orders, track deliveries, and access your wishlist.
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
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
              style={{ marginTop: '1.5rem' }}
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Store'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Create Account link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--color-burgundy)', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/admin/login"
              style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldCheck size={14} />
              <span>Looking for Administrator Login? Click here</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
