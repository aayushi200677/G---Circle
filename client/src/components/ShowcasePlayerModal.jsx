import React, { useRef } from 'react';
import Modal from './Modal.jsx';
import { showcaseService } from '../services/showcaseService.js';
import { Clock, Eye, Tag, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function ShowcasePlayerModal({ video, isOpen, onClose }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  if (!video) return null;

  const streamUrl = showcaseService.getStreamUrl(video.id);

  const handleModalClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={video.title}
      maxWidth="760px"
    >
      <div className="showcase-player-content">
        {/* HTML5 Video Player - strictly NO autoplay */}
        <div className="video-viewport">
          <video
            ref={videoRef}
            src={streamUrl}
            controls
            preload="metadata"
            className="main-video-element"
            poster={video.thumbnailUrl || undefined}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>

        {/* Video Information Header */}
        <div className="player-meta-section">
          <div className="category-duration-row">
            <span className="category-badge">{video.category}</span>
            <span className="duration-pill">
              <Clock size={12} />
              {formatDuration(video.duration)}
            </span>
            <span className="visibility-pill" title={`Privacy: ${video.visibility}`}>
              <Shield size={12} />
              {video.visibility === 'PUBLIC'
                ? 'Public'
                : video.visibility === 'TEAM_ONLY'
                ? 'Team Members Only'
                : 'Private'}
            </span>
          </div>

          <h3 className="video-player-title">{video.title}</h3>

          {video.description && (
            <p className="video-player-desc">{video.description}</p>
          )}

          {/* Skill Tags */}
          {video.skillTags && video.skillTags.length > 0 && (
            <div className="player-tags-section">
              <div className="tag-header">
                <Tag size={13} />
                <span>Demonstrated Skills & Capabilities:</span>
              </div>
              <div className="tags-list">
                {video.skillTags.map((tag, idx) => (
                  <span key={idx} className="skill-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Student Profile Info */}
          {video.user && (
            <div
              className="student-creator-card"
              onClick={() => {
                handleModalClose();
                navigate(`/profile/${video.user.id}`);
              }}
            >
              <img
                src={
                  video.user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${video.user.name}&backgroundColor=722F3E&textColor=FAF8F4`
                }
                alt={video.user.name}
                className="creator-avatar"
              />
              <div className="creator-details">
                <span className="creator-name">{video.user.name}</span>
                <span className="creator-academic">
                  {video.user.academicYear} • {video.user.course}
                </span>
              </div>
              <span className="view-profile-link">View Profile →</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .showcase-player-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .video-viewport {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          outline: none;
        }

        .player-meta-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-duration-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .category-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: var(--burgundy-100);
          color: var(--accent-primary);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-strong);
        }

        .duration-pill, .visibility-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 3px 9px;
          border-radius: var(--radius-full);
        }

        .video-player-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .video-player-desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--text-secondary);
          white-space: pre-wrap;
        }

        .player-tags-section {
          background-color: var(--bg-surface-accent);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 10px 14px;
        }

        .tag-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-chip {
          font-size: 11.5px;
          font-weight: 500;
          background-color: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px 10px;
        }

        .student-creator-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-top: 4px;
        }

        .student-creator-card:hover {
          background-color: var(--burgundy-50);
          border-color: var(--accent-primary);
        }

        .creator-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--border-strong);
        }

        .creator-details {
          flex: 1;
        }

        .creator-name {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .creator-academic {
          display: block;
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .view-profile-link {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent-primary);
        }
      `}</style>
    </Modal>
  );
}
