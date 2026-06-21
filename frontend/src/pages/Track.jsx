import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { trackActivity, getEmissionFactors } from '../api/carbon';

export default function Track() {
  const addEntry = useStore(state => state.addEntry);
  const [factors, setFactors] = useState(null);
  const [category, setCategory] = useState('food');
  const [activity, setActivity] = useState('vegetarian_meal');
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    getEmissionFactors().then(data => {
      if(data) setFactors(data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await trackActivity({ category, activity, amount: Number(amount) });
      addEntry({
        id: res.id,
        category,
        activity,
        amount: Number(amount),
        carbon_kg: res.carbon_kg,
        world_impact: res.world_impact,
        nudge: res.nudge
      });
      setFeedback({ type: 'success', msg: `Logged! +${res.carbon_kg} kg CO2e. ${res.nudge}` });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to log activity.' });
    }
    setLoading(false);
  };

  if (!factors) return <div className="p-8">Loading emission factors...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-heading font-bold">Track Activity</h2>
      
      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium mb-2">Category</label>
            <select 
              id="category-select"
              value={category} 
              onChange={(e) => {
                setCategory(e.target.value);
                setActivity(Object.keys(factors[e.target.value])[0]);
              }}
              className="w-full bg-forest-dark/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-emerald"
            >
              {Object.keys(factors).map(cat => (
                <option key={cat} value={cat} className="bg-forest-dark">{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activity-select" className="block text-sm font-medium mb-2">Activity</label>
            <select 
              id="activity-select"
              value={activity} 
              onChange={(e) => setActivity(e.target.value)}
              className="w-full bg-forest-dark/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-emerald"
            >
              {Object.keys(factors[category] || {}).map(act => (
                <option key={act} value={act} className="bg-forest-dark">{act.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount-input" className="block text-sm font-medium mb-2">Amount</label>
            <input 
              id="amount-input"
              type="number" 
              step="0.1"
              min="0.1"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-forest-dark/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-emerald"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
            className="w-full py-3 bg-emerald text-forest-dark font-bold rounded-lg hover:bg-sage transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Activity'}
          </button>
        </form>

        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className={`mt-6 p-4 rounded-lg border ${feedback.type === 'success' ? 'bg-emerald/20 border-emerald/50' : 'bg-coral/20 border-coral/50'}`}
          >
            {feedback.msg}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
