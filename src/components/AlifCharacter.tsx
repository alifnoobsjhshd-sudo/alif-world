import React from 'react';
import { motion } from 'motion/react';
import alifCharacterImg from '../assets/images/alif_character_pure_transparent_1780383675414.png';

export const AlifCharacter = React.memo(() => (
  <div className="relative w-96 h-[390px] flex flex-col items-center justify-center scale-105 sm:scale-115">
    {/* The Character Group */}
    <motion.div 
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 w-full flex justify-center"
    >
      <div className="relative">
        {/* Soft Shadow below character */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-60 h-8 bg-black/10 blur-xl rounded-full" />
        
        {/* Use the provided character image */}
        <img 
          src={alifCharacterImg} 
          alt="Alif Character"
          className="w-full max-w-[350px] sm:max-w-[400px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] object-contain select-none"
          style={{ imageRendering: 'auto', contentVisibility: 'auto' }}
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  </div>
));

AlifCharacter.displayName = 'AlifCharacter';
