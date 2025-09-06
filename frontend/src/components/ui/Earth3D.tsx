import React from 'react';
import { motion } from 'framer-motion';

interface EarthProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Earth3D: React.FC<EarthProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48 md:w-64 md:h-64',
    large: 'w-64 h-64 md:w-80 md:h-80'
  };

  return (
    <div className={`earth-container ${className}`}>
      <motion.div
        className={`earth-sphere relative ${sizeClasses[size]}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.5, 
          ease: "easeOut",
          delay: 0.2 
        }}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
      >
        {/* Continental patterns */}
        <div className="absolute inset-0 rounded-full opacity-40">
          {/* North America */}
          <div className="absolute top-6 left-8 w-8 h-6 bg-green-400 rounded-full transform rotate-12 opacity-60"></div>
          
          {/* Europe */}
          <div className="absolute top-4 left-1/2 w-4 h-3 bg-green-400 rounded-full transform -rotate-6 opacity-60"></div>
          
          {/* Asia */}
          <div className="absolute top-6 right-6 w-12 h-8 bg-green-400 rounded-full transform rotate-45 opacity-50"></div>
          
          {/* Africa */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-green-400 rounded-full opacity-60"></div>
          
          {/* Australia */}
          <div className="absolute bottom-8 right-10 w-4 h-3 bg-green-400 rounded-full transform -rotate-12 opacity-60"></div>
          
          {/* South America */}
          <div className="absolute bottom-6 left-8 w-4 h-8 bg-green-400 rounded-full transform rotate-6 opacity-60"></div>
        </div>

        {/* Cloud layer */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-white/10"
          animate={{ 
            rotateY: 360 
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Cloud spots */}
          <div className="absolute top-8 left-12 w-6 h-3 bg-white/30 rounded-full blur-sm"></div>
          <div className="absolute top-16 right-8 w-8 h-4 bg-white/25 rounded-full blur-sm"></div>
          <div className="absolute bottom-12 left-6 w-5 h-2 bg-white/30 rounded-full blur-sm"></div>
          <div className="absolute bottom-16 right-12 w-7 h-3 bg-white/25 rounded-full blur-sm"></div>
        </motion.div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse"></div>
        
        {/* Atmosphere glow */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-glow"></div>
      </motion.div>

      {/* Orbital rings */}
      <motion.div 
        className="absolute inset-0 border-2 border-blue-300/20 rounded-full"
        style={{ 
          width: '120%', 
          height: '120%',
          top: '-10%',
          left: '-10%'
        }}
        animate={{ 
          rotateX: [0, 360],
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      <motion.div 
        className="absolute inset-0 border border-blue-200/20 rounded-full"
        style={{ 
          width: '140%', 
          height: '140%',
          top: '-20%',
          left: '-20%'
        }}
        animate={{ 
          rotateX: [360, 0],
        }}
        transition={{ 
          duration: 60, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
