import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Bell, Search, ChevronDown } from 'lucide-react';

/* ------------------------------------------------------------------
   SpringPopover: pill jo apne content ke size tak spring ke saath
   failta hai aur band hone pe wapas sikud jata hai.
------------------------------------------------------------------- */
function SpringPopover({ open, side = 'right', children }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      panel.style.setProperty('--w', content.offsetWidth + 'px');
      panel.style.setProperty('--h', content.offsetHeight + 'px');
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={panelRef} className={`sp ${side} ${open ? 'open' : ''}`}>
      <div className="sp-bg" />
      <div ref={contentRef} className="sp-content">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   SpringMenu: list jisme hover highlight spring ke saath glide karta hai
------------------------------------------------------------------- */
function SpringMenu({ items, open, columns = 1 }) {
  const [hl, setHl] = useState({ x: 0, y: 0, w: 0, h: 0, show: false, instant: false });

  const move = (e) => {
    const li = e.currentTarget; // li ka offset ul ke hisaab se aata hai
    setHl((p) => ({
      x: li.offsetLeft,
      y: li.offsetTop,
      w: li.offsetWidth,
      h: li.offsetHeight,
      show: true,
      instant: !p.show, // pehli baar seedha wahin dikhao, glide nahi
    }));
  };

  useEffect(() => {
    if (!open) setHl((p) => ({ ...p, show: false }));
  }, [open]);

  useEffect(() => {
    if (!hl.instant) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setHl((p) => ({ ...p, instant: false })))
    );
    return () => cancelAnimationFrame(id);
  }, [hl.instant]);

  return (
    <ul
      className={`sp-menu ${columns === 2 ? 'cols-2' : ''}`}
      onMouseLeave={() => setHl((p) => ({ ...p, show: false }))}
    >
      <li
        aria-hidden="true"
        className={`sp-hl ${hl.show ? 'show' : ''} ${hl.instant ? 'instant' : ''}`}
        style={{ width: hl.w, height: hl.h, transform: `translate(${hl.x}px, ${hl.y}px)` }}
      />
      {items.map((it, i) => (
        <li
          key={it.label}
          className="sp-li"
          style={{ '--i': i }}
          onMouseEnter={move}
          onFocus={move}
        >
          <button
            type="button"
            className={`${it.active ? 'active' : ''} ${it.danger ? 'danger' : ''}`}
            onClick={it.onClick}
            aria-current={it.active ? 'page' : undefined}
          >
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

const QUICK_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Explore Projects', to: '/explore' },
  { label: 'Find Collaborators', to: '/collaborators' },
  { label: 'My Projects', to: '/my-projects' },
  { label: 'My Teams', to: '/my-teams' },
  { label: 'My Tasks', to: '/my-tasks' },
  { label: 'Requests Inbox', to: '/requests' },
  { label: 'Settings', to: '/settings' },
];

export default function Navbar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user;
  const logout = auth.logout;
  const [notifications, setNotifications] = useState([]);
  const [openMenu, setOpenMenu] = useState(null); // null | 'nav' | 'notif' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));
  const close = () => setOpenMenu(null);

  // Bahar click ya Escape dabane pe band
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e) => {
      const el = e.target;
      if (!(el instanceof Element) || !el.closest(`[data-sp-root="${openMenu}"]`)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  // Page change hote hi menu band
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  // Scroll pe navbar ke neeche shadow (kisi bhi scroll container ke liye)
  useEffect(() => {
    const onScroll = (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest('.sp')) return;
      const y = t instanceof Element ? t.scrollTop : window.scrollY;
      setScrolled(y > 8);
    };
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, []);

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
        if (res && res.success && Array.isArray(res.data)) {
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
        close();
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

  const go = (to) => {
    close();
    navigate(to);
  };

  const handleLogout = () => {
    close();
    if (typeof logout === 'function') logout();
  };

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const quickItems = QUICK_LINKS.map((l) => ({
    label: l.label,
    active: isActive(l.to),
    onClick: () => go(l.to),
  }));

  const profileItems = [
    { label: 'My Profile', onClick: () => go('/profile') },
    { label: 'My Projects', onClick: () => go('/my-projects') },
    { label: 'Settings', onClick: () => go('/settings') },
    { label: 'Log out', danger: true, onClick: handleLogout },
  ];

  const avatarSrc =
    (user && user.avatar) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${(user && user.name) || 'GU'}&backgroundColor=722F3E&textColor=FAF8F4`;

  return (
    <>
      {/* Menu khulne pe peeche ka page blur (header se bahar rakha hai) */}
      <div className={`nav-scrim ${openMenu ? 'on' : ''}`} onClick={close} />

      <header className={`app-navbar ${scrolled ? 'scrolled' : ''}`}>
        {/* ---------- LEFT: breadcrumb + title + quick menu ---------- */}
        <div className="navbar-left sp-root" data-sp-root="nav">
          <div className="breadcrumb-line" key={`b-${breadcrumb}`}>
            <span>{breadcrumb}</span>
          </div>
          <div className="title-row">
            <h1 className="page-title" key={`t-${title}`}>{title}</h1>
            <button
              type="button"
              className={`chev-btn ${openMenu === 'nav' ? 'open' : ''}`}
              onClick={() => toggle('nav')}
              aria-expanded={openMenu === 'nav'}
              aria-label="Quick navigation"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <SpringPopover open={openMenu === 'nav'} side="left">
            <SpringMenu items={quickItems} open={openMenu === 'nav'} columns={2} />
          </SpringPopover>
        </div>

        {/* ---------- RIGHT: search + notifications + profile ---------- */}
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
          <div className="notifications-wrap sp-root" data-sp-root="notif">
            <button
              type="button"
              className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => toggle('notif')}
              title="Notifications"
              aria-expanded={openMenu === 'notif'}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="notif-badge" key={unreadCount}>{unreadCount}</span>
              )}
            </button>

            <SpringPopover open={openMenu === 'notif'} side="right">
              <div className="notif-body">
                <div className="notif-header">
                  <h3>Notifications</h3>
                  <span className="notif-count">{unreadCount} unread</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div
                        key={n.id}
                        style={{ '--i': Math.min(idx, 8) }}
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
            </SpringPopover>
          </div>

          {/* Profile menu */}
          <div className="profile-wrap sp-root" data-sp-root="profile">
            <button
              type="button"
              className="navbar-profile"
              onClick={() => toggle('profile')}
              aria-expanded={openMenu === 'profile'}
              title="My Account"
            >
              <img
                src={avatarSrc}
                alt={(user && user.name) || 'Student'}
                className="navbar-avatar"
              />
            </button>

            <SpringPopover open={openMenu === 'profile'} side="right">
              <SpringMenu items={profileItems} open={openMenu === 'profile'} />
            </SpringPopover>
          </div>
        </div>

        <style>{`
          .app-navbar {
            --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
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
            transition: box-shadow 0.4s ease;
          }
          .app-navbar.scrolled { box-shadow: var(--shadow-md); }

          @supports (transition-timing-function: linear(0, 1)) {
            .app-navbar {
              --ease-spring: linear(0, 0.007 1.3%, 0.028 2.7%, 0.112 5.8%, 0.224 8.8%, 0.594 17.7%, 0.786 23.4%, 0.856 26.1%, 0.916 28.9%, 0.964 31.8%, 1 34.8%, 1.038 40.4%, 1.05 47%, 1.005 75.3%, 1);
            }
          }

          .sp-root { position: relative; }

          /* ---------- Page blur jab menu khule ---------- */
          .nav-scrim {
            position: fixed;
            inset: 0;
            z-index: 39;
            background: rgba(34, 11, 17, 0.18);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.4s ease, visibility 0s linear 0.4s;
          }
          .nav-scrim.on {
            opacity: 1;
            visibility: visible;
            pointer-events: all;
            transition: opacity 0.4s ease, visibility 0s;
          }

          /* ---------- Left: breadcrumb + title ---------- */
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
            animation: text-in 0.6s var(--ease-spring) both;
          }

          .title-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .page-title {
            font-size: 19px;
            font-weight: 700;
            color: var(--text-primary);
            animation: text-in 0.7s var(--ease-spring) 0.05s both;
          }

          @keyframes text-in {
            from { opacity: 0; transform: translateY(10px); filter: blur(6px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }

          .chev-btn {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid var(--border-subtle);
            background-color: var(--bg-surface);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition:
              transform 0.6s var(--ease-spring),
              color 0.2s ease,
              border-color 0.2s ease,
              background-color 0.2s ease;
          }
          .chev-btn:hover { color: var(--accent-primary); border-color: var(--accent-primary); transform: scale(1.12); }
          .chev-btn:active { transform: scale(0.9); }
          .chev-btn.open {
            transform: rotate(180deg);
            color: var(--text-inverse);
            background-color: var(--accent-primary);
            border-color: var(--accent-primary);
          }

          /* ---------- Right side ---------- */
          .navbar-right {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .navbar-search {
            position: relative;
            width: 260px;
            transition: width 0.7s var(--ease-spring);
          }
          .navbar-search:focus-within { width: 340px; }

          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
            transition: color 0.3s ease, transform 0.6s var(--ease-spring);
          }
          .navbar-search:focus-within .search-icon {
            color: var(--accent-primary);
            transform: translateY(-50%) scale(1.15);
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
            transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.4s ease;
          }
          .search-input:focus {
            border-color: var(--accent-primary);
            background-color: var(--bg-card);
            box-shadow: 0 0 0 4px rgba(114, 47, 62, 0.12), 0 8px 24px rgba(114, 47, 62, 0.15);
          }

          /* ---------- Bell ---------- */
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
            transition:
              transform 0.5s var(--ease-spring),
              background-color 0.3s ease,
              border-color 0.3s ease,
              color 0.3s ease;
          }
          .notif-btn:hover {
            background-color: var(--bg-card);
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: scale(1.08);
          }
          .notif-btn:active { transform: scale(0.92); }
          .notif-btn[aria-expanded='true'] {
            color: var(--accent-primary);
            border-color: var(--accent-primary);
          }
          .notif-btn svg { transform-origin: 50% 10%; }
          .notif-btn[aria-expanded='true'] svg { animation: bell-ring 0.9s ease both; }
          .notif-btn.has-unread svg { animation: bell-ring 1.2s ease 1s 2 both; }

          @keyframes bell-ring {
            0% { transform: rotate(0); }
            15% { transform: rotate(18deg); }
            30% { transform: rotate(-16deg); }
            45% { transform: rotate(12deg); }
            60% { transform: rotate(-8deg); }
            75% { transform: rotate(4deg); }
            100% { transform: rotate(0); }
          }

          .notif-badge {
            position: absolute;
            top: -3px;
            right: -3px;
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
            animation: badge-pop 0.6s var(--ease-spring) both;
          }
          @keyframes badge-pop {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }

          /* ---------- Avatar ---------- */
          .navbar-profile {
            cursor: pointer;
            background: none;
            border: 0;
            padding: 0;
            display: block;
            border-radius: 50%;
          }
          .navbar-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            border: 2px solid var(--border-strong);
            transition:
              transform 0.6s var(--ease-spring),
              box-shadow 0.5s var(--ease-spring),
              border-color 0.3s ease;
          }
          .navbar-profile:hover .navbar-avatar { transform: scale(1.08); border-color: var(--accent-primary); }
          .navbar-profile:active .navbar-avatar { transform: scale(0.94); }
          .navbar-profile[aria-expanded='true'] .navbar-avatar {
            transform: scale(1.1);
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 5px var(--accent-subtle);
          }

          .chev-btn:focus-visible,
          .notif-btn:focus-visible,
          .navbar-profile:focus-visible,
          .sp-menu button:focus-visible {
            outline: 2px solid var(--accent-primary);
            outline-offset: 2px;
          }

          /* =========================================================
             SPRING POPOVER
             ========================================================= */
          .sp {
            position: absolute;
            top: calc(100% + 10px);
            z-index: 100;
            visibility: hidden;
            pointer-events: none;
            transition: visibility 0s linear 0.65s;
          }
          .sp.right { right: 0; }
          .sp.left { left: 0; }
          .sp.open {
            visibility: visible;
            pointer-events: all;
            transition: visibility 0s;
          }

          /* Background pill: chhota circle <-> content ke size ka */
          .sp-bg {
            position: absolute;
            top: 0;
            width: 38px;
            height: 38px;
            border-radius: 19px;
            background-color: var(--bg-card);
            border: 1px solid var(--border-subtle);
            box-shadow: var(--shadow-xl), 0 18px 50px rgba(114, 47, 62, 0.22);
            box-sizing: border-box;
            opacity: 0;
            transition:
              width 0.65s var(--ease-spring),
              height 0.65s var(--ease-spring),
              border-radius 0.65s var(--ease-spring),
              opacity 0.25s ease 0.35s;
          }
          .sp.right .sp-bg { right: 0; }
          .sp.left .sp-bg { left: 0; }
          .sp.open .sp-bg {
            width: var(--w, 220px);
            height: var(--h, 200px);
            border-radius: 22px;
            opacity: 1;
            transition:
              width 0.65s var(--ease-spring),
              height 0.65s var(--ease-spring),
              border-radius 0.65s var(--ease-spring),
              opacity 0.05s ease 0s;
          }

          /* Content: scale + fade + slide */
          .sp-content {
            position: relative;
            border-radius: 22px;
            overflow: hidden;
            opacity: 0;
            translate: 0 -8px;
            scale: 0.94;
            transition: opacity 0.15s ease-out, translate 0.2s ease-out, scale 0.2s ease-out;
          }
          .sp.right .sp-content { transform-origin: top right; }
          .sp.left .sp-content { transform-origin: top left; }
          .sp.open .sp-content {
            opacity: 1;
            translate: 0 0;
            scale: 1;
            transition:
              opacity 0.35s ease-out 0.1s,
              translate 0.6s var(--ease-spring) 0.1s,
              scale 0.6s var(--ease-spring) 0.1s;
          }

          /* ---------- Menu list ---------- */
          .sp-menu {
            list-style: none;
            margin: 0;
            padding: 8px;
            display: grid;
            grid-template-columns: 1fr;
            min-width: 200px;
            position: relative;
          }
          .sp-menu.cols-2 {
            grid-template-columns: repeat(2, 1fr);
            min-width: 340px;
          }

          /* Sliding highlight */
          .sp-hl {
            position: absolute;
            top: 0;
            left: 0;
            border-radius: var(--radius-md);
            background-color: var(--accent-subtle);
            pointer-events: none;
            opacity: 0;
            z-index: 0;
            transition:
              transform 0.5s var(--ease-spring),
              width 0.5s var(--ease-spring),
              height 0.5s var(--ease-spring),
              opacity 0.25s ease;
          }
          .sp-hl.show { opacity: 1; }
          .sp-hl.instant { transition: opacity 0.25s ease; }

          .sp-li {
            position: relative;
            z-index: 1;
            transition: opacity 0.25s ease;
          }
          /* Hover pe baaki items halke dim */
          .sp-menu:has(.sp-li:hover) .sp-li { opacity: 0.55; }
          .sp-menu:has(.sp-li:hover) .sp-li:hover { opacity: 1; }

          /* Items ek-ek karke bounce karke aate hain */
          .sp.open .sp-li,
          .sp.open .notif-item {
            animation: sp-item-in 0.6s var(--ease-spring) both;
            animation-delay: calc(var(--i, 0) * 45ms + 180ms);
          }
          @keyframes sp-item-in {
            from { opacity: 0; transform: translateY(14px) scale(0.96); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }

          .sp-menu button {
            display: block;
            width: 100%;
            text-align: left;
            background: none;
            border: 0;
            padding: 9px 12px;
            border-radius: var(--radius-md);
            font: inherit;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
            cursor: pointer;
            transition: color 0.25s ease, scale 0.4s var(--ease-spring), padding-left 0.4s var(--ease-spring);
          }
          .sp-menu button:hover { color: var(--accent-primary); padding-left: 16px; }
          .sp-menu button:active { scale: 0.96; }
          .sp-menu button.active { color: var(--accent-primary); font-weight: 700; }
          .sp-menu button.danger:hover { color: #b3261e; }

          /* ---------- Notifications content ---------- */
          .notif-body {
            width: 340px;
            max-width: calc(100vw - 32px);
          }

          .notif-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .notif-header h3 { font-size: 13.5px; font-weight: 700; }
          .notif-count { font-size: 11px; color: var(--accent-primary); font-weight: 600; }

          .notif-list { max-height: 320px; overflow-y: auto; }

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
            transition: background-color 0.2s ease, padding-left 0.4s var(--ease-spring);
          }
          .notif-item:hover { background-color: var(--bg-surface); padding-left: 22px; }
          .notif-item.unread { background-color: var(--accent-subtle); }

          .notif-item-body { flex: 1; }
          .notif-title { font-size: 12.5px; color: var(--text-primary); display: block; }
          .notif-msg {
            font-size: 12px;
            color: var(--text-secondary);
            margin: 2px 0 4px;
            line-height: 1.4;
          }
          .notif-time { font-size: 10.5px; color: var(--text-muted); }

          .unread-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: var(--accent-primary);
            margin-top: 5px;
            flex-shrink: 0;
            animation: dot-pulse 1.8s ease-out infinite;
          }
          @keyframes dot-pulse {
            0% { box-shadow: 0 0 0 0 rgba(114, 47, 62, 0.5); }
            70% { box-shadow: 0 0 0 8px rgba(114, 47, 62, 0); }
            100% { box-shadow: 0 0 0 0 rgba(114, 47, 62, 0); }
          }

          /* ---------- Mobile ---------- */
          @media (max-width: 640px) {
            .app-navbar { padding: 0 16px; }
            .navbar-search { display: none; }
            .sp-menu.cols-2 { grid-template-columns: 1fr; min-width: 210px; }
          }

          /* ---------- Reduced motion ---------- */
          @media (prefers-reduced-motion: reduce) {
            .sp, .sp-bg, .sp-content, .sp-hl, .chev-btn, .navbar-avatar,
            .navbar-search, .notif-btn, .nav-scrim { transition: none !important; }
            .sp.open .sp-li, .sp.open .notif-item, .page-title, .breadcrumb-line,
            .notif-btn svg, .notif-badge, .unread-dot { animation: none !important; }
          }
        `}</style>
      </header>
    </>
  );
}
