import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-app);
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }

        .dashboard-content {
          flex: 1;
          padding: 28px 32px 48px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
          }
          .dashboard-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

