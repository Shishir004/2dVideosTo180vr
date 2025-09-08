// Simplified Cloudflare Worker backend for VR 180 Platform

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
function handleCors(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// In-memory job storage (for demo purposes)
const jobStatus = new Map();

// Mock processing simulation
function simulateProcessing(jobId) {
  const steps = [
    { progress: 10, message: 'Analyzing video...' },
    { progress: 30, message: 'Extracting frames...' },
    { progress: 50, message: 'Generating depth maps...' },
    { progress: 70, message: 'Creating stereoscopic frames...' },
    { progress: 90, message: 'Finalizing VR 180 video...' },
    { progress: 100, message: 'Processing complete!' }
  ];

  let stepIndex = 0;
  const interval = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(interval);
      return;
    }

    const step = steps[stepIndex];
    const status = {
      jobId,
      status: stepIndex === steps.length - 1 ? 'completed' : 'processing',
      progress: step.progress,
      message: step.message,
      timestamp: new Date().toISOString()
    };

    jobStatus.set(jobId, status);
    stepIndex++;
  }, 2000);
}

// Handle file upload
async function handleUpload(request) {
  const formData = await request.formData();
  const file = formData.get('video');
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No video file uploaded' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const jobId = crypto.randomUUID();

  // Initial status
  const initialStatus = {
    jobId,
    status: 'processing',
    progress: 5,
    message: 'Upload complete, starting processing...',
    originalName: file.name,
    timestamp: new Date().toISOString()
  };

  jobStatus.set(jobId, initialStatus);
  
  // Start mock processing
  simulateProcessing(jobId);

  return new Response(JSON.stringify({
    jobId,
    originalName: file.name,
    message: 'Processing started.'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get job status
async function getStatus(jobId) {
  const status = jobStatus.get(jobId);
  
  if (!status) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle download/preview (mock)
async function handleDownload(jobId) {
  const status = jobStatus.get(jobId);
  
  if (!status) {
    return new Response('Video not found', { status: 404 });
  }

  if (status.status !== 'completed') {
    return new Response('Video not ready', { status: 404 });
  }

  // Mock video content
  return new Response('Mock VR 180 video content', {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${jobId}-vr180.mp4"`
    }
  });
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    // Route handling
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', worker: 'vr180-backend' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/upload' && request.method === 'POST') {
      return handleUpload(request);
    }

    if (url.pathname.startsWith('/api/status/') && request.method === 'GET') {
      const jobId = url.pathname.split('/').pop();
      return getStatus(jobId);
    }

    if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
      const jobId = url.pathname.split('/').pop();
      return handleDownload(jobId);
    }

    if (url.pathname.startsWith('/api/preview/') && request.method === 'GET') {
      const jobId = url.pathname.split('/').pop();
      return handleDownload(jobId);
    }

    // Mock socket.io endpoint to prevent 404s
    if (url.pathname === '/socket.io/' || url.pathname.startsWith('/socket.io/')) {
      return new Response(JSON.stringify({ error: 'Socket.IO not available in this environment' }), {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
