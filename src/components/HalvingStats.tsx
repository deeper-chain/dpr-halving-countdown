import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Big from 'big.js';
import type { HalvingStats as HalvingStatsType } from '@/types';
import { formatNumber, getEstimatedDate } from '@/lib/utils';

interface Props {
  stats: HalvingStatsType;
}

// Add a new component for animated number
const AnimatedNumber = ({ value }: { value: number }) => (
  <div className="relative h-24 overflow-hidden">
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="absolute inset-0 flex items-center justify-center text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
      >
        {value.toString().padStart(2, '0')}
      </motion.span>
    </AnimatePresence>
  </div>
);

export default function HalvingStats({ stats }: Props) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // 计算剩余天数（向上取整，因为是倒计时）
      const remainingDays = Math.ceil(
        new Big(stats.remainingAmount).div(new Big(stats.averageDailyIncrease)).toNumber()
      );
      
      // 计算目标时间
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + remainingDays);
      targetDate.setHours(0, 0, 0, 0); // 设置为当天的开始时间
      
      // 计算剩余时间
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    // 立即计算一次
    calculateTimeLeft();
    
    // 每秒更新一次
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [stats.remainingAmount, stats.averageDailyIncrease]); // 依赖项更新

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
          <div className="grid grid-cols-4 gap-8 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <motion.div
                key={unit}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatedNumber value={value} />
                <p className="text-gray-400 mt-4 text-lg capitalize">{unit}</p>
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
          <p>Estimated completion: {format(getEstimatedDate(Math.ceil(new Big(stats.remainingAmount).div(new Big(stats.averageDailyIncrease)).toNumber())), 'PPP')}</p>
          <p className="text-sm mt-2">Last updated: {format(new Date(), 'PPpp')}</p>
        </div>
      </div>
    </div>
  );
} 