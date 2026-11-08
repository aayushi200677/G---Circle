import React from 'react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span className="loading-text">{message}</span>

      <style>{`
        .loading-state {
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border-subtle);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }

        .loading-text {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-muted);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
