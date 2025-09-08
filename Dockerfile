# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install FFmpeg
RUN apk update && \
    apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Move back to root
WORKDIR /app

# Create necessary directories
RUN mkdir -p /tmp/uploads /tmp/output /tmp/temp

# Expose port
EXPOSE $PORT

# Start command
CMD ["npm", "run", "server"]
