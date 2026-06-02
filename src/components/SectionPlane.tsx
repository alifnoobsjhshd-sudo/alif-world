import React from 'react';
import { motion, animate, MotionValue } from 'motion/react';

interface SectionPlaneProps {
  activeSection: number;
  depthValue: MotionValue<number>;
}

const NAV = [
  { label: 'Hero'    },
  { label: 'About'   },
  { label: 'Skills'  },
  { label: 'Works'   },
  { label: 'Contact' },
];

const DEPTHS = [0, 5000, 10000, 15000, 20000];

/* Tiny paper airplane facing right ---------------------------------------- */
const TinyPlane = () => (
  <svg width="28" height="18" viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tpTop" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e8ecf4"/>
        <stop offset="100%" stopColor="#d0d6e2"/>
      </linearGradient>
      <linearGradient id="tpBot" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#c4cad8"/>
        <stop offset="100%" stopColor="#b0b6c4"/>
      </linearGradient>
    </defs>
    {/* Top wing */}
    <path d="M54 16 L4 2 L18 16 Z" fill="url(#tpTop)" stroke="#bec4d0" strokeWidth="0.8"/>
    {/* Bottom wing */}
    <path d="M54 16 L18 16 L4 30 Z" fill="url(#tpBot)" stroke="#aab0be" strokeWidth="0.8"/>
    {/* Fold wall */}
    <path d="M18 16 L22 30 L4 30 Z" fill="#7a808e" opacity="0.6"/>
    {/* Spine */}
    <line x1="54" y1="16" x2="18" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.85"/>
    {/* Nose glint */}
    <circle cx="54" cy="16" r="2" fill="white" opacity="0.95"/>
  </svg>
);

export const SectionPlane = React.memo(({ activeSection, depthValue }: SectionPlaneProps) => {

  const goTo = (i: number) => {
    animate(depthValue, DEPTHS[i], { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
  };

  return (
    <div
      className="fixed top-6 left-0 right-0 flex justify-center z-40 pointer-events-none"
      aria-label="Section navigator"
    >
      {/* Track */}
      <div className="relative flex items-center pointer-events-auto" style={{ width: 280 }}>

        {/* Connecting line */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-gray-200" />

        {/* Dots */}
        <div className="relative w-full flex items-center justify-between">
          {NAV.map((item, i) => {
            const isActive = activeSection === i;
            return (
              <button
                key={item.label}
                onClick={() => goTo(i)}
                className="relative flex flex-col items-center gap-1.5 focus:outline-none group"
                aria-label={`Go to ${item.label}`}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.4 : 1,
                    backgroundColor: isActive ? '#1f2937' : '#d1d5db',
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <span
                  className="font-display font-bold uppercase tracking-wider transition-colors duration-200"
                  style={{
                    fontSize: 8,
                    color: isActive ? '#111827' : '#9ca3af',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Airplane — slides to active dot */}
        <motion.div
          className="absolute -top-5 pointer-events-none"
          animate={{ left: `calc(${(activeSection / 4) * 100}% - 14px)` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.14))' }}
        >
          <TinyPlane />
        </motion.div>

      </div>
    </div>
  );
});

SectionPlane.displayName = 'SectionPlane';
