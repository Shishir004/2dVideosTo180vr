import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Zap, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      className="glass-effect"
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        margin: '20px',
        padding: '20px 40px',
        borderRadius: '20px'
      }}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">VR 180 Platform</h1>
            <p className="text-sm opacity-70 text-white">Immersive Video Conversion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white opacity-80">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
          <div className="flex items-center gap-2 text-white opacity-80">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">No APIs Required</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
