const { createCanvas, loadImage } = require('canvas');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');

class DepthEstimator {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    fs.ensureDirSync(this.tempDir);
  }

  async generateDepthMaps(videoPath) {
    try {
      // Extract frames from video
      const framesDir = path.join(this.tempDir, 'frames');
      fs.ensureDirSync(framesDir);
      
      await this.extractFrames(videoPath, framesDir);
      
      // Process each frame to generate depth map
      const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
      const depthMaps = [];
      
      for (let i = 0; i < frameFiles.length; i++) {
        const framePath = path.join(framesDir, frameFiles[i]);
        const depthMap = await this.estimateDepthFromFrame(framePath);
        depthMaps.push(depthMap);
      }
      
      return depthMaps;
    } catch (error) {
      console.error('Error generating depth maps:', error);
      throw error;
    }
  }

  async extractFrames(videoPath, outputDir) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          '-vf fps=5', // Extract 30 frames per second
          '-q:v 2'      // High quality
        ])
        .output(path.join(outputDir, 'frame_%04d.png'))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async estimateDepthFromFrame(framePath) {
    try {
      const image = await Jimp.read(framePath);
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Create depth map using multiple techniques
      const depthMap = await this.createDepthMap(image, width, height);
      
      return {
        width,
        height,
        data: depthMap,
        framePath
      };
    } catch (error) {
      console.error('Error estimating depth for frame:', framePath, error);
      throw error;
    }
  }

  async createDepthMap(image, width, height) {
    // Multi-technique depth estimation approach
    const depthData = new Float32Array(width * height);
    
    // Technique 1: Edge-based depth estimation
    const edgeDepth = this.calculateEdgeBasedDepth(image, width, height);
    
    // Technique 2: Gradient-based depth estimation
    const gradientDepth = this.calculateGradientBasedDepth(image, width, height);
    
    // Technique 3: Brightness-based depth estimation
    const brightnessDepth = this.calculateBrightnessBasedDepth(image, width, height);
    
    // Technique 4: Focus-based depth estimation
    const focusDepth = this.calculateFocusBasedDepth(image, width, height);
    
    // Combine all techniques with weighted average
    for (let i = 0; i < width * height; i++) {
      depthData[i] = (
        edgeDepth[i] * 0.3 +
        gradientDepth[i] * 0.25 +
        brightnessDepth[i] * 0.25 +
        focusDepth[i] * 0.2
      );
    }
    
    // Apply smoothing filter
    return this.smoothDepthMap(depthData, width, height);
  }

  calculateEdgeBasedDepth(image, width, height) {
    const depthData = new Float32Array(width * height);
    
    // Sobel edge detection for depth estimation
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Get surrounding pixels
        const pixels = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x + dx, y + dy));
            pixels.push((color.r + color.g + color.b) / 3);
          }
        }
        
        // Sobel X kernel
        const sobelX = (
          -1 * pixels[0] + 1 * pixels[2] +
          -2 * pixels[3] + 2 * pixels[5] +
          -1 * pixels[6] + 1 * pixels[8]
        );
        
        // Sobel Y kernel
        const sobelY = (
          -1 * pixels[0] - 2 * pixels[1] - 1 * pixels[2] +
           1 * pixels[6] + 2 * pixels[7] + 1 * pixels[8]
        );
        
        // Edge magnitude (higher edges = closer objects)
        const edgeMagnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
        depthData[idx] = Math.min(edgeMagnitude / 255, 1.0);
      }
    }
    
    return depthData;
  }

  calculateGradientBasedDepth(image, width, height) {
    const depthData = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        const brightness = (color.r + color.g + color.b) / 3;
        
        // Use vertical gradient as depth cue (objects lower in frame are closer)
        const verticalGradient = (height - y) / height;
        
        // Combine with brightness
        depthData[idx] = (brightness / 255) * 0.7 + verticalGradient * 0.3;
      }
    }
    
    return depthData;
  }

  calculateBrightnessBasedDepth(image, width, height) {
    const depthData = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        
        // Convert to HSV to get better brightness estimation
        const hsv = this.rgbToHsv(color.r, color.g, color.b);
        
        // Brighter objects are typically closer
        depthData[idx] = hsv.v;
      }
    }
    
    return depthData;
  }

  calculateFocusBasedDepth(image, width, height) {
    const depthData = new Float32Array(width * height);
    
    // Calculate local variance (focus measure)
    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let y = halfWindow; y < height - halfWindow; y++) {
      for (let x = halfWindow; x < width - halfWindow; x++) {
        const idx = y * width + x;
        
        // Calculate variance in local window
        let sum = 0;
        let sumSquared = 0;
        let count = 0;
        
        for (let dy = -halfWindow; dy <= halfWindow; dy++) {
          for (let dx = -halfWindow; dx <= halfWindow; dx++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x + dx, y + dy));
            const brightness = (color.r + color.g + color.b) / 3;
            sum += brightness;
            sumSquared += brightness * brightness;
            count++;
          }
        }
        
        const mean = sum / count;
        const variance = (sumSquared / count) - (mean * mean);
        
        // Higher variance = more in focus = closer
        depthData[idx] = Math.min(variance / 10000, 1.0);
      }
    }
    
    return depthData;
  }

  smoothDepthMap(depthData, width, height) {
    const smoothed = new Float32Array(width * height);
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);
    
    // Gaussian blur kernel
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    const kernelSum = 16;
    
    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        const idx = y * width + x;
        let sum = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelIdx = (y + ky - halfKernel) * width + (x + kx - halfKernel);
            sum += depthData[pixelIdx] * kernel[ky][kx];
          }
        }
        
        smoothed[idx] = sum / kernelSum;
      }
    }
    
    // Copy edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (y < halfKernel || y >= height - halfKernel || 
            x < halfKernel || x >= width - halfKernel) {
          smoothed[idx] = depthData[idx];
        }
      }
    }
    
    return smoothed;
  }

  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return { h, s, v };
  }
}

module.exports = DepthEstimator;
