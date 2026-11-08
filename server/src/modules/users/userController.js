import * as userService from './userService.js';
import * as skillService from '../skills/skillService.js';
import prisma from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';

export const getMe = async (req, res, next) => {
  try {
    const profile = await userService.getCurrentUserProfile(req.user.id);
    return sendSuccess(res, profile, 'Profile fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await userService.getPublicProfile(req.params.id);
    return sendSuccess(res, profile, 'Student profile fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const searchStudents = async (req, res, next) => {
  try {
    const students = await userService.searchStudents(req.query);
    return sendSuccess(res, students, 'Students retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

// Skills
export const getSkillsCatalog = async (req, res, next) => {
  try {
    const skills = await skillService.getAllSkills();
    return sendSuccess(res, skills, 'Skills catalog retrieved.');
  } catch (error) {
    next(error);
  }
};

export const addMySkill = async (req, res, next) => {
  try {
    const userSkill = await skillService.addUserSkill(req.user.id, req.body);
    return sendSuccess(res, userSkill, 'Skill added to profile.', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMySkill = async (req, res, next) => {
  try {
    const updated = await skillService.updateUserSkill(req.user.id, req.params.id, req.body);
    return sendSuccess(res, updated, 'Skill proficiency updated.');
  } catch (error) {
    next(error);
  }
};

export const deleteMySkill = async (req, res, next) => {
  try {
    const result = await skillService.deleteUserSkill(req.user.id, req.params.id);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

// Preferences
export const getMyPreferences = async (req, res, next) => {
  try {
    let prefs = await prisma.userPreference.findUnique({
      where: { userId: req.user.id },
    });
    if (!prefs) {
      prefs = await prisma.userPreference.create({
        data: {
          userId: req.user.id,
          themeMode: 'light',
          themeIntensity: 'classic',
          collaborationStyle: 'Brainstorming together',
          availability: 'Flexible',
        },
      });
    }
    return sendSuccess(res, prefs, 'Preferences retrieved.');
  } catch (error) {
    next(error);
  }
};

export const updateMyPreferences = async (req, res, next) => {
  try {
    const { themeMode, themeIntensity, collaborationStyle, availability, communicationMethods } = req.body;
    const updated = await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      update: {
        themeMode: themeMode || undefined,
        themeIntensity: themeIntensity || undefined,
        collaborationStyle: collaborationStyle || undefined,
        availability: availability || undefined,
        communicationMethods: communicationMethods || undefined,
      },
      create: {
        userId: req.user.id,
        themeMode: themeMode || 'light',
        themeIntensity: themeIntensity || 'classic',
        collaborationStyle: collaborationStyle || 'Brainstorming together',
        availability: availability || 'Flexible',
        communicationMethods: communicationMethods || ['Voice discussions', 'Text-based communication'],
      },
    });
    return sendSuccess(res, updated, 'Preferences updated successfully.');
  } catch (error) {
    next(error);
  }
};
