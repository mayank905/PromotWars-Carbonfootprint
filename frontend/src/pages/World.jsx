import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function World() {
  const { worldScore } = useStore();

  // Score is bounded between 0 and 100
  const score = Math.max(0, Math.min(100, worldScore));
  
  // Continuous properties based on score
  // Trees: 100 = 33 trees. 0 = 0 trees.
  const numTrees = Math.floor((score / 100) * 33);
  
  // Brightness: 100 = 1.1 (bright). 0 = 0.4 (dark)
  const brightness = 0.4 + (score / 100) * 0.7;
  
  // Grayscale: 100 = 0. 0 = 0.8 (greyish dead)
  const grayscale = 0.8 - (score / 100) * 0.8; 
  
  // Sepia: 100 = 0. 0 = 0.5 (brownish dead)
  const sepia = 0.5 - (score / 100) * 0.5;

  // Smog/Pollution: 100 = 0 (no smog). 0 = 0.9 (heavy smog)
  const smogOpacity = 0.9 - (score / 100) * 0.9;

  return (
    <div className="space-y-6 h-full flex flex-col min-h-[600px]">
      <header>
        <h2 className="text-3xl font-heading font-bold">My Living World</h2>
        <p className="text-white/60 mt-1">
          At 100 Health, your world is fully bright and thriving with trees. As health drops to 0, pollution increases and trees disappear.
        </p>
      </header>

      <div className="flex-1 rounded-3xl overflow-hidden relative shadow-2xl border-2 border-white/10 isolate">
        
        {/* Base World Container - filters applied here for gradient transitions */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#1e90ff] via-[#87ceeb] to-[#e0f7fa] transition-all duration-1000"
          style={{
            filter: `grayscale(${grayscale}) sepia(${sepia}) brightness(${brightness})`
          }}
        >
          {/* Sun */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
            className="absolute top-12 right-20 w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_80px_rgba(253,224,71,0.8)]"
            style={{ opacity: score / 100 }}
          />

          {/* Clouds */}
          <motion.div 
            animate={{ x: [0, 100, 0] }} 
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="absolute top-20 left-10 flex gap-4 opacity-80"
          >
            <div className="w-24 h-8 bg-white rounded-full relative">
               <div className="absolute -top-4 left-4 w-12 h-12 bg-white rounded-full"></div>
               <div className="absolute -top-6 left-10 w-16 h-16 bg-white rounded-full"></div>
            </div>
          </motion.div>

          {/* Birds */}
          {score > 50 && (
            <motion.div 
              animate={{ x: [-50, 800], y: [0, -30, 20, -10] }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute top-32 left-0 text-3xl z-20"
            >
              🦅 🕊️
            </motion.div>
          )}

          {/* Mountains */}
          <div className="absolute bottom-1/3 w-full h-48 flex items-end">
            <div className="w-1/2 h-full rounded-t-full -ml-20 bg-[#2e7d32]"></div>
            <div className="w-3/4 h-3/4 rounded-t-full -ml-32 bg-[#388e3c]"></div>
            <div className="w-1/2 h-full rounded-t-full -ml-20 bg-[#43a047]"></div>
          </div>

          {/* Ground */}
          <div className="absolute bottom-0 w-full h-1/3 bg-[#388e3c] shadow-[inset_0_20px_20px_rgba(0,0,0,0.1)] z-10">
            
            {/* Water feature */}
            <div className="absolute bottom-0 right-10 w-1/3 h-full rounded-tl-full bg-[#0288d1] shadow-inner opacity-90"></div>

            {/* Cabin */}
            {score > 10 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-16 left-24 z-20"
              >
                <div className="w-20 h-16 bg-[#8d6e63] relative shadow-lg">
                  <div className="absolute -top-10 -left-2 w-24 h-12 bg-[#5d4037] transform origin-bottom -rotate-12"></div>
                  <div className="absolute -top-10 -right-2 w-24 h-12 bg-[#4e342e] transform origin-bottom rotate-12"></div>
                  <div className="absolute bottom-0 left-6 w-8 h-10 bg-[#3e2723]"></div>
                  {score > 50 && <div className="absolute top-4 left-2 w-4 h-4 bg-yellow-200 shadow-[0_0_10px_rgba(253,224,71,0.8)]"></div>}
                </div>
              </motion.div>
            )}

            {/* Trees array generated dynamically */}
            {[...Array(33)].map((_, i) => {
              const isVisible = i < numTrees;
              if (!isVisible) return null;
              
              const leftPos = 5 + (i * 17) % 85; 
              const bottomPos = 10 + (i * 7) % 30;
              const scale = 0.6 + (i % 5) * 0.15;
              
              return (
                <motion.div 
                  key={`tree-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="absolute z-20 origin-bottom"
                  style={{ 
                    bottom: `${bottomPos}%`, 
                    left: `${leftPos}%` 
                  }}
                >
                  <div className="w-3 h-16 bg-[#5d4037] mx-auto rounded-t-sm" />
                  <div className="w-20 h-20 rounded-full -mt-14 shadow-lg bg-[#2e7d32]" />
                  <div className="w-16 h-16 rounded-full absolute top-2 -left-4 shadow-lg bg-[#388e3c]" />
                  <div className="w-16 h-16 rounded-full absolute top-2 left-6 shadow-lg bg-[#1b5e20]" />
                </motion.div>
              );
            })}
          </div>

          {/* Floating Particles (Sparkles when thriving) */}
          {score > 70 && (
            <div className="absolute inset-0 pointer-events-none z-30">
               {[...Array(Math.floor((score - 70) / 2))].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 rounded-full bg-white/60 shadow-[0_0_5px_#fff]"
                    animate={{
                      y: [0, -100],
                      x: [0, (i % 2 === 0 ? 50 : -50)],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    style={{
                      bottom: `${(i * 13) % 40}%`,
                      left: `${(i * 17) % 100}%`
                    }}
                  />
               ))}
            </div>
          )}
        </div>

        {/* Smog Overlay - Increases linearly as score drops to 0 */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-600/70 mix-blend-multiply pointer-events-none z-40 transition-opacity duration-1000"
          style={{ opacity: smogOpacity }}
        />

        {/* Score Indicator */}
        <div className="absolute top-6 right-6 bg-forest-dark/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center z-50">
          <div className="text-sm font-medium uppercase tracking-wider text-sage mb-1">Ecosystem Health</div>
          <div className="text-5xl font-bold font-heading text-emerald">
            {score.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
