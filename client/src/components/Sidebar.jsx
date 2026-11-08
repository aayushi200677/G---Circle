import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Compass,
  Users,
  FolderGit2,
  UsersRound,
  CheckSquare,
  Inbox,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Video,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `nav-item ${isActive ? 'active' : ''}`;

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <span className="logo-letter">G</span>
        </div>
        <div className="brand-text">
          <h2 className="brand-name">G-CIRCLE</h2>
          <p className="brand-tagline">Discover. Collaborate. Build.</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        <div className="nav-group">
          <span className="nav-group-title">Overview</span>
          <NavLink to="/" end className={navItemClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Discover</span>
          <NavLink to="/explore" className={navItemClass}>
            <Compass size={18} />
            <span>Explore Projects</span>
          </NavLink>
          <NavLink to="/collaborators" className={navItemClass}>
            <Users size={18} />
            <span>Find Collaborators</span>
          </NavLink>
          <NavLink to="/showcase" className={navItemClass}>
            <Video size={18} />
            <span>Talent Showcase</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">My Workspace</span>
          <NavLink to="/my-projects" className={navItemClass}>
            <FolderGit2 size={18} />
            <span>My Projects</span>
          </NavLink>
          <NavLink to="/my-teams" className={navItemClass}>
            <UsersRound size={18} />
            <span>My Teams</span>
          </NavLink>
          <NavLink to="/my-tasks" className={navItemClass}>
            <CheckSquare size={18} />
            <span>My Tasks</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Activity</span>
          <NavLink to="/requests" className={navItemClass}>
            <Inbox size={18} />
            <span>Requests</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">System</span>
          <NavLink to="/settings" className={navItemClass}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Fixed Bottom Profile Bar */}
      <div className="sidebar-profile-bar">
        <div className="profile-info-wrap" onClick={() => navigate('/profile')} title="View your profile">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}&backgroundColor=722F3E&textColor=FAF8F4`}
            alt={user?.name || 'Student'}
            className="user-avatar"
          />
          <div className="user-details">
            <span className="user-name">{user?.name || 'Galgotias Student'}</span>
            <span className="user-meta">{user?.academicYear || 'Student'} • {user?.course || 'GU'}</span>
          </div>
          <ChevronRight size={16} className="profile-arrow" />
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Log Out">
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .app-sidebar {
          width: 250px;
          min-width: 250px;
          height: 100vh;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar-brand {
          height: 72px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--burgundy-700), var(--burgundy-900));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(81, 33, 46, 0.25);
          flex-shrink: 0;
        }

        .logo-letter {
          color: var(--ivory-50);
          font-weight: 800;
          font-size: 18px;
          font-family: 'Manrope', sans-serif;
        }

        .brand-text {
          overflow: hidden;
        }

        .brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-tagline {
          font-size: 10.5px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-group-title {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          padding: 0 10px 4px 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .nav-item:hover {
          background-color: var(--bg-surface);
          color: var(--accent-primary);
        }

        .nav-item.active {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }

        .nav-item.active svg {
          color: var(--text-inverse);
        }

        .sidebar-profile-bar {
          height: 68px;
          padding: 10px 14px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-sidebar);
        }

        .profile-info-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          overflow: hidden;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast);
        }

        .profile-info-wrap:hover {
          background-color: var(--bg-surface);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-strong);
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-meta {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .logout-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background-color: var(--burgundy-50);
          color: var(--accent-primary);
          border-color: var(--border-subtle);
        }
      `}</style>
    </aside>
  );
}

