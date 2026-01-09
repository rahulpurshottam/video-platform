import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  tenantId: {
    type: String,
    required: [true, 'Tenant ID is required'],
    index: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['uploaded', 'safe', 'flagged'],
    default: 'uploaded',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metadata: {
    width: Number,
    height: Number,
    codec: String,
    bitrate: Number,
    fps: Number
  },
  flagReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

videoSchema.index({ tenantId: 1, userId: 1 });
videoSchema.index({ tenantId: 1, status: 1 });

const Video = mongoose.model('Video', videoSchema);

export default Video;
