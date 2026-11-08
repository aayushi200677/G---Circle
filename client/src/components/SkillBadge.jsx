import React from 'react';

const PROFICIENCY_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
};

export default function SkillBadge({ name, proficiency, importance, isMissing = false, isCovered = false }) {
  // Extract display string safely
  let displayName = '';
  if (typeof name === 'string') {
    displayName = name;
  } else if (name && typeof name === 'object') {
    displayName = name.name || name.skill?.name || name.title || '';
  }

  const getBadgeClass = () => {
    if (isMissing) return 'skill-badge badge-missing';
    if (isCovered) return 'skill-badge badge-covered';
    if (proficiency >= 3) return 'skill-badge badge-high';
    return 'skill-badge';
  };

  return (
    <span className={getBadgeClass()} title={proficiency ? `Level: ${PROFICIENCY_LABELS[proficiency] || proficiency}` : ''}>
      <span className="skill-name">{displayName}</span>
      {proficiency && (
        <span className="skill-level" title={PROFICIENCY_LABELS[proficiency]}>
          {proficiency === 4 && '★ Expert'}
          {proficiency === 3 && '◆ Adv'}
          {proficiency === 2 && '● Mid'}
          {proficiency === 1 && '○ Beg'}
        </span>
      )}
      {importance && (
        <span className="skill-importance" title={`Priority: ${importance}/5`}>
          w:{importance}
        </span>
      )}

      <style>{`
        .skill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          font-size: 11.5px;
          font-weight: 500;
          background-color: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          white-space: nowrap;
        }

        .skill-level {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-primary);
          opacity: 0.85;
        }

        .skill-importance {
          font-size: 9.5px;
          font-weight: 700;
          color: var(--text-muted);
          background-color: var(--bg-card);
          padding: 1px 4px;
          border-radius: 4px;
        }

        .badge-high {
          background-color: var(--burgundy-50);
          border-color: var(--border-strong);
        }

        .badge-missing {
          background-color: var(--burgundy-100);
          color: var(--burgundy-900);
          border-color: var(--burgundy-700);
          font-weight: 600;
        }

        .badge-covered {
          background-color: var(--beige-400);
          color: var(--burgundy-900);
          border-color: var(--beige-600);
        }
      `}</style>
    </span>
  );
}
