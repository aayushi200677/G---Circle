import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService.js';
import { Sparkles, Plus, Trash2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const PROJECT_TYPES = [
  'Hackathon',
  'Academic',
  'Research',
  'Open Source',
  'Startup',
  'Competition',
];

const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export default function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'Hackathon',
    requiredTeamSize: 4,
    difficulty: 'Intermediate',
    deadline: '',
  });

  const [requiredSkills, setRequiredSkills] = useState([
    { name: 'React.js', importance: 4 },
    { name: 'Node.js', importance: 4 },
  ]);

  const [roles, setRoles] = useState([
    { roleName: 'Frontend Lead', openCount: 1 },
    { roleName: 'Backend Engineer', openCount: 1 },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillImportance, setNewSkillImportance] = useState(3);
  const [newRoleName, setNewRoleName] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // AI-Assisted Structured Analysis
  const handleAnalyzeWithAI = async () => {
    if (!formData.description || formData.description.length < 10) {
      setError('Please provide at least a short description (10+ characters) to run AI analysis.');
      return;
    }

    try {
      setError('');
      setIsAnalyzing(true);
      const res = await projectService.analyze({
        title: formData.title,
        description: formData.description,
      });

      if (res.success && res.data) {
        setAiSuggestions(res.data);
      }
    } catch (err) {
      setError(err.message || 'AI analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAISuggestions = () => {
    if (!aiSuggestions) return;

    if (aiSuggestions.project_type) {
      setFormData((prev) => ({ ...prev, projectType: aiSuggestions.project_type }));
    }
    if (aiSuggestions.difficulty) {
      setFormData((prev) => ({ ...prev, difficulty: aiSuggestions.difficulty }));
    }
    if (aiSuggestions.team_size) {
      setFormData((prev) => ({ ...prev, requiredTeamSize: aiSuggestions.team_size }));
    }
    if (aiSuggestions.required_skills?.length > 0) {
      setRequiredSkills(
        aiSuggestions.required_skills.map((s) => ({
          name: s.skill,
          importance: s.importance,
        }))
      );
    }
    if (aiSuggestions.roles?.length > 0) {
      setRoles(
        aiSuggestions.roles.map((r) => ({
          roleName: r,
          openCount: 1,
        }))
      );
    }
    setAiSuggestions(null);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (requiredSkills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setError('This skill is already in the list.');
      return;
    }
    setRequiredSkills([...requiredSkills, { name: newSkillName.trim(), importance: Number(newSkillImportance) }]);
    setNewSkillName('');
    setNewSkillImportance(3);
    setError('');
  };

  const handleRemoveSkill = (index) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    setRoles([...roles, { roleName: newRoleName.trim(), openCount: 1 }]);
    setNewRoleName('');
  };

  const handleRemoveRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill for your team.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        requiredTeamSize: Number(formData.requiredTeamSize),
        deadline: formData.deadline || null,
        requiredSkills,
        roles,
      };

      const res = await projectService.create(payload);
      if (res.success && res.data) {
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <h2 className="title">Publish Project & Form Team</h2>
        <p className="subtitle">
          Define your project goals, required skills, and let our complementary matching engine find the best teammates.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="project-form" onSubmit={handleSubmit}>
        {/* Basic Info Card */}
        <div className="form-card card">
          <h3 className="card-section-title">1. Project Overview</h3>

          <div className="input-group">
            <label className="input-label">Project Title *</label>
            <input
              type="text"
              name="title"
              className="input-control"
              placeholder="e.g. Smart Campus Navigation System"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-with-action">
              <label className="input-label">Project Description *</label>
              <button
                type="button"
                className="btn btn-outline btn-sm ai-analyze-btn"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
              >
                <Sparkles size={14} />
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Skill Analysis'}</span>
              </button>
            </div>
            <textarea
              name="description"
              className="input-control"
              rows={5}
              placeholder="Describe your vision, target users, problem statement, and high-level tech stack..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <span className="field-hint">
              Click "AI Skill Analysis" above to automatically detect skills, roles, and project difficulty from your description.
            </span>
          </div>

          {/* AI Suggestions Review Box */}
          {aiSuggestions && (
            <div className="ai-suggestions-box">
              <div className="ai-box-header">
                <div className="ai-box-title">
                  <Sparkles size={16} />
                  <span>AI Structured Suggestions</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleApplyAISuggestions}
                >
                  <CheckCircle size={14} /> Apply All Suggestions
                </button>
              </div>

              <div className="ai-suggestions-content">
                <div className="ai-suggest-item">
                  <strong>Detected Type:</strong> <span>{aiSuggestions.project_type}</span>
                </div>
                <div className="ai-suggest-item">
                  <strong>Recommended Difficulty:</strong> <span>{aiSuggestions.difficulty}</span>
                </div>
                <div className="ai-suggest-item">
                  <strong>Team Size:</strong> <span>{aiSuggestions.team_size} members</span>
                </div>
                <div className="ai-suggest-skills">
                  <strong>Extracted Skills:</strong>
                  <div className="suggest-chips">
                    {aiSuggestions.required_skills?.map((s, idx) => (
                      <span key={idx} className="suggest-chip">
                        {s.skill} (Weight: {s.importance})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ai-suggest-roles">
                  <strong>Open Roles:</strong>
                  <div className="suggest-chips">
                    {aiSuggestions.roles?.map((r, idx) => (
                      <span key={idx} className="suggest-chip role">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-grid-3">
            <div className="input-group">
              <label className="input-label">Project Type *</label>
              <select
                name="projectType"
                className="input-control"
                value={formData.projectType}
                onChange={handleInputChange}
                required
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Difficulty *</label>
              <select
                name="difficulty"
                className="input-control"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Required Team Size (2-10) *</label>
              <input
                type="number"
                name="requiredTeamSize"
                className="input-control"
                min={2}
                max={10}
                value={formData.requiredTeamSize}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Project Deadline (Optional)</label>
            <input
              type="date"
              name="deadline"
              className="input-control"
              value={formData.deadline}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Required Skills Card */}
        <div className="form-card card">
          <h3 className="card-section-title">2. Required Skills & Importance Weights</h3>
          <p className="card-section-sub">
            The matching engine uses skill weights (1=Low, 5=Crucial) to find collaborators who fill your team's missing capabilities.
          </p>

          <div className="skills-builder-row">
            <input
              type="text"
              className="input-control"
              placeholder="e.g. React.js, Python, PostgreSQL"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />
            <select
              className="input-control importance-select"
              value={newSkillImportance}
              onChange={(e) => setNewSkillImportance(e.target.value)}
            >
              <option value={1}>Weight 1 (Minor)</option>
              <option value={2}>Weight 2 (Useful)</option>
              <option value={3}>Weight 3 (Moderate)</option>
              <option value={4}>Weight 4 (High)</option>
              <option value={5}>Weight 5 (Crucial)</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddSkill}
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>

          <div className="current-skills-list">
            {requiredSkills.map((s, idx) => (
              <div key={idx} className="skill-item-pill">
                <span className="skill-item-name">{s.name}</span>
                <span className="skill-item-weight">Weight: {s.importance}/5</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveSkill(idx)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Open Roles Card */}
        <div className="form-card card">
          <h3 className="card-section-title">3. Team Roles</h3>
          <p className="card-section-sub">
            Specify functional positions needed in your team (e.g. Backend Lead, Pitch & Presentation Lead).
          </p>

          <div className="roles-builder-row">
            <input
              type="text"
              className="input-control"
              placeholder="e.g. ML Engineer, UI/UX Designer, Presenter"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddRole}
            >
              <Plus size={16} /> Add Role
            </button>
          </div>

          <div className="current-roles-list">
            {roles.map((r, idx) => (
              <div key={idx} className="role-item-pill">
                <span>{r.roleName}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveRole(idx)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-submit-row">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/my-projects')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Project & Team...' : 'Create Project & Form Team'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>
      </form>

      <style>{`
        .create-project-page {
          max-width: 860px;
          margin: 0 auto;
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

        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          font-size: 13px;
          font-weight: 600;
        }

        .project-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-card {
          padding: 28px;
        }

        .card-section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .card-section-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 18px;
        }

        .label-with-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-analyze-btn {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .field-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .ai-suggestions-box {
          background-color: var(--burgundy-50);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-bottom: 20px;
        }

        .ai-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ai-box-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .ai-suggestions-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12.5px;
        }

        .suggest-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .suggest-chip {
          padding: 2px 8px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .skills-builder-row, .roles-builder-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .importance-select {
          max-width: 170px;
        }

        .current-skills-list, .current-roles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-item-pill, .role-item-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 12px;
        }

        .skill-item-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .skill-item-weight {
          font-size: 10.5px;
          color: var(--accent-primary);
          background-color: var(--bg-card);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        .remove-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .remove-btn:hover {
          color: var(--accent-primary);
        }

        .form-submit-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .form-grid-3 {
            grid-template-columns: 1fr;
          }
          .skills-builder-row {
            flex-direction: column;
          }
          .importance-select {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
