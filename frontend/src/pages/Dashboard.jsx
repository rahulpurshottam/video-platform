import { useState, useEffect } from 'react';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const { user, logout, isEditor } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await videoAPI.getAll(params);
      setVideos(response.data.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  useEffect(() => {
    if (!socket) return;

    socket.on('video:uploaded', () => {
      fetchVideos();
    });

    socket.on('video:processing', (data) => {
      setVideos(prev => prev.map(video => 
        video._id === data.videoId 
          ? { ...video, status: data.status, progress: data.progress }
          : video
      ));
    });

    socket.on('video:complete', (data) => {
      setVideos(prev => prev.map(video => 
        video._id === data.videoId 
          ? { ...video, status: data.status, progress: 100, flagReason: data.flagReason }
          : video
      ));
    });

    return () => {
      socket.off('video:uploaded');
      socket.off('video:processing');
      socket.off('video:complete');
    };
  }, [socket]);

  const confirmDelete = (video) => {
    setVideoToDelete(video);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    
    try {
      await videoAPI.delete(videoToDelete._id);
      setVideos(videos.filter(v => v._id !== videoToDelete._id));
      setDeleteSuccess(true);
      setResultMessage('Video deleted successfully!');
      setShowResultDialog(true);
    } catch (error) {
      console.error('Failed to delete video:', error);
      setDeleteSuccess(false);
      setResultMessage(error.response?.data?.error || 'Failed to delete video');
      setShowResultDialog(true);
    } finally {
      setVideoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setVideoToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold libertinus-serif-bold">VIDEO PLATFORM</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.name} ({user?.role})
            </span>
            {isEditor && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Upload Video
              </button>
            )}
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            ALL VIDEOS
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-4 py-2 rounded ${filter === 'safe' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            SAFE
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded ${filter === 'flagged' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            FLAGGED
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No videos found. {isEditor && 'Upload your first video!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{video.originalName}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                      {video.status === 'processing' && (
                        <span className="text-sm text-gray-600">{video.progress}%</span>
                      )}
                    </div>
                    {video.status === 'processing' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${video.progress}%` }}
                        />
                      </div>
                    )}
                    {video.flagReason && (
                      <p className="text-sm text-red-600">{video.flagReason}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {(video.status === 'safe' || video.status === 'flagged') ? (
                      <button
                        onClick={() => navigate(`/player/${video._id}`)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        Watch
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-600 px-3 py-2 rounded text-sm cursor-not-allowed"
                      >
                        Processing...
                      </button>
                    )}
                    {isEditor && (
                      <button
                        onClick={() => confirmDelete(video)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteDialog && videoToDelete && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-2">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                  <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Video?</h3>
              </div>
              <p className="text-gray-700 mb-2">Are you sure you want to delete this video?</p>
              <p className="text-sm font-semibold text-gray-900 mb-6">"{videoToDelete.originalName}"</p>
            
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResultDialog && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-2">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {deleteSuccess ? (
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Success!</h3>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Error!</h3>
                </div>
              )}
              <p className="text-gray-700 mb-6">{resultMessage}</p>
              <button
                onClick={() => setShowResultDialog(false)}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  deleteSuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
