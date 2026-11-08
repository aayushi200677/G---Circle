import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({ token, password, confirmPassword });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="auth-header">
        <h2 className="auth-title">Create New Password</h2>
        <p className="auth-subtitle">Enter your new secure password below.</p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-success-banner">
          <CheckCircle2 size={16} />
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">New Password</label>
          <input
            type="password"
            className="input-control"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="input-group">
          <label className="input-label">Confirm New Password</label>
          <input
            type="password"
            className="input-control"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
          {loading ? 'Updating Password...' : 'Save New Password'}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-switch-link">
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
