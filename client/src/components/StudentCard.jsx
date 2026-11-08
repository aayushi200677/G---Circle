import React from 'react';
import { useNavigate } from 'react-router-dom';
import SkillBadge from './SkillBadge.jsx';
import { MessageSquare, Sparkles, ExternalLink, Video } from 'lucide-react';

export default function StudentCard({ student, matchPercentage, whyRecommended, onConnect, isConnecting = false }) {
  const navigate = useNavigate();

  // Helper to safely extract technical skill name & proficiency
  const getSkillInfo = (s) => {
    if (!s) return { name: '', proficiency: 3 };
    if (typeof s === 'string') return { name: s, proficiency: 3 };
    const name = s.skill?.name || s.name || '';
    const proficiency = s.proficiency !== undefined ? s.proficiency : 3;
    return { name, proficiency };
  };

  // Helper to safely extract communication skill name
  const getCommName = (cs) => {
    if (!cs) return '';
    if (typeof cs === 'string') return cs;
    return cs.communicationSkill?.name || cs.name || '';
  };

  const showcaseCount = student?.showcaseVideos?.length || 0;
  const hasShowcase = showcaseCount > 0 || student?.hasShowcase;

  return (
    <div className="student-card card card-hover">
      <div className="student-top">
        <img
          src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=722F3E&textColor=FAF8F4`}
          alt={student.name}
          className="student-avatar"
        />
        <div className="student-header-info">
          <h3 className="student-name" onClick={() => navigate(`/profile/${student.id}`)}>
            {student.name}
          </h3>
          <span className="student-academic">
            {student.academicYear} • {student.course}
          </span>
          {student.preferredRoles && student.preferredRoles.length > 0 && (
            <span className="preferred-role-badge">
              {student.preferredRoles[0]}
            </span>
          )}
        </div>

        {matchPercentage !== undefined && (
          <div className="compatibility-badge" title="Team Complementary Compatibility">
            <span className="compatibility-score">{matchPercentage}%</span>
            <span className="compatibility-label">Match</span>
          </div>
        )}
      </div>

      {/* Video Showcase Available Indicator */}
      {hasShowcase && (
        <div
          className="showcase-indicator"
          onClick={() => navigate(`/profile/${student.id}`)}
          title="Click to view student's talent & communication video demonstrations"
        >
          <Video size={13} className="showcase-indicator-icon" />
          <span className="showcase-indicator-text">Video Showcase Available</span>
          {showcaseCount > 0 && (
            <span className="showcase-count-pill">{showcaseCount}</span>
          )}
        </div>
      )}

      {/* Why Recommended Explanation Pill */}
      {whyRecommended && (
        <div className="why-recommended-box">
          <Sparkles size={13} className="sparkle-icon" />
          <p className="why-text">{whyRecommended}</p>
        </div>
      )}

      {/* Bio / Summary */}
      {student.bio && (
        <p className="student-bio">
          {student.bio}
        </p>
      )}

      {/* Technical Skills */}
      {student.skills && student.skills.length > 0 && (
        <div className="skills-row">
          <span className="row-label">Technical Skills</span>
          <div className="skills-chips">
            {student.skills.slice(0, 4).map((s, idx) => {
              const { name, proficiency } = getSkillInfo(s);
              if (!name) return null;
              return (
                <SkillBadge
                  key={idx}
                  name={name}
                  proficiency={proficiency}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Communication Strengths */}
      {(student.communicationSkills?.length > 0 || student.communicationStrengths?.length > 0) && (
        <div className="comm-row">
          <span className="row-label">Communication & Collaboration</span>
          <div className="comm-chips">
            {(student.communicationSkills || student.communicationStrengths)
              .slice(0, 3)
              .map((cs, i) => {
                const commName = getCommName(cs);
                if (!commName) return null;
                return (
                  <span key={i} className="comm-tag">
                    {commName}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="student-footer">
        <span className="availability-indicator" title="Availability">
          ● {student.availability || 'Flexible'}
        </span>

        <div className="footer-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/profile/${student.id}`)}
          >
            <ExternalLink size={13} /> View
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onConnect && onConnect(student)}
            disabled={isConnecting}
          >
            <MessageSquare size={13} /> Connect
          </button>
        </div>
      </div>

      <style>{`
        .student-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .student-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-strong);
          flex-shrink: 0;
        }

        .student-header-info {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          cursor: pointer;
        }

        .student-name:hover {
          color: var(--accent-primary);
        }

        .student-academic {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .preferred-role-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--accent-primary);
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-subtle);
          padding: 1px 7px;
          border-radius: var(--radius-sm);
          margin-top: 4px;
        }

        .compatibility-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          padding: 4px 10px;
          min-width: 52px;
          flex-shrink: 0;
        }

        .compatibility-score {
          font-size: 15px;
          font-weight: 800;
          color: var(--accent-primary);
          line-height: 1;
        }

        .compatibility-label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .showcase-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-full);
          padding: 3px 10px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: fit-content;
        }

        .showcase-indicator:hover {
          background-color: var(--burgundy-100);
          border-color: var(--accent-primary);
        }

        .showcase-indicator-icon {
          color: var(--accent-primary);
        }

        .showcase-indicator-text {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-primary);
          letter-spacing: 0.2px;
        }

        .showcase-count-pill {
          font-size: 10px;
          font-weight: 700;
          background-color: var(--accent-primary);
          color: var(--ivory-50);
          border-radius: var(--radius-full);
          padding: 0 5px;
          line-height: 15px;
          height: 15px;
        }

        .why-recommended-box {
          background-color: var(--bg-surface-accent);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sparkle-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .why-text {
          font-size: 11.5px;
          line-height: 1.4;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .student-bio {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .row-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 5px;
        }

        .skills-row, .comm-row {
          margin-bottom: 10px;
        }

        .skills-chips, .comm-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .comm-tag {
          font-size: 11px;
          font-weight: 500;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 2px 8px;
          color: var(--text-primary);
        }

        .student-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }

        .availability-indicator {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-primary);
        }

        .footer-actions {
          display: flex;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
