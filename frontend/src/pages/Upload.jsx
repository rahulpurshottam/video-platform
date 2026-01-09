import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setUploadSuccess(false);
        setDialogMessage('Please select a valid video file');
        setShowDialog(true);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadSuccess(false);
      setDialogMessage('Please select a file');
      setShowDialog(true);
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);

    try {
      await videoAPI.upload(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setUploadSuccess(true);
      setDialogMessage('Video uploaded successfully! Processing will begin shortly.');
      setShowDialog(true);
      
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      setUploadSuccess(false);
      setDialogMessage(err.response?.data?.error || 'Failed to upload video');
      setShowDialog(true);
    } finally {
      setUploading(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    if (uploadSuccess) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold libertinus-serif-bold">UPLOAD VIDEO</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Select Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Note:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Supported formats: MP4, AVI, MOV, MKV, WebM</li>
              <li>• Maximum file size: 500MB</li>
              <li>• Video will be automatically processed for sensitive content</li>
              <li>• Processing progress will be shown in the dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-2">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {uploadSuccess ? (
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
              <p className="text-gray-700 mb-6">{dialogMessage}</p>
              <button
                onClick={closeDialog}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  uploadSuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {uploadSuccess ? 'Go to Dashboard' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
