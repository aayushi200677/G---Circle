import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No results found', message = 'Try adjusting your filters or search query.', actionText, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-box">
        <Icon size={28} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-message">{message}</p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}

      <style>{`
        .empty-state {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-card);
          border: 1px dashed var(--border-strong);
          border-radius: var(--radius-lg);
          margin: 16px 0;
        }

        .empty-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .empty-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .empty-message {
          font-size: 13px;
          color: var(--text-muted);
          max-width: 380px;
          line-height: 1.45;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
