import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-brand-pane">
        <div className="brand-badge">
          <span className="badge-letter">G</span>
        </div>
        <h1 className="auth-brand-name">G-CIRCLE</h1>
        <p className="auth-brand-tagline">Discover. Collaborate. Build.</p>
        <p className="auth-brand-desc">
          The premier university collaboration ecosystem connecting Galgotias University students based on complementary strengths, technical expertise, and communication capabilities.
        </p>

        <div className="auth-usp-points">
          <div className="usp-item">
            <span className="usp-bullet">✦</span>
            <div>
              <strong>Complementary Matching</strong>
              <p>Find teammates who fill missing capabilities instead of duplicate skills.</p>
            </div>
          </div>
          <div className="usp-item">
            <span className="usp-bullet">✦</span>
            <div>
              <strong>Communication Discovery</strong>
              <p>Connect with public speakers, presenters, and coordinators.</p>
            </div>
          </div>
          <div className="usp-item">
            <span className="usp-bullet">✦</span>
            <div>
              <strong>Integrated Workspaces</strong>
              <p>Manage project teams and Kanban sprint boards in one place.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-pane">
        <div className="auth-form-card">
          <Outlet />
        </div>
      </div>

      <style>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          background-color: var(--bg-app);
        }

        .auth-brand-pane {
          flex: 1;
          background: linear-gradient(145deg, var(--burgundy-900), var(--burgundy-700));
          color: var(--ivory-50);
          padding: 60px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-badge {
          width: 52px;
          height: 52px;
          background: var(--ivory-50);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        .badge-letter {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: var(--burgundy-800);
        }

        .auth-brand-name {
          font-size: 36px;
          font-weight: 800;
          color: var(--ivory-50);
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .auth-brand-tagline {
          font-size: 16px;
          font-weight: 600;
          color: var(--beige-400);
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .auth-brand-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--beige-200);
          max-width: 440px;
          margin-bottom: 40px;
        }

        .auth-usp-points {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 440px;
        }

        .usp-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .usp-bullet {
          color: var(--beige-400);
          font-size: 16px;
          margin-top: 2px;
        }

        .usp-item strong {
          display: block;
          font-size: 14px;
          color: var(--ivory-50);
          margin-bottom: 2px;
        }

        .usp-item p {
          font-size: 12.5px;
          color: var(--beige-400);
          line-height: 1.45;
        }

        .auth-form-pane {
          flex: 1.1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background-color: var(--bg-app);
          overflow-y: auto;
        }

        .auth-form-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 36px 32px;
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 900px) {
          .auth-layout {
            flex-direction: column;
          }
          .auth-brand-pane {
            display: none;
          }
          .auth-form-pane {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}
