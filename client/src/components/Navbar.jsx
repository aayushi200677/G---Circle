import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Bell, Search, Check, ChevronRight } from 'lucide-react';

export default function Navbar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Page title and breadcrumbs based on pathname
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', breadcrumb: 'Overview / Dashboard' };
    if (path.startsWith('/explore')) return { title: 'Explore Projects', breadcrumb: 'Discover / Explore Projects' };
    if (path.startsWith('/collaborators')) return { title: 'Find Collaborators', breadcrumb: 'Discover / Find Collaborators' };
    if (path.startsWith('/projects/create')) return { title: 'Create Project', breadcrumb: 'Projects / Create Project' };
    if (path.startsWith('/projects/')) return { title: 'Project Details', breadcrumb: 'Projects / Details' };
    if (path.startsWith('/my-projects')) return { title: 'My Projects', breadcrumb: 'Workspace / My Projects' };
    if (path.startsWith('/my-teams')) return { title: 'My Teams', breadcrumb: 'Workspace / My Teams' };
    if (path.startsWith('/teams/')) return { title: 'Team Workspace', breadcrumb: 'Workspace / Team Details' };
    if (path.startsWith('/my-tasks')) return { title: 'My Tasks', breadcrumb: 'Workspace / Personal Tasks' };
    if (path.startsWith('/requests')) return { title: 'Requests Inbox', breadcrumb: 'Activity / Join Requests' };
    if (path.startsWith('/profile')) return { title: 'Student Profile', breadcrumb: 'Account / Profile' };
    if (path.startsWith('/settings')) return { title: 'Settings', breadcrumb: 'System / Settings' };
    return { title: 'G-CIRCLE', breadcrumb: 'Collaboration Ecosystem' };
  };

  const { title, breadcrumb } = getPageInfo();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await userService.getNotifications();
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      } catch (_) {}
    }
    fetchNotifications();
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id, link) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (link) {
        setShowNotifications(false);
        navigate(link);
      }
    } catch (_) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <div className="breadcrumb-line">
          <span>{breadcrumb}</span>
        </div>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, skills, or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Notifications */}
        <div className="notifications-wrap">
          <button
            className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                <span className="notif-count">{unreadCount} unread</span>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id, n.link)}
                    >
                      <div className="notif-item-body">
                        <strong className="notif-title">{n.title}</strong>
                        <p className="notif-msg">{n.message}</p>
                        <span className="notif-time">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!n.read && <span className="unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="navbar-profile" onClick={() => navigate('/profile')} title="My Profile">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'GU'}&backgroundColor=722F3E&textColor=FAF8F4`}
            alt={user?.name || 'Student'}
            className="navbar-avatar"
          />
        </div>
      </div>

      <style>{`
        .app-navbar {
          height: 72px;
          padding: 0 32px;
          background-color: var(--bg-navbar);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .navbar-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .breadcrumb-line {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .page-title {
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .navbar-search {
          position: relative;
          width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          font-size: 13px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-primary);
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          border-color: var(--accent-primary);
          background-color: var(--bg-card);
          box-shadow: 0 0 0 3px rgba(114, 47, 62, 0.1);
          width: 320px;
        }

        .notifications-wrap {
          position: relative;
        }

        .notif-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all var(--transition-fast);
        }

        .notif-btn:hover {
          background-color: var(--bg-card);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .notif-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          font-size: 10px;
          font-weight: 700;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-navbar);
        }

        .notif-dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          width: 340px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: 100;
          overflow: hidden;
        }

        .notif-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notif-header h3 {
          font-size: 13.5px;
          font-weight: 700;
        }

        .notif-count {
          font-size: 11px;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .notif-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .notif-empty {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        .notif-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .notif-item:hover {
          background-color: var(--bg-surface);
        }

        .notif-item.unread {
          background-color: var(--accent-subtle);
        }

        .notif-item-body {
          flex: 1;
        }

        .notif-title {
          font-size: 12.5px;
          color: var(--text-primary);
          display: block;
        }

        .notif-msg {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 2px 0 4px;
          line-height: 1.4;
        }

        .notif-time {
          font-size: 10.5px;
          color: var(--text-muted);
        }

        .unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent-primary);
          margin-top: 5px;
          flex-shrink: 0;
        }

        .navbar-profile {
          cursor: pointer;
        }

        .navbar-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-strong);
          transition: border-color var(--transition-fast);
        }

        .navbar-avatar:hover {
          border-color: var(--accent-primary);
        }
      `}</style>
    </header>
  );
}

