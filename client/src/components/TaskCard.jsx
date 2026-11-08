import React from 'react';
import { Calendar, User, MoreVertical, Trash2, Edit2 } from 'lucide-react';

export default function TaskCard({ task, onStatusChange, onEdit, onDelete, canManage = true }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'priority-urgent';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>

        {canManage && (
          <div className="task-actions">
            {onEdit && (
              <button className="icon-action-btn" onClick={() => onEdit(task)} title="Edit Task">
                <Edit2 size={13} />
              </button>
            )}
            {onDelete && (
              <button className="icon-action-btn delete-btn" onClick={() => onDelete(task.id)} title="Delete Task">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {/* Task Meta Footer */}
      <div className="task-footer">
        <div className="assignee-wrap">
          {task.assignedTo ? (
            <div className="assignee-pill" title={`Assigned to ${task.assignedTo.name}`}>
              <img
                src={task.assignedTo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                alt={task.assignedTo.name}
                className="assignee-avatar"
              />
              <span className="assignee-name">{task.assignedTo.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="unassigned-tag">
              <User size={12} /> Unassigned
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className="due-date" title="Due Date">
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Quick Status Selector */}
      {onStatusChange && (
        <div className="status-changer">
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      )}

      <style>{`
        .task-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-strong);
        }

        .task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .priority-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }

        .priority-urgent {
          background-color: var(--burgundy-900);
          color: var(--ivory-50);
        }

        .priority-high {
          background-color: var(--burgundy-700);
          color: var(--ivory-50);
        }

        .priority-medium {
          background-color: var(--beige-500);
          color: var(--burgundy-900);
        }

        .priority-low {
          background-color: var(--bg-surface);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .icon-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
        }

        .icon-action-btn:hover {
          color: var(--text-primary);
        }

        .delete-btn:hover {
          color: var(--accent-primary);
        }

        .task-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .task-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid var(--border-subtle);
        }

        .assignee-pill {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .assignee-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-strong);
        }

        .assignee-name {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .unassigned-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
        }

        .due-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .status-changer {
          margin-top: 2px;
        }

        .status-select {
          width: 100%;
          font-size: 11.5px;
          padding: 4px 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          outline: none;
          cursor: pointer;
        }

        .status-select:focus {
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
