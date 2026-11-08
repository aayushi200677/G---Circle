import fs from 'fs';
import path from 'path';
import * as showcaseService from './showcaseService.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const uploadVideo = async (req, res, next) => {
  try {
    const video = await showcaseService.uploadVideo(req.user.id, req.file, req.body);
    return sendSuccess(res, video, 'Showcase video uploaded successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyVideos = async (req, res, next) => {
  try {
    const videos = await showcaseService.getMyVideos(req.user.id);
    return sendSuccess(res, videos, 'User showcase videos fetched.');
  } catch (error) {
    next(error);
  }
};

export const getUserVideos = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const videos = await showcaseService.getUserVideos(req.user.id, userId);
    return sendSuccess(res, videos, 'Showcase videos retrieved.');
  } catch (error) {
    next(error);
  }
};

export const getPublicShowcase = async (req, res, next) => {
  try {
    const { category, search, skillTag } = req.query;
    const videos = await showcaseService.getPublicShowcase(req.user.id, {
      category,
      search,
      skillTag,
    });
    return sendSuccess(res, videos, 'Public showcase videos fetched.');
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await showcaseService.updateVideo(req.user.id, id, req.body);
    return sendSuccess(res, updated, 'Showcase video updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await showcaseService.deleteVideo(req.user.id, id);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const streamVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filePath, video } = await showcaseService.getStreamFile(req.user.id, id);

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.webm' ? 'video/webm' : 'video/mp4';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};
