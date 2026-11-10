import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

/**
 * IMAGES  ->  client/public/images/
 *   campus_bg.png        (single background image: library + AI & Data Science Block)
 *   galgotias-logo.jpg   (university logo)
 */
const IMG_BG = '/images/campus_bg.png';
const IMG_LOGO = '/images/galgotias-logo.jpg';

const PORTAL_URL = 'https://www.galgotiasuniversity.edu.in';

/**
 * Removes the white background of the logo at runtime so it sits cleanly on the dark UI.
 * whitenDark = true  -> dark text pixels become white (navbar)
 * whitenDark = false -> original colours kept (coloured "G" mark in the card)
 * Also reports the image ratio (width / height) so we know if the file is just the mark.
 */
function useCleanLogo(src, whitenDark) {
  const [state, setState] = useState({ url: null, failed: false, ratio: 1 });

  useEffect(() => {
    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const p = data.data;

        for (let i = 0; i < p.length; i += 4) {
          const r = p[i];
          const g = p[i + 1];
          const b = p[i + 2];
          const mn = Math.min(r, g, b);

          if (mn >= 238) {
            p[i + 3] = 0;
            continue;
          }

          const a = (255 - mn) / 255;
          let nr = Math.min(255, Math.max(0, (r - mn) / a));
          let ng = Math.min(255, Math.max(0, (g - mn) / a));
          let nb = Math.min(255, Math.max(0, (b - mn) / a));

          if (whitenDark) {
            const mx = Math.max(nr, ng, nb);
            const mi = Math.min(nr, ng, nb);
            const sat = mx ? (mx - mi) / mx : 0;
            const lum = 0.299 * nr + 0.587 * ng + 0.114 * nb;
            if (lum < 110 && sat < 0.3) {
              nr = 245;
              ng = 246;
              nb = 250;
            }
          }

          p[i] = nr;
          p[i + 1] = ng;
          p[i + 2] = nb;
          p[i + 3] = Math.round(a * 255);
        }

        ctx.putImageData(data, 0, 0);
        if (!cancelled) setState({ url: canvas.toDataURL('image/png'), failed: false, ratio });
      } catch (e) {
        if (!cancelled) setState({ url: src, failed: false, ratio });
      }
    };

    img.onerror = () => {
      if (!cancelled) setState({ url: null, failed: true, ratio: 1 });
    };

    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, whitenDark]);

  return state;
}

export default function AuthLayout() {
  const location = useLocation();
  const outletRef = useRef(null);

  const navLogo = useCleanLogo(IMG_LOGO, true);
  const markLogo = useCleanLogo(IMG_LOGO, false);
  const logoIsMarkOnly = navLogo.ratio < 1.8;

  // Scale the card down (never up) so it always fits inside the viewport without scrolling.
  const cardRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, w: 0, h: 0, ready: false });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;

    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const isDesktop = window.innerWidth >= 900;
      const available = window.innerHeight - 78 - 80; // navbar + equal breathing room above & below
      let s = 1;
      if (isDesktop && h > available) s = Math.max(0.62, available / h);
      setFit((prev) =>
        prev.scale === s && prev.w === w && prev.h === h && prev.ready
          ? prev
          : { scale: s, w, h, ready: true }
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const isRegister = /register|signup|sign-up/i.test(location.pathname);
  const heading = isRegister ? 'Join G-CIRCLE' : 'Welcome Back';
  const subheading = isRegister
    ? 'Create your account with your Galgotias University email'
    : 'Log in with your Galgotias University credentials';

  /**
   * Hides (never deletes) two things inside the existing page:
   *  1. its own duplicate heading ("Welcome Back" / "Create Account") – the card already has one
   *  2. the "Quick demo logins" box
   * SAFETY: an element is only hidden if it contains NO input / form / submit button,
   * so the real login form can never be hidden by mistake.
   */
  useEffect(() => {
    const root = outletRef.current;
    if (!root) return undefined;

    const headingRe = /^(welcome back|create account|create your account|sign in|log ?in|login|register|sign up|join g-circle)/i;
    const demoRe = /quick demo|demo login/i;
    const namesRe = /aarav|priya|rohan/i;

    const hideExtras = () => {
      // 1) duplicate heading
      root.querySelectorAll('h1, h2, h3').forEach((h) => {
        if (h.dataset.authDup) return;
        if (h.closest('form')) return;
        if (headingRe.test((h.textContent || '').trim())) {
          h.dataset.authDup = '1';
          const next = h.nextElementSibling;
          if (next && next.tagName === 'P' && !next.querySelector('input, button, a')) {
            next.dataset.authDup = '1';
          }
        }
      });

      // 2) demo-login box (outermost element that holds the demo text but no form controls)
      const candidates = Array.from(root.querySelectorAll('div, section, aside, fieldset, ul')).filter((el) => {
        if (el.dataset.authDup) return false;
        const t = el.textContent || '';
        if (t.length > 400) return false;
        if (!demoRe.test(t) || !namesRe.test(t)) return false;
        return !el.querySelector('input, select, textarea, form, button[type="submit"]');
      });

      candidates.forEach((el) => {
        const insideAnother = candidates.some((o) => o !== el && o.contains(el));
        if (!insideAnother) el.dataset.authDup = '1';
      });
    };

    hideExtras();
    const observer = new MutationObserver(hideExtras);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="auth-layout">
      {/* ───────── Single background image (placed below the navbar so nothing is cut) ───────── */}
      <div className="auth-bg" aria-hidden="true">
        <div className="bg-photo" style={{ backgroundImage: `url("${IMG_BG}")` }} />
        <div className="bg-grade" />
        <div className="bg-vignette" />
        <div className="bg-top-fade" />
        <div className="bg-floor" />
      </div>

      {/* ───────── Navbar: brand + Home + Student Portal ───────── */}
      <header className="auth-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            {navLogo.failed ? (
              <span className="nav-uni">
                <span>GALGOTIAS</span>
                <span>UNIVERSITY</span>
              </span>
            ) : (
              <>
                {navLogo.url ? (
                  <img className="nav-logo" src={navLogo.url} alt="Galgotias University" />
                ) : (
                  <span className="nav-logo-placeholder" />
                )}
                {logoIsMarkOnly && (
                  <span className="nav-uni">
                    <span>GALGOTIAS</span>
                    <span>UNIVERSITY</span>
                  </span>
                )}
              </>
            )}
            <span className="nav-divider" />
            <span className="nav-product">G-CIRCLE</span>
          </div>

          <nav className="nav-links" aria-label="Primary">
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
          </nav>

          <div className="nav-right">
            <a
              className="nav-portal"
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9l10-5 10 5-10 5L2 9z" />
                <path d="M6 11.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.5" />
                <path d="M22 9v6" />
              </svg>
              <span className="portal-label">Student Portal</span>
              <svg className="portal-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ───────── Center glass card ───────── */}
      <main className="auth-stage">
        <div
          className={`card-fit ${fit.ready ? 'fit-ready' : ''}`}
          style={fit.ready ? { width: fit.w * fit.scale, height: fit.h * fit.scale } : undefined}
        >
          <section
            className="auth-glass-card"
            ref={cardRef}
            style={fit.ready ? { transform: `scale(${fit.scale})` } : undefined}
          >
            <div className="card-glow" aria-hidden="true" />
            <div className="card-shine" aria-hidden="true" />

            <div className="card-head">
              <div className="card-mark">
                {markLogo.url && !markLogo.failed ? (
                  <img src={markLogo.url} alt="Galgotias University" />
                ) : (
                  <span className="card-mark-fallback">G</span>
                )}
              </div>
              <h1 className="card-title">{heading}</h1>
              <p className="card-sub">
                <span>{subheading}</span>
              </p>
            </div>

            {/* Existing Login / Register page — all logic untouched */}
            <div className="auth-outlet" ref={outletRef}>
              <Outlet />
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap');

        .auth-layout {
          --navy: #111827;
          --charcoal: #1b1d2b;
          --burgundy: #8b173d;
          --burgundy-deep: #5a0f27;
          --rose: #d94d75;
          --text-hi: #f8fafc;
          --text-mid: #aeb4c0;

          --nav-h: 78px;
          --bg-lift: 80px; /* how far the background photo is pushed UP (bigger = building higher) */
          --bg-shift-x: 12vw; /* pushes the building to the RIGHT so the sign is not hidden by the card (0 = no shift) */
          --mark: clamp(48px, 8vh, 62px);
          --title: clamp(30px, 4.8vh, 38px);
          --field-h: clamp(46px, 7.2vh, 54px);
          --btn-h: clamp(50px, 7.8vh, 60px);

          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--navy);
          color: var(--text-hi);
          font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-size: 14px;
          overflow-x: hidden;
          isolation: isolate;
          animation: pageIn 0.8s ease both;
        }

        .auth-layout *,
        .auth-layout *::before,
        .auth-layout *::after { box-sizing: border-box; }

        @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }

        .auth-outlet [data-auth-dup] { display: none !important; }

        /* ───── Background: one photo, starting right under the navbar ───── */
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          background: linear-gradient(180deg, #0e1424, var(--navy) 60%, #0a0e19);
        }

        .bg-photo {
          position: absolute;
          top: calc(var(--nav-h) - var(--bg-lift));
          left: 0;
          right: calc(var(--bg-shift-x) * -1);
          bottom: 0;
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          transform-origin: center top;
          animation: bgZoom 32s ease-in-out infinite alternate;
        }

        @keyframes bgZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.04); }
        }

        .bg-grade {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(14, 20, 44, 0.24), rgba(60, 24, 70, 0.1) 55%, rgba(60, 32, 96, 0.18));
        }

        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 30% 62% at 50% 54%, rgba(8, 10, 22, 0.4), transparent 75%);
        }

        /* very short fade so the sign on top of the building is NOT darkened */
        .bg-top-fade {
          position: absolute;
          top: var(--nav-h);
          left: 0;
          right: 0;
          height: 5%;
          background: linear-gradient(180deg, rgba(14, 20, 36, 0.55), rgba(14, 20, 36, 0));
        }

        .bg-floor {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 12%;
          background: linear-gradient(180deg, rgba(10, 14, 25, 0), rgba(10, 14, 25, 0.65));
        }

        /* ───── Navbar ───── */
        .auth-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(14, 19, 33, 0.72);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
                  backdrop-filter: blur(16px) saturate(140%);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .nav-inner {
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          height: var(--nav-h);
          padding: 0 clamp(16px, 3.4vw, 64px);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .nav-logo {
          height: 48px;
          width: auto;
          max-width: 230px;
          object-fit: contain;
          display: block;
        }

        .nav-logo-placeholder { width: 48px; height: 48px; }

        .nav-uni {
          display: flex;
          flex-direction: column;
          font-family: 'Playfair Display', Georgia, serif;
          color: var(--text-hi);
          line-height: 1.05;
          white-space: nowrap;
        }

        .nav-uni span:first-child { font-size: 19px; font-weight: 600; letter-spacing: 2px; }
        .nav-uni span:last-child  { font-size: 13px; font-weight: 500; letter-spacing: 4.6px; }

        .nav-divider {
          width: 1px;
          height: 34px;
          background: rgba(255,255,255,0.28);
          flex-shrink: 0;
          margin: 0 4px;
        }

        .nav-product {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 27px;
          font-weight: 600;
          color: var(--text-hi);
          white-space: nowrap;
        }

        .nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* light text in EVERY state (normal / hover / focus / active / visited) */
        .auth-nav a,
        .auth-nav a:link,
        .auth-nav a:visited,
        .auth-nav a:hover,
        .auth-nav a:focus,
        .auth-nav a:active {
          color: var(--text-hi) !important;
          text-decoration: none !important;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-link {
          padding: 9px 24px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 500;
          border: 1px solid transparent;
          white-space: nowrap;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .nav-link:hover,
        .nav-link:focus-visible {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--burgundy), var(--burgundy-deep));
          border-color: rgba(217,77,117,0.55);
          box-shadow: 0 0 18px rgba(139,23,61,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .nav-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .nav-portal {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.03);
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }

        .nav-portal:hover,
        .nav-portal:focus-visible {
          background: rgba(255,255,255,0.1);
          border-color: var(--rose);
          box-shadow: 0 0 20px rgba(217,77,117,0.3);
          transform: translateY(-1px);
        }

        /* ───── Stage + glass card ───── */
        .auth-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .card-fit {
          position: relative;
          animation: cardIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }

        .card-fit.fit-ready .auth-glass-card {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top left;
        }

        .auth-glass-card {
          position: relative;
          width: 500px;
          max-width: calc(100vw - 40px);
          padding: clamp(18px, 3vh, 30px) clamp(20px, 2.6vw, 38px) clamp(20px, 3.2vh, 30px);
          border-radius: 30px;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 34%, rgba(255,255,255,0.02) 62%, rgba(255,255,255,0.08) 100%),
            rgba(20, 24, 44, 0.72);
          -webkit-backdrop-filter: blur(85px) saturate(180%);
                  backdrop-filter: blur(85px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow:
            0 30px 80px rgba(0,0,0,0.5),
            0 0 50px rgba(150,170,255,0.14),
            0 40px 90px -30px rgba(217,77,117,0.3),
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(255,255,255,0.1);
        }

        /* bright glowing edge: strongest at the top-left and bottom-right corners */
        .card-glow {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1.6px;
          background: linear-gradient(135deg,
            rgba(255,255,255,1) 0%,
            rgba(190,205,255,0.5) 14%,
            rgba(255,255,255,0.1) 34%,
            rgba(255,255,255,0.06) 62%,
            rgba(217,77,117,0.55) 86%,
            rgba(255,255,255,0.95) 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          mask-composite: exclude;
          pointer-events: none;
          animation: glowPulse 5s ease-in-out infinite;
        }

        /* soft light patches in the corners + a faint diagonal sheen */
        .card-shine {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.055) 50%, transparent 62%);
        }

        .card-shine::before {
          content: '';
          position: absolute;
          top: -38%;
          left: -28%;
          width: 85%;
          height: 80%;
          background: radial-gradient(circle, rgba(255,255,255,0.3), rgba(255,255,255,0) 62%);
        }

        .card-shine::after {
          content: '';
          position: absolute;
          bottom: -42%;
          right: -28%;
          width: 85%;
          height: 80%;
          background: radial-gradient(circle, rgba(217,77,117,0.34), rgba(217,77,117,0) 62%);
        }

        .card-head,
        .auth-outlet { position: relative; z-index: 1; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }

        .card-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: clamp(14px, 2.6vh, 22px);
        }

        .card-mark {
          width: var(--mark);
          height: var(--mark);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 6px;
          filter: drop-shadow(0 6px 14px rgba(217,77,117,0.35));
        }

        .card-mark img {
          height: 100%;
          width: auto;
          max-width: none;
          object-fit: contain;
          object-position: left center;
          display: block;
        }

        .card-mark-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 30% 25%, var(--rose), var(--burgundy) 60%, var(--burgundy-deep));
          font-weight: 800;
          font-size: 26px;
          color: #fff;
        }

        .card-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: var(--title);
          font-weight: 600;
          line-height: 1.15;
          color: var(--text-hi);
          margin: 0 0 clamp(8px, 1.4vh, 12px);
          text-shadow: 0 2px 18px rgba(0,0,0,0.35);
        }

        .card-sub {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 13.5px;
          color: var(--text-hi);
        }

        .card-sub span { text-align: center; }

        .card-sub::before,
        .card-sub::after {
          content: '';
          flex: 1;
          min-width: 10px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--rose));
        }

        .card-sub::after { background: linear-gradient(270deg, transparent, var(--rose)); }

        /* ───── Existing form rendered via <Outlet /> : dark glass -> LIGHT text ───── */
        .auth-outlet { color: var(--text-hi); }

        .auth-outlet :is(h1, h2, h3, h4, h5, h6, strong, label, legend) { color: var(--text-hi); }
        .auth-outlet :is(span, div) { color: inherit; }
        .auth-outlet :is(p, small) { color: var(--text-mid); font-size: 13px; }
        .auth-outlet [class*='error' i],
        .auth-outlet [role='alert'] { color: #ff8fab; font-size: 12.5px; }

        .auth-outlet form {
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 1.9vh, 16px);
        }

        .auth-outlet label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        .auth-outlet :where(input:not([type='checkbox']):not([type='radio']), select, textarea) {
          padding: 0 18px;
        }

        .auth-outlet input:not([type='checkbox']):not([type='radio']),
        .auth-outlet select,
        .auth-outlet textarea {
          width: 100%;
          height: var(--field-h);
          border-radius: 999px;
          background-color: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.22);
          color: var(--text-hi);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }

        .auth-outlet textarea {
          height: auto;
          min-height: 88px;
          padding: 12px 18px;
          border-radius: 20px;
        }

        .auth-outlet select option { color: #111827; background: #f8fafc; }

        .auth-outlet input::placeholder,
        .auth-outlet textarea::placeholder { color: var(--text-mid); opacity: 0.9; }

        .auth-outlet input:-webkit-autofill {
          -webkit-text-fill-color: var(--text-hi);
          -webkit-box-shadow: 0 0 0 100px #262b45 inset;
          caret-color: var(--text-hi);
        }

        .auth-outlet input:not([type='checkbox']):not([type='radio']):hover,
        .auth-outlet select:hover,
        .auth-outlet textarea:hover { border-color: rgba(255,255,255,0.36); }

        .auth-outlet input:not([type='checkbox']):not([type='radio']):focus,
        .auth-outlet select:focus,
        .auth-outlet textarea:focus {
          background-color: rgba(255,255,255,0.12);
          border-color: var(--rose);
          box-shadow: 0 0 0 3px rgba(217,77,117,0.22), 0 0 20px rgba(217,77,117,0.28);
        }

        /* envelope + lock icons (only when the page does not already draw its own icon) */
        .auth-outlet :not(:has(> svg)) > input[type='email'],
        .auth-outlet :not(:has(> svg)) > input[name*='email' i] {
          padding-left: 52px;
          background-repeat: no-repeat;
          background-position: 18px center;
          background-size: 22px 22px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='M3 7l9 6 9-6'/%3E%3C/svg%3E");
        }

        .auth-outlet :not(:has(> svg)) > input[type='password'],
        .auth-outlet :not(:has(> svg)) > input[name*='password' i] {
          padding-left: 52px;
          background-repeat: no-repeat;
          background-position: 18px center;
          background-size: 22px 22px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f8fafc' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='11' width='14' height='9' rx='2'/%3E%3Cpath d='M8 11V8a4 4 0 0 1 8 0v3'/%3E%3Ccircle cx='12' cy='15.5' r='1'/%3E%3C/svg%3E");
        }

        .auth-outlet input[type='checkbox'] {
          accent-color: var(--burgundy);
          width: 17px;
          height: 17px;
          cursor: pointer;
        }

        .auth-outlet button:not([type='submit']) { color: var(--text-mid); }
        .auth-outlet button:not([type='submit']):hover { color: var(--text-hi); }

        .auth-outlet a,
        .auth-outlet a:link,
        .auth-outlet a:visited {
          color: #ff8fb0;
          text-decoration: none;
          font-weight: 600;
          text-shadow: 0 1px 8px rgba(0,0,0,0.45);
          transition: color 0.25s ease, text-shadow 0.25s ease;
        }

        .auth-outlet a:hover,
        .auth-outlet a:active {
          color: #ff86a8;
          text-shadow: 0 0 14px rgba(217,77,117,0.5);
        }

        /* Sign-in button */
        .auth-outlet button[type='submit'] {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: var(--btn-h);
          border: 1px solid rgba(217,77,117,0.55);
          border-radius: 999px;
          background: linear-gradient(135deg, #a8204d 0%, #6a1230 100%);
          color: var(--text-hi);
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(139,23,61,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
        }

        .auth-outlet button[type='submit']::after {
          content: '';
          position: absolute;
          top: 0;
          left: -80%;
          width: 50%;
          height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.28), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s ease;
          pointer-events: none;
        }

        .auth-outlet button[type='submit']:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(217,77,117,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
          filter: brightness(1.08);
        }

        .auth-outlet button[type='submit']:hover:not(:disabled)::after { left: 130%; }
        .auth-outlet button[type='submit']:active:not(:disabled) { transform: translateY(0); }
        .auth-outlet button[type='submit']:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-outlet button:focus-visible,
        .auth-outlet a:focus-visible {
          outline: 2px solid var(--rose);
          outline-offset: 3px;
        }

        /* ───── Responsive ───── */
        @media (max-width: 900px) {
          .nav-inner { grid-template-columns: 1fr auto auto; gap: 12px; }
          .nav-product { font-size: 24px; }
          .auth-layout { --bg-shift-x: 0px; }
          .bg-photo { background-position: 30% top; filter: brightness(0.75); }
        }

        @media (max-width: 700px) {
          .nav-uni { display: none; }
          .portal-label,
          .portal-arrow { display: none; }
          .nav-portal { padding: 10px 12px; }
          .nav-link { padding: 9px 16px; }
        }

        @media (max-width: 560px) {
          .auth-layout { --nav-h: 64px; }
          .nav-brand { gap: 10px; }
          .nav-divider { height: 26px; margin: 0; }
          .nav-logo { height: 36px; }
          .nav-logo-placeholder { width: 36px; height: 36px; }
          .nav-product { font-size: 20px; }

          .auth-stage { padding: 16px 12px 32px; align-items: flex-start; }
          .auth-glass-card { border-radius: 24px; }
          .card-sub { font-size: 12px; gap: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-layout,
          .auth-layout *,
          .auth-layout *::before,
          .auth-layout *::after {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
