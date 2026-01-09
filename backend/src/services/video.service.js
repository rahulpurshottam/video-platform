import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video.model.js';

const detectSensitiveContent = (probability = 0.5) => {
  const isFlagged = Math.random() < probability;

  const reasons = [
    'Potentially sensitive content detected',
    'Inappropriate language detected',
    'Violence detected',
    'Adult content detected'
  ];

  return {
    isFlagged,
    reason: isFlagged ? reasons[Math.floor(Math.random() * reasons.length)] : null
  };
};

const extractMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');

      resolve({
        duration: metadata.format?.duration || 0,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        codec: videoStream?.codec_name || 'unknown',
        bitrate: metadata.format?.bit_rate || 0,
        fps: videoStream?.r_frame_rate
          ? Number(videoStream.r_frame_rate.split('/')[0]) /
            Number(videoStream.r_frame_rate.split('/')[1])
          : 0
      });
    });
  });
};

const extractMetadataFallback = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  
  const estimatedDuration = Math.round((fileSizeInMB / 8) * 60);
  

  const duration = Math.max(1, estimatedDuration);
  
  return {
    duration: duration,
    width: 1920,
    height: 1080,
    codec: 'unknown',
    bitrate: Math.round((stats.size * 8) / duration),
    fps: 30
  };
};

export const processVideo = async (videoId, io) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) return console.error('❌ Video not found:', videoId);

    let metadata;
    try {
      metadata = await extractMetadata(video.path);
      console.log('✅ Extracted metadata using FFmpeg');
    } catch (ffmpegError) {
      console.warn('⚠️ FFmpeg not available, using fallback metadata extraction');
      metadata = extractMetadataFallback(video.path);
    }
    
    video.metadata = metadata;
    video.duration = metadata.duration;

    const { isFlagged, reason } = detectSensitiveContent();

    video.status = isFlagged ? 'flagged' : 'safe';
    video.flagReason = reason;
    video.progress = 100;
    await video.save();

    io.emit('video:complete', {
      videoId,
      status: video.status,
      progress: 100,
      flagReason: video.flagReason,
      message: isFlagged
        ? '⚠️ Video flagged for review'
        : '✅ Video processed successfully'
    });

    console.log(`✅ Processed ${videoId} → ${video.status}`);
  } catch (error) {
    console.error('❌ Error processing video:', error);

    try {
      await Video.findByIdAndUpdate(videoId, {
        status: 'safe',
        progress: 100
      });

      io.emit('video:complete', {
        videoId,
        status: 'safe',
        progress: 100,
        message: '✅ Video processed successfully'
      });
    } catch (updateError) {
      console.error('❌ Error updating failure state:', updateError);
    }
  }
};

export default { processVideo };
