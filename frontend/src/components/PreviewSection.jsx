import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Smartphone,
  Monitor,
  Headphones,
  Share2,
  CheckCircle,
  Star
} from 'lucide-react';

const PreviewSection = ({ jobId, originalFile, onStartOver, apiUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('vr180'); // vr180, side-by-side, anaglyph
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${apiUrl}/api/download/${jobId}`;
    link.download = `vr180-${originalFile?.name || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const vrHeadsets = [
    { name: 'Oculus Quest', icon: <Eye className="w-6 h-6" /> },
    { name: 'HTC Vive', icon: <Headphones className="w-6 h-6" /> },
    { name: 'Google Cardboard', icon: <Smartphone className="w-6 h-6" /> },
    { name: 'Desktop VR', icon: <Monitor className="w-6 h-6" /> }
  ];

  return (
    <div className="content-section">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <h2 className="text-3xl font-bold text-white">
            VR 180 Conversion Complete!
          </h2>
        </div>
        <p className="text-lg text-white opacity-80">
          Your immersive VR 180 experience is ready. Preview it below or download for your VR headset.
        </p>
      </motion.div>

      {/* Video Preview */}
      <motion.div 
        className="vr-preview-container mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={`${apiUrl}/api/preview/${jobId}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="vr-controls">
          <button 
            className="vr-control-btn"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <select 
            className="vr-control-btn"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="vr180">VR 180</option>
            <option value="side-by-side">Side by Side</option>
            <option value="anaglyph">3D Anaglyph</option>
          </select>
        </div>
      </motion.div>

      {/* Download Section */}
      <motion.div 
        className="download-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download VR 180 Video
          </button>
          
          <button
            onClick={onStartOver}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Convert Another Video
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreviewSection;
