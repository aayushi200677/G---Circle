import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyEmail({ email, otp });
      if (res.success) {
        setSuccessMsg('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your university email address.');
      return;
    }
    try {
      setResending(true);
      setError('');
      const res = await authService.resendOtp({ email });
      setSuccessMsg(res.message || 'A new verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="auth-header">
        <div className="mail-icon-wrap">
          <Mail size={24} />
        </div>
        <h2 className="auth-title">Verify University Email</h2>
        <p className="auth-subtitle">
          We have dispatched a 6-digit verification code to your Galgotias University email.
        </p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-success-banner">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">University Email</label>
          <input
            type="email"
            className="input-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@galgotiasuniversity.ac.in"
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Enter 6-Digit Verification Code</label>
          <input
            type="text"
            className="input-control otp-input"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
          <span className="input-hint">Check your student inbox or terminal server logs in development.</span>
        </div>

        <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
          {loading ? 'Verifying Code...' : 'Verify & Continue'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="resend-section">
        <p>Didn't receive the code or did it expire?</p>
        <button
          type="button"
          className="btn btn-outline btn-sm resend-btn"
          onClick={handleResend}
          disabled={resending}
        >
          <RefreshCw size={14} className={resending ? 'spin' : ''} />
          {resending ? 'Sending...' : 'Resend Verification Code'}
        </button>
      </div>

      <div className="auth-footer">
        <Link to="/login" className="auth-switch-link">
          Back to Login
        </Link>
      </div>

      <style>{`
        .mail-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .auth-header {
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.5;
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

        .otp-input {
          font-size: 24px !important;
          letter-spacing: 12px;
          text-align: center;
          font-weight: 800;
          color: var(--accent-primary);
          padding: 12px !important;
        }

        .input-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 5px;
        }

        .submit-btn {
          width: 100%;
          margin-top: 10px;
        }

        .resend-section {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }

        .resend-section p {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .resend-btn {
          margin: 0 auto;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-footer {
          margin-top: 20px;
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

