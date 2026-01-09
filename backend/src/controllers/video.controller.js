import Video from '../models/Video.model.js';
import { processVideo } from '../services/video.service.js';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const video = await Video.create({
      userId: req.userId,
      tenantId: req.tenantId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded'
    });

    const io = req.app.get('io');
    io.emit('video:uploaded', {
      videoId: video._id,
      filename: video.originalName,
      userId: req.userId
    });

    processVideo(video._id, io).catch(err => {
      console.error('Error processing video:', err);
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { status, userId } = req.query;
    
    const query = { tenantId: req.tenantId };
    
    if (status) {
      query.status = status;
    }
    
    if (req.user.role !== 'admin') {
      query.userId = req.userId;
    } else if (userId) {
      query.userId = userId;
    }

    const videos = await Video.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    }).populate('userId', 'name email');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (req.user.role !== 'admin' && video.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (req.user.role !== 'admin' && video.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fs = await import('fs/promises');
    try {
      await fs.unlink(video.path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { uploadVideo, getVideos, getVideo, deleteVideo };
