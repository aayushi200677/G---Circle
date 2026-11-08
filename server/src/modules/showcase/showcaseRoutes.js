import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as showcaseController from './showcaseController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../../uploads/videos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `showcase-${uniqueSuffix}${ext}`);
  },
});

// Multer file filter (MP4 and WebM only)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm'];
  const allowedExts = ['.mp4', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only MP4 and WebM videos are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

const router = Router();

// Public / general showcase browsing
router.get('/', requireAuth, showcaseController.getPublicShowcase);

// User's own showcase videos
router.get('/me', requireAuth, showcaseController.getMyVideos);

// Specific student's showcase videos (respects PUBLIC / TEAM_ONLY / PRIVATE)
router.get('/user/:userId', requireAuth, showcaseController.getUserVideos);

// Video streaming with range header and access control
router.get('/stream/:id', requireAuth, showcaseController.streamVideo);

// Upload showcase video (multipart/form-data with field 'video')
router.post(
  '/upload',
  requireAuth,
  (req, res, next) => {
    upload.single('video')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds limit. Maximum video size is 50 MB.',
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  showcaseController.uploadVideo
);

// Update metadata
router.put('/:id', requireAuth, showcaseController.updateVideo);

// Delete video
router.delete('/:id', requireAuth, showcaseController.deleteVideo);

export default router;
