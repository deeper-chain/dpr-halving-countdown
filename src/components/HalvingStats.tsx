import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { HalvingStats as HalvingStatsType } from '@/types';
import { formatNumber, getEstimatedDate } from '@/lib/utils';

interface Props {
  stats: HalvingStatsType;
}

export default function HalvingStats({ stats }: Props) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date(now.getTime() + stats.estimatedDays * 24 * 60 * 60 * 1000);
      const diff = target.getTime() - now.getTime();
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [stats.estimatedDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#20295f] to-[#0a192f] text-white">
      {/* Particle effect background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particles-container" /> {/* 需要添加粒子效果组件 */}
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          DPR Second Halving Countdown
        </h1>

        {/* Main countdown timer */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <motion.div
                key={unit}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    {value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <p className="text-gray-400 mt-2 capitalize">{unit}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-gray-400 mb-3">Current Issuance</h2>
            <p className="text-3xl font-bold text-blue-400">
              {formatNumber(stats.currentIssuance)} DPR
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-gray-400 mb-3">Remaining Until Halving</h2>
            <p className="text-3xl font-bold text-green-400">
              {formatNumber(stats.remainingAmount)} DPR
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-gray-400 mb-3">Daily Average Increase</h2>
            <p className="text-3xl font-bold text-purple-400">
              {formatNumber(stats.averageDailyIncrease)} DPR
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-16 text-gray-400">
          <p>Estimated completion: {format(getEstimatedDate(stats.estimatedDays), 'PPP')}</p>
          <p className="text-sm mt-2">Last updated: {format(new Date(), 'PPpp')}</p>
        </div>
      </div>
    </div>
  );
} 