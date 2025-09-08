# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

VR 180 Immersive Experience Platform - A full-stack application that converts 2D video clips into immersive VR 180 experiences using local processing (no external APIs). The platform uses advanced depth estimation and stereoscopic rendering to create VR content compatible with Oculus Quest, HTC Vive, and other VR headsets.

## Architecture

This is a **simplified two-service architecture** (originally designed as three services but evolved to use Express.js for all processing):

- **React Frontend** (Port 3000) - Modern React UI with Vite, Framer Motion animations, and real-time progress tracking
- **Express.js Backend** (Port 5000) - API gateway, file handling, FFmpeg video processing, and VR 180 conversion

### Key Technologies
- **Frontend**: React 18, Vite, Framer Motion, Socket.IO client, Axios, React Dropzone
- **Backend**: Express.js, Socket.IO, FFmpeg (fluent-ffmpeg), Multer, Jimp for image processing
- **Video Processing**: FFmpeg with custom stereoscopic rendering algorithms
- **Deployment**: Docker, Vercel, Render.com support

## Common Development Commands

### Installation
```bash
# Install all dependencies (root, backend, frontend)
npm run install-all

# Or use the Windows batch file
install_all.bat
```

### Development
```bash
# Start both services in development mode
npm run dev

# Or start individually
npm run server    # Backend only (port 5000)
npm run client    # Frontend only (port 3000)

# Windows batch files
start_all_services.bat  # Start both services
```

### Building and Production
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Testing and Debugging
```bash
# Test all services are running
python test_system.py

# Lint frontend code
cd frontend && npm run lint

# Preview built frontend
cd frontend && npm run preview
```

## Development Workflow

### Video Processing Pipeline
1. User uploads 2D video via React frontend
2. Express backend receives and validates video file
3. Backend extracts frames using FFmpeg
4. Jimp processes each frame to generate depth maps
5. Custom algorithm creates stereoscopic frames (left/right eye views)
6. FFmpeg reassembles frames into VR 180 format video
7. Real-time progress updates via Socket.IO
8. User can preview and download converted VR content

### File Upload Constraints
- Maximum file size: 500MB
- Supported formats: MP4, AVI, MOV, MKV, WebM
- Processing directories: `/tmp/uploads`, `/tmp/output`, `/tmp/temp` (for serverless compatibility)

### Socket.IO Real-time Updates
The system uses Socket.IO for real-time communication between frontend and backend during video processing. Progress updates include:
- Frame extraction progress
- Individual frame processing status
- Overall conversion progress
- Error handling and status messages

## Project Structure Understanding

### Backend Processing (`backend/server.js`)
- **VR180Processor Class**: Core video processing logic
- **generateDepthMap()**: Converts 2D images to depth maps using brightness-based algorithm
- **createStereoscopicFrame()**: Creates left/right eye views with calculated disparity
- **extractFrames()**: Uses FFmpeg to extract video frames at 24fps
- **processFrames()**: Iterates through frames to create VR 180 content

### Frontend Architecture (`frontend/src/`)
- **App.jsx**: Main application with step-based UI (upload → processing → preview)
- **Components**: Modular React components for each processing step
- **Socket.IO Integration**: Real-time progress tracking and status updates
- **Framer Motion**: Smooth transitions between processing steps

### Deployment Configurations
- **Docker**: Multi-stage build with FFmpeg installation
- **Vercel**: Serverless deployment with static frontend and Node.js backend
- **Render**: Container-based deployment with persistent storage

## Development Notes

### Local Development
- Frontend runs on port 3000 with Vite dev server
- Backend runs on port 5000 with Express.js
- Vite proxy configuration handles API requests from frontend to backend
- Socket.IO connections require CORS configuration for cross-origin communication

### Video Processing Considerations
- Processing time varies based on video length and resolution
- Memory usage can be significant for large videos
- FFmpeg operations are CPU-intensive
- Temporary files are cleaned up automatically after processing

### Error Handling
- Comprehensive error handling for file uploads, processing failures, and network issues
- Socket.IO error events propagate to frontend for user feedback
- Processing timeouts prevent hanging operations
- File validation prevents unsupported formats

### Performance Optimization
- Frame processing uses efficient iteration patterns
- Jimp image operations are optimized for batch processing
- FFmpeg parameters tuned for quality vs. speed balance
- Real-time progress prevents UI blocking during long operations

## API Endpoints

### Backend REST API (Port 5000)
- `GET /health` - Service health check
- `POST /api/upload` - Upload video for VR conversion (multipart/form-data)
- `GET /api/status/:jobId` - Get processing status and progress
- `GET /api/download/:jobId` - Download completed VR 180 video
- `GET /api/preview/:jobId` - Stream video with range request support

### Socket.IO Events
- `processingUpdate` - Real-time status updates with progress percentage
- Connection handling for multiple clients
- Automatic cleanup on disconnect

## Component Architecture

### Frontend Components (`frontend/src/components/`)
- **UploadSection.jsx**: Drag-and-drop file upload with validation
  - React Dropzone integration (500MB max, video formats only)
  - File size formatting and metadata display
  - Feature showcase with animated icons
  - Upload progress handling

- **ProcessingSection.jsx**: Real-time conversion progress
  - Circular progress bar with animated updates
  - 5-stage processing pipeline visualization
  - Dynamic step highlighting based on progress percentage
  - Error state handling with user feedback

- **PreviewSection.jsx**: VR 180 video preview and download
  - Video streaming with range request support
  - VR-optimized video controls
  - Download functionality for completed conversions

- **Header.jsx** & **Footer.jsx**: Application shell components

### Processing Pipeline Stages
1. **Analyzing Video** (0-20%): Frame extraction and metadata analysis
2. **Generating Depth Maps** (20-50%): Brightness-based depth estimation
3. **Creating Stereoscopic Views** (50-70%): Left/right eye view generation with disparity calculation
4. **Rendering VR 180** (70-90%): Frame-by-frame stereoscopic processing
5. **Finalizing** (90-100%): Video assembly with audio sync and optimization

## Video Processing Details

### VR180Processor Class Methods
- `generateDepthMap(image)`: Creates depth maps from brightness analysis
- `createStereoscopicFrame(leftImage, depthMap)`: Generates right-eye view with 12px max disparity
- `extractFrames()`: FFmpeg frame extraction at 24fps with quality settings
- `processFrames(framesDir)`: Batch processing of all video frames
- `createVR180Video(vr180FramesDir)`: Final video assembly with H.264 encoding

### FFmpeg Configuration
- **Video Codec**: libx264 with CRF 23 (balanced quality/size)
- **Audio Codec**: AAC for VR headset compatibility
- **Frame Rate**: 24fps for smooth VR playback
- **Pixel Format**: yuv420p for maximum compatibility
- **Optimization**: faststart flag for streaming playback

## Styling and UI Framework

### CSS Architecture (`frontend/src/App.css`)
- **Glass morphism design**: Backdrop blur effects with rgba transparency
- **Gradient backgrounds**: Linear gradients for modern visual appeal
- **Animated components**: Framer Motion integration for smooth transitions
- **Responsive grid**: Auto-fit grid layouts for various screen sizes
- **Processing animations**: Custom bounce animations for loading states

### Key UI Patterns
- **Step indicators**: Visual progress tracking with active/completed states
- **Feature cards**: Hover effects with transform animations
- **Processing dots**: 3-dot loading animation with staggered timing
- **VR preview container**: Specialized video container with custom controls

## Development Environment Setup

### Prerequisites
- Node.js 16+ (required for ES modules in frontend)
- FFmpeg system installation (bundled via ffmpeg-static)
- 8GB+ RAM recommended for video processing
- Windows development environment (batch files included)

### Port Configuration
- Frontend: 3000 (Vite dev server)
- Backend: 5000 (Express server)
- Proxy setup in `vite.config.js` handles API and Socket.IO routing

### File Upload Limits and Validation
- Maximum file size: 500MB (configurable in multer setup)
- Allowed formats: MP4, AVI, MOV, MKV, WebM
- MIME type validation: video/* with extension checking
- Automatic file cleanup after processing completion

## Deployment Configurations

### Docker Setup
- Alpine Linux base with Node.js 18 LTS
- FFmpeg installation via apk package manager
- Multi-stage build: dependencies → source copy → frontend build
- Persistent `/tmp` directory for serverless compatibility

### Vercel Configuration
- Serverless functions for backend API
- Static hosting for React frontend
- API route rewrites for seamless integration
- Build process: frontend build → backend serverless deployment

### Render.com Setup
- Container-based deployment with 1GB persistent storage
- Environment variables for production configuration
- Free tier compatible with resource optimizations
