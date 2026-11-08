import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';
import { matchingService } from '../services/matchingService.js';
import StudentCard from '../components/StudentCard.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { Users, Sparkles, MessageSquare, Search, Filter, MessageCircle, Code2, CheckCircle2, Video } from 'lucide-react';

const COURSES = ['All', 'B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'BCA', 'MCA', 'BBA', 'MBA'];
const ACADEMIC_YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const AVAILABILITY_OPTIONS = ['All', 'Morning', 'Afternoon', 'Evening', 'Flexible'];
const SHOWCASE_FILTERS = [
  'All Categories',
  'Public Speaking',
  'Presentation Skills',
  'Technical Explanation',
  'Leadership & Team Coordination',
  'Project Demonstration',
  'Creative Talent',
  'Language Skills',
];

export default function FindCollaborators() {
  // Discovery Mode: 'technical' or 'communication'
  const [activeMode, setActiveMode] = useState('technical');

  const [students, setStudents] = useState([]);
  const [communicationMatches, setCommunicationMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Technical Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedShowcaseCat, setSelectedShowcaseCat] = useState('All Categories');
  const [onlyWithShowcase, setOnlyWithShowcase] = useState(false);

  // Connect modal state
  const [selectedStudentForConnect, setSelectedStudentForConnect] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    if (activeMode === 'technical') {
      fetchTechnicalStudents();
    } else {
      fetchCommunicationMatches();
    }
  }, [activeMode, selectedCourse, selectedYear, selectedAvailability, selectedShowcaseCat, onlyWithShowcase]);

  const fetchTechnicalStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCourse !== 'All') params.course = selectedCourse;
      if (selectedYear !== 'All') params.academicYear = selectedYear;
      if (selectedAvailability !== 'All') params.availability = selectedAvailability;
      if (selectedShowcaseCat !== 'All Categories') {
        params.showcaseCategory = selectedShowcaseCat;
      } else if (onlyWithShowcase) {
        params.hasShowcase = 'true';
      }

      const res = await userService.searchStudents(params);
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunicationMatches = async () => {
    try {
      setLoading(true);
      const res = await matchingService.getMyCommunicationMatches();
      if (res.success && res.data) {
        setCommunicationMatches(res.data);
      }
    } catch (err) {
      console.error('Failed to load communication matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeMode === 'technical') {
      fetchTechnicalStudents();
    }
  };

  const handleOpenConnectModal = (student) => {
    setSelectedStudentForConnect(student);
    setConnectMessage(`Hi ${student.name.split(' ')[0]}! I saw your profile on G-CIRCLE and would love to collaborate.`);
  };

  const handleSendConnection = (e) => {
    e.preventDefault();
    setSuccessBanner(`Connection request sent to ${selectedStudentForConnect?.name}!`);
    setSelectedStudentForConnect(null);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  return (
    <div className="find-collaborators-page">
      <div className="page-header">
        <h2 className="title">Find Collaborators</h2>
        <p className="subtitle">
          Connect with students based on complementary capabilities, communication strengths, and working styles.
        </p>
      </div>

      {successBanner && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* DISCOVERY MODE SWITCHER TABS (A. Technical Collaboration, B. Communication & Collaboration) */}
      <div className="mode-switcher-card card">
        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-tab ${activeMode === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveMode('technical')}
          >
            <Code2 size={17} />
            <div className="tab-text">
              <span className="tab-title">A. Technical Collaboration</span>
              <span className="tab-desc">Search by programming languages, frameworks & tech skills</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-tab ${activeMode === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveMode('communication')}
          >
            <MessageCircle size={17} />
            <div className="tab-text">
              <span className="tab-title">B. Communication & Collaboration</span>
              <span className="tab-desc">Find public speakers, presenters & project coordinators</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mode-Specific Toolbar */}
      {activeMode === 'technical' && (
        <div className="technical-filters-card card">
          <form className="search-row" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-control"
                placeholder="Search by student name, bio, or technical keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="dropdowns-row">
            <div className="filter-select-group">
              <label>Course:</label>
              <select
                className="input-control select-sm"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select-group">
              <label>Year:</label>
              <select
                className="input-control select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select-group">
              <label>Availability:</label>
              <select
                className="input-control select-sm"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select-group">
              <label className="showcase-label-with-icon">
                <Video size={13} className="label-icon" /> Showcase:
              </label>
              <select
                className="input-control select-sm"
                value={selectedShowcaseCat}
                onChange={(e) => setSelectedShowcaseCat(e.target.value)}
              >
                {SHOWCASE_FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-toggle-group">
              <label className="checkbox-pill">
                <input
                  type="checkbox"
                  checked={onlyWithShowcase}
                  onChange={(e) => setOnlyWithShowcase(e.target.checked)}
                />
                <span>Has Video Showcase</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'communication' && (
        <div className="comm-banner-card card">
          <div className="comm-banner-content">
            <Sparkles size={20} className="sparkle-icon" />
            <div>
              <h4 className="comm-banner-title">Find Communication & Coordination Partners</h4>
              <p className="comm-banner-desc">
                Many engineering students have strong code skills but need partners who excel in Public Speaking, Presentation Skills, Pitch Decks, and Team Coordination. Below are your highest synergy matches based on complementary communication styles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      {loading ? (
        <LoadingState message="Finding suitable university collaborators..." />
      ) : activeMode === 'technical' ? (
        students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match your filter"
            message="Try widening your search terms or course filters."
          />
        ) : (
          <div className="students-grid">
            {students.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                onConnect={handleOpenConnectModal}
              />
            ))}
          </div>
        )
      ) : communicationMatches.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No communication matches yet"
          message="Update your communication preferences in Settings to generate synergy matches."
        />
      ) : (
        <div className="students-grid">
          {communicationMatches.map((m, idx) => (
            <StudentCard
              key={idx}
              student={m.student}
              matchPercentage={m.matchPercentage}
              whyRecommended={m.whyRecommended}
              onConnect={handleOpenConnectModal}
            />
          ))}
        </div>
      )}

      {/* Connect Message Modal */}
      <Modal
        isOpen={!!selectedStudentForConnect}
        onClose={() => setSelectedStudentForConnect(null)}
        title={`Message ${selectedStudentForConnect?.name}`}
        maxWidth="480px"
      >
        <form onSubmit={handleSendConnection}>
          <div className="connect-preview">
            <img
              src={selectedStudentForConnect?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudentForConnect?.name}&backgroundColor=722F3E&textColor=FAF8F4`}
              alt={selectedStudentForConnect?.name}
              className="connect-avatar"
            />
            <div>
              <strong>{selectedStudentForConnect?.name}</strong>
              <p>{selectedStudentForConnect?.academicYear} • {selectedStudentForConnect?.course}</p>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Collaboration Note</label>
            <textarea
              className="input-control"
              rows={4}
              value={connectMessage}
              onChange={(e) => setConnectMessage(e.target.value)}
              placeholder="Suggest a project or share your collaboration ideas..."
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedStudentForConnect(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Note
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .find-collaborators-page {
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

        .mode-switcher-card {
          padding: 8px;
        }

        .mode-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .mode-tab {
          padding: 12px 18px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          color: var(--text-secondary);
        }

        .mode-tab:hover {
          background-color: var(--bg-surface-accent);
          border-color: var(--border-strong);
        }

        .mode-tab.active {
          background-color: var(--burgundy-50);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        .mode-tab svg {
          margin-top: 3px;
          flex-shrink: 0;
        }

        .tab-title {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .mode-tab.active .tab-title {
          color: var(--accent-primary);
        }

        .tab-desc {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .technical-filters-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .search-row {
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

        .dropdowns-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select-group label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .select-sm {
          padding: 6px 10px;
          font-size: 12.5px;
          width: auto;
          min-width: 130px;
        }

        .showcase-label-with-icon {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-primary) !important;
        }

        .showcase-label-with-icon .label-icon {
          color: var(--accent-primary);
        }

        .filter-toggle-group {
          display: flex;
          align-items: center;
          margin-left: auto;
        }

        .checkbox-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .checkbox-pill:hover {
          background-color: var(--burgundy-100);
          border-color: var(--accent-primary);
        }

        .checkbox-pill input[type="checkbox"] {
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        .comm-banner-card {
          padding: 20px 24px;
          background-color: var(--bg-surface-accent);
          border-color: var(--border-strong);
        }

        .comm-banner-content {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .comm-banner-content .sparkle-icon {
          color: var(--accent-primary);
          margin-top: 2px;
          flex-shrink: 0;
        }

        .comm-banner-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .comm-banner-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .connect-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .connect-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-strong);
        }

        .connect-preview strong {
          display: block;
          font-size: 14px;
          color: var(--text-primary);
        }

        .connect-preview p {
          font-size: 12px;
          color: var(--text-muted);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }

        @media (max-width: 768px) {
          .mode-tabs {
            grid-template-columns: 1fr;
          }
          .students-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

