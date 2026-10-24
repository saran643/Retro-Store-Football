import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required.';
    
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (formData.phone && !/^[0-9+ -]{10,14}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      showToast('Please fix the errors in the registration form.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(formData);
      if (res.success) {
        showToast('Registration successful! Welcome to RETRO STORE.', 'success');
        navigate('/account', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="retro-box" style={{ padding: '2.5rem 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">JOIN THE ARCHIVE</span>
            <h1 style={{ fontSize: '2rem', margin: '0.4rem 0' }}>Create Account</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Register for exclusive drops, order tracking, and save your favorite kits.
            </p>
          </div>

          {serverError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Arjun Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              </div>
              {errors.full_name && <div className="form-error">{errors.full_name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              </div>
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem' }}
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem' }}
                    placeholder="Re-enter password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
                {errors.confirm_password && <div className="form-error">{errors.confirm_password}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-burgundy btn-lg btn-block"
              disabled={submitting}
              style={{ marginTop: '1rem' }}
            >
              <span>{submitting ? 'Creating Account...' : 'Register as Member'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Already have a RETRO STORE account?{' '}
            <Link to="/login" style={{ color: 'var(--color-burgundy)', fontWeight: 700 }}>
              Log In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
