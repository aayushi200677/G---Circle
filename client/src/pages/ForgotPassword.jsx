import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!email.toLowerCase().endsWith('@galgotiasuniversity.ac.in')) {
      setError('Please enter your official Galgotias University email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email });
      setMsg(res.message || 'If an account exists, a password reset link has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="auth-header">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          Enter your registered Galgotias University email to receive a password reset link.
        </p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="auth-success-banner">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">University Email</label>
          <input
            type="email"
            className="input-control"
            placeholder="student@galgotiasuniversity.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
          {loading ? 'Sending Link...' : 'Send Password Reset Link'}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-switch-link">
          <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Back to Login
        </Link>
      </div>

      <style>{`
        .auth-header {
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .auth-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          font-size: 12.5px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .auth-success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: var(--beige-400);
          border: 1px solid var(--beige-600);
          border-radius: var(--radius-md);
          color: var(--burgundy-900);
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          margin-top: 10px;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
        }

        .auth-switch-link {
          font-weight: 600;
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
