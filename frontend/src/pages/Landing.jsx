import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-forest-dark via-[#111A15] to-[#0D1510] relative overflow-hidden">
      {/* Background Particles Placeholder */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
          Your choices shape a world. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald to-sage">Watch it grow.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          EcoSphere is more than a carbon calculator. It's a living ecosystem that thrives when you make sustainable choices. Start tracking today.
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-block px-8 py-4 bg-gradient-to-r from-emerald to-sage text-forest-dark font-bold text-lg rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(64,145,108,0.5)]"
        >
          Enter Your World
        </Link>
      </motion.div>
    </div>
  );
}
