import React from 'react';
import { useNavigate } from 'react-router-dom';
import SkillBadge from './SkillBadge.jsx';
import { Users, Clock, Send, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ProjectCard({ project, onRequestJoin, isJoining = false }) {
  const navigate = useNavigate();

  const isFull = project.currentTeamSize >= project.requiredTeamSize;
  const isMember = project.isMember || project.isLeader;
  const hasRequested = project.userRequestStatus === 'PENDING';

  return (
    <div className="project-card card card-hover">
      <div className="card-top">
        <div className="project-category-badge">
          {project.projectType}
        </div>
        {project.skillMatchPercentage !== undefined && (
          <div className="match-pill" title="Complementary skill compatibility">
            <span className="match-score">{project.skillMatchPercentage}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>

      <h3 className="project-title" onClick={() => navigate(`/projects/${project.id}`)}>
        {project.title}
      </h3>

      <p className="project-desc">
        {project.description}
      </p>

      {/* Skills Required */}
      <div className="skills-section">
        <span className="section-label">Required Skills</span>
        <div className="skills-wrap">
          {project.skills?.slice(0, 4).map((s, idx) => (
            <SkillBadge key={idx} name={s.name || s} importance={s.importance} />
          ))}
          {project.skills?.length > 4 && (
            <span className="more-skills">+{project.skills.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Open Roles */}
      {project.roles && project.roles.length > 0 && (
        <div className="roles-section">
          <span className="section-label">Open Roles</span>
          <div className="roles-wrap">
            {project.roles.slice(0, 3).map((r, i) => (
              <span key={i} className="role-tag">
                {r.roleName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="card-footer">
        <div className="meta-left">
          <div className="team-capacity" title="Team members">
            <Users size={14} />
            <span>
              {project.currentTeamSize} / {project.requiredTeamSize} Members
            </span>
          </div>
          {project.deadline && (
            <div className="deadline-tag" title="Project deadline">
              <Clock size={13} />
              <span>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="meta-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            Details
          </button>

          {!isMember && (
            <button
              className={`btn btn-sm ${hasRequested ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => onRequestJoin && onRequestJoin(project)}
              disabled={isFull || hasRequested || isJoining}
            >
              {hasRequested ? (
                <>
                  <CheckCircle size={13} /> Requested
                </>
              ) : isFull ? (
                'Team Full'
              ) : (
                <>
                  <Send size={13} /> Join Team
                </>
              )}
            </button>
          )}

          {isMember && (
            <span className="member-indicator">
              <ShieldCheck size={14} /> My Team
            </span>
          )}
        </div>
      </div>

      <style>{`
        .project-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .project-category-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--burgundy-700);
          background-color: var(--burgundy-50);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .match-pill {
          display: flex;
          align-items: baseline;
          gap: 3px;
          background-color: var(--bg-surface-accent);
          border: 1px solid var(--border-strong);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .match-score {
          font-size: 13px;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .match-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .project-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1.3;
          cursor: pointer;
        }

        .project-title:hover {
          color: var(--accent-primary);
        }

        .project-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .section-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .skills-section {
          margin-bottom: 12px;
        }

        .skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .more-skills {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .roles-section {
          margin-bottom: 16px;
        }

        .roles-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .role-tag {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }

        .meta-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .team-capacity, .deadline-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .meta-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}

