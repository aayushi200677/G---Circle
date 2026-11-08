import React from 'react';
import { Play, Clock, Tag, Trash2, Shield, Video } from 'lucide-react';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function ShowcaseVideoCard({
  video,
  onPlay,
  isOwner = false,
  onDelete,
  isDeleting = false,
}) {
  return (
    <div className="showcase-card card card-hover">
      {/* Thumbnail Container */}
      <div className="showcase-thumb-wrap" onClick={() => onPlay && onPlay(video)}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="thumb-image" />
        ) : (
          <div className="thumb-fallback">
            <Video size={36} className="thumb-bg-icon" />
            <span className="thumb-category-title">{video.category}</span>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="play-button-overlay">
          <div className="play-circle">
            <Play size={20} className="play-icon" />
          </div>
        </div>

        {/* Duration badge */}
        <span className="thumb-duration">
          <Clock size={11} /> {formatDuration(video.duration)}
        </span>

        {/* Visibility Pill (if owner or non-public) */}
        {(isOwner || video.visibility !== 'PUBLIC') && (
          <span className="thumb-visibility">
            <Shield size={10} />
            {video.visibility === 'PUBLIC'
              ? 'Public'
              : video.visibility === 'TEAM_ONLY'
              ? 'Team Only'
              : 'Private'}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="showcase-card-body">
        <div className="category-row">
          <span className="category-tag">{video.category}</span>
          {isOwner && onDelete && (
            <button
              type="button"
              className="delete-video-btn"
              title="Delete this showcase video"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
                  onDelete(video.id);
                }
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <h4 className="showcase-title" onClick={() => onPlay && onPlay(video)}>
          {video.title}
        </h4>

        {video.description && (
          <p className="showcase-desc">{video.description}</p>
        )}

        {/* Skill Tags */}
        {video.skillTags && video.skillTags.length > 0 && (
          <div className="showcase-tags">
            {video.skillTags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag-chip">
                {tag}
              </span>
            ))}
            {video.skillTags.length > 3 && (
              <span className="more-tags">+{video.skillTags.length - 3}</span>
            )}
          </div>
        )}

        {/* Author info (if available and not owner view) */}
        {video.user && !isOwner && (
          <div className="author-row">
            <img
              src={
                video.user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${video.user.name}&backgroundColor=722F3E&textColor=FAF8F4`
              }
              alt={video.user.name}
              className="author-avatar"
            />
            <span className="author-name">{video.user.name}</span>
          </div>
        )}
      </div>

      <style>{`
        .showcase-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          height: 100%;
        }

        .showcase-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #2b1219;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .showcase-card:hover .thumb-image {
          transform: scale(1.03);
        }

        .thumb-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #51212E 0%, #722F3E 100%);
          color: var(--ivory-50);
        }

        .thumb-bg-icon {
          color: var(--warm-beige-200);
          opacity: 0.8;
        }

        .thumb-category-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--warm-beige-100);
          text-align: center;
          padding: 0 12px;
        }

        .play-button-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          transition: background var(--transition-fast);
        }

        .showcase-thumb-wrap:hover .play-button-overlay {
          background: rgba(0, 0, 0, 0.4);
        }

        .play-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(250, 248, 244, 0.92);
          color: var(--burgundy-900);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transition: transform var(--transition-fast), background var(--transition-fast);
        }

        .showcase-thumb-wrap:hover .play-circle {
          transform: scale(1.1);
          background: #ffffff;
        }

        .play-icon {
          margin-left: 2px;
          color: var(--accent-primary);
        }

        .thumb-duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .thumb-visibility {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(81, 33, 46, 0.88);
          color: var(--ivory-50);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .showcase-card-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .category-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .category-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-primary);
          background-color: var(--burgundy-50);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .delete-video-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 3px;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }

        .delete-video-btn:hover {
          color: #b91c1c;
        }

        .showcase-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          margin-bottom: 6px;
          cursor: pointer;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .showcase-title:hover {
          color: var(--accent-primary);
        }

        .showcase-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .showcase-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: auto;
          padding-top: 8px;
        }

        .tag-chip {
          font-size: 10.5px;
          font-weight: 500;
          background-color: var(--bg-surface-accent);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 1px 7px;
        }

        .more-tags {
          font-size: 10.5px;
          color: var(--text-muted);
          align-self: center;
        }

        .author-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }

        .author-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid var(--border-strong);
        }

        .author-name {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
