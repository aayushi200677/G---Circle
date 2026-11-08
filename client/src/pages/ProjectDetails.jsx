import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService.js';
import { matchingService } from '../services/matchingService.js';
import { teamService } from '../services/teamService.js';
import SkillBadge from '../components/SkillBadge.jsx';
import StudentCard from '../components/StudentCard.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import {
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [isSendingJoin, setIsSendingJoin] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, gapsRes, recsRes] = await Promise.all([
        projectService.getById(id),
        matchingService.getProjectSkillGaps(id),
        matchingService.getProjectRecommendations(id),
      ]);

      if (projRes.success) setProject(projRes.data);
      if (gapsRes.success) setSkillGaps(gapsRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    try {
      setIsSendingJoin(true);
      const res = await teamService.sendJoinRequest(id, joinMessage);
      if (res.success) {
        setSuccessMsg('Your join request has been sent to the team leader!');
        setShowJoinModal(false);
        setProject((prev) => ({ ...prev, myRequestStatus: 'PENDING' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to send request.');
    } finally {
      setIsSendingJoin(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading project details & team skill gaps..." />;
  }

  if (!project) {
    return (
      <div className="not-found-card card">
        <h3>Project not found</h3>
        <p>The project you are looking for does not exist or was removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/explore')}>
          Browse Projects
        </button>
      </div>
    );
  }

  const team = project.team;
  const members = team?.members || [];
  const isFull = members.length >= project.requiredTeamSize;

  return (
    <div className="project-details-page">
      {successMsg && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Banner Card */}
      <div className="project-header-card card">
        <div className="header-meta-row">
          <span className="category-tag">{project.projectType}</span>
          <span className="difficulty-tag">{project.difficulty} Difficulty</span>
          <span className={`status-tag ${project.status.toLowerCase()}`}>
            ● {project.status}
          </span>
        </div>

        <h1 className="project-title">{project.title}</h1>
        <p className="project-desc">{project.description}</p>

        <div className="meta-stats-row">
          <div className="meta-stat">
            <Users size={16} className="stat-icon" />
            <div>
              <span className="stat-label">Team Capacity</span>
              <strong className="stat-value">{members.length} / {project.requiredTeamSize} Members</strong>
            </div>
          </div>

          {project.deadline && (
            <div className="meta-stat">
              <Calendar size={16} className="stat-icon" />
              <div>
                <span className="stat-label">Target Deadline</span>
                <strong className="stat-value">{new Date(project.deadline).toLocaleDateString()}</strong>
              </div>
            </div>
          )}

          <div className="meta-stat leader-stat" onClick={() => navigate(`/profile/${project.creator.id}`)}>
            <img
              src={project.creator.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.creator.name}&backgroundColor=722F3E&textColor=FAF8F4`}
              alt={project.creator.name}
              className="leader-avatar"
            />
            <div>
              <span className="stat-label">Team Leader</span>
              <strong className="stat-value leader-name">{project.creator.name}</strong>
            </div>
          </div>

          <div className="header-action-col">
            {project.isLeader ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/teams/${team?.id}`)}
              >
                Go to Team Workspace
              </button>
            ) : project.isMember ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/teams/${team?.id}`)}
              >
                Open Workspace
              </button>
            ) : project.myRequestStatus === 'PENDING' ? (
              <span className="status-pill pending">
                <CheckCircle size={15} /> Join Request Pending Review
              </span>
            ) : isFull ? (
              <span className="status-pill full">Team at Full Capacity</span>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setJoinMessage(`Hi ${project.creator.name.split(' ')[0]}! I would love to collaborate on "${project.title}".`);
                  setShowJoinModal(true);
                }}
              >
                <Send size={16} /> Send Join Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE USP: TEAM SKILL GAP ANALYSIS */}
      <div className="gap-analysis-card card">
        <div className="gap-header">
          <div>
            <h3 className="gap-title">
              <Sparkles size={18} className="sparkle-icon" /> Team Skill Gap Analysis
            </h3>
            <p className="gap-subtitle">
              Evaluates existing members' covered capabilities against project requirements to identify genuine missing gaps.
            </p>
          </div>
          <div className="gap-metrics">
            <span className="gap-metric covered">
              {skillGaps?.coveredCount || 0} Covered
            </span>
            <span className="gap-metric missing">
              {skillGaps?.missingCount || 0} Missing Gaps
            </span>
          </div>
        </div>

        <div className="gap-grid">
          {/* Covered Skills */}
          <div className="gap-col covered-col">
            <h4 className="col-heading">Skills Already Covered</h4>
            {skillGaps?.coveredSkills?.length === 0 ? (
              <p className="col-empty">No skills covered yet.</p>
            ) : (
              <div className="gaps-list">
                {skillGaps?.coveredSkills?.map((s, idx) => (
                  <div key={idx} className="gap-item covered">
                    <div className="gap-item-top">
                      <strong className="skill-name">{s.name}</strong>
                      <span className="covered-by-tag">
                        Covered by {s.coveredBy?.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Skills */}
          <div className="gap-col missing-col">
            <h4 className="col-heading">Missing Team Capabilities</h4>
            {skillGaps?.missingSkills?.length === 0 ? (
              <p className="col-empty success">Great! All required capabilities are covered by existing team members.</p>
            ) : (
              <div className="gaps-list">
                {skillGaps?.missingSkills?.map((s, idx) => (
                  <div key={idx} className="gap-item missing">
                    <div className="gap-item-top">
                      <strong className="skill-name">{s.name}</strong>
                      <span className="importance-weight">Priority Weight: {s.importance}/5</span>
                    </div>
                    <span className="gap-alert">
                      Team currently lacks this skill. Looking for student contributors.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members & Open Roles */}
      <div className="details-two-col">
        {/* Current Team Members */}
        <div className="card members-card">
          <h3 className="section-title">Team Members ({members.length})</h3>
          <div className="members-list">
            {members.map((m) => (
              <div key={m.id} className="member-row" onClick={() => navigate(`/profile/${m.user.id}`)}>
                <img
                  src={m.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                  alt={m.user.name}
                  className="member-avatar"
                />
                <div className="member-info">
                  <strong className="member-name">{m.user.name}</strong>
                  <span className="member-role">{m.role}</span>
                  <span className="member-course">{m.user.academicYear} • {m.user.course}</span>
                </div>
                <ChevronRight size={16} className="chevron" />
              </div>
            ))}
          </div>
        </div>

        {/* Open Roles */}
        <div className="card roles-card">
          <h3 className="section-title">Open Positions & Roles</h3>
          {project.roles?.length === 0 ? (
            <p className="no-roles">No specific roles defined.</p>
          ) : (
            <div className="roles-list">
              {project.roles?.map((r, i) => (
                <div key={i} className="role-item">
                  <div className="role-item-main">
                    <strong className="role-title">{r.roleName}</strong>
                    <span className="role-open-tag">Open: {r.openCount} spot</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Collaborators Who Fill Gaps */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <Sparkles size={18} className="sparkle-icon" /> Recommended Collaborators Who Fill Missing Gaps
              </h3>
              <p className="section-subtitle">
                Ranked by our weighted matching engine specifically targeting this project's missing capabilities.
              </p>
            </div>
          </div>

          <div className="recommendations-grid">
            {recommendations.slice(0, 4).map((rec, idx) => (
              <StudentCard
                key={idx}
                student={rec.student}
                matchPercentage={rec.matchPercentage}
                whyRecommended={rec.whyRecommended}
                onConnect={() => navigate(`/profile/${rec.student.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title={`Join ${project.title}`}
        maxWidth="500px"
      >
        <form onSubmit={handleSendJoinRequest}>
          <p className="modal-lead">
            Explain what skills you will contribute and how you can fill the team's missing capabilities:
          </p>
          <div className="input-group">
            <label className="input-label">Message</label>
            <textarea
              className="input-control"
              rows={4}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSendingJoin}>
              {isSendingJoin ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .project-details-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background-color: var(--beige-400);
          border: 1px solid var(--beige-600);
          border-radius: var(--radius-md);
          color: var(--burgundy-900);
          font-weight: 600;
        }

        .project-header-card {
          padding: 32px;
        }

        .header-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .category-tag {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          background-color: var(--burgundy-50);
          color: var(--burgundy-700);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .difficulty-tag {
          font-size: 11.5px;
          font-weight: 600;
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .status-tag {
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .status-tag.recruiting {
          background-color: var(--beige-400);
          color: var(--burgundy-900);
        }

        .project-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.25;
        }

        .project-desc {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
          max-width: 900px;
        }

        .meta-stats-row {
          display: flex;
          align-items: center;
          gap: 32px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
        }

        .meta-stat {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-icon {
          color: var(--accent-primary);
        }

        .stat-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .leader-stat {
          cursor: pointer;
        }

        .leader-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid var(--border-strong);
        }

        .leader-name:hover {
          color: var(--accent-primary);
        }

        .header-action-col {
          margin-left: auto;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: var(--radius-md);
        }

        .status-pill.pending {
          background-color: var(--beige-400);
          color: var(--burgundy-900);
          border: 1px solid var(--beige-600);
        }

        .status-pill.full {
          background-color: var(--bg-surface);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        /* Skill Gap Analysis */
        .gap-analysis-card {
          padding: 28px;
          background-color: var(--bg-card);
        }

        .gap-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .gap-title {
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .gap-title .sparkle-icon {
          color: var(--accent-primary);
        }

        .gap-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .gap-metrics {
          display: flex;
          gap: 8px;
        }

        .gap-metric {
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .gap-metric.covered {
          background-color: var(--beige-400);
          color: var(--burgundy-900);
        }

        .gap-metric.missing {
          background-color: var(--burgundy-700);
          color: var(--ivory-50);
        }

        .gap-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .gap-col {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 16px;
        }

        .col-heading {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .gaps-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gap-item {
          padding: 10px 12px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .gap-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .covered-by-tag {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .importance-weight {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .gap-alert {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .details-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .members-card, .roles-card {
          padding: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .members-list, .roles-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .member-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .member-row:hover {
          border-color: var(--border-strong);
        }

        .member-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-strong);
        }

        .member-info {
          flex: 1;
        }

        .member-name {
          font-size: 13.5px;
          color: var(--text-primary);
          display: block;
        }

        .member-role {
          font-size: 12px;
          color: var(--accent-primary);
          font-weight: 600;
          display: block;
        }

        .member-course {
          font-size: 11px;
          color: var(--text-muted);
        }

        .role-item {
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .role-item-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .role-title {
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .role-open-tag {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-primary);
        }

        .recommendations-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
        }

        .modal-lead {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .gap-grid, .details-two-col {
            grid-template-columns: 1fr;
          }
          .meta-stats-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .header-action-col {
            margin-left: 0;
            width: 100%;
          }
          .header-action-col button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

