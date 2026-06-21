import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TIPS = [
  "Every small change helps. Unplugging idle devices can save up to 10% on energy emissions.",
  "Consider washing your clothes in cold water to save energy used for heating.",
  "A plant-based meal just once a week can save roughly the equivalent of driving 1,160 miles a year.",
  "Using a reusable water bottle prevents hundreds of plastic bottles from entering landfills annually.",
  "Switching to LED light bulbs uses 75% less energy and lasts 25 times longer than incandescent lighting.",
  "Composting your food waste reduces methane emissions from landfills and creates nutrient-rich soil.",
  "Bringing your own shopping bags helps reduce the 100 billion plastic bags used annually in the US alone.",
  "Opting for public transit, walking, or biking over driving can halve your daily transport emissions.",
  "Lowering your thermostat by just 2 degrees in winter can significantly reduce your carbon footprint.",
  "Eating locally sourced produce reduces the heavy transportation emissions associated with imported food."
];

export default function Insights() {
  const { entries, spent } = useStore();
  
  const randomTip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

  const categoryTotals = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.carbon_kg;
    return acc;
  }, {});

  const data = Object.keys(categoryTotals).map(cat => ({
    name: cat.toUpperCase(),
    value: categoryTotals[cat]
  }));

  const COLORS = ['#2D6A4F', '#40916C', '#95D5B2', '#E9C46A', '#E76F51'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-3xl font-heading font-bold">Personal Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="text-xl font-medium mb-4 w-full text-left">Today's Category Breakdown</h3>
          {data.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0F0D', border: '1px solid #40916C', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {data.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    {entry.name}: {entry.value.toFixed(1)}kg
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/50 italic">
              No data logged today.
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-medium mb-4">Personalized Recommendations</h3>
          <div className="space-y-4">
            {data.find(d => d.name === 'FOOD' && d.value > 3) && (
              <div className="p-4 bg-emerald/10 border border-emerald/30 rounded-xl">
                <h4 className="font-bold text-emerald mb-1">Food Impact High</h4>
                <p className="text-sm text-white/80">Consider swapping one meat-based meal for a plant-based alternative to drastically cut today's emissions.</p>
              </div>
            )}
            {data.find(d => d.name === 'TRANSPORT' && d.value > 5) && (
              <div className="p-4 bg-emerald/10 border border-emerald/30 rounded-xl">
                <h4 className="font-bold text-emerald mb-1">Optimize Your Commute</h4>
                <p className="text-sm text-white/80">Taking public transit or carpooling could halve your transport footprint.</p>
              </div>
            )}
            {data.length === 0 && (
              <p className="text-white/50 italic">Start tracking activities to receive personalized recommendations!</p>
            )}
            
            {data.length > 0 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="font-bold text-sage mb-1">General Tip</h4>
                <p className="text-sm text-white/80">{randomTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Trends */}
        <div className="glass-card p-6 md:col-span-2">
           <h3 className="text-xl font-medium mb-4">Your Trend vs Average</h3>
           <div className="space-y-6">
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span>Your Daily Average</span>
                 <span className="font-bold text-emerald">{(spent || 4.2).toFixed(1)} kg CO2e</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-3">
                 <div className="bg-emerald h-3 rounded-full" style={{ width: `${Math.min(((spent||4.2) / 15) * 100, 100)}%` }}></div>
               </div>
             </div>
             
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span>National Average</span>
                 <span className="font-bold text-coral">15.5 kg CO2e</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-3">
                 <div className="bg-coral h-3 rounded-full" style={{ width: '100%' }}></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span>Paris Agreement Target (2030)</span>
                 <span className="font-bold text-sage">6.3 kg CO2e</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-3">
                 <div className="bg-sage h-3 rounded-full" style={{ width: '40%' }}></div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
