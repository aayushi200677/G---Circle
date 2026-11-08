import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { UsersRound, ArrowRight, ShieldCheck, CheckSquare, Clock } from 'lucide-react';

export default function MyTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await teamService.getMyTeams();
      if (res.success && res.data) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-teams-page">
      <div className="page-header">
        <h2 className="title">My Teams</h2>
        <p className="subtitle">
          Collaborative teams and project groups you actively contribute to.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading your teams..." />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="You haven't joined any teams yet"
          message="Browse university projects seeking collaborators and send join requests."
          actionText="Explore Projects"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="teams-grid">
          {teams.map((t) => (
            <div key={t.teamId} className="team-card card card-hover">
              <div className="team-card-header">
                <div className="team-badge">
                  {t.isLeader ? (
                    <span className="leader-pill">
                      <ShieldCheck size={12} /> Team Leader
                    </span>
                  ) : (
                    <span className="member-pill">
                      Member • {t.myRole}
                    </span>
                  )}
                </div>
                <span className="project-type-tag">{t.project.projectType}</span>
              </div>

              <h3 className="team-name">{t.teamName}</h3>
              <p className="project-title-link" onClick={() => navigate(`/projects/${t.project.id}`)}>
                Project: {t.project.title}
              </p>

              {/* Leader Meta */}
              <div className="leader-row">
                <img
                  src={t.leader.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.leader.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                  alt={t.leader.name}
                  className="leader-avatar"
                />
                <div>
                  <span className="leader-label">Leader</span>
                  <strong className="leader-name">{t.leader.name}</strong>
                </div>
              </div>

              {/* Team Members Avatars */}
              <div className="members-stack-row">
                <span className="members-count-label">
                  {t.memberCount} / {t.project.requiredTeamSize} Members
                </span>
                <div className="avatars-group">
                  {t.members.slice(0, 5).map((m) => (
                    <img
                      key={m.id}
                      src={m.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                      alt={m.user.name}
                      title={`${m.user.name} (${m.role})`}
                      className="stacked-avatar"
                    />
                  ))}
                  {t.members.length > 5 && (
                    <span className="more-avatar-pill">+{t.members.length - 5}</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-labels">
                  <span className="progress-text">Sprint Tasks</span>
                  <span className="progress-val">
                    {t.completedTaskCount} / {t.taskCount} ({t.progress}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>

              {/* Workspace Action Button */}
              <button
                className="btn btn-primary enter-workspace-btn"
                onClick={() => navigate(`/teams/${t.teamId}`)}
              >
                <span>Open Team Workspace</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .my-teams-page {
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

        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .team-card {
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .team-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .leader-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: var(--ivory-50);
          background-color: var(--burgundy-700);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .member-pill {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .project-type-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .team-name {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .project-title-link {
          font-size: 13px;
          color: var(--accent-primary);
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .project-title-link:hover {
          text-decoration: underline;
        }

        .leader-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-md);
          margin-bottom: 16px;
        }

        .leader-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-strong);
        }

        .leader-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .leader-name {
          font-size: 12.5px;
          color: var(--text-primary);
        }

        .members-stack-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .members-count-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .avatars-group {
          display: flex;
          align-items: center;
        }

        .stacked-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--bg-card);
          margin-left: -6px;
          object-fit: cover;
        }

        .stacked-avatar:first-child {
          margin-left: 0;
        }

        .more-avatar-pill {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--bg-surface);
          border: 2px solid var(--bg-card);
          margin-left: -6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .progress-section {
          margin-bottom: 20px;
          margin-top: auto;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          margin-bottom: 6px;
        }

        .progress-text {
          color: var(--text-muted);
          font-weight: 600;
        }

        .progress-val {
          color: var(--accent-primary);
          font-weight: 700;
        }

        .progress-bar-bg {
          height: 6px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--accent-primary);
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }

        .enter-workspace-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

