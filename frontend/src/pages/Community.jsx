import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function Community() {
  const { spent } = useStore();

  // The user starts at 150 points when spent is 0
  // Every kg of CO2 spent drastically lowers their saved points to push them down the leaderboard
  const userScore = Math.max(0, 150 - (spent * 5)); 

  const mockUsers = [
    { id: 'u1', name: 'EcoWarrior', saved: 160 },
    { id: 'u2', name: 'GreenThumb', saved: 155 },
    // If spent = 0, User has 150 points and ranks #3 right here
    { id: 'u3', name: 'PlanetProtector', saved: 145 },
    { id: 'u4', name: 'SolarKing', saved: 135 },
    { id: 'u5', name: 'VeganVibes', saved: 125 },
    { id: 'u6', name: 'WindWalker', saved: 115 },
    { id: 'u7', name: 'EarthGuardian', saved: 105 },
    { id: 'u8', name: 'NatureLover', saved: 95 },
    { id: 'u9', name: 'RecyclePro', saved: 85 },
  ];

  // Combine user and mock users, sort by saved, assign ranks
  const leaderBoard = [...mockUsers, { id: 'me', name: 'You', saved: userScore, current: true }]
    .sort((a, b) => b.saved - a.saved)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-3xl font-heading font-bold">Community Challenges</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Collective Impact */}
        <div className="glass-card p-6 bg-gradient-to-br from-forest-dark to-emerald/20">
          <h3 className="text-xl font-medium mb-4">Collective Impact</h3>
          <div className="text-center py-6">
            <div className="text-5xl font-bold font-heading text-emerald mb-2">1,240 kg</div>
            <p className="text-white/60">CO2e saved by your neighborhood this week!</p>
          </div>
          <div className="mt-4 flex justify-center">
            <button className="px-6 py-2 bg-emerald text-forest-dark font-medium rounded-full hover:bg-sage">
              Share Impact
            </button>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-medium mb-4">Active Challenges</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-sage/30 bg-sage/10 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sage">Meatless Week</h4>
                  <p className="text-sm text-white/60">3 days remaining</p>
                </div>
                <button className="px-4 py-1 text-sm bg-white/10 rounded-full hover:bg-white/20">Joined</button>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-sage w-[60%]"></div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/5 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Public Transit Commute</h4>
                  <p className="text-sm text-white/60">Starts tomorrow</p>
                </div>
                <button className="px-4 py-1 text-sm bg-emerald text-forest-dark rounded-full hover:bg-sage">Join</button>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="text-xl font-medium mb-4">Neighborhood Leaderboard</h3>
          <p className="text-white/50 text-sm mb-4">Your rank dynamically updates based on your daily tracked footprint.</p>
          <div className="space-y-2">
            {leaderBoard.map((user) => (
              <div key={user.id} className={`flex justify-between items-center p-4 rounded-xl ${user.current ? 'bg-emerald/20 border border-emerald/50' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-gold text-forest-dark' : 'bg-white/10'}`}>
                    {user.rank}
                  </div>
                  <span className={`font-medium ${user.current ? 'text-emerald' : ''}`}>{user.name}</span>
                </div>
                <div className="font-bold">{user.saved.toFixed(1)} points</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
