import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import SkillBadge from '../components/SkillBadge.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ShowcaseVideoCard from '../components/ShowcaseVideoCard.jsx';
import ShowcasePlayerModal from '../components/ShowcasePlayerModal.jsx';
import ShowcaseUploadModal from '../components/ShowcaseUploadModal.jsx';
import { showcaseService } from '../services/showcaseService.js';
import {
  User,
  GraduationCap,
  Mail,
  Linkedin,
  Github,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  MessageSquare,
  Award,
  Video,
} from 'lucide-react';

const PROFICIENCY_OPTIONS = [
  { value: 1, label: 'Beginner (1)' },
  { value: 2, label: 'Intermediate (2)' },
  { value: 3, label: 'Advanced (3)' },
  { value: 4, label: 'Expert (4)' },
];

export default function StudentProfile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = !id || id === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [commCatalog, setCommCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editAvailability, setEditAvailability] = useState('Flexible');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editRoles, setEditRoles] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Add Skill Modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(2);

  // Add Comm Skill Modal
  const [showCommModal, setShowCommModal] = useState(false);
  const [selectedCommName, setSelectedCommName] = useState('');
  const [selectedCommProficiency, setSelectedCommProficiency] = useState(3);

  // Beyond Skills — Talent Showcase Modal & Player state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  const [successBanner, setSuccessBanner] = useState('');

  const handleDeleteShowcaseVideo = async (videoId) => {
    try {
      setDeletingVideoId(videoId);
      await showcaseService.deleteVideo(videoId);
      setProfile((prev) => ({
        ...prev,
        showcaseVideos: (prev.showcaseVideos || []).filter((v) => v.id !== videoId),
      }));
      setSuccessBanner('Showcase video removed successfully.');
      setTimeout(() => setSuccessBanner(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to delete video.');
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleShowcaseUploadSuccess = (newVideo) => {
    setProfile((prev) => ({
      ...prev,
      showcaseVideos: [newVideo, ...(prev.showcaseVideos || [])],
    }));
    setSuccessBanner('Showcase video published successfully!');
    setTimeout(() => setSuccessBanner(''), 3500);
  };

  useEffect(() => {
    loadProfileData();
  }, [id, currentUser?.id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        const res = await userService.getMe();
        if (res.success && res.data) {
          setProfile(res.data);
          setEditBio(res.data.bio || '');
          setEditExperience(res.data.experience || '');
          setEditAvailability(res.data.availability || 'Flexible');
          setEditLinkedin(res.data.linkedin || '');
          setEditGithub(res.data.github || '');
          setEditRoles(res.data.preferredRoles?.join(', ') || '');
        }
      } else {
        const res = await userService.getPublicProfile(id);
        if (res.success && res.data) {
          setProfile(res.data);
        }
      }

      // Load skills catalogs for adding
      const [skillsRes, commRes] = await Promise.all([
        userService.getSkillsCatalog(),
        userService.getCommunicationSkills(),
      ]);
      if (skillsRes.success) setSkillsCatalog(skillsRes.data);
      if (commRes.success) setCommCatalog(commRes.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const rolesArray = editRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await userService.updateMe({
        bio: editBio,
        experience: editExperience,
        availability: editAvailability,
        linkedin: editLinkedin,
        github: editGithub,
        preferredRoles: rolesArray,
      });

      if (res.success) {
        setProfile(res.data);
        updateUser(res.data);
        setShowEditModal(false);
        setSuccessBanner('Profile details updated successfully!');
        setTimeout(() => setSuccessBanner(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillName.trim()) return;

    try {
      const res = await userService.addSkill({
        skillName: selectedSkillName.trim(),
        proficiency: Number(selectedProficiency),
      });

      if (res.success) {
        loadProfileData();
        setShowSkillModal(false);
        setSelectedSkillName('');
        setSuccessBanner('Technical skill added to your profile!');
        setTimeout(() => setSuccessBanner(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (userSkillId) => {
    if (!window.confirm('Remove this skill from your profile?')) return;
    try {
      await userService.deleteSkill(userSkillId);
      setProfile((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== userSkillId),
      }));
    } catch (err) {
      alert(err.message || 'Failed to remove skill.');
    }
  };

  const handleAddCommSkill = async (e) => {
    e.preventDefault();
    if (!selectedCommName.trim()) return;

    try {
      const res = await userService.addCommunicationSkill({
        communicationSkillName: selectedCommName.trim(),
        proficiency: Number(selectedCommProficiency),
      });

      if (res.success) {
        loadProfileData();
        setShowCommModal(false);
        setSelectedCommName('');
        setSuccessBanner('Communication strength added!');
        setTimeout(() => setSuccessBanner(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to add communication strength.');
    }
  };

  const handleDeleteCommSkill = async (id) => {
    try {
      await userService.deleteCommunicationSkill(id);
      setProfile((prev) => ({
        ...prev,
        communicationSkills: prev.communicationSkills.filter((cs) => cs.id !== id),
      }));
    } catch (err) {
      alert(err.message || 'Failed to delete communication strength.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading student profile..." />;
  }

  if (!profile) {
    return (
      <div className="card empty-profile">
        <h3>Student profile not found</h3>
      </div>
    );
  }

  return (
    <div className="student-profile-page">
      {successBanner && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="profile-hero-card card">
        <div className="hero-top">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=722F3E&textColor=FAF8F4`}
            alt={profile.name}
            className="hero-avatar"
          />

          <div className="hero-info">
            <div className="name-row">
              <h1 className="hero-name">{profile.name}</h1>
              {profile.emailVerified && (
                <span className="verified-badge" title="Official Galgotias University Student Verified">
                  ✓ Verified Student
                </span>
              )}
            </div>

            <p className="hero-academic">
              {profile.academicYear} • {profile.course}
              {profile.studentId && ` (${profile.studentId})`}
            </p>

            <p className="hero-uni">Galgotias University</p>

            <div className="hero-links">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="profile-social-link">
                  <Mail size={14} /> {profile.email}
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="profile-social-link">
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-social-link"
                >
                  <Github size={14} /> GitHub
                </a>
              )}
            </div>
          </div>

          <div className="hero-actions">
            {isOwnProfile ? (
              <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
                <Edit2 size={15} /> Edit Profile
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => alert(`Connect request sent to ${profile.name}!`)}
              >
                <MessageSquare size={15} /> Connect
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bio-box">
            <p className="bio-text">{profile.bio}</p>
          </div>
        )}

        {/* Roles & Availability pills */}
        <div className="profile-quick-meta">
          <div className="meta-pill">
            <Clock size={13} />
            <span>Availability: {profile.availability || 'Flexible'}</span>
          </div>

          {profile.preferredRoles?.map((role, idx) => (
            <span key={idx} className="role-chip">
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Grid: Technical Skills & Communication Strengths */}
      <div className="skills-two-col">
        {/* Technical Skills (Relational user_skills) */}
        <div className="card skills-block-card">
          <div className="block-header">
            <div>
              <h3 className="block-title">Technical Skills</h3>
              <p className="block-subtitle">Structured proficiency records (1=Beginner to 4=Expert)</p>
            </div>
            {isOwnProfile && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowSkillModal(true)}>
                <Plus size={14} /> Add Skill
              </button>
            )}
          </div>

          {profile.skills?.length === 0 ? (
            <p className="empty-hint">No technical skills added yet.</p>
          ) : (
            <div className="skills-structured-list">
              {profile.skills?.map((item) => (
                <div key={item.id} className="skill-row-card">
                  <div className="skill-info">
                    <strong className="skill-title">{item.skill.name}</strong>
                    <span className="skill-category">{item.skill.category}</span>
                  </div>

                  <div className="skill-level-indicator">
                    <div className="level-bar-wrap">
                      <div className="level-dots">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`level-dot ${step <= item.proficiency ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="level-name">
                        {item.proficiency === 4
                          ? 'Expert (4)'
                          : item.proficiency === 3
                          ? 'Advanced (3)'
                          : item.proficiency === 2
                          ? 'Intermediate (2)'
                          : 'Beginner (1)'}
                      </span>
                    </div>

                    {isOwnProfile && (
                      <button
                        className="delete-skill-btn"
                        onClick={() => handleDeleteSkill(item.id)}
                        title="Remove Skill"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communication Skills */}
        <div className="card skills-block-card">
          <div className="block-header">
            <div>
              <h3 className="block-title">
                <Sparkles size={16} className="title-sparkle" /> Communication & Soft Strengths
              </h3>
              <p className="block-subtitle">Capabilities evaluated for team coordination & presentation</p>
            </div>
            {isOwnProfile && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowCommModal(true)}>
                <Plus size={14} /> Add Strength
              </button>
            )}
          </div>

          {profile.communicationSkills?.length === 0 ? (
            <p className="empty-hint">No communication strengths added yet.</p>
          ) : (
            <div className="comm-strengths-list">
              {profile.communicationSkills?.map((cs) => (
                <div key={cs.id} className="comm-row-card">
                  <div className="comm-name-wrap">
                    <Award size={15} className="comm-icon" />
                    <strong>{cs.communicationSkill.name}</strong>
                  </div>

                  <div className="comm-level-wrap">
                    <span className="comm-proficiency-tag">
                      Level {cs.proficiency}/4
                    </span>
                    {isOwnProfile && (
                      <button
                        className="delete-skill-btn"
                        onClick={() => handleDeleteCommSkill(cs.id)}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {profile.languages?.length > 0 && (
            <div className="languages-sub-section">
              <span className="sub-label">Languages Spoken</span>
              <div className="lang-chips">
                {profile.languages.map((l) => (
                  <span key={l.id} className="lang-chip">
                    {l.language} ({l.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration Preferences */}
          {profile.preferences && (
            <div className="preferences-sub-section">
              <span className="sub-label">Collaboration Style</span>
              <p className="pref-style-pill">{profile.preferences.collaborationStyle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Experience & Past Projects */}
      {profile.experience && (
        <div className="card experience-card">
          <h3 className="block-title">Experience & Hackathons</h3>
          <p className="experience-text">{profile.experience}</p>
        </div>
      )}

      {/* Beyond Skills — Talent Showcase */}
      <div className="card showcase-section-card" id="showcase">
        <div className="showcase-section-header">
          <div>
            <div className="showcase-tagline-wrap">
              <Sparkles size={13} className="sparkle-icon" />
              <span className="showcase-tagline">Show More Than Your Skills</span>
            </div>
            <h3 className="block-title">Beyond Skills – Talent & Communication Showcase</h3>
            <p className="block-subtitle">
              Authentic video demonstrations of technical explanation, presentations, public speaking, leadership, and project builds.
            </p>
          </div>
          {isOwnProfile && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
              disabled={(profile.showcaseVideos?.length || 0) >= 6}
            >
              <Plus size={14} /> Add Showcase Video ({profile.showcaseVideos?.length || 0}/6)
            </button>
          )}
        </div>

        {(!profile.showcaseVideos || profile.showcaseVideos.length === 0) ? (
          <div className="showcase-empty-state">
            <Video size={36} className="empty-video-icon" />
            <p className="empty-title">
              {isOwnProfile
                ? 'No showcase demonstrations uploaded yet'
                : 'This student has not uploaded any showcase demonstrations yet'}
            </p>
            <p className="empty-subtitle">
              {isOwnProfile
                ? 'Record or upload short video clips (up to 6) highlighting your public speaking, project demo, or explanation abilities to help teammates discover you.'
                : 'Check back later or connect with them to discuss collaboration.'}
            </p>
            {isOwnProfile && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={14} /> Record or Upload Your First Video
              </button>
            )}
          </div>
        ) : (
          <div className="profile-showcase-grid">
            {profile.showcaseVideos.map((video) => (
              <ShowcaseVideoCard
                key={video.id}
                video={video}
                isOwner={isOwnProfile}
                onPlay={(v) => setPlayingVideo(v)}
                onDelete={handleDeleteShowcaseVideo}
                isDeleting={deletingVideoId === video.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student Profile"
        maxWidth="560px"
      >
        <form onSubmit={handleSaveProfile}>
          <div className="input-group">
            <label className="input-label">Bio / Headline</label>
            <textarea
              className="input-control"
              rows={3}
              placeholder="Tell other students what you're passionate about..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Experience & Hackathon History</label>
            <textarea
              className="input-control"
              rows={3}
              placeholder="e.g. SIH 2024 Finalist, built 3 full-stack React projects..."
              value={editExperience}
              onChange={(e) => setEditExperience(e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Availability</label>
              <select
                className="input-control"
                value={editAvailability}
                onChange={(e) => setEditAvailability(e.target.value)}
              >
                <option value="Flexible">Flexible</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Preferred Roles (Comma-separated)</label>
              <input
                type="text"
                className="input-control"
                placeholder="Frontend Developer, ML Engineer"
                value={editRoles}
                onChange={(e) => setEditRoles(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">LinkedIn URL</label>
              <input
                type="url"
                className="input-control"
                value={editLinkedin}
                onChange={(e) => setEditLinkedin(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">GitHub Username / URL</label>
              <input
                type="text"
                className="input-control"
                value={editGithub}
                onChange={(e) => setEditGithub(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        title="Add Technical Skill"
        maxWidth="460px"
      >
        <form onSubmit={handleAddSkill}>
          <div className="input-group">
            <label className="input-label">Skill Name</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. React.js, Python, PostgreSQL, Docker"
              value={selectedSkillName}
              onChange={(e) => setSelectedSkillName(e.target.value)}
              list="skills-options"
              required
            />
            <datalist id="skills-options">
              {skillsCatalog.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div className="input-group">
            <label className="input-label">Proficiency Level</label>
            <select
              className="input-control"
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value)}
            >
              {PROFICIENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSkillModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Communication Strength Modal */}
      <Modal
        isOpen={showCommModal}
        onClose={() => setShowCommModal(false)}
        title="Add Communication Strength"
        maxWidth="460px"
      >
        <form onSubmit={handleAddCommSkill}>
          <div className="input-group">
            <label className="input-label">Strength</label>
            <select
              className="input-control"
              value={selectedCommName}
              onChange={(e) => setSelectedCommName(e.target.value)}
              required
            >
              <option value="">Select a strength...</option>
              {commCatalog.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Proficiency Level</label>
            <select
              className="input-control"
              value={selectedCommProficiency}
              onChange={(e) => setSelectedCommProficiency(e.target.value)}
            >
              <option value={2}>Intermediate (2)</option>
              <option value={3}>Advanced (3)</option>
              <option value={4}>Expert (4)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCommModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Strength
            </button>
          </div>
        </form>
      </Modal>

      {/* Video Player Modal */}
      <ShowcasePlayerModal
        video={playingVideo}
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
      />

      {/* Video Upload Modal */}
      <ShowcaseUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleShowcaseUploadSuccess}
        currentVideoCount={profile.showcaseVideos?.length || 0}
      />

      <style>{`
        .showcase-section-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .showcase-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 14px;
        }

        .showcase-tagline-wrap {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent-primary);
          background-color: var(--burgundy-50);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-bottom: 4px;
          border: 1px solid var(--border-subtle);
        }

        .showcase-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 20px;
          background-color: var(--bg-surface-accent);
          border: 1px dashed var(--border-strong);
          border-radius: var(--radius-lg);
          gap: 8px;
        }

        .empty-video-icon {
          color: var(--accent-primary);
          opacity: 0.7;
          margin-bottom: 4px;
        }

        .showcase-empty-state .empty-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .showcase-empty-state .empty-subtitle {
          font-size: 12.5px;
          color: var(--text-muted);
          max-width: 520px;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .profile-showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .student-profile-page {
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

        .profile-hero-card {
          padding: 32px;
        }

        .hero-top {
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .hero-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--border-strong);
          flex-shrink: 0;
        }

        .hero-info {
          flex: 1;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-name {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .verified-badge {
          font-size: 11px;
          font-weight: 700;
          background-color: var(--beige-400);
          color: var(--burgundy-900);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          border: 1px solid var(--beige-600);
        }

        .hero-academic {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .hero-uni {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent-primary);
          margin-top: 2px;
        }

        .hero-links {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .profile-social-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }

        .profile-social-link:hover {
          color: var(--accent-primary);
        }

        .bio-box {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .bio-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 800px;
        }

        .profile-quick-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .role-chip {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-primary);
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-subtle);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .skills-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .skills-block-card {
          padding: 24px;
        }

        .block-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .block-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .title-sparkle {
          color: var(--accent-primary);
        }

        .block-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .skills-structured-list, .comm-strengths-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skill-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .skill-title {
          font-size: 13.5px;
          color: var(--text-primary);
          display: block;
        }

        .skill-category {
          font-size: 11px;
          color: var(--text-muted);
        }

        .skill-level-indicator {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .level-bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .level-dots {
          display: flex;
          gap: 4px;
        }

        .level-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--border-strong);
        }

        .level-dot.filled {
          background-color: var(--accent-primary);
        }

        .level-name {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .comm-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .comm-name-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .comm-icon {
          color: var(--accent-primary);
        }

        .comm-level-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .comm-proficiency-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--accent-primary);
          background-color: var(--bg-card);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .delete-skill-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .delete-skill-btn:hover {
          color: var(--accent-primary);
        }

        .languages-sub-section, .preferences-sub-section {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .sub-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .lang-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lang-chip {
          font-size: 12px;
          padding: 3px 10px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .pref-style-pill {
          font-size: 12.5px;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          padding: 6px 12px;
          border-radius: var(--radius-md);
          display: inline-block;
        }

        .experience-card {
          padding: 24px;
        }

        .experience-text {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-top: 8px;
        }

        .empty-hint {
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .hero-top {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .name-row, .hero-links, .profile-quick-meta {
            justify-content: center;
          }
          .skills-two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

