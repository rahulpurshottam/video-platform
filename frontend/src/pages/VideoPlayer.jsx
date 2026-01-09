import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setVideoError('Failed to load video. Please try again.');
      });
      
      videoRef.current.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded successfully');
      });
    }
  }, [videoRef.current, video]);

  const fetchVideo = async () => {
    try {
      const response = await videoAPI.getOne(id);
      setVideo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  const streamUrl = `${videoAPI.getStreamUrl(id)}?token=${token}`;
  
  console.log('Stream URL:', streamUrl);
  console.log('Video data:', video);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold libertinus-serif-bold">VIDEO PLAYER</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {videoError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
              {videoError}
            </div>
          )}
          
          <video
            ref={videoRef}
            controls
            className="w-full"
            style={{ maxHeight: '70vh' }}
            preload="metadata"
            crossOrigin="anonymous"
          >
            <source src={streamUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{video.originalName}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-semibold">{video.status}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Size</p>
                <p className="font-semibold">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {video.metadata && (
                <div>
                  <p className="text-gray-600 text-sm">Resolution</p>
                  <p className="font-semibold">{video.metadata.width} x {video.metadata.height}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm">Uploaded</p>
                <p className="font-semibold">{new Date(video.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {video.flagReason && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-semibold">Content Warning:</p>
                <p>{video.flagReason}</p>
              </div>
            )}

            {video.metadata && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Technical Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Resolution: {video.metadata.width}x{video.metadata.height}</div>
                  <div>Codec: {video.metadata.codec}</div>
                  <div>Bitrate: {Math.round(video.metadata.bitrate / 1000)} kbps</div>
                  <div>FPS: {Math.round(video.metadata.fps)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
