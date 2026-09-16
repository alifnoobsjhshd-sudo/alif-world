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
  // Let content soften in the camera's close range instead of staying fully
  // opaque as it rushes past the viewer. The neighboring scene remains visible
  // underneath, so this never creates a blank handoff.
  const opacity = useTransform(
    relativeDepth,
    [-5000, -3400, -2600, -2000, -1400, -900, -500, 0, 400, 800, 1400, 2200, 3000, 4000, 5000],
    [0, 0.08, 0.16, 0.24, 0.3, 0.34, 0.38, 0.42, 0.36, 0.42, 0.56, 0.7, 0.76, 0.36, 0]
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
