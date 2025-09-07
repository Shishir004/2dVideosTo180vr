import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Brain, 
  Eye, 
  Layers, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Film
} from 'lucide-react';

const ProcessingSection = ({ status, uploadedFile }) => {
  const progress = typeof status?.progress === 'number' ? status.progress : 0;

  // Icon based on current status
  const getStatusIcon = () => {
    if (!status) return <Loader className="w-6 h-6 animate-spin" />;

    switch (status.status) {
      case 'processing':
        return <Loader className="w-6 h-6 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Loader className="w-6 h-6 animate-spin" />;
    }
  };

  // Progress color based on status
  const getStatusColor = () => {
    if (!status) return '#667eea';

    switch (status.status) {
      case 'processing':
        return '#667eea';
      case 'completed':
        return '#28a745';
      case 'error':
        return '#dc3545';
      default:
        return '#667eea';
    }
  };

  // Pipeline steps
  const processingSteps = [
    {
      id: 'analyzing',
      title: 'Analyzing Video',
      description: 'Extracting frames and metadata',
      icon: <Video className="w-5 h-5" />,
      range: [0, 20]
    },
    {
      id: 'depth',
      title: 'Generating Depth Maps',
      description: 'AI-powered depth estimation',
      icon: <Brain className="w-5 h-5" />,
      range: [20, 50]
    },
    {
      id: 'stereo',
      title: 'Creating Stereoscopic Views',
      description: 'Rendering left and right eye perspectives',
      icon: <Eye className="w-5 h-5" />,
      range: [50, 70]
    },
    {
      id: 'rendering',
      title: 'Rendering VR 180',
      description: 'Combining into immersive format',
      icon: <Layers className="w-5 h-5" />,
      range: [70, 90]
    },
    {
      id: 'finalizing',
      title: 'Finalizing',
      description: 'Optimizing for VR playback',
      icon: <Film className="w-5 h-5" />,
      range: [90, 100]
    }
  ];

  // Determine current active step
  const getCurrentStep = () => {
    const stepIndex = processingSteps.findIndex(step => 
      progress >= step.range[0] && progress < step.range[1]
    );
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStep();

  return (
    <div className="content-section">
      {/* Title */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Converting to VR 180
        </h2>
        <p className="text-lg text-white opacity-80">
          Our AI is transforming your 2D video into an immersive VR experience
        </p>
      </motion.div>

      {/* File Info */}
      {uploadedFile && (
        <motion.div 
          className="card mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{uploadedFile.name}</h3>
              <p className="text-sm text-white opacity-70">
                {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • Processing started
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span
                className={`text-sm font-medium ${
                  status?.status === 'error'
                    ? 'text-red-400'
                    : status?.status === 'completed'
                    ? 'text-green-400'
                    : 'text-blue-400'
                }`}
              >
                {status?.status === 'processing'
                  ? 'Processing'
                  : status?.status === 'completed'
                  ? 'Completed'
                  : status?.status === 'error'
                  ? 'Error'
                  : 'Starting'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Circle */}
      <motion.div 
        className="flex justify-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-48 h-48">
          <CircularProgressbar
            value={progress}
            text={`${Math.round(progress)}%`}
            styles={buildStyles({
              textSize: '16px',
              pathColor: getStatusColor(),
              textColor: '#ffffff',
              trailColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
      </motion.div>

      {/* Current Status Message */}
      {status?.message && (
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg text-white font-medium">
            {status.message}
          </p>
        </motion.div>
      )}

      {/* Processing Steps */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Processing Pipeline
        </h3>

        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = progress >= step.range[1];

            return (
              <motion.div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30'
                    : isCompleted
                    ? 'bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30'
                    : 'bg-white bg-opacity-5 border border-white border-opacity-10'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-500'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-white bg-opacity-10'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    <div className="text-white opacity-50">{step.icon}</div>
                  )}
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      isActive || isCompleted ? 'text-white' : 'text-white opacity-70'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      isActive || isCompleted ? 'text-white opacity-80' : 'text-white opacity-50'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      isActive || isCompleted ? 'text-white' : 'text-white opacity-50'
                    }`}
                  >
                    {step.range[0]}% - {step.range[1]}%
                  </div>
                  {isActive && <div className="text-xs text-blue-300 mt-1">In Progress</div>}
                  {isCompleted && <div className="text-xs text-green-300 mt-1">Completed</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Processing Animation */}
      <motion.div 
        className="processing-animation mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="text-center">
          <div className="processing-dots mb-4">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p className="text-white opacity-70 text-sm">
            This may take a few minutes depending on video length and complexity
          </p>
        </div>
      </motion.div>

      {/* Error State */}
      {status?.status === 'error' && (
        <motion.div 
          className="card mt-8 border-red-500 border-opacity-50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">Processing Error</h3>
              <p className="text-sm opacity-80">{status.message}</p>
              <button 
                className="btn-primary mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProcessingSection;
