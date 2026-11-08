import React, { useState, useEffect } from 'react';
import { showcaseService } from '../services/showcaseService.js';
import ShowcaseVideoCard from '../components/ShowcaseVideoCard.jsx';
import ShowcasePlayerModal from '../components/ShowcasePlayerModal.jsx';
import ShowcaseUploadModal, { SHOWCASE_CATEGORIES } from '../components/ShowcaseUploadModal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Video, Plus, Search, Filter, Sparkles, MessageCircle, Mic, MonitorPlay } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Showcase() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchShowcase();
    fetchMyVideos();
  }, [activeTab]);

  const fetchShowcase = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'All') params.category = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await showcaseService.getPublicShowcase(params);
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error('Failed to load showcase videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVideos = async () => {
    try {
      const res = await showcaseService.getMyVideos();
      if (res.success && res.data) {
        setMyVideos(res.data);
      }
    } catch (err) {
      console.error('Failed to load personal showcase videos:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShowcase();
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      setDeletingId(videoId);
      await showcaseService.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      alert(err.message || 'Failed to delete video.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSuccess = (newVideo) => {
    setMyVideos((prev) => [newVideo, ...prev]);
    if (newVideo.visibility === 'PUBLIC') {
      setVideos((prev) => [newVideo, ...prev]);
    }
  };

  return (
    <div className="showcase-page">
      {/* Header Banner */}
      <div className="showcase-hero card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-sparkle" />
            <span>Show More Than Your Skills</span>
          </div>
          <h2 className="hero-title">Beyond Skills — Talent & Communication Showcase</h2>
          <p className="hero-desc">
            Discover teammates through authentic video demonstrations. Explore presentations, public speaking, technical walkthroughs, and creative capabilities to build truly complementary university project teams.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus size={16} /> Upload or Record Video
            </button>
            <span className="my-count-pill">
              {myVideos.length}/6 Showcase Videos Uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroller Tabs */}
      <div className="categories-scroll-bar">
        <button
          type="button"
          className={`category-pill ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          All Showcases
        </button>
        {SHOWCASE_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={`category-pill ${activeTab === cat.name ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-filter-card card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-control"
              placeholder="Search by topic, speaker name, or demonstration title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <LoadingState message="Loading talent & communication showcases..." />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No showcase demonstrations found"
          message={
            activeTab === 'All'
              ? 'Be the first student to showcase your communication, public speaking or project demonstrations!'
              : `No student videos found under "${activeTab}". Try switching categories or upload one yourself.`
          }
          actionLabel="Upload Your Showcase"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="showcase-grid">
          {videos.map((vid) => (
            <ShowcaseVideoCard
              key={vid.id}
              video={vid}
              isOwner={vid.userId === user?.id}
              onPlay={(v) => setPlayingVideo(v)}
              onDelete={handleDeleteVideo}
              isDeleting={deletingId === vid.id}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <ShowcasePlayerModal
        video={playingVideo}
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
      />

      {/* Video Upload / Record Modal */}
      <ShowcaseUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        currentVideoCount={myVideos.length}
      />

      <style>{`
        .showcase-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .showcase-hero {
          background: linear-gradient(135deg, var(--burgundy-900) 0%, var(--accent-primary) 100%);
          color: var(--ivory-50);
          padding: 32px 36px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-strong);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(250, 248, 244, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--warm-beige-100);
          margin-bottom: 12px;
        }

        .hero-sparkle {
          color: var(--warm-beige-200);
        }

        .hero-title {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 8px;
        }

        .hero-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--warm-beige-100);
          max-width: 720px;
          margin-bottom: 20px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .showcase-hero .btn-primary {
          background-color: var(--ivory-50);
          color: var(--burgundy-900);
          font-weight: 700;
        }

        .showcase-hero .btn-primary:hover {
          background-color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }

        .my-count-pill {
          font-size: 12px;
          font-weight: 600;
          color: var(--warm-beige-200);
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .categories-scroll-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
        }

        .category-pill {
          padding: 8px 16px;
          font-size: 12.5px;
          font-weight: 600;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .category-pill:hover {
          background-color: var(--bg-surface-accent);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .category-pill.active {
          background-color: var(--accent-primary);
          color: var(--ivory-50);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        .search-filter-card {
          padding: 14px 18px;
        }

        .search-form {
          display: flex;
          gap: 10px;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input-wrap input {
          padding-left: 36px;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 22px;
        }
      `}</style>
    </div>
  );
}
