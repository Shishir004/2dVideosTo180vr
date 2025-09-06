# VR 180 Platform Setup Instructions

## System Architecture

This platform is split into 3 services:
1. **Python Service** (Port 5001) - MiDaS depth estimation + video processing
2. **Express Backend** (Port 5000) - API gateway + file handling
3. **React Frontend** (Port 3000) - User interface

## Prerequisites

### Python Requirements
- Python 3.8 or higher
- pip package manager
- CUDA-capable GPU (optional, for faster processing)

### Node.js Requirements
- Node.js 16 or higher
- npm package manager

## Installation Steps

### 1. Install Python Dependencies
```bash
cd python_service
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Running the Services

### Option 1: Start All Services at Once
```bash
start_all_services.bat
```

### Option 2: Start Services Individually

#### Start Python Service (Port 5001)
```bash
cd python_service
python app.py
```

#### Start Express Backend (Port 5000)
```bash
cd backend
npm start
```

#### Start React Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

## How It Works

### Video Processing Pipeline

1. **Upload**: User uploads 2D video via React frontend
2. **Forward**: Express backend forwards video to Python service
3. **Process**: Python service:
   - Extracts frames using OpenCV
   - Generates depth maps using MiDaS model
   - Creates stereoscopic frames (left/right eye views)
   - Renders VR 180 video using FFmpeg
4. **Download**: Express backend downloads processed video
5. **Serve**: User can preview and download VR 180 video

### Key Features

- **MiDaS Depth Estimation**: Uses Intel's MiDaS model for accurate depth maps
- **Real-time Progress**: WebSocket updates during processing
- **VR 180 Format**: Outputs side-by-side stereoscopic video
- **GPU Acceleration**: Automatically uses CUDA if available
- **Error Handling**: Comprehensive error handling and timeouts

## API Endpoints

### Express Backend (Port 5000)
- `GET /health` - Check service health
- `POST /api/upload` - Upload video for processing
- `GET /api/status/:jobId` - Check processing status
- `GET /api/download/:jobId` - Download processed video
- `GET /api/preview/:jobId` - Stream video preview

### Python Service (Port 5001)
- `GET /health` - Check service health
- `POST /process_video` - Process video to VR 180
- `GET /download/:filename` - Download processed file
- `GET /status/:filename` - Check file status

## Troubleshooting

### Python Service Issues
- Ensure Python 3.8+ is installed
- Install PyTorch with CUDA support for GPU acceleration
- Check that all dependencies are installed correctly

### Memory Issues
- Large videos may require significant RAM
- Consider reducing video resolution for testing
- Monitor GPU memory usage if using CUDA

### Network Issues
- Ensure all ports (3000, 5000, 5001) are available
- Check firewall settings
- Verify services are running on correct ports

## File Structure
```
project/
├── python_service/          # Python Flask service
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── start_python.bat    # Python service starter
├── backend/                # Express.js backend
│   ├── server.js          # Main server file
│   ├── package.json       # Node.js dependencies
│   └── uploads/           # Temporary upload directory
├── frontend/              # React frontend
│   ├── src/              # React source code
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
└── start_all_services.bat # Start all services
```

## Performance Notes

- First run will download MiDaS model (~400MB)
- Processing time depends on video length and resolution
- GPU acceleration significantly improves performance
- Recommended: 8GB+ RAM, CUDA-capable GPU
