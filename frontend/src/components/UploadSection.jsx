import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Film, CheckCircle, AlertCircle, Eye, Zap, Layers } from 'lucide-react';

const UploadSection = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="content-section">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">Transform 2D Videos into VR 180</h1>
        <p className="hero-subtitle">
          Upload your 2D video and watch it come to life as an immersive VR 180 experience. 
          Our AI-powered platform creates depth maps and stereoscopic views without any external APIs.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="features-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="feature-card">
          <div className="feature-icon">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="feature-title">Depth Estimation</h3>
          <p className="feature-description">
            Advanced algorithms analyze your 2D video to create accurate depth maps for realistic 3D conversion.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="feature-title">Stereoscopic Rendering</h3>
          <p className="feature-description">
            Generate left and right eye views with proper disparity for authentic VR 180 experiences.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="feature-title">No APIs Required</h3>
          <p className="feature-description">
            All processing happens locally using custom algorithms - no external dependencies or API keys needed.
          </p>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div 
          {...getRootProps()} 
          className={`upload-zone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          
          {!selectedFile ? (
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-16 h-16 text-white opacity-70 mx-auto mb-4" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Drop your video here' : 'Upload Your 2D Video'}
              </h3>
              
              <p className="text-white opacity-70 mb-4">
                Drag and drop your video file here, or click to browse
              </p>
              
              <div className="text-sm text-white opacity-60">
                <p>Supported formats: MP4, AVI, MOV, MKV, WebM</p>
                <p>Maximum size: 500MB</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              
              <h3 className="text-xl font-semibold text-white mb-2">File Selected</h3>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Film className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">{selectedFile.name}</span>
                </div>
                
                <div className="text-sm text-white opacity-70 space-y-1">
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  <p>Type: {selectedFile.type}</p>
                  <p>Last modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="btn-secondary"
                >
                  Choose Different File
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                  className="btn-primary"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="processing-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Start VR Conversion'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-white opacity-80">
              <p className="font-medium mb-2">Tips for best results:</p>
              <ul className="space-y-1 list-disc list-inside opacity-70">
                <li>Use videos with clear depth cues (foreground/background objects)</li>
                <li>Higher resolution videos (720p+) produce better VR experiences</li>
                <li>Avoid videos with rapid camera movements for smoother conversion</li>
                <li>Scenes with varied lighting help create more accurate depth maps</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadSection;
