import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import { Inbox, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function RequestsInbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [inbox, setInbox] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await teamService.getRequestsInbox();
      if (res.success && res.data) {
        setInbox(res.data);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await teamService.acceptRequest(requestId);
      if (res.success) {
        setActionMessage('Request accepted! The student has been added to your team.');
        setInbox((prev) => ({
          ...prev,
          received: prev.received.map((r) =>
            r.id === requestId ? { ...r, status: 'ACCEPTED' } : r
          ),
        }));
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await teamService.rejectRequest(requestId);
      if (res.success) {
        setActionMessage('Request rejected.');
        setInbox((prev) => ({
          ...prev,
          received: prev.received.map((r) =>
            r.id === requestId ? { ...r, status: 'REJECTED' } : r
          ),
        }));
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to reject request.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading join requests..." />;
  }

  const currentList = activeTab === 'received' ? inbox.received : inbox.sent;

  return (
    <div className="requests-page">
      <div className="page-header">
        <h2 className="title">Requests Inbox</h2>
        <p className="subtitle">
          Review incoming student join requests for teams you lead, or check the status of requests you have sent.
        </p>
      </div>

      {actionMessage && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-bar card">
        <button
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <ArrowDownLeft size={16} />
          <span>Received Applications ({inbox.received.filter((r) => r.status === 'PENDING').length} pending)</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <ArrowUpRight size={16} />
          <span>Sent Applications ({inbox.sent.length})</span>
        </button>
      </div>

      {/* Requests List */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={activeTab === 'received' ? 'No applications received' : 'No sent requests'}
          message={
            activeTab === 'received'
              ? 'When students discover your projects and request to collaborate, they will appear here.'
              : 'You have not submitted join requests to any projects yet.'
          }
          actionText={activeTab === 'received' ? 'Publish Project' : 'Explore Projects'}
          onAction={() => navigate(activeTab === 'received' ? '/projects/create' : '/explore')}
        />
      ) : (
        <div className="requests-list">
          {activeTab === 'received'
            ? inbox.received.map((req) => (
                <div key={req.id} className="request-card card">
                  <div className="req-header">
                    <div className="student-profile-peek" onClick={() => navigate(`/profile/${req.student.id}`)}>
                      <img
                        src={req.student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${req.student.name}&backgroundColor=722F3E&textColor=FAF8F4`}
                        alt={req.student.name}
                        className="applicant-avatar"
                      />
                      <div>
                        <strong className="applicant-name">{req.student.name}</strong>
                        <span className="applicant-meta">
                          {req.student.academicYear} • {req.student.course} ({req.student.studentId})
                        </span>
                      </div>
                    </div>

                    <div className="req-meta-right">
                      <span className="project-badge" onClick={() => navigate(`/projects/${req.projectId}`)}>
                        Project: {req.projectName}
                      </span>
                      <span className="req-date">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {req.message && (
                    <div className="application-msg-box">
                      <p className="app-msg-text">"{req.message}"</p>
                    </div>
                  )}

                  {/* Applicant's Skills */}
                  {req.student.skills && req.student.skills.length > 0 && (
                    <div className="applicant-skills">
                      <span className="skills-label">Applicant Skills:</span>
                      <div className="skills-row">
                        {req.student.skills.slice(0, 5).map((s, idx) => (
                          <SkillBadge
                            key={idx}
                            name={s.skill.name}
                            proficiency={s.proficiency}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience if present */}
                  {req.student.experience && (
                    <div className="applicant-experience">
                      <span className="exp-label">Experience:</span>
                      <span className="exp-text">{req.student.experience}</span>
                    </div>
                  )}

                  {/* Actions / Status */}
                  <div className="req-footer">
                    <div className="team-cap">
                      Team Capacity: {req.currentMembers} / {req.requiredTeamSize} members
                    </div>

                    <div className="req-actions">
                      {req.status === 'PENDING' ? (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleReject(req.id)}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(req.id)}
                          >
                            <CheckCircle2 size={14} /> Accept into Team
                          </button>
                        </>
                      ) : (
                        <span className={`status-pill ${req.status.toLowerCase()}`}>
                          {req.status === 'ACCEPTED' ? '✓ Accepted Member' : '✕ Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            : inbox.sent.map((req) => (
                <div key={req.id} className="request-card card">
                  <div className="req-header">
                    <div>
                      <strong
                        className="project-name-link"
                        onClick={() => navigate(`/projects/${req.projectId}`)}
                      >
                        {req.projectName}
                      </strong>
                      <span className="applicant-meta">
                        Team Leader: {req.leader.name}
                      </span>
                    </div>

                    <div className="req-meta-right">
                      <span className={`status-pill ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                      <span className="req-date">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {req.message && (
                    <div className="application-msg-box">
                      <p className="app-msg-text">Your note: "{req.message}"</p>
                    </div>
                  )}
                </div>
              ))}
        </div>
      )}

      <style>{`
        .requests-page {
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

        .tabs-bar {
          display: flex;
          padding: 6px;
          gap: 8px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background-color: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover {
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background-color: var(--burgundy-700);
          color: var(--ivory-50);
          box-shadow: var(--shadow-sm);
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .request-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .req-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .student-profile-peek {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .applicant-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-strong);
        }

        .applicant-name {
          font-size: 15px;
          color: var(--text-primary);
          display: block;
        }

        .applicant-name:hover {
          color: var(--accent-primary);
        }

        .applicant-meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .req-meta-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .project-badge {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-primary);
          background-color: var(--burgundy-50);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .project-badge:hover {
          text-decoration: underline;
        }

        .project-name-link {
          font-size: 15px;
          font-weight: 700;
          color: var(--accent-primary);
          cursor: pointer;
          display: block;
        }

        .project-name-link:hover {
          text-decoration: underline;
        }

        .req-date {
          font-size: 11px;
          color: var(--text-muted);
        }

        .application-msg-box {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 10px 14px;
        }

        .app-msg-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.45;
        }

        .applicant-skills {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .skills-label, .exp-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .applicant-experience {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .req-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          margin-top: 4px;
        }

        .team-cap {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .req-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-pill {
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .status-pill.pending {
          background-color: var(--beige-400);
          color: var(--burgundy-900);
        }

        .status-pill.accepted {
          background-color: var(--burgundy-700);
          color: var(--ivory-50);
        }

        .status-pill.rejected {
          background-color: var(--bg-surface);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }
      `}</style>
    </div>
  );
}

