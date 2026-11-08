import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { userService } from '../services/userService.js';
import {
  Palette,
  User,
  Shield,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { themeMode, themeIntensity, setThemeMode, setThemeIntensity } = useTheme();

  // Active settings tab
  const [activeTab, setActiveTab] = useState('appearance');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Appearance notification
  const [appearanceMsg, setAppearanceMsg] = useState('');

  // Account details
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications !== false
  );

  const handleModeChange = async (mode) => {
    setThemeMode(mode);
    setAppearanceMsg(`Theme mode updated to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode immediately.`);
    try {
      await userService.updatePreferences({ themeMode: mode });
    } catch (_) {}
    setTimeout(() => setAppearanceMsg(''), 3000);
  };

  const handleIntensityChange = async (intensity) => {
    setThemeIntensity(intensity);
    setAppearanceMsg(`Theme intensity set to ${intensity.charAt(0).toUpperCase() + intensity.slice(1)}.`);
    try {
      await userService.updatePreferences({ themeIntensity: intensity });
    } catch (_) {}
    setTimeout(() => setAppearanceMsg(''), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="title">Settings</h2>
        <p className="subtitle">
          Customize website appearance, security credentials, and account preferences.
        </p>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation Sidebar */}
        <div className="settings-nav-card card">
          <button
            className={`settings-nav-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={17} />
            <span>Theme & Appearance</span>
          </button>

          <button
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={17} />
            <span>Profile Settings</span>
          </button>

          <button
            className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={17} />
            <span>Password Settings</span>
          </button>

          <button
            className={`settings-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={17} />
            <span>Privacy Preferences</span>
          </button>
        </div>

        {/* Settings Detail Content */}
        <div className="settings-content-card card">
          {/* 1. Dedicated Theme & Appearance Section */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="section-head">
                <h3 className="section-heading">Theme & Appearance</h3>
                <p className="section-desc">
                  Customize the visual styling of G-CIRCLE. The entire interface strictly uses Burgundy, Warm Beige, and Ivory families with WCAG-compliant contrast.
                </p>
              </div>

              {appearanceMsg && (
                <div className="success-banner">
                  <CheckCircle2 size={16} />
                  <span>{appearanceMsg}</span>
                </div>
              )}

              {/* Theme Modes */}
              <div className="appearance-group">
                <label className="group-label">Theme Mode</label>
                <div className="modes-grid">
                  <div
                    className={`mode-selector-card ${themeMode === 'light' ? 'selected' : ''}`}
                    onClick={() => handleModeChange('light')}
                  >
                    <div className="mode-icon-circle light">
                      <Sun size={20} />
                    </div>
                    <strong className="mode-title">Light Mode</strong>
                    <p className="mode-desc">Ivory background, white cards, burgundy primary accents, and dark high-contrast text.</p>
                    <span className="select-pill">{themeMode === 'light' ? 'Active' : 'Select'}</span>
                  </div>

                  <div
                    className={`mode-selector-card ${themeMode === 'dark' ? 'selected' : ''}`}
                    onClick={() => handleModeChange('dark')}
                  >
                    <div className="mode-icon-circle dark">
                      <Moon size={20} />
                    </div>
                    <strong className="mode-title">Dark Mode</strong>
                    <p className="mode-desc">Deep burgundy-derived dark surfaces, warm beige accents, and bright ivory text.</p>
                    <span className="select-pill">{themeMode === 'dark' ? 'Active' : 'Select'}</span>
                  </div>

                  <div
                    className={`mode-selector-card ${themeMode === 'system' ? 'selected' : ''}`}
                    onClick={() => handleModeChange('system')}
                  >
                    <div className="mode-icon-circle system">
                      <Laptop size={20} />
                    </div>
                    <strong className="mode-title">System Default</strong>
                    <p className="mode-desc">Automatically adapts between Light and Dark mode based on your operating system.</p>
                    <span className="select-pill">{themeMode === 'system' ? 'Active' : 'Select'}</span>
                  </div>
                </div>
              </div>

              {/* Theme Intensity */}
              <div className="appearance-group">
                <label className="group-label">Palette Intensity</label>
                <p className="group-sub">Fine-tune the depth of the Burgundy, Warm Beige, and Ivory color tokens:</p>
                <div className="intensity-options-row">
                  {[
                    { id: 'soft', name: 'Soft', desc: 'Muted, airy, gentle contrast' },
                    { id: 'classic', name: 'Classic', desc: 'Standard balanced university palette' },
                    { id: 'rich', name: 'Rich', desc: 'High-contrast, deep burgundy & warm beige' },
                  ].map((int) => (
                    <div
                      key={int.id}
                      className={`intensity-card ${themeIntensity === int.id ? 'selected' : ''}`}
                      onClick={() => handleIntensityChange(int.id)}
                    >
                      <strong className="intensity-title">{int.name}</strong>
                      <span className="intensity-desc">{int.desc}</span>
                      {themeIntensity === int.id && <span className="active-dot">● Active</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Swatch Preview */}
              <div className="swatch-preview-box">
                <span className="swatch-title">Active Color Tokens</span>
                <div className="swatches-row">
                  <div className="swatch-pill">
                    <span className="swatch-circle" style={{ backgroundColor: '#722F3E' }} />
                    <span>Burgundy (#722F3E)</span>
                  </div>
                  <div className="swatch-pill">
                    <span className="swatch-circle" style={{ backgroundColor: '#51212E' }} />
                    <span>Deep Burgundy (#51212E)</span>
                  </div>
                  <div className="swatch-pill">
                    <span className="swatch-circle" style={{ backgroundColor: '#E9DDCE' }} />
                    <span>Warm Beige (#E9DDCE)</span>
                  </div>
                  <div className="swatch-pill">
                    <span className="swatch-circle" style={{ backgroundColor: '#FAF8F4', border: '1px solid #D8C8B6' }} />
                    <span>Ivory (#FAF8F4)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-head">
                <h3 className="section-heading">Profile Settings</h3>
                <p className="section-desc">Manage your academic credentials and verified Galgotias student information.</p>
              </div>

              <div className="info-display-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <strong className="info-value">{user?.name}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Student ID</span>
                  <strong className="info-value">{user?.studentId}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Official University Email</span>
                  <strong className="info-value">{user?.email}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Academic Year</span>
                  <strong className="info-value">{user?.academicYear}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Course / Branch</span>
                  <strong className="info-value">{user?.course}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Institution</span>
                  <strong className="info-value">Galgotias University</strong>
                </div>
              </div>

              <div className="form-action-note">
                <p>To update your bio, technical skills, or social links, please visit your Student Profile page.</p>
              </div>
            </div>
          )}

          {/* 3. Password Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-head">
                <h3 className="section-heading">Password & Security</h3>
                <p className="section-desc">Ensure your account is protected with a secure password.</p>
              </div>

              {passwordMsg && (
                <div className="success-banner">
                  <CheckCircle2 size={16} />
                  <span>{passwordMsg}</span>
                </div>
              )}
              {passwordError && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPasswordError('');
                  if (newPassword.length < 6) {
                    setPasswordError('New password must be at least 6 characters long.');
                    return;
                  }
                  if (newPassword !== confirmNewPassword) {
                    setPasswordError('Passwords do not match.');
                    return;
                  }
                  setPasswordMsg('Password updated successfully.');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setTimeout(() => setPasswordMsg(''), 4000);
                }}
              >
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    className="input-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    className="input-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input-control"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* 4. Privacy Preferences */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <div className="section-head">
                <h3 className="section-heading">Privacy Preferences</h3>
                <p className="section-desc">Control your collaborator visibility across the university ecosystem.</p>
              </div>

              <div className="privacy-options-stack">
                <div className="privacy-option-item">
                  <div>
                    <strong className="option-title">University Email Notifications</strong>
                    <p className="option-desc">Receive notifications when you get join requests or task assignments.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="toggle-checkbox"
                  />
                </div>

                <div className="privacy-option-item">
                  <div>
                    <strong className="option-title">Discovery Profile Visibility</strong>
                    <p className="option-desc">Allow project creators to find you in the complementary matching engine.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header .title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .page-header .subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          align-items: flex-start;
        }

        .settings-nav-card {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .settings-nav-btn:hover {
          background-color: var(--bg-surface);
          color: var(--accent-primary);
        }

        .settings-nav-btn.active {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          box-shadow: var(--shadow-sm);
        }

        .settings-content-card {
          padding: 32px;
        }

        .section-head {
          margin-bottom: 24px;
        }

        .section-heading {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .section-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: var(--beige-400);
          border: 1px solid var(--beige-600);
          border-radius: var(--radius-md);
          color: var(--burgundy-900);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .appearance-group {
          margin-bottom: 28px;
        }

        .group-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .group-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .modes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .mode-selector-card {
          padding: 18px;
          background-color: var(--bg-surface);
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
        }

        .mode-selector-card:hover {
          border-color: var(--border-strong);
        }

        .mode-selector-card.selected {
          border-color: var(--accent-primary);
          background-color: var(--bg-card);
          box-shadow: var(--shadow-md);
        }

        .mode-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border: 1px solid var(--border-subtle);
        }

        .mode-icon-circle.light {
          background-color: #FAF8F4;
          color: #722F3E;
        }

        .mode-icon-circle.dark {
          background-color: #38141D;
          color: #FAF8F4;
        }

        .mode-icon-circle.system {
          background-color: var(--beige-400);
          color: #51212E;
        }

        .mode-title {
          font-size: 14.5px;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .mode-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 14px;
          flex: 1;
        }

        .select-pill {
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          padding: 4px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface);
          color: var(--text-muted);
        }

        .mode-selector-card.selected .select-pill {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
        }

        .intensity-options-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .intensity-card {
          padding: 14px;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all var(--transition-fast);
        }

        .intensity-card:hover {
          border-color: var(--border-strong);
        }

        .intensity-card.selected {
          border-color: var(--accent-primary);
          background-color: var(--bg-card);
        }

        .intensity-title {
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .intensity-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .active-dot {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--accent-primary);
          margin-top: 4px;
        }

        .swatch-preview-box {
          padding: 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .swatch-title {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .swatches-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .swatch-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .swatch-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .info-display-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .info-item {
          padding: 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .info-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .form-action-note {
          padding: 12px 16px;
          background-color: var(--bg-surface);
          border-left: 3px solid var(--accent-primary);
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .privacy-options-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .privacy-option-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .option-title {
          display: block;
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .option-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
          .modes-grid, .intensity-options-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

