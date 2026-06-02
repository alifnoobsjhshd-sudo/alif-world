import React from 'react';
import { motion, useTransform } from 'motion/react';

interface SectionProps {
  children: React.ReactNode;
  startDepth: number;
  scrollProgress: any;
  totalCycle: number;
}

export const Section = React.memo(({
  children,
  startDepth,
  scrollProgress,
  totalCycle
}: SectionProps) => {
  const relativeDepth = useTransform(scrollProgress, (val: number) => {
    let diff = (startDepth - (val % totalCycle) + totalCycle) % totalCycle;
    if (diff > totalCycle / 2) diff -= totalCycle;
    return diff;
  });

  // Reduced scale at the "just passed" end so sections don't balloon up and cause a white flash
  const z       = useTransform(relativeDepth, [-1200, 0, 5000], [500,  0, -2200]);
  const scale   = useTransform(relativeDepth, [-1200, 0, 5000], [1.15, 1,  0.05]);
  // Quick fade-out when a section passes the viewer — eliminates the lingering-white-fill
  const opacity = useTransform(relativeDepth, [-900, -200, 0, 2000, 4200], [0, 0.15, 1, 0.4, 0]);

  // Disable pointer events if section is far from focus
  const pointerEvents = useTransform(relativeDepth, (val: number) => {
    return Math.abs(val) < 800 ? 'auto' : 'none';
  });

  // Optimize rendering by using 'visibility: hidden' on out-of-bounds sections.
  // This directs the GPU/browser to completely skip compositor draws when offscreen.
  const visibility = useTransform(relativeDepth, (val: number) => {
    return (val < -1000 || val > 4400) ? 'hidden' : 'visible';
  });

  return (
    <motion.div
      style={{ z, opacity, scale, visibility, willChange: 'transform, opacity' }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8 pb-20 sm:pb-28 preserve-3d pointer-events-none gpu"
    >
      <motion.div 
        style={{ pointerEvents }}
        className="w-full flex justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

Section.displayName = 'Section';
