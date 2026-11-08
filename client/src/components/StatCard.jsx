import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-body">
        <h3 className="stat-value">{value}</h3>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>

      <style>{`
        .stat-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 120px;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-body {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-subtitle {
          font-size: 11.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
