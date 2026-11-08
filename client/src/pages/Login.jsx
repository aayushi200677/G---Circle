import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@galgotiasuniversity.ac.in')) {
      setError('Please use your official Galgotias University email address (@galgotiasuniversity.ac.in).');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.message && err.message.includes('not verified')) {
        navigate('/verify-email', { state: { email } });
      } else {
        setError(err.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="login-page">
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in with your official Galgotias University credentials</p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
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
          <span className="input-hint">Must end with @galgotiasuniversity.ac.in</span>
        </div>

        <div className="input-group">
          <div className="label-with-link">
            <label className="input-label">Password</label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <div className="password-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-row remember-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In to G-CIRCLE'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="demo-credentials-box">
        <span className="demo-title">
          <ShieldCheck size={14} /> Quick Demo Logins:
        </span>
        <div className="demo-pills">
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleQuickDemoLogin('aarav.sharma@galgotiasuniversity.ac.in')}
          >
            Aarav (Frontend Lead)
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleQuickDemoLogin('priya.patel@galgotiasuniversity.ac.in')}
          >
            Priya (Backend Lead)
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleQuickDemoLogin('rohan.verma@galgotiasuniversity.ac.in')}
          >
            Rohan (AI/ML Lead)
          </button>
        </div>
      </div>

      <div className="auth-footer">
        <p>
          New to G-CIRCLE?{' '}
          <Link to="/register" className="auth-switch-link">
            Create an account
          </Link>
        </p>
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

        .input-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .label-with-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-primary);
        }

        .password-input-wrap {
          position: relative;
        }

        .toggle-password-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remember-row {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label input {
          accent-color: var(--accent-primary);
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .submit-btn {
          width: 100%;
        }

        .demo-credentials-box {
          margin-top: 24px;
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px dashed var(--border-strong);
          border-radius: var(--radius-md);
        }

        .demo-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .demo-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .demo-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--accent-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .demo-pill:hover {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          border-color: var(--accent-primary);
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        .auth-switch-link {
          font-weight: 700;
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}

