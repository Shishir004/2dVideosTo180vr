# VR 180 Immersive Experience Platform

A platform that converts 2D video clips into fully immersive VR 180 experiences without using external APIs.

## Features

- **2D to VR 180 Conversion**: Advanced depth estimation and stereoscopic rendering
- **User-Friendly Interface**: Clean, intuitive React frontend
- **Real-time Progress Tracking**: Monitor conversion progress
- **VR Preview**: Preview your VR content before download
- **No External APIs**: All processing done locally

## Tech Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Express.js with video processing capabilities
- **Video Processing**: FFmpeg for video manipulation
- **Depth Estimation**: Custom algorithm for 2D to 3D conversion
- **Stereoscopic Rendering**: Custom VR 180 format generation

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Usage

1. Upload your 2D video clip
2. Wait for the AI processing to complete
3. Preview your VR 180 experience
4. Download the converted file for VR headset viewing

## Project Structure

```
├── frontend/          # React.js frontend
├── backend/           # Express.js backend
├── models/            # AI models for depth estimation
└── uploads/           # Temporary file storage
```

## VR 180 Format

The platform generates stereoscopic videos in VR 180 format, compatible with:
- Oculus Quest/Quest 2
- HTC Vive
- Google Cardboard
- Other VR headsets supporting 180° content
