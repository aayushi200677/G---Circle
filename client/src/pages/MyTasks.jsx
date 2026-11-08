import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService.js';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { CheckSquare, Filter, Calendar } from 'lucide-react';

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await taskService.getMyTasks(params);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      alert(err.message || 'Failed to update task.');
      fetchTasks();
    }
  };

  return (
    <div className="my-tasks-page">
      <div className="page-header">
        <div>
          <h2 className="title">Personal Tasks</h2>
          <p className="subtitle">All sprint tasks assigned to you across your active Galgotias University teams.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="filters-card card">
        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <div className="pills-wrap">
              {['All', 'TODO', 'IN_PROGRESS', 'DONE'].map((st) => (
                <button
                  key={st}
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'In Progress' : st === 'DONE' ? 'Done' : 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Priority:</span>
            <div className="pills-wrap">
              {['All', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((pr) => (
                <button
                  key={pr}
                  className={`filter-pill ${priorityFilter === pr ? 'active' : ''}`}
                  onClick={() => setPriorityFilter(pr)}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <LoadingState message="Loading your assigned tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          message="You currently have no tasks matching this filter. Check your teams for open tasks."
          actionText="View Teams"
          onAction={() => navigate('/my-teams')}
        />
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className="task-container">
              <div className="team-header-pill" onClick={() => navigate(`/teams/${task.team.id}`)}>
                <span>Team: {task.team.name}</span>
                <span className="dot">•</span>
                <span>{task.team.project?.title}</span>
              </div>
              <TaskCard
                task={task}
                onStatusChange={handleStatusChange}
                canManage={false}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .my-tasks-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header .title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .page-header .subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .filters-card {
          padding: 16px 20px;
        }

        .filters-row {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .pills-wrap {
          display: flex;
          gap: 6px;
        }

        .filter-pill {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-pill:hover {
          border-color: var(--border-strong);
        }

        .filter-pill.active {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          border-color: var(--accent-primary);
          font-weight: 600;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .task-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .team-header-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-primary);
          padding-left: 4px;
          cursor: pointer;
        }

        .team-header-pill:hover {
          text-decoration: underline;
        }

        .team-header-pill .dot {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

