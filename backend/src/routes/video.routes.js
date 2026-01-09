import express from 'express';
import { uploadVideo, getVideos, getVideo, deleteVideo } from '../controllers/video.controller.js';
import { streamVideo } from '../controllers/stream.controller.js';
import { auth, authorize } from '../middleware/auth.middleware.js';
import streamAuth from '../middleware/streamAuth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/upload', auth, authorize('editor', 'admin'), upload.single('video'), uploadVideo);

router.get('/', auth, getVideos);

router.get('/:id', auth, getVideo);

router.get('/:id/stream', streamAuth, streamVideo);

router.delete('/:id', auth, authorize('editor', 'admin'), deleteVideo);

export default router;
