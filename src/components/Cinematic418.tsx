import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import LetterGlitch from './LetterGlitch'; // Use the existing glitch component

interface Cinematic418Props {
  isActive: boolean;
  onClose: () => void;
}

export const Cinematic418: React.FC<Cinematic418Props> = ({ isActive, onClose }) => {
  useEffect(() => {
    if (isActive) {
      // Spam logs to console for extra effect
      let count = 0;
      const interval = setInterval(() => {
        console.error(`[CRITICAL] BREW ATTEMPT DETECTED [${count}]`);
        console.error('[SECURITY] USER OVERSTEPPING BOUNDARIES');
        console.error('[HTTP 418] I AM A TEAPOT, I DO NOT BREW COFFEE');
        count++;
        if (count > 20) clearInterval(interval);
      }, 100);

      const timeout = setTimeout(() => {
        onClose();
      }, 6000); // Glitch out for 6 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isActive, onClose]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(-45deg)'] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      >
        <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none">
           <LetterGlitch glitchSpeed={30} centerVignette={false} outerVignette={true} glitchColors={['#ff0000', '#ff8800', '#ffffff']} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 bg-black/80 border-4 border-red-600 shadow-[0_0_100px_rgba(255,0,0,0.5)] max-w-4xl w-full">
           <Terminal className="text-red-600 w-32 h-32 mb-8 animate-pulse" />
           <motion.h1 
             animate={{ x: [-10, 10, -10, 10, 0] }}
             transition={{ repeat: Infinity, duration: 0.1 }}
             className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter uppercase mb-4"
           >
             Error 418
           </motion.h1>
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">I AM A TEAPOT</h2>
           
           <div className="w-full text-left font-mono text-red-500 text-sm md:text-base leading-tight">
             <p className="animate-pulse">{'>'} CRITICAL SYSTEM FAILURE</p>
             <p>{'>'} UNAUTHORIZED BEVERAGE REQUEST DETECTED</p>
             <p>{'>'} USER CLASSIFIED AS: FOOLISH</p>
           </div>
        </div>

        {/* Scanline effect overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      </motion.div>
    </AnimatePresence>
  );
};
