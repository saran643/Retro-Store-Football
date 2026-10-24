import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.forgotPassword({ email });
      setSubmitted(true);
      setMessage(res.data.message);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
      showToast('Password reset processed.', 'info');
    } catch (err) {
      showToast('Error processing request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="retro-box" style={{ padding: '2.5rem 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">ACCOUNT RECOVERY</span>
            <h1 style={{ fontSize: '2rem', margin: '0.4rem 0' }}>Reset Password</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div>
              <div className="alert alert-info" style={{ display: 'block', lineHeight: '1.6' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={18} /> Request Processed
                </div>
                <div>{message}</div>
                {devToken && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#FFF', border: '1px solid var(--color-border)', borderRadius: '4px', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                    <strong>Dev Reset Token:</strong> {devToken}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/login" className="btn btn-outline btn-block">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
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

              <button
                type="submit"
                className="btn btn-burgundy btn-lg btn-block"
                disabled={submitting}
                style={{ marginTop: '1.5rem' }}
              >
                <span>{submitting ? 'Processing...' : 'Send Reset Instructions'}</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                  &larr; Back to Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
