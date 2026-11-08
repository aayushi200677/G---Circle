import * as taskService from './taskService.js';
import { createTaskSchema, updateTaskSchema } from '../../validators/taskValidator.js';
import { sendSuccess } from '../../utils/response.js';

export const getTeamTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTeamTasks(req.params.teamId, req.user.id);
    return sendSuccess(res, tasks, 'Team tasks fetched.');
  } catch (error) {
    next(error);
  }
};

export const createTeamTask = async (req, res, next) => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(req.params.teamId, req.user.id, validated);
    return sendSuccess(res, task, 'Task created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const validated = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.params.id, req.user.id, validated);
    return sendSuccess(res, task, 'Task updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user.id);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getMyTasks(req.user.id, req.query);
    return sendSuccess(res, tasks, 'My tasks fetched.');
  } catch (error) {
    next(error);
  }
};
