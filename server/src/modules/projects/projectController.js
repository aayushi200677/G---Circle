import * as projectService from './projectService.js';
import { createProjectSchema, updateProjectSchema, analyzeProjectSchema } from '../../validators/projectValidator.js';
import { sendSuccess } from '../../utils/response.js';

export const analyzeDescription = async (req, res, next) => {
  try {
    const validated = analyzeProjectSchema.parse(req.body);
    const analysis = await projectService.analyzeProjectDescription(validated);
    return sendSuccess(res, analysis, 'Project analysis generated successfully.');
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(req.user.id, validated);
    return sendSuccess(res, project, 'Project and team created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.query, req.user?.id);
    return sendSuccess(res, projects, 'Projects fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user?.id);
    return sendSuccess(res, project, 'Project details fetched.');
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const validated = updateProjectSchema.parse(req.body);
    const updated = await projectService.updateProject(req.user.id, req.params.id, validated);
    return sendSuccess(res, updated, 'Project updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.user.id, req.params.id);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
