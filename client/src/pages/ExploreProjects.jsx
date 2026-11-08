import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../services/projectService.js';
import { teamService } from '../services/teamService.js';
import ProjectCard from '../components/ProjectCard.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { Search, Filter, Compass, CheckCircle2 } from 'lucide-react';

const PROJECT_TYPES = ['All', 'Hackathon', 'Academic', 'Research', 'Open Source', 'Startup', 'Competition'];
const DIFFICULTY_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function ExploreProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Join modal
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [selectedType, selectedDifficulty]);

  const fetchProjects = async (searchOverride = searchQuery) => {
    try {
      setLoading(true);
      const params = {};
      if (searchOverride.trim()) params.query = searchOverride.trim();
      if (selectedType !== 'All') params.projectType = selectedType;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;

      const res = await projectService.getAll(params);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(searchQuery);
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const handleOpenJoinModal = (project) => {
    setSelectedProjectForJoin(project);
    setJoinMessage(`Hi! I would love to collaborate on "${project.title}" and contribute my capabilities.`);
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!selectedProjectForJoin) return;

    try {
      setIsSubmittingJoin(true);
      const res = await teamService.sendJoinRequest(selectedProjectForJoin.id, joinMessage);
      if (res.success) {
        setSuccessBanner(`Join request sent to ${selectedProjectForJoin.title}!`);
        setSelectedProjectForJoin(null);
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProjectForJoin.id ? { ...p, userRequestStatus: 'PENDING' } : p
          )
        );
        setTimeout(() => setSuccessBanner(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to send request.');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  return (
    <div className="explore-projects-page">
      <div className="page-header">
        <h2 className="title">Explore Projects</h2>
        <p className="subtitle">
          Discover student-led initiatives across Galgotias University looking for skilled teammates.
        </p>
      </div>

      {successBanner && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="filters-card card">
        <form className="search-row" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-control search-input"
              placeholder="Search by project title, description, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-pills-row">
          <div className="filter-group">
            <span className="filter-label">Project Type:</span>
            <div className="pills-wrap">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-pill ${selectedType === type ? 'active' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Difficulty:</span>
            <div className="pills-wrap">
              {DIFFICULTY_LEVELS.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`filter-pill ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingState message="Discovering university projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No projects match your criteria"
          message="Try adjusting your keywords, project type, or difficulty filter."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedType('All');
            setSelectedDifficulty('All');
            setSearchQuery('');
            fetchProjects('');
          }}
        />
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onRequestJoin={handleOpenJoinModal}
            />
          ))}
        </div>
      )}

      {/* Send Join Request Modal */}
      <Modal
        isOpen={!!selectedProjectForJoin}
        onClose={() => setSelectedProjectForJoin(null)}
        title={`Join ${selectedProjectForJoin?.title}`}
        maxWidth="500px"
      >
        <form onSubmit={handleSendJoinRequest}>
          <p className="modal-text">
            Tell the team leader why you want to join and what skills you bring to the table:
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
              {isSubmittingJoin ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .explore-projects-page {
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
          padding: 10px 16px;
          background-color: var(--beige-400);
          border: 1px solid var(--beige-600);
          border-radius: var(--radius-md);
          color: var(--burgundy-900);
          font-size: 13px;
          font-weight: 600;
        }

        .filters-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-row {
          display: flex;
          gap: 12px;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 38px;
        }

        .filter-pills-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          min-width: 90px;
        }

        .pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-pill {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-pill:hover {
          border-color: var(--border-strong);
          background-color: var(--bg-surface-accent);
        }

        .filter-pill.active {
          background-color: var(--accent-primary);
          color: var(--text-inverse);
          border-color: var(--accent-primary);
          font-weight: 600;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .modal-text {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 14px;
          line-height: 1.45;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

