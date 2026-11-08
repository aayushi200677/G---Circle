import * as teamService from './teamService.js';
import { sendSuccess } from '../../utils/response.js';

export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getMyTeams(req.user.id);
    return sendSuccess(res, teams, 'User teams fetched.');
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await teamService.getTeamWorkspace(req.params.id, req.user.id);
    return sendSuccess(res, workspace, 'Team workspace data retrieved.');
  } catch (error) {
    next(error);
  }
};

export const sendJoinRequest = async (req, res, next) => {
  try {
    const request = await teamService.sendJoinRequest(req.user.id, req.params.projectId, req.body.message);
    return sendSuccess(res, request, 'Join request sent successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const getRequestsInbox = async (req, res, next) => {
  try {
    const requests = await teamService.getRequestsInbox(req.user.id);
    return sendSuccess(res, requests, 'Requests inbox fetched.');
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const result = await teamService.acceptRequest(req.user.id, req.params.id);
    return sendSuccess(res, result, 'Join request accepted. Student added to team.');
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const result = await teamService.rejectRequest(req.user.id, req.params.id);
    return sendSuccess(res, result, 'Join request rejected.');
  } catch (error) {
    next(error);
  }
};
