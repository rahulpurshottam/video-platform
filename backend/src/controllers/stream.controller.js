import fs from 'fs';
import path from 'path';
import Video from '../models/Video.model.js';

export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoPath = video.path;
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      return res.status(416).send("Range header required");
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(videoPath, { start, end });
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': video.mimeType || 'video/mp4',
    });

    file.pipe(res);
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default { streamVideo };
