import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService.js';
import { taskService } from '../services/taskService.js';
import TaskCard from '../components/TaskCard.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import {
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function TeamWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Edit task modal
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const res = await teamService.getWorkspace(id);
      if (res.success && res.data) {
        setWorkspace(res.data);
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      alert(err.message || 'Could not load workspace. You must be an authorized team member.');
      navigate('/my-teams');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      alert(err.message || 'Failed to update task status.');
      loadWorkspace();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      setIsSavingTask(true);
      const payload = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedToId: taskAssignee || null,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || null,
      };

      const res = await taskService.createTask(id, payload);
      if (res.success && res.data) {
        setTasks([res.data, ...tasks]);
        setShowTaskModal(false);
        // Reset form
        setTaskTitle('');
        setTaskDesc('');
        setTaskAssignee('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
        setTaskStatus('TODO');
      }
    } catch (err) {
      alert(err.message || 'Failed to create task.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskAssignee(task.assignedToId || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const handleSaveEditTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      setIsSavingTask(true);
      const payload = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedToId: taskAssignee || null,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || null,
      };

      const res = await taskService.updateTask(editingTask.id, payload);
      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? res.data : t))
        );
        setEditingTask(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update task.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await taskService.deleteTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading Team Workspace & Kanban..." />;
  }

  if (!workspace) return null;

  const members = workspace.members || [];
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  const completedCount = doneTasks.length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="workspace-page">
      {/* 1. Project & Team Overview Banner */}
      <div className="workspace-overview-card card">
        <div className="overview-header">
          <div>
            <div className="meta-row">
              <span className="project-type-badge">{workspace.project.projectType}</span>
              <span className="team-lead-badge">
                <ShieldCheck size={13} /> Leader: {workspace.leader.name}
              </span>
            </div>
            <h1 className="workspace-title">{workspace.name}</h1>
            <p className="project-link" onClick={() => navigate(`/projects/${workspace.project.id}`)}>
              Project: {workspace.project.title} <ExternalLink size={13} />
            </p>
          </div>

          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Create Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-overview">
          <div className="progress-meta">
            <span className="progress-text">Sprint Delivery Progress</span>
            <span className="progress-num">
              {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Team Members Roster */}
      <div className="team-roster-card card">
        <h3 className="section-title">Team Roster ({members.length} Members)</h3>
        <div className="members-grid">
          {members.map((m) => (
            <div key={m.id} className="member-card" onClick={() => navigate(`/profile/${m.user.id}`)}>
              <img
                src={m.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                alt={m.user.name}
                className="member-avatar"
              />
              <div className="member-details">
                <strong className="member-name">{m.user.name}</strong>
                <span className="member-role">{m.role}</span>
                <span className="member-course">{m.user.academicYear} • {m.user.course}</span>
                <div className="member-skills-row">
                  {m.user.skills?.slice(0, 3).map((s, i) => (
                    <span key={i} className="mini-skill-tag">
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TASK MANAGEMENT: THREE-COLUMN KANBAN BOARD */}
      <div className="kanban-section">
        <div className="kanban-header">
          <div>
            <h3 className="section-title">Sprint Kanban Board</h3>
            <p className="section-subtitle">Track, assign, and advance tasks across development stages</p>
          </div>
        </div>

        <div className="kanban-board-grid">
          {/* TO DO COLUMN */}
          <div className="kanban-column todo-col">
            <div className="column-header">
              <div className="col-title-wrap">
                <span className="col-dot dot-todo" />
                <h4 className="col-title">TO DO</h4>
              </div>
              <span className="col-count">{todoTasks.length}</span>
            </div>

            <div className="column-tasks-list">
              {todoTasks.length === 0 ? (
                <div className="column-empty">No tasks in To Do</div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    canManage={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="kanban-column progress-col">
            <div className="column-header">
              <div className="col-title-wrap">
                <span className="col-dot dot-progress" />
                <h4 className="col-title">IN PROGRESS</h4>
              </div>
              <span className="col-count">{inProgressTasks.length}</span>
            </div>

            <div className="column-tasks-list">
              {inProgressTasks.length === 0 ? (
                <div className="column-empty">No tasks in progress</div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    canManage={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div className="kanban-column done-col">
            <div className="column-header">
              <div className="col-title-wrap">
                <span className="col-dot dot-done" />
                <h4 className="col-title">DONE</h4>
              </div>
              <span className="col-count">{doneTasks.length}</span>
            </div>

            <div className="column-tasks-list">
              {doneTasks.length === 0 ? (
                <div className="column-empty">No completed tasks yet</div>
              ) : (
                doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    canManage={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={showTaskModal || !!editingTask}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create Team Task'}
        maxWidth="500px"
      >
        <form onSubmit={editingTask ? handleSaveEditTask : handleCreateTask}>
          <div className="input-group">
            <label className="input-label">Task Title *</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Design UI wireframe in Figma"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-control"
              rows={3}
              placeholder="Provide clear acceptance criteria and specifications..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Assign Member</label>
              <select
                className="input-control"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Priority</label>
              <select
                className="input-control"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Due Date</label>
              <input
                type="date"
                className="input-control"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Initial Stage</label>
              <select
                className="input-control"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowTaskModal(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSavingTask}
            >
              {isSavingTask ? 'Saving...' : editingTask ? 'Save Task Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .workspace-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workspace-overview-card {
          padding: 28px 32px;
        }

        .overview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .project-type-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background-color: var(--burgundy-50);
          color: var(--burgundy-700);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .team-lead-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .workspace-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .project-link {
          font-size: 13.5px;
          color: var(--accent-primary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-weight: 500;
        }

        .project-link:hover {
          text-decoration: underline;
        }

        .progress-overview {
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .progress-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .progress-text {
          font-weight: 600;
          color: var(--text-muted);
        }

        .progress-num {
          font-weight: 700;
          color: var(--accent-primary);
        }

        .progress-track {
          height: 8px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--accent-primary);
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }

        /* Roster */
        .team-roster-card {
          padding: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }

        .member-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }

        .member-card:hover {
          border-color: var(--border-strong);
          background-color: var(--bg-surface-accent);
        }

        .member-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-strong);
        }

        .member-details {
          flex: 1;
          min-width: 0;
        }

        .member-name {
          font-size: 13.5px;
          color: var(--text-primary);
          display: block;
        }

        .member-role {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-primary);
          display: block;
        }

        .member-course {
          font-size: 11px;
          color: var(--text-muted);
          display: block;
          margin-bottom: 6px;
        }

        .member-skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .mini-skill-tag {
          font-size: 9.5px;
          font-weight: 600;
          padding: 1px 6px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        /* Kanban Board */
        .kanban-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .kanban-board-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: flex-start;
        }

        .kanban-column {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 16px;
          display: flex;
          flex-direction: column;
          min-height: 450px;
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 14px;
        }

        .col-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .dot-todo {
          background-color: var(--burgundy-700);
        }

        .dot-progress {
          background-color: var(--beige-800);
        }

        .dot-done {
          background-color: var(--burgundy-900);
        }

        .col-title {
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: var(--text-primary);
        }

        .col-count {
          font-size: 11px;
          font-weight: 700;
          background-color: var(--bg-card);
          padding: 2px 7px;
          border-radius: var(--radius-full);
          color: var(--text-muted);
        }

        .column-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .column-empty {
          text-align: center;
          padding: 40px 16px;
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .kanban-board-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

