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

  // Keep a generous overlap between neighboring scenes so a fast, controlled
  // scroll never reveals a blank frame between their fades.
  const z       = useTransform(relativeDepth, [-1800, 0, 5000], [500,  0, -2200]);
  const scale   = useTransform(relativeDepth, [-1800, 0, 5000], [1.1, 1,  0.18]);
  // Section content reaches its visual peak farther away, then starts fading
  // early while the camera approaches. This keeps Hero/About/Works from
  // staying fully opaque until they are right in front of the viewer.
  const opacity = useTransform(
    relativeDepth,
    [-5000, -3600, -2800, -2200, -1600, -1000, -600, 0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 4700, 5000],
    [0, 0.06, 0.12, 0.18, 0.24, 0.29, 0.34, 0.42, 0.38, 0.4, 0.45, 0.52, 0.6, 0.68, 0.72, 0.3, 0]
  );

  // Disable pointer events if section is far from focus
  const pointerEvents = useTransform(relativeDepth, (val: number) => {
    return Math.abs(val) < 800 ? 'auto' : 'none';
  });

  // Optimize rendering by using 'visibility: hidden' on out-of-bounds sections.
  // This directs the GPU/browser to completely skip compositor draws when offscreen.
  const visibility = useTransform(relativeDepth, (val: number) => {
    return (val < -2600 || val > 5200) ? 'hidden' : 'visible';
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
