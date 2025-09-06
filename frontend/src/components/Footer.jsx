import React from 'react';
import { motion } from 'framer-motion';
import { Github, Heart, Code } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      className="glass-effect"
      style={{ 
        margin: '20px',
        padding: '20px 40px',
        borderRadius: '20px'
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          <span className="text-sm">Built for VR Hackathon</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>for immersive experiences</span>
          </div>
          
          <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <Github className="w-4 h-4" />
            <span className="text-sm">Open Source</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
