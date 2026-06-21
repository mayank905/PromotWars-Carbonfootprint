import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { deleteActivity, updateActivity } from '../api/carbon';
import { Trash2, Edit2 } from 'lucide-react';

export default function Dashboard() {
  const { budget, spent, entries, worldScore, removeEntry, updateEntry } = useStore();
  const [budgetStatus, setBudgetStatus] = useState('green');

  useEffect(() => {
    const percentage = (spent / budget) * 100;
    if (percentage > 90) setBudgetStatus('red');
    else if (percentage > 60) setBudgetStatus('amber');
    else setBudgetStatus('green');
  }, [spent, budget]);

  const statusColors = {
    green: 'text-emerald',
    amber: 'text-gold',
    red: 'text-coral'
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await deleteActivity(id);
      } catch (e) {
        // Silently proceed
      }
      removeEntry(id);
    }
  };

  const handleEdit = async (entry) => {
    const newAmount = window.prompt(`Edit amount for ${entry.activity.replace('_', ' ')}:`, entry.amount);
    if (newAmount !== null && !isNaN(newAmount) && Number(newAmount) > 0) {
      try {
        const updated = await updateActivity(entry.id, {
          category: entry.category,
          activity: entry.activity,
          amount: Number(newAmount)
        });
        updateEntry(entry.id, {
          amount: Number(newAmount),
          carbon_kg: updated.carbon_kg,
          world_impact: updated.world_impact,
          nudge: updated.nudge
        });
      } catch (e) {
        // Fallback calculation if backend is down
        const ratio = Number(newAmount) / entry.amount;
        const newCarbon = entry.carbon_kg * ratio;
        const newImpact = entry.category === 'food' ? 2.0 - newCarbon : 1.0 - newCarbon;
        updateEntry(entry.id, {
          amount: Number(newAmount),
          carbon_kg: newCarbon,
          world_impact: newImpact
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold">Dashboard</h2>
          <p className="text-white/60 mt-1">Here is your impact for today.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Meter */}
        <div className="glass-card p-6 md:col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium mb-2">Daily Carbon Budget</h3>
            <div className="text-4xl font-bold font-heading mb-1">
              <span className={statusColors[budgetStatus]}>{spent.toFixed(1)}</span>
              <span className="text-white/40 text-2xl"> / {budget} kg</span>
            </div>
            <p className="text-white/60">
              {budget - spent > 0 
                ? `You have ${(budget - spent).toFixed(1)} kg remaining today.` 
                : `You are over budget by ${(spent - budget).toFixed(1)} kg.`}
            </p>
          </div>
          
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-white/10">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="64" cy="64" r="56" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                className={statusColors[budgetStatus]}
                strokeDasharray="351"
                strokeDashoffset={351 - (351 * Math.min(spent/budget, 1))}
              />
            </svg>
            <span className="text-xl font-bold">{Math.round((spent/budget)*100)}%</span>
          </div>
        </div>

        {/* World Status */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-medium text-white/80 mb-2">World Health</h3>
          <div className="text-5xl mb-4">
            {worldScore > 80 ? '🌍' : worldScore > 40 ? '🌎' : '🥀'}
          </div>
          <div className="text-2xl font-bold text-emerald">{worldScore.toFixed(0)} / 100</div>
          <Link to="/world" className="mt-4 text-sm text-sage hover:underline">View Your World</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Recent Activity */}
         <div className="glass-card p-6">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-medium">Recent Activity</h3>
             <Link to="/track" className="text-sage text-sm hover:underline">Log New</Link>
           </div>
           {entries.length === 0 ? (
             <p className="text-white/40 italic py-4">No activities logged today.</p>
           ) : (
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
               {entries.map(entry => (
                 <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10 group">
                   <div>
                     <p className="font-medium capitalize">{entry.activity.replace('_', ' ')}</p>
                     <p className="text-xs text-white/50 capitalize">{entry.category} • amount: {entry.amount}</p>
                   </div>
                   <div className="flex items-center gap-4">
                     <p className="font-bold text-coral">+{entry.carbon_kg.toFixed(2)} kg</p>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(entry)} className="p-1 hover:bg-white/10 rounded text-sage">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(entry.id)} className="p-1 hover:bg-white/10 rounded text-coral">
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Nudge/Tip */}
         <div className="glass-card p-6 bg-gradient-to-br from-forest-dark to-emerald/20 border-emerald/30">
           <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
             <span className="text-sage">💡</span> Daily Insight
           </h3>
           <p className="text-lg leading-relaxed">
             {entries.length > 0 && entries[0].nudge 
                ? entries[0].nudge 
                : "Tracking your meals is a great way to start. A plant-based meal can save up to 5kg of CO2 compared to a beef meal!"}
           </p>
           <div className="mt-6">
             <p className="text-sm text-white/60 mb-2">Your actions so far equal:</p>
             <p className="font-medium text-emerald">≈ {(spent / 0.192).toFixed(1)} km driven</p>
             <p className="font-medium text-emerald">≈ {((spent / 22) * 365).toFixed(1)} trees needed to offset for a year</p>
           </div>
         </div>
      </div>
    </motion.div>
  );
}
