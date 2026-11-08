import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-container {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-xl);
          animation: modalAppear 200ms ease-out;
          overflow: hidden;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .modal-close-btn:hover {
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
