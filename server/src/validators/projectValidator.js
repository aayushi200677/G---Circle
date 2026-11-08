import { z } from 'zod';
import { PROJECT_TYPES, DIFFICULTY_LEVELS } from '../config/constants.js';

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, 'Project title must be at least 3 characters').max(150),
  description: z.string().trim().min(10, 'Project description must be at least 10 characters'),
  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: 'Please select a valid project type' }),
  }),
  requiredTeamSize: z.coerce.number().min(2, 'Team size must be at least 2').max(10, 'Team size cannot exceed 10'),
  difficulty: z.enum(DIFFICULTY_LEVELS, {
    errorMap: () => ({ message: 'Please select a valid difficulty level' }),
  }),
  deadline: z.string().optional().nullable(),
  requiredSkills: z
    .array(
      z.object({
        skillId: z.string().optional(),
        name: z.string().min(1),
        importance: z.coerce.number().min(1).max(5).default(3),
      })
    )
    .min(1, 'Please add at least one required skill'),
  roles: z
    .array(
      z.object({
        roleName: z.string().min(1),
        openCount: z.coerce.number().min(1).default(1),
      })
    )
    .optional()
    .default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const analyzeProjectSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().min(10, 'Please provide at least a short description to analyze'),
});

export const llmExtractionSchema = z.object({
  project_type: z.enum(PROJECT_TYPES).default('Hackathon'),
  required_skills: z
    .array(
      z.object({
        skill: z.string(),
        importance: z.number().min(1).max(5).default(3),
      })
    )
    .default([]),
  roles: z.array(z.string()).default([]),
  team_size: z.number().min(2).max(10).default(4),
  difficulty: z.enum(DIFFICULTY_LEVELS).default('Intermediate'),
  missing_skills: z.array(z.string()).default([]),
});
