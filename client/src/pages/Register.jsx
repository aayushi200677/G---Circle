import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const COURSES = [
  'B.Tech CSE',
  'B.Tech IT',
  'B.Tech ECE',
  'B.Tech Mechanical',
  'B.Tech Civil',
  'BCA',
  'MCA',
  'BBA',
  'MBA',
  'B.Sc',
  'M.Sc',
  'Other',
];

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    academicYear: '3rd Year',
    course: 'B.Tech CSE',
    linkedin: '',
    github: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Domain validation
    if (!formData.email.toLowerCase().endsWith('@galgotiasuniversity.ac.in')) {
      setError('Please use your official Galgotias University email address (@galgotiasuniversity.ac.in).');
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        navigate('/verify-email', { state: { email: formData.email, name: formData.name } });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-header">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the Galgotias University collaboration network</p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="input-control"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Student ID *</label>
            <input
              type="text"
              name="studentId"
              className="input-control"
              placeholder="e.g. 22SCSE1010045"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">University Email *</label>
          <input
            type="email"
            name="email"
            className="input-control"
            placeholder="student@galgotiasuniversity.ac.in"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <span className="input-hint">Please use your official Galgotias University email address.</span>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Academic Year *</label>
            <select
              name="academicYear"
              className="input-control"
              value={formData.academicYear}
              onChange={handleChange}
              required
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Course / Branch *</label>
            <select
              name="course"
              className="input-control"
              value={formData.course}
              onChange={handleChange}
              required
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">Password *</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="input-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
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

          <div className="input-group">
            <label className="input-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className="input-control"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label">LinkedIn Profile URL</label>
            <input
              type="url"
              name="linkedin"
              className="input-control"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">GitHub ID or URL</label>
            <input
              type="text"
              name="github"
              className="input-control"
              placeholder="username or github link"
              value={formData.github}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Continue to Email Verification'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already registered?{' '}
          <Link to="/login" className="auth-switch-link">
            Log In
          </Link>
        </p>
      </div>

      <style>{`
        .auth-header {
          margin-bottom: 20px;
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

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .input-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
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

        .submit-btn {
          width: 100%;
          margin-top: 8px;
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

        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}

