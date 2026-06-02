/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useMotionValueEvent,
} from 'motion/react';
import { AlifCharacter }  from './components/AlifCharacter';
import { SketchyCloud }   from './components/SketchyCloud';
import { Section }        from './components/Section';
import { Balloon, Kite, Cloud, SceneCloud } from './components/Decorations';
import { ContactSection } from './components/ContactSection';
import { NavBar }         from './components/NavBar';
import { SectionPlane }   from './components/SectionPlane';
import { ScrollHint }     from './components/ScrollHint';
import { PaperAirplane }  from './components/PaperAirplane';
import { LoadingScreen }   from './components/LoadingScreen';
import { ProjectsPage }   from './pages/ProjectsPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

const SECTION_DEPTHS = [0, 5000, 10000, 15000, 20000];
const TOTAL_CYCLE    = 25000;

function Portfolio({ initialLoading }: { initialLoading: boolean }) {
  const navigate = useNavigate();

  // ── Depth motion value — the "camera Z position" ──────────────────────────
  const depthValue   = useMotionValue(0);
  const smoothedDepth = useSpring(depthValue, {
    stiffness: 45,   // Slightly softer for more fluid motion
    damping:   35,   // Higher damping to prevent oscillation
    mass:      0.8,  // More mass for "heavier", premium feel
    restDelta: 0.1,
  });
  
  // Clean velocity from raw input is MUCH smoother for driving rotations
  const depthVelocity = useVelocity(depthValue);

  // ── Active section tracking ────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState(0);
  useMotionValueEvent(smoothedDepth, 'change', (v) => {
    const normalized = ((v % TOTAL_CYCLE) + TOTAL_CYCLE) % TOTAL_CYCLE;
    const raw        = normalized / 5000;
    const idx        = Math.min(Math.max(Math.round(raw), 0), 4);
    setActiveSection(idx);
  });

  // ── World tilt transforms ──────────────────────────────────────────────────
  // We use the raw depthVelocity but pass it through a heavy spring
  const worldRotateX = useTransform(depthVelocity, [-3000, 0, 3000], [12, 0, -12]);
  const smoothWorldRotateX = useSpring(worldRotateX, { stiffness: 35, damping: 25, mass: 1 });

  const worldRotateZ = useTransform(depthVelocity, [-3000, 0, 3000], [-3, 0, 3]);
  const smoothWorldRotateZ = useSpring(worldRotateZ, { stiffness: 35, damping: 25, mass: 1 });

  const worldScale   = useTransform(depthVelocity, [-4000, 0, 4000], [1.03, 1.0, 1.03]);
  const smoothWorldScale = useSpring(worldScale, { stiffness: 35, damping: 25, mass: 1 });

  const worldTranslateX = useTransform(depthVelocity, [-3000, 0, 3000], [12, 0, -12]);
  const smoothWorldTranslateX = useSpring(worldTranslateX, { stiffness: 35, damping: 25, mass: 1 });

  const worldTranslateY = useTransform(depthVelocity, [-3000, 0, 3000], [8, 0, 8]);
  const smoothWorldTranslateY = useSpring(worldTranslateY, { stiffness: 35, damping: 25, mass: 1 });

  const speedVignetteBg = useTransform(
    depthVelocity,
    [-4000, 0, 4000],
    [
      'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.07) 100%)',
      'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.00) 100%)',
      'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.07) 100%)',
    ]
  );

  // ── Wheel scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      depthValue.set(depthValue.get() + e.deltaY * 20);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [depthValue]);

  // ── Touch scroll — smooth, lag-free ───────────────────────────────────────
  const touchStartY = useRef(0);
  const touchLastY  = useRef(0);
  const touchVelY   = useRef(0);
  const rafId       = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchLastY.current  = e.touches[0].clientY;
      touchVelY.current   = 0;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y     = e.touches[0].clientY;
      const delta = touchLastY.current - y;
      touchVelY.current  = delta;
      touchLastY.current = y;
      depthValue.set(depthValue.get() + delta * 20);
    };

    // Momentum after finger lift
    const onTouchEnd = () => {
      let vel = touchVelY.current;
      const step = () => {
        if (Math.abs(vel) < 0.1) return;
        depthValue.set(depthValue.get() + vel * 12); // Reduced multiplier for more controlled stop
        vel *= 0.92; // Slightly more friction for smoother decay
        rafId.current = requestAnimationFrame(step);
      };
      rafId.current = requestAnimationFrame(step);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [depthValue]);

  // ── Section content ────────────────────────────────────────────────────────
  const scenes = useMemo(() => [
    {
      depth: 0,
      content: (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
        >
          <SketchyCloud className="scale-[0.8] transform-gpu">
            <div className="flex flex-col items-center">
              <motion.h1
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl sm:text-8xl font-mono font-bold text-gray-800 tracking-tight mb-4"
              >
                &lt;hello/&gt;
              </motion.h1>
              <motion.p
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="text-xl sm:text-2xl font-hand text-gray-500 mb-8 italic text-center"
              >
                i'm alif, welcome to my world
              </motion.p>
              <div className="relative mb-6">
                <AlifCharacter />
              </div>
              <motion.p
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="text-gray-600 font-hand text-xl sm:text-2xl max-w-sm leading-relaxed text-center"
              >
                "shaping digital dreams into reality"
              </motion.p>
            </div>
          </SketchyCloud>
        </motion.div>
      ),
    },
    {
      depth: 5000,
      content: (
        <SketchyCloud className="scale-100 sm:scale-110">
          <div className="flex flex-col items-center max-w-xl">
            <h2 className="text-4xl sm:text-6xl font-display font-black text-gray-800 uppercase tracking-widest mb-8">
              ABOUT ME
            </h2>
            <div className="flex flex-col gap-6 text-gray-500 font-hand text-2xl sm:text-3xl leading-relaxed italic text-center">
              <p>i'm a creative developer who loves to mix art with code.</p>
              <div className="w-24 h-0.5 bg-gray-200 mx-auto" />
              <p>currently focused on building immersive experiences that bridge the gap between design and tech.</p>
            </div>
          </div>
        </SketchyCloud>
      ),
    },
    {
      depth: 10000,
      content: (
        <div className="flex flex-col items-center">
          <motion.h2
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl sm:text-9xl font-display font-black text-gray-800 uppercase mb-4 opacity-10"
          >
            SKILLS
          </motion.h2>
          <motion.p
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="text-gray-600 font-hand text-3xl sm:text-4xl mb-12 italic text-center"
          >
            my favorite tools
          </motion.p>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-10 max-w-3xl">
            {[
              { name: 'NEXT.js',  color: 'bg-black text-white',  dur: 4.1 },
              { name: 'REACT',    color: 'bg-blue-50',           dur: 4.7 },
              { name: 'THREE.js', color: 'bg-purple-50',         dur: 5.2 },
              { name: 'MOTION',   color: 'bg-pink-50',           dur: 4.4 },
              { name: 'D3.js',    color: 'bg-orange-50',         dur: 5.8 },
              { name: 'TAILWIND', color: 'bg-cyan-50',           dur: 4.9 },
            ].map((skill, i) => (
              <motion.div
                key={i}
                animate={{
                  y:      [0, i % 2 === 0 ? -8 : 8, 0],
                  rotate: [i % 2 === 0 ? -2 : 2, i % 2 === 0 ? 2 : -2, i % 2 === 0 ? -2 : 2],
                }}
                transition={{ duration: skill.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
                whileHover={{ 
                  scale: 1.08, 
                  rotate: 0,
                  boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  borderColor: '#262626'
                }}
                whileTap={{ scale: 0.95 }}
                className={`${skill.color} px-6 py-3 sm:px-8 sm:py-4 rounded-3xl border-2 border-gray-200 font-display font-black text-lg sm:text-xl shadow-xl sketchy-border cursor-pointer transition-colors duration-200`}
              >
                {skill.name}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      depth: 15000,
      content: (
        <SketchyCloud className="scale-100 sm:scale-110">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <motion.h2
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl sm:text-8xl font-display font-black text-gray-800 uppercase tracking-tighter leading-none opacity-20"
              >
                WORKS
              </motion.h2>
              <motion.p
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="text-gray-600 font-hand text-2xl sm:text-3xl -mt-4 text-center"
              >
                click the button to visit my projects
              </motion.p>
            </div>
            <motion.button
              onClick={() => navigate('/projects')}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gray-800 text-white rounded-3xl px-10 py-4 font-display font-black text-xl uppercase tracking-widest shadow-2xl hover:bg-black transition-colors sketchy-border"
            >
              Projects →
            </motion.button>
          </div>
        </SketchyCloud>
      ),
    },
    {
      depth: 20000,
      content: <ContactSection />,
    },
  ], [navigate]);

  return (
    <div className="relative bg-[#f8f8f8] text-gray-800 font-sans selection:bg-blue-100 h-screen w-screen overflow-hidden">
      
      {/* ── Cinematic entrance ───────────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: initialLoading ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="fixed inset-0 z-[200] pointer-events-none"
      >
        <motion.div
          animate={{ y: initialLoading ? '0%' : '-100%' }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 0.3 }}
          className="h-1/2 bg-white w-full border-b border-gray-100 flex items-end justify-center pb-24"
        >
          <div className="opacity-20 translate-y-12">
            <Cloud x="20%" y="0" z={0} scale={4} opacity={1} />
            <Cloud x="60%" y="0" z={0} scale={6} opacity={1} />
          </div>
        </motion.div>
        <motion.div
          animate={{ y: initialLoading ? '0%' : '100%' }}
          transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 0.3 }}
          className="h-1/2 bg-white w-full border-t border-gray-100 flex items-start justify-center pt-24"
        >
          <div className="opacity-20 -translate-y-12">
            <Cloud x="40%" y="0" z={0} scale={5} opacity={1} />
            <Cloud x="80%" y="0" z={0} scale={7} opacity={1} />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Top navigation ───────────────────────────────────────────────────── */}
      <NavBar depthValue={depthValue} activeSection={activeSection} />

      {/* ── Main 3-D canvas ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-sky-50/40 to-white overflow-hidden"
        style={{ perspective: '900px', perspectiveOrigin: '50% 55%' }}
      >
        <motion.div
          className="relative w-full h-full preserve-3d gpu"
          style={{
            rotateX:    smoothWorldRotateX,
            rotateZ:    smoothWorldRotateZ,
            scale:      smoothWorldScale,
            translateX: smoothWorldTranslateX,
            translateY: smoothWorldTranslateY,
            transformOrigin: '50% 50%',
            willChange: 'transform',
          }}
        >
          {/* Scene clouds */}
          <SceneCloud x="-12%" y="10%" z={-800}   scale={1.4}       duration={8}  delay={0}   />
          <SceneCloud x="72%"  y="5%"  z={-800}   scale={1.2} flip  duration={9}  delay={1.5} />
          <SceneCloud x="-8%"  y="55%" z={-1800}  scale={1.0}       duration={10} delay={0.8} />
          <SceneCloud x="76%"  y="50%" z={-1800}  scale={1.1} flip  duration={7}  delay={2.5} />

          <SceneCloud x="-14%" y="20%" z={-3200}  scale={1.3} flip  duration={9}  delay={1}   />
          <SceneCloud x="74%"  y="30%" z={-3200}  scale={1.5}       duration={8}  delay={0.5} />
          <SceneCloud x="5%"   y="70%" z={-4500}  scale={0.9}       duration={11} delay={2}   />
          <SceneCloud x="70%"  y="65%" z={-4500}  scale={1.0} flip  duration={10} delay={3}   />

          <SceneCloud x="-10%" y="15%" z={-6000}  scale={1.6}       duration={7}  delay={0.3} />
          <SceneCloud x="73%"  y="18%" z={-6000}  scale={1.3} flip  duration={9}  delay={1.8} />
          <SceneCloud x="-5%"  y="60%" z={-7500}  scale={1.1} flip  duration={8}  delay={1}   />
          <SceneCloud x="75%"  y="58%" z={-7500}  scale={1.4}       duration={10} delay={0}   />

          <SceneCloud x="-15%" y="25%" z={-9000}  scale={1.2}       duration={9}  delay={2}   />
          <SceneCloud x="72%"  y="22%" z={-9000}  scale={1.5} flip  duration={8}  delay={0.7} />
          <SceneCloud x="2%"   y="68%" z={-10500} scale={1.0} flip  duration={11} delay={1.5} />
          <SceneCloud x="74%"  y="72%" z={-10500} scale={0.9}       duration={7}  delay={3.5} />

          <SceneCloud x="-12%" y="18%" z={-12000} scale={1.4} flip  duration={8}  delay={1}   />
          <SceneCloud x="73%"  y="12%" z={-12000} scale={1.3}       duration={10} delay={0.3} />
          <SceneCloud x="-6%"  y="62%" z={-13500} scale={1.1}       duration={9}  delay={2.2} />
          <SceneCloud x="75%"  y="60%" z={-13500} scale={1.2} flip  duration={7}  delay={1.8} />

          <Balloon x="20%" y="40%" z={-4000}  color="bg-rose-400"  />
          <Balloon x="75%" y="25%" z={-11000} color="bg-amber-400" />
          <Kite    x="85%" y="45%" z={-7000}  />
          <Balloon x="5%"  y="65%" z={-15000} color="bg-sky-400"   />

          {/* Sections */}
          {scenes.map((scene, i) => (
            <Section
              key={i}
              startDepth={scene.depth}
              scrollProgress={smoothedDepth}
              totalCycle={TOTAL_CYCLE}
            >
              {scene.content}
            </Section>
          ))}
        </motion.div>
      </div>

      {/* ── Vignettes ────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)] z-10" />
      <motion.div className="fixed inset-0 pointer-events-none z-20" style={{ background: speedVignetteBg }} />

      {/* ── Section airplane indicator ────────────────────────────────────────── */}
      <SectionPlane activeSection={activeSection} depthValue={depthValue} />

      {/* ── 3D Crafted Airplane ──────────────────────────────────────────────── */}
      <PaperAirplane scrollVelocity={depthVelocity} smoothedDepth={smoothedDepth} />

      {/* ── Scroll hint — fades after first scroll ───────────────────────────── */}
      <ScrollHint smoothedDepth={smoothedDepth} />

    </div>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {initialLoading && (
          <LoadingScreen onComplete={() => setInitialLoading(false)} />
        )}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<Portfolio initialLoading={initialLoading} />} />
        <Route path="/projects" element={<ProjectsPage initialLoading={initialLoading} />} />
      </Routes>
    </>
  );
}
