import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import UploadSection from './components/UploadSection.jsx';
import ProcessingSection from './components/ProcessingSection.jsx';
import PreviewSection from './components/PreviewSection.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

// ✅ CORRECTED: The only change is updating this URL to your live backend.
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://twodvideosto180vr-20.onrender.com" // Corrected backend deployed URL
    : "http://localhost:5000";

function App() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, processing, preview
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_URL, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on('processingUpdate', (data) => {
      setProcessingStatus(data);
      if (data.status === 'completed') {
        setCurrentStep('preview');
      } else if (data.status === 'error') {
        console.error('Processing error:', data.message);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setUploadedFile(file);
      setCurrentStep('processing');

      const formData = new FormData();
      formData.append('video', file);

      // Upload video to backend
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setJobId(response.data.jobId);
      setProcessingStatus({
        jobId: response.data.jobId,
        status: 'processing',
        progress: 0,
        message: 'Starting video processing...',
        originalName: file.name // This was a minor bug fix
      });
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus({
        status: 'error',
        message: 'Upload failed. Please try again.',
        progress: 0
      });
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setJobId(null);
    setProcessingStatus(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <UploadSection onFileUpload={handleFileUpload} />
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ProcessingSection 
              status={processingStatus}
              uploadedFile={uploadedFile}
            />
          </motion.div>
        );

      case 'preview':
        return (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <PreviewSection 
              jobId={jobId}
              originalFile={uploadedFile}
              onStartOver={handleStartOver}
              apiUrl={API_URL}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header />
      
      <main className="container">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;

