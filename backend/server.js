const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const Jimp = require('jimp');

// Set FFmpeg paths for reliable execution
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "https://2d-videos-to180vr.vercel.app",
      /^https:\/\/vr180-platform.*\.onrender\.com$/,
      /^https:\/\/.*\.render\.com$/
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Force production mode on Render
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
}

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001", 
    "https://2d-videos-to180vr.vercel.app",
    /^https:\/\/vr180-platform.*\.onrender\.com$/,
    /^https:\/\/.*\.render\.com$/
  ],
  credentials: true
}));
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Vercel serverless environment requires using the /tmp directory for writes
const uploadsDir = path.join('/tmp', 'uploads');
const outputDir = path.join('/tmp', 'output');
const tempDir = path.join('/tmp', 'temp');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);
fs.ensureDirSync(tempDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, AVI, MOV, etc.) are allowed.'));
    }
  }
});

// Socket.io connection handling
// Note: Socket.IO might have issues in a serverless environment without extra configuration.
// This setup will work for the initial deployment, but may need adjustment for scaling.
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// VR 180 Video Processor Class
class VR180Processor {
  constructor(jobId, inputPath, originalName, io) {
    this.jobId = jobId;
    this.inputPath = inputPath;
    this.originalName = originalName;
    this.io = io;
    this.statusFile = path.join(outputDir, `${jobId}-status.json`);
    this.tempJobDir = path.join(tempDir, jobId);
    fs.ensureDirSync(this.tempJobDir);
  }

  updateStatus(status, progress = 0, message = '') {
    const statusData = {
      jobId: this.jobId,
      status,
      progress,
      message,
      originalName: this.originalName,
      timestamp: new Date().toISOString()
    };
    fs.writeJsonSync(this.statusFile, statusData);
    this.io.emit('processingUpdate', statusData);
  }

  async generateDepthMap(image) {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const depthMap = new Jimp(width, height, 0x000000ff);
    
    image.scan(0, 0, width, height, (x, y, idx) => {
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      const brightness = (red + green + blue) / 3;
      const depth = Math.min(255, brightness);
      const depthColor = Jimp.rgbaToInt(depth, depth, depth, 255);
      depthMap.setPixelColor(depthColor, x, y);
    });
    
    return depthMap;
  }

  async createStereoscopicFrame(leftImage, depthMap) {
    const width = leftImage.bitmap.width;
    const height = leftImage.bitmap.height;
    const stereoImage = new Jimp(width * 2, height, 0x000000ff);
    
    stereoImage.composite(leftImage, 0, 0);
    const rightImage = leftImage.clone();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const depthValue = Jimp.intToRGBA(depthMap.getPixelColor(x, y)).r / 255;
        const disparity = Math.floor(depthValue * 12);
        const sourceX = Math.max(0, Math.min(width - 1, x - disparity));
        const sourceColor = leftImage.getPixelColor(sourceX, y);
        rightImage.setPixelColor(sourceColor, x, y);
      }
    }
    
    stereoImage.composite(rightImage, width, 0);
    return stereoImage;
  }

  async extractFrames() {
    return new Promise((resolve, reject) => {
      const framesDir = path.join(this.tempJobDir, 'frames');
      fs.ensureDirSync(framesDir);
      
      ffmpeg(this.inputPath)
        .outputOptions(['-vf', 'fps=24', '-q:v', '2'])
        .output(path.join(framesDir, 'frame-%05d.png'))
        .on('progress', (progress) => {
          const frameProgress = Math.min(30, progress.frames / 100);
          this.updateStatus('processing', frameProgress, 'Extracting video frames...');
        })
        .on('end', () => resolve(framesDir))
        .on('error', (err) => reject(new Error(`Frame extraction failed: ${err.message}`)))
        .run();
    });
  }

  async processFrames(framesDir) {
    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
    const vr180FramesDir = path.join(this.tempJobDir, 'vr180_frames');
    fs.ensureDirSync(vr180FramesDir);
    
    for (let i = 0; i < frameFiles.length; i++) {
      const frameFile = frameFiles[i];
      const framePath = path.join(framesDir, frameFile);
      const vr180FramePath = path.join(vr180FramesDir, frameFile);
      
      const image = await Jimp.read(framePath);
      const depthMap = await this.generateDepthMap(image);
      const stereoImage = await this.createStereoscopicFrame(image, depthMap);
      await stereoImage.writeAsync(vr180FramePath);
      
      const progress = 30 + ((i + 1) / frameFiles.length) * 60;
      this.updateStatus('processing', progress, `Processing frame ${i + 1}/${frameFiles.length}...`);
    }
    
    return vr180FramesDir;
  }

  async createVR180Video(vr180FramesDir) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(outputDir, `${this.jobId}-vr180.mp4`);
      
      ffmpeg()
        .input(path.join(vr180FramesDir, 'frame-%05d.png'))
        .inputOptions(['-framerate', '24'])
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart'
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          const finalProgress = 90 + (progress.percent * 0.1);
          this.updateStatus('processing', Math.min(99, finalProgress), 'Finalizing VR 180 video...');
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Video creation failed: ${err.message}`)))
        .run();
    });
  }

  async process() {
    try {
      this.updateStatus('processing', 5, 'Starting VR 180 conversion...');
      const framesDir = await this.extractFrames();
      const vr180FramesDir = await this.processFrames(framesDir);
      await this.createVR180Video(vr180FramesDir);
      this.updateStatus('completed', 100, 'VR 180 conversion completed!');
      
      // Cleanup after successful completion
      fs.removeSync(this.tempJobDir);
      fs.removeSync(this.inputPath);
    } catch (error) {
      console.error('Processing error:', error);
      this.updateStatus('error', 0, `Processing failed: ${error.message}`);
      
      // Cleanup on error
      try {
        fs.removeSync(this.tempJobDir);
        fs.removeSync(this.inputPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
}

// Routes
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }
  const jobId = uuidv4();
  const processor = new VR180Processor(jobId, req.file.path, req.file.originalname, io);
  processor.process();
  res.json({ 
    jobId, 
    originalName: req.file.originalname,
    message: 'Processing started.' 
  });
});

app.get('/api/status/:jobId', (req, res) => {
  const statusFile = path.join(outputDir, `${req.params.jobId}-status.json`);
  if (fs.existsSync(statusFile)) {
    res.json(fs.readJsonSync(statusFile));
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.get('/api/download/:jobId', (req, res) => {
  const videoPath = path.join(outputDir, `${req.params.jobId}-vr180.mp4`);
  if (fs.existsSync(videoPath)) {
    res.download(videoPath);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

app.get('/api/preview/:jobId', (req, res) => {
    const videoPath = path.join(outputDir, `${req.params.jobId}-vr180.mp4`);
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// Catch-all handler for React Router in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`VR 180 Platform server running on port ${PORT}`);
  console.log('Full video processing enabled.');
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
