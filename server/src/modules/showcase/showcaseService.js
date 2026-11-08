import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads/videos');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const SHOWCASE_CATEGORIES = [
  'Self Introduction',
  'Public Speaking',
  'Presentation Skills',
  'Technical Explanation',
  'Group Discussion',
  'Project Demonstration',
  'Leadership & Team Coordination',
  'Creative Talent',
  'Problem Solving',
  'Language Skills',
];

export const DURATION_LIMITS = {
  'Self Introduction': 90,
  'Public Speaking': 120,
  'Presentation Skills': 120,
  'Technical Explanation': 120,
  'Group Discussion': 120,
  'Project Demonstration': 300,
  'Leadership & Team Coordination': 120,
  'Creative Talent': 180,
  'Problem Solving': 120,
  'Language Skills': 120,
};

/**
 * Check whether two students share at least one team.
 */
async function doStudentsShareTeam(userIdA, userIdB) {
  if (userIdA === userIdB) return true;

  const teamsA = await prisma.teamMember.findMany({
    where: { userId: userIdA },
    select: { teamId: true },
  });
  const teamIdsA = new Set(teamsA.map((t) => t.teamId));

  const teamsB = await prisma.teamMember.findMany({
    where: { userId: userIdB },
    select: { teamId: true },
  });

  return teamsB.some((t) => teamIdsA.has(t.teamId));
}

export const uploadVideo = async (userId, file, data) => {
  if (!file) {
    const error = new Error('No video file provided.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Max 6 videos per student rule
  const count = await prisma.showcaseVideo.count({ where: { userId } });
  if (count >= 6) {
    // Clean up uploaded file
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
    const error = new Error('Maximum limit reached: You can upload up to 6 showcase videos.');
    error.statusCode = 400;
    throw error;
  }

  const { title, category, description, duration, visibility, skillTags, thumbnailUrl } = data;

  if (!title || title.trim().length < 3) {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
    const error = new Error('Video title must be at least 3 characters.');
    error.statusCode = 400;
    throw error;
  }

  const validCategory = SHOWCASE_CATEGORIES.includes(category) ? category : 'Self Introduction';
  const validVisibility = ['PUBLIC', 'TEAM_ONLY', 'PRIVATE'].includes(visibility) ? visibility : 'PUBLIC';
  const durationSec = parseInt(duration || '60', 10);

  // Parse skillTags
  let tags = [];
  if (Array.isArray(skillTags)) {
    tags = skillTags;
  } else if (typeof skillTags === 'string') {
    tags = skillTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const video = await prisma.showcaseVideo.create({
    data: {
      userId,
      title: title.trim(),
      category: validCategory,
      description: description ? description.trim() : null,
      storageKey: file.filename,
      videoUrl: `/api/showcase/stream/placeholder`, // updated below with actual ID
      thumbnailUrl: thumbnailUrl || null,
      duration: durationSec,
      skillTags: tags,
      visibility: validVisibility,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, academicYear: true, course: true },
      },
    },
  });

  // Update actual videoUrl with video ID
  const updated = await prisma.showcaseVideo.update({
    where: { id: video.id },
    data: { videoUrl: `/api/showcase/stream/${video.id}` },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, academicYear: true, course: true },
      },
    },
  });

  return updated;
};

export const getMyVideos = async (userId) => {
  return await prisma.showcaseVideo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserVideos = async (viewerUserId, targetUserId) => {
  const isOwner = viewerUserId === targetUserId;
  const isTeammate = isOwner ? true : await doStudentsShareTeam(viewerUserId, targetUserId);

  const where = { userId: targetUserId };
  if (!isOwner) {
    if (isTeammate) {
      where.visibility = { in: ['PUBLIC', 'TEAM_ONLY'] };
    } else {
      where.visibility = 'PUBLIC';
    }
  }

  return await prisma.showcaseVideo.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, avatar: true, academicYear: true, course: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPublicShowcase = async (viewerUserId, filters = {}) => {
  const { category, search, skillTag } = filters;
  const where = { visibility: 'PUBLIC' };

  if (category && category !== 'All') {
    where.category = category;
  }

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
      { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
    ];
  }

  if (skillTag && skillTag !== 'All') {
    where.skillTags = { has: skillTag };
  }

  return await prisma.showcaseVideo.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          academicYear: true,
          course: true,
          studentId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
};

export const updateVideo = async (userId, videoId, data) => {
  const video = await prisma.showcaseVideo.findUnique({ where: { id: videoId } });
  if (!video) {
    const error = new Error('Video not found.');
    error.statusCode = 404;
    throw error;
  }

  if (video.userId !== userId) {
    const error = new Error('Unauthorized. You can only update your own videos.');
    error.statusCode = 403;
    throw error;
  }

  const { title, category, description, visibility, skillTags } = data;
  const updateData = {};

  if (title) updateData.title = title.trim();
  if (category && SHOWCASE_CATEGORIES.includes(category)) updateData.category = category;
  if (description !== undefined) updateData.description = description;
  if (visibility && ['PUBLIC', 'TEAM_ONLY', 'PRIVATE'].includes(visibility)) {
    updateData.visibility = visibility;
  }
  if (skillTags) {
    updateData.skillTags = Array.isArray(skillTags)
      ? skillTags
      : skillTags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  return await prisma.showcaseVideo.update({
    where: { id: videoId },
    data: updateData,
  });
};

export const deleteVideo = async (userId, videoId) => {
  const video = await prisma.showcaseVideo.findUnique({ where: { id: videoId } });
  if (!video) {
    const error = new Error('Video not found.');
    error.statusCode = 404;
    throw error;
  }

  if (video.userId !== userId) {
    const error = new Error('Unauthorized. You can only delete your own videos.');
    error.statusCode = 403;
    throw error;
  }

  // Delete file from disk if present
  const filePath = path.join(UPLOADS_DIR, video.storageKey);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {}

  await prisma.showcaseVideo.delete({ where: { id: videoId } });
  return { message: 'Showcase video deleted successfully.' };
};

export const getStreamFile = async (viewerUserId, videoId) => {
  const video = await prisma.showcaseVideo.findUnique({
    where: { id: videoId },
  });

  if (!video) {
    const error = new Error('Video not found.');
    error.statusCode = 404;
    throw error;
  }

  // Privacy check
  if (video.visibility === 'PRIVATE' && video.userId !== viewerUserId) {
    const error = new Error('This video is private to the owner.');
    error.statusCode = 403;
    throw error;
  }

  if (video.visibility === 'TEAM_ONLY' && video.userId !== viewerUserId) {
    const isTeammate = await doStudentsShareTeam(viewerUserId, video.userId);
    if (!isTeammate) {
      const error = new Error('This video is only accessible to team members.');
      error.statusCode = 403;
      throw error;
    }
  }

  const filePath = path.join(UPLOADS_DIR, video.storageKey);
  if (!fs.existsSync(filePath)) {
    const error = new Error('Video media file not found on disk.');
    error.statusCode = 404;
    throw error;
  }

  return { filePath, video };
};
