const { createCanvas, loadImage } = require('canvas');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

class StereoscopicRenderer {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.stereoDir = path.join(this.tempDir, 'stereo');
    fs.ensureDirSync(this.stereoDir);
    
    // VR 180 configuration
    this.vr180Config = {
      width: 3840,  // 4K width for VR 180
      height: 2160, // 4K height for VR 180
      eyeSeparation: 64, // Average human eye separation in pixels
      convergenceDistance: 1000, // Convergence point
      maxDisparity: 100 // Maximum stereo disparity
    };
  }

  async createStereoscopicFrames(videoPath, depthMaps) {
    try {
      const framesDir = path.join(this.tempDir, 'frames');
      const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
      
      const stereoscopicFrames = [];
      
      for (let i = 0; i < frameFiles.length && i < depthMaps.length; i++) {
        const framePath = path.join(framesDir, frameFiles[i]);
        const depthMap = depthMaps[i];
        
        const stereoFrame = await this.createStereoFrame(framePath, depthMap, i);
        stereoscopicFrames.push(stereoFrame);
      }
      
      return stereoscopicFrames;
    } catch (error) {
      console.error('Error creating stereoscopic frames:', error);
      throw error;
    }
  }

  async createStereoFrame(framePath, depthMap, frameIndex) {
    try {
      const originalImage = await Jimp.read(framePath);
      const width = originalImage.getWidth();
      const height = originalImage.getHeight();
      
      // Create left and right eye views
      const leftEye = await this.generateEyeView(originalImage, depthMap, 'left');
      const rightEye = await this.generateEyeView(originalImage, depthMap, 'right');
      
      // Create VR 180 side-by-side format
      const vr180Frame = await this.createVR180Frame(leftEye, rightEye);
      
      // Save the stereoscopic frame
      const outputPath = path.join(this.stereoDir, `stereo_${frameIndex.toString().padStart(4, '0')}.png`);
      await vr180Frame.writeAsync(outputPath);
      
      return {
        path: outputPath,
        frameIndex,
        width: this.vr180Config.width,
        height: this.vr180Config.height
      };
    } catch (error) {
      console.error('Error creating stereo frame:', error);
      throw error;
    }
  }

  async generateEyeView(originalImage, depthMap, eye) {
    const width = originalImage.getWidth();
    const height = originalImage.getHeight();
    
    // Create new image for this eye view
    const eyeView = new Jimp(width, height);
    
    // Calculate disparity based on eye (left = negative, right = positive)
    const eyeMultiplier = eye === 'left' ? -1 : 1;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const depthIdx = y * width + x;
        const depth = depthMap.data[depthIdx];
        
        // Calculate disparity based on depth
        const disparity = this.calculateDisparity(depth) * eyeMultiplier;
        
        // Calculate source pixel position
        const sourceX = Math.round(x + disparity);
        
        // Handle boundaries and get pixel color
        let pixelColor;
        if (sourceX >= 0 && sourceX < width) {
          pixelColor = originalImage.getPixelColor(sourceX, y);
        } else {
          // Use edge pixel for out-of-bounds
          const edgeX = Math.max(0, Math.min(width - 1, sourceX));
          pixelColor = originalImage.getPixelColor(edgeX, y);
        }
        
        eyeView.setPixelColor(pixelColor, x, y);
      }
    }
    
    return eyeView;
  }

  calculateDisparity(depth) {
    // Convert depth (0-1) to disparity in pixels
    // Closer objects (higher depth) have more disparity
    const normalizedDepth = Math.max(0, Math.min(1, depth));
    
    // Use exponential curve for more natural depth perception
    const disparityFactor = Math.pow(normalizedDepth, 0.7);
    
    return disparityFactor * this.vr180Config.maxDisparity;
  }

  async createVR180Frame(leftEye, rightEye) {
    // Resize images to fit VR 180 format (side-by-side)
    const eyeWidth = this.vr180Config.width / 2;
    const eyeHeight = this.vr180Config.height;
    
    const leftResized = leftEye.resize(eyeWidth, eyeHeight);
    const rightResized = rightEye.resize(eyeWidth, eyeHeight);
    
    // Create VR 180 frame (side-by-side layout)
    const vr180Frame = new Jimp(this.vr180Config.width, this.vr180Config.height);
    
    // Composite left eye on left side
    vr180Frame.composite(leftResized, 0, 0);
    
    // Composite right eye on right side
    vr180Frame.composite(rightResized, eyeWidth, 0);
    
    // Apply VR 180 specific adjustments
    return this.applyVR180Corrections(vr180Frame);
  }

  async applyVR180Corrections(vr180Frame) {
    // Apply barrel distortion correction for VR lenses
    const corrected = await this.applyBarrelDistortion(vr180Frame);
    
    // Apply chromatic aberration correction
    const chromaticCorrected = await this.correctChromaticAberration(corrected);
    
    // Apply edge blending for seamless VR experience
    const blended = await this.applyEdgeBlending(chromaticCorrected);
    
    return blended;
  }

  async applyBarrelDistortion(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const corrected = new Jimp(width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY);
    
    // Barrel distortion parameters for VR correction
    const k1 = -0.1; // Barrel distortion coefficient
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Convert to normalized coordinates
        const nx = (x - centerX) / maxRadius;
        const ny = (y - centerY) / maxRadius;
        const r = Math.sqrt(nx * nx + ny * ny);
        
        if (r > 0) {
          // Apply barrel distortion
          const rDistorted = r * (1 + k1 * r * r);
          const factor = rDistorted / r;
          
          const sourceX = Math.round(centerX + nx * factor * maxRadius);
          const sourceY = Math.round(centerY + ny * factor * maxRadius);
          
          if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
            const pixelColor = image.getPixelColor(sourceX, sourceY);
            corrected.setPixelColor(pixelColor, x, y);
          } else {
            corrected.setPixelColor(0x000000FF, x, y); // Black for out of bounds
          }
        } else {
          const pixelColor = image.getPixelColor(x, y);
          corrected.setPixelColor(pixelColor, x, y);
        }
      }
    }
    
    return corrected;
  }

  async correctChromaticAberration(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const corrected = new Jimp(width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Chromatic aberration correction factors
    const redScale = 1.002;
    const blueScale = 0.998;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Get original pixel
        const originalColor = Jimp.intToRGBA(image.getPixelColor(x, y));
        
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Apply different scaling for R, G, B channels
        const redX = Math.round(centerX + dx * redScale);
        const redY = Math.round(centerY + dy * redScale);
        const blueX = Math.round(centerX + dx * blueScale);
        const blueY = Math.round(centerY + dy * blueScale);
        
        let r = originalColor.r;
        let g = originalColor.g;
        let b = originalColor.b;
        
        // Sample red channel from scaled position
        if (redX >= 0 && redX < width && redY >= 0 && redY < height) {
          const redColor = Jimp.intToRGBA(image.getPixelColor(redX, redY));
          r = redColor.r;
        }
        
        // Sample blue channel from scaled position
        if (blueX >= 0 && blueX < width && blueY >= 0 && blueY < height) {
          const blueColor = Jimp.intToRGBA(image.getPixelColor(blueX, blueY));
          b = blueColor.b;
        }
        
        const correctedColor = Jimp.rgbaToInt(r, g, b, originalColor.a);
        corrected.setPixelColor(correctedColor, x, y);
      }
    }
    
    return corrected;
  }

  async applyEdgeBlending(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const blended = image.clone();
    
    const blendWidth = 50; // Pixels to blend at edges
    
    // Apply soft edge blending to reduce VR seams
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < blendWidth; x++) {
        // Left edge
        const leftAlpha = x / blendWidth;
        const leftColor = Jimp.intToRGBA(blended.getPixelColor(x, y));
        const leftBlended = Jimp.rgbaToInt(
          leftColor.r, leftColor.g, leftColor.b, 
          Math.round(leftColor.a * leftAlpha)
        );
        blended.setPixelColor(leftBlended, x, y);
        
        // Right edge
        const rightX = width - 1 - x;
        const rightAlpha = x / blendWidth;
        const rightColor = Jimp.intToRGBA(blended.getPixelColor(rightX, y));
        const rightBlended = Jimp.rgbaToInt(
          rightColor.r, rightColor.g, rightColor.b,
          Math.round(rightColor.a * rightAlpha)
        );
        blended.setPixelColor(rightBlended, rightX, y);
      }
    }
    
    return blended;
  }

  async renderVR180Video(stereoscopicFrames, outputPath, videoInfo) {
    try {
      const framePattern = path.join(this.stereoDir, 'stereo_%04d.png');
      
      return new Promise((resolve, reject) => {
        let command = ffmpeg()
          .input(framePattern)
          .inputOptions([
            '-framerate 30',
            '-f image2'
          ])
          .outputOptions([
            '-c:v libx264',
            '-preset medium',
            '-crf 18',
            '-pix_fmt yuv420p',
            '-movflags +faststart',
            // VR 180 metadata
            '-metadata:s:v:0 stereo_mode=left_right',
            '-metadata spherical-video=1',
            '-metadata projection=equirectangular'
          ])
          .output(outputPath);
        
        // Add audio if original video had audio
        if (videoInfo && videoInfo.hasAudio) {
          command = command
            .input(videoInfo.path)
            .outputOptions(['-c:a aac', '-b:a 128k', '-map 1:a']);
        }
        
        command
          .on('progress', (progress) => {
            console.log('Rendering progress:', progress.percent + '%');
          })
          .on('end', () => {
            console.log('VR 180 video rendering completed');
            resolve();
          })
          .on('error', (error) => {
            console.error('Rendering error:', error);
            reject(error);
          })
          .run();
      });
    } catch (error) {
      console.error('Error rendering VR 180 video:', error);
      throw error;
    }
  }
}

module.exports = StereoscopicRenderer;
