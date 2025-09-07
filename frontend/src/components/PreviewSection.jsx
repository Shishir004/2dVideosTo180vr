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

const PreviewSection = ({ jobId, originalFile, onStartOver }) => {
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

      {/* Success Stats */}
      <motion.div 
        className="grid grid-2 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">4K</div>
          <div className="text-white opacity-80">Output Resolution</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">180°</div>
          <div className="text-white opacity-80">Field of View</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">30fps</div>
          <div className="text-white opacity-80">Frame Rate</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">✓</div>
          <div className="text-white opacity-80">VR Optimized</div>
        </div>
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
          poster={`${apiUrl}/api/thumbnail`}
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
          
          <button className="vr-control-btn">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* VR Headset Compatibility */}
      <motion.div 
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          Compatible VR Headsets
        </h3>
        
        <div className="vr-headset-icons">
          {vrHeadsets.map((headset, index) => (
            <motion.div
              key={headset.name}
              className="headset-icon"
              title={headset.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {headset.icon}
            </motion.div>
          ))}
        </div>
        
        <p className="text-center text-white opacity-70 text-sm mt-4">
          Your VR 180 video is compatible with all major VR headsets and platforms
        </p>
      </motion.div>

      {/* Download Section */}
      <motion.div 
        className="download-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="download-info">
          <h3 className="text-xl font-semibold text-white mb-4">
            Ready for VR Experience
          </h3>
          
          <div className="grid grid-2 gap-4 mb-6 text-sm text-white opacity-80">
            <div>
              <strong>Original:</strong> {originalFile?.name}
            </div>
            <div>
              <strong>Format:</strong> VR 180 MP4
            </div>
            <div>
              <strong>Resolution:</strong> 3840x2160 (4K)
            </div>
            <div>
              <strong>Projection:</strong> Equirectangular
            </div>
          </div>
          
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
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div 
        className="card mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          How to View Your VR 180 Video
        </h3>
        
        <div className="space-y-4 text-white opacity-80">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <strong>Download the video</strong> to your device or transfer it to your VR headset's storage.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <strong>Open your VR media player</strong> (Oculus Gallery, SteamVR Media Player, etc.).
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <strong>Select "VR 180" or "Stereoscopic"</strong> viewing mode for the best experience.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <strong>Enjoy your immersive experience!</strong> Look around to explore the 180° field of view.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share Section */}
      <motion.div 
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <button className="btn-secondary flex items-center gap-2 mx-auto">
          <Share2 className="w-4 h-4" />
          Share Your Creation
        </button>
        <p className="text-white opacity-60 text-sm mt-2">
          Show others what you've created with our VR 180 platform
        </p>
      </motion.div>
    </div>
  );
};

export default PreviewSection;
