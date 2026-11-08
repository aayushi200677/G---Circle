import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { matchingService } from '../services/matchingService.js';
import { taskService } from '../services/taskService.js';
import { teamService } from '../services/teamService.js';
import StatCard from '../components/StatCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  Plus,
  FolderGit2,
  UsersRound,
  Inbox,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  Clock,
  ListTodo,
  Video,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myProjects: 0,
    activeTeams: 0,
    pendingRequests: 0,
    completedTasks: 0,
  });

  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // "+ Add Your Project" action modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Join request modal state
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [actionSuccessBanner, setActionSuccessBanner] = useState('');

  // Connect Student Modal state
  const [selectedStudentForConnect, setSelectedStudentForConnect] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          userService.getStats(),
          matchingService.getMyRecommendedProjects(),
          taskService.getMyTasks(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (projectsRes.success) setRecommendedProjects(projectsRes.data);
        if (tasksRes.success) setTasks(tasksRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleOpenJoinModal = (project) => {
    setSelectedProjectForJoin(project);
    setJoinMessage(`Hi! I would love to contribute my technical and collaboration skills to "${project.title}".`);
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!selectedProjectForJoin) return;

    try {
      setIsSubmittingJoin(true);
      const res = await teamService.sendJoinRequest(selectedProjectForJoin.id, joinMessage);
      if (res.success) {
        setActionSuccessBanner(`Join request sent to ${selectedProjectForJoin.title}!`);
        setSelectedProjectForJoin(null);
        // Update local state
        setRecommendedProjects((prev) =>
          prev.map((rp) =>
            rp.project.id === selectedProjectForJoin.id
              ? { ...rp, project: { ...rp.project, userRequestStatus: 'PENDING' } }
              : rp
          )
        );
        setTimeout(() => setActionSuccessBanner(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit join request.');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your collaboration dashboard..." />;
  }

  // Filter tasks for compact overview
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="dashboard-page">
      {actionSuccessBanner && (
        <div className="success-banner">
          <CheckCircle2 size={18} />
          <span>{actionSuccessBanner}</span>
        </div>
      )}

      {/* 1. Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-text-wrap">
          <h2 className="welcome-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p className="welcome-subtitle">
            Discover the right people. Build something meaningful.
          </p>
          <div className="student-academic-pill">
            <span>{user?.name}</span>
            <span className="dot">•</span>
            <span>{user?.academicYear}</span>
            <span className="dot">•</span>
            <span>{user?.course}</span>
            <span className="dot">•</span>
            <span className="uni-tag">Galgotias University</span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <div className="primary-action-wrap">
          <button className="btn btn-primary btn-lg add-project-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add Your Project</span>
          </button>
        </div>
      </section>

      {/* 2. Statistics Section (4 equal-sized cards) */}
      <section className="stats-grid">
        <StatCard
          title="My Projects"
          value={stats.myProjects}
          subtitle="Projects created"
          icon={FolderGit2}
          onClick={() => navigate('/my-projects')}
        />
        <StatCard
          title="Active Teams"
          value={stats.activeTeams}
          subtitle="Collaborations"
          icon={UsersRound}
          onClick={() => navigate('/my-teams')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Awaiting review"
          icon={Inbox}
          onClick={() => navigate('/requests')}
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          subtitle="Delivered sprint tasks"
          icon={CheckSquare}
          onClick={() => navigate('/my-tasks')}
        />
      </section>

      {/* 3. Main Content Columns */}
      <div className="dashboard-columns-grid">
        {/* Left Column: Recommended Projects & Recommended Collaborators */}
        <div className="main-feed-col">
          {/* Recommended Projects */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">Recommended Projects</h3>
                <p className="section-subtitle">Projects looking for your skills and strengths</p>
              </div>
              <Link to="/explore" className="section-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {recommendedProjects.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                title="No project recommendations yet"
                message="Explore existing university projects or publish your own project to find collaborators."
                actionText="Explore Projects"
                onAction={() => navigate('/explore')}
              />
            ) : (
              <div className="projects-grid">
                {recommendedProjects.slice(0, 2).map((item) => (
                  <ProjectCard
                    key={item.project.id}
                    project={{
                      ...item.project,
                      skillMatchPercentage: item.skillMatchPercentage,
                    }}
                    onRequestJoin={handleOpenJoinModal}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Beyond Skills — Talent Showcase Spotlight */}
          <section className="dashboard-section">
            <div className="showcase-spotlight-card card">
              <div className="spotlight-content">
                <div className="spotlight-badge">
                  <Video size={13} />
                  <span>New Feature • Talent & Communication Showcase</span>
                </div>
                <h3 className="spotlight-title">Show More Than Your Skills</h3>
                <p className="spotlight-desc">
                  Discover collaborators through authentic video demonstrations. Explore public speaking, technical explanations, presentations, and project builds across Galgotias University.
                </p>
                <div className="spotlight-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/showcase')}
                  >
                    <Video size={14} /> Open Talent Showcase
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('/collaborators')}
                  >
                    <Compass size={14} /> Find Collaborators
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: My Tasks Compact Overview */}
        <div className="sidebar-feed-col">
          <section className="tasks-compact-card card">
            <div className="section-header">
              <div>
                <h3 className="section-title">My Tasks</h3>
                <p className="section-subtitle">Sprint progress across your teams</p>
              </div>
              <Link to="/my-tasks" className="section-link">
                All <ArrowRight size={14} />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-tasks-box">
                <ListTodo size={24} className="empty-tasks-icon" />
                <p>No sprint tasks assigned yet.</p>
                <Link to="/my-teams" className="btn btn-outline btn-sm">
                  View Teams
                </Link>
              </div>
            ) : (
              <div className="tasks-columns-stack">
                {/* To Do Stack */}
                <div className="task-stack-group">
                  <div className="stack-header">
                    <span className="status-dot dot-todo" />
                    <span className="stack-title">TO DO ({todoTasks.length})</span>
                  </div>
                  <div className="stack-items">
                    {todoTasks.slice(0, 2).map((t) => (
                      <div key={t.id} className="compact-task-item" onClick={() => navigate('/my-tasks')}>
                        <span className="compact-task-title">{t.title}</span>
                        <span className="compact-team-tag">{t.team?.name || 'Project'}</span>
                      </div>
                    ))}
                    {todoTasks.length === 0 && <span className="no-tasks-hint">No pending tasks</span>}
                  </div>
                </div>

                {/* In Progress Stack */}
                <div className="task-stack-group">
                  <div className="stack-header">
                    <span className="status-dot dot-progress" />
                    <span className="stack-title">IN PROGRESS ({inProgressTasks.length})</span>
                  </div>
                  <div className="stack-items">
                    {inProgressTasks.slice(0, 2).map((t) => (
                      <div key={t.id} className="compact-task-item" onClick={() => navigate('/my-tasks')}>
                        <span className="compact-task-title">{t.title}</span>
                        <span className="compact-team-tag">{t.team?.name || 'Project'}</span>
                      </div>
                    ))}
                    {inProgressTasks.length === 0 && <span className="no-tasks-hint">No tasks in progress</span>}
                  </div>
                </div>

                {/* Done Stack */}
                <div className="task-stack-group">
                  <div className="stack-header">
                    <span className="status-dot dot-done" />
                    <span className="stack-title">DONE ({doneTasks.length})</span>
                  </div>
                  <div className="stack-items">
                    {doneTasks.slice(0, 2).map((t) => (
                      <div key={t.id} className="compact-task-item completed" onClick={() => navigate('/my-tasks')}>
                        <span className="compact-task-title">{t.title}</span>
                        <span className="compact-team-tag">{t.team?.name || 'Project'}</span>
                      </div>
                    ))}
                    {doneTasks.length === 0 && <span className="no-tasks-hint">No completed tasks yet</span>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* "+ Add Your Project" Modal: Shows A. Create a Project, B. Join a Team */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Get Started on G-CIRCLE"
        maxWidth="500px"
      >
        <div className="add-options-wrap">
          <p className="modal-lead">Choose how you want to collaborate today:</p>

          <div
            className="option-card"
            onClick={() => {
              setShowAddModal(false);
              navigate('/projects/create');
            }}
          >
            <div className="option-icon-box">
              <Plus size={22} />
            </div>
            <div className="option-info">
              <h4 className="option-title">A. Create a Project</h4>
              <p className="option-desc">
                Publish a new project, run AI skill extraction, and discover complementary teammates who fill your skill gaps.
              </p>
            </div>
          </div>

          <div
            className="option-card"
            onClick={() => {
              setShowAddModal(false);
              navigate('/explore');
            }}
          >
            <div className="option-icon-box">
              <Compass size={22} />
            </div>
            <div className="option-info">
              <h4 className="option-title">B. Join a Team</h4>
              <p className="option-desc">
                Browse existing Galgotias University projects seeking your skills and send join requests.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Join Request Modal */}
      <Modal
        isOpen={!!selectedProjectForJoin}
        onClose={() => setSelectedProjectForJoin(null)}
        title={`Join ${selectedProjectForJoin?.title}`}
        maxWidth="520px"
      >
        <form onSubmit={handleSendJoinRequest} className="join-form">
          <p className="join-lead">
            Introduce yourself to the team leader and mention how your skills can help this project succeed:
          </p>

          <div className="input-group">
            <label className="input-label">Message to Team Leader</label>
            <textarea
              className="input-control"
              rows={4}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Explain your technical skills, experience, or role interest..."
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedProjectForJoin(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmittingJoin}
            >
              {isSubmittingJoin ? 'Sending...' : 'Send Join Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Connect Student Modal */}
      <Modal
        isOpen={!!selectedStudentForConnect}
        onClose={() => setSelectedStudentForConnect(null)}
        title={`Connect with ${selectedStudentForConnect?.name}`}
        maxWidth="480px"
      >
        <div className="connect-modal-body">
          <div className="connect-student-header">
            <img
              src={selectedStudentForConnect?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudentForConnect?.name}&backgroundColor=722F3E&textColor=FAF8F4`}
              alt={selectedStudentForConnect?.name}
              className="connect-avatar"
            />
            <div>
              <h4 className="connect-name">{selectedStudentForConnect?.name}</h4>
              <span className="connect-meta">
                {selectedStudentForConnect?.academicYear} • {selectedStudentForConnect?.course}
              </span>
            </div>
          </div>

          <p className="connect-hint">
            You can invite {selectedStudentForConnect?.name} to your projects or collaborate by visiting their profile.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedStudentForConnect(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const id = selectedStudentForConnect.id;
                setSelectedStudentForConnect(null);
                navigate(`/profile/${id}`);
              }}
            >
              View Full Profile
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          background-color: var(--beige-400);
          border: 1px solid var(--beige-600);
          border-radius: var(--radius-md);
          color: var(--burgundy-900);
          font-size: 13.5px;
          font-weight: 600;
        }

        .welcome-section {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 32px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
        }

        .welcome-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 6px 0 14px;
        }

        .student-academic-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .student-academic-pill .dot {
          opacity: 0.5;
        }

        .student-academic-pill .uni-tag {
          color: var(--accent-primary);
          font-weight: 700;
        }

        .add-project-btn {
          box-shadow: var(--shadow-md);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .dashboard-columns-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: flex-start;
        }

        .main-feed-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .dashboard-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .showcase-spotlight-card {
          background: linear-gradient(135deg, var(--burgundy-900) 0%, var(--accent-primary) 100%);
          color: var(--ivory-50);
          padding: 24px 28px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-strong);
        }

        .spotlight-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .spotlight-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(250, 248, 244, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: var(--warm-beige-100);
          width: fit-content;
        }

        .spotlight-title {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.25;
          margin-top: 2px;
        }

        .spotlight-desc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--warm-beige-100);
          max-width: 580px;
          margin-bottom: 8px;
        }

        .spotlight-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .spotlight-actions .btn-primary {
          background-color: var(--ivory-50);
          color: var(--burgundy-900);
          font-weight: 700;
        }

        .spotlight-actions .btn-primary:hover {
          background-color: #ffffff;
        }

        .spotlight-actions .btn-secondary {
          background-color: rgba(250, 248, 244, 0.12);
          color: var(--ivory-50);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .spotlight-actions .btn-secondary:hover {
          background-color: rgba(250, 248, 244, 0.22);
          color: #ffffff;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .title-icon {
          color: var(--accent-primary);
        }

        .section-subtitle {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .section-link {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .section-link:hover {
          color: var(--accent-primary-hover);
        }

        .projects-grid, .collaborators-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .tasks-compact-card {
          padding: 24px;
        }

        .empty-tasks-box {
          padding: 32px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .empty-tasks-icon {
          color: var(--border-strong);
        }

        .tasks-columns-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 14px;
        }

        .task-stack-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stack-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-todo {
          background-color: var(--burgundy-700);
        }

        .dot-progress {
          background-color: var(--beige-600);
        }

        .dot-done {
          background-color: var(--burgundy-900);
        }

        .stack-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: var(--text-muted);
        }

        .stack-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .compact-task-item {
          padding: 8px 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 3px;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .compact-task-item:hover {
          border-color: var(--border-strong);
        }

        .compact-task-item.completed .compact-task-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .compact-task-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .compact-team-tag {
          font-size: 10.5px;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .no-tasks-hint {
          font-size: 11.5px;
          color: var(--text-muted);
          font-style: italic;
          padding-left: 6px;
        }

        .modal-lead {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .add-options-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-card {
          padding: 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .option-card:hover {
          background-color: var(--bg-surface-accent);
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .option-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .option-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .join-lead {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          line-height: 1.45;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .connect-student-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .connect-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-strong);
        }

        .connect-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .connect-meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .connect-hint {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-columns-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
          }
          .projects-grid, .collaborators-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

