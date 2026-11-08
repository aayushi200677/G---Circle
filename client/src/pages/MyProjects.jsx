import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import { FolderGit2, Plus, Users, Calendar, ArrowRight, Settings, ExternalLink, Trash2 } from 'lucide-react';

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('RECRUITING');

  useEffect(() => {
    loadMyProjects();
  }, []);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll({ status: 'All' });
      if (res.success && res.data) {
        // Filter projects created by current user (marked as isLeader)
        const mine = res.data.filter((p) => p.isLeader);
        setProjects(mine);
      }
    } catch (err) {
      console.error('Failed to load my projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDesc(project.description);
    setEditStatus(project.status);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const res = await projectService.update(editingProject.id, {
        title: editTitle,
        description: editDesc,
        status: editStatus,
      });

      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? { ...p, title: editTitle, description: editDesc, status: editStatus } : p))
        );
        setEditingProject(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update project.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also remove the associated team.')) {
      return;
    }

    try {
      const res = await projectService.delete(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="my-projects-page">
      <div className="page-header">
        <div>
          <h2 className="title">My Projects</h2>
          <p className="subtitle">Manage the initiatives you've founded and lead at Galgotias University.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading your projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="You haven't created any projects yet"
          message="Publish a project to assemble a balanced team with complementary skills."
          actionText="Create Project"
          onAction={() => navigate('/projects/create')}
        />
      ) : (
        <div className="projects-table-wrap card">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Category</th>
                <th>Team Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="title-cell">
                    <span className="project-name" onClick={() => navigate(`/projects/${p.id}`)}>
                      {p.title}
                    </span>
                    <span className="project-sub">{p.description.slice(0, 80)}...</span>
                  </td>
                  <td>
                    <span className="category-pill">{p.projectType}</span>
                  </td>
                  <td>
                    <div className="team-size-info">
                      <Users size={14} className="cell-icon" />
                      <span>{p.currentTeamSize} / {p.requiredTeamSize} Members</span>
                    </div>
                    <span className={`status-dot-badge ${p.status.toLowerCase()}`}>
                      ● {p.status}
                    </span>
                  </td>
                  <td>
                    {p.deadline ? (
                      <span className="deadline-text">
                        {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="no-deadline">Open</span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/teams/${p.teamId}`)}
                        title="Manage Team & Kanban"
                      >
                        Workspace
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit Project Details"
                      >
                        <Settings size={15} />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(p.id)}
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="input-group">
            <label className="input-label">Project Title</label>
            <input
              type="text"
              className="input-control"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-control"
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Project Status</label>
            <select
              className="input-control"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="RECRUITING">RECRUITING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingProject(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .my-projects-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .projects-table-wrap {
          padding: 0;
          overflow-x: auto;
        }

        .projects-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .projects-table th {
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
        }

        .projects-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }

        .projects-table tr:last-child td {
          border-bottom: none;
        }

        .title-cell {
          max-width: 320px;
        }

        .project-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          display: block;
        }

        .project-name:hover {
          color: var(--accent-primary);
        }

        .project-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 3px;
          display: block;
        }

        .category-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background-color: var(--burgundy-50);
          color: var(--burgundy-700);
          border: 1px solid var(--border-subtle);
        }

        .team-size-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-dot-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          margin-top: 4px;
        }

        .status-dot-badge.recruiting {
          color: var(--burgundy-700);
        }

        .status-dot-badge.in_progress {
          color: var(--beige-800);
        }

        .status-dot-badge.completed {
          color: var(--burgundy-900);
        }

        .deadline-text {
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .no-deadline {
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          border-color: var(--border-strong);
          color: var(--accent-primary);
        }

        .icon-btn.delete:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }
      `}</style>
    </div>
  );
}

