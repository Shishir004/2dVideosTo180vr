const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

class VideoProcessor {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    fs.ensureDirSync(this.tempDir);
  }

  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

        const info = {
          path: videoPath,
          duration: metadata.format.duration,
          width: videoStream ? videoStream.width : 0,
          height: videoStream ? videoStream.height : 0,
          fps: videoStream ? eval(videoStream.r_frame_rate) : 30,
          hasAudio: !!audioStream,
          bitrate: metadata.format.bit_rate,
          format: metadata.format.format_name,
          size: metadata.format.size
        };

        resolve(info);
      });
    });
  }

  async extractAudio(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(outputPath)
        .audioCodec('aac')
        .audioBitrate('128k')
        .noVideo()
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async optimizeForVR(videoPath) {
    try {
      const tempPath = videoPath + '.temp.mp4';
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .outputOptions([
            // VR optimization settings
            '-c:v libx264',
            '-preset slow',
            '-crf 20',
            '-maxrate 50M',
            '-bufsize 100M',
            '-pix_fmt yuv420p',
            '-movflags +faststart',
            // VR 180 specific metadata
            '-metadata:s:v:0 stereo_mode=left_right',
            '-metadata spherical-video=1',
            '-metadata projection=equirectangular',
            '-metadata:g:0 handler_name="VR 180 Video"'
          ])
          .output(tempPath)
          .on('end', async () => {
            try {
              // Replace original with optimized version
              await fs.move(tempPath, videoPath, { overwrite: true });
              resolve();
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject)
          .run();
      });
    } catch (error) {
      console.error('Error optimizing video for VR:', error);
      throw error;
    }
  }

  async createPreview(videoPath, outputPath, duration = 30) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(0)
        .duration(duration)
        .outputOptions([
          '-c:v libx264',
          '-crf 28',
          '-preset fast',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async generateThumbnail(videoPath, outputPath, timestamp = '00:00:01') {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async validateVideo(videoPath) {
    try {
      const info = await this.getVideoInfo(videoPath);
      
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        info
      };

      // Check file size (max 500MB)
      if (info.size > 500 * 1024 * 1024) {
        validation.warnings.push('File size is large (>500MB). Processing may take longer.');
      }

      // Check duration (max 10 minutes for demo)
      if (info.duration > 600) {
        validation.warnings.push('Video is longer than 10 minutes. Consider trimming for better performance.');
      }

      // Check resolution
      if (info.width < 640 || info.height < 480) {
        validation.warnings.push('Low resolution video may not produce optimal VR results.');
      }

      // Check format
      const supportedFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
      if (!supportedFormats.some(format => info.format.includes(format))) {
        validation.errors.push('Unsupported video format. Please use MP4, AVI, MOV, MKV, or WebM.');
        validation.isValid = false;
      }

      return validation;
    } catch (error) {
      return {
        isValid: false,
        errors: ['Unable to read video file. Please check if the file is corrupted.'],
        warnings: [],
        info: null
      };
    }
  }

  async convertToStandardFormat(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-preset medium',
          '-crf 23',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  cleanup() {
    try {
      // Clean up temporary files
      if (fs.existsSync(this.tempDir)) {
        fs.removeSync(this.tempDir);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = VideoProcessor;
