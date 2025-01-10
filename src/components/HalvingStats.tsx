import { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Big from 'big.js';
import type { HalvingStats as HalvingStatsType } from '@/types';
import { formatNumber, getEstimatedDate } from '@/lib/utils';
import { NetworkBackground } from './NetworkBackground';
import { sanitizeNumber, validateTimeLeft } from '@/lib/validation';
import { HalvingPhase, HALVING_CONFIG } from '@/lib/constants';
import { memo } from 'react';

interface Props {
  stats: HalvingStatsType & {
    halvingPhase: HalvingPhase;
  };
}

// Particle effect component
const ParticleEffect = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at center, rgba(96,165,250,0.03) 0%, transparent 70%)',
      }}
    >
      {/* Add dynamic particles here */}
    </motion.div>
  </div>
);
ParticleEffect.displayName = 'ParticleEffect';

// Enhanced AnimatedNumber with improved 3D effect
const AnimatedNumber = memo(({ value }: { value: number }) => (
  <div className="relative h-40 perspective-[1000px]">
    <AnimatePresence mode="wait">
      <motion.div
        key={value}
        initial={{ rotateX: -120, y: 40, opacity: 0, scale: 0.9 }}
        animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
        exit={{ rotateX: 120, y: -40, opacity: 0, scale: 0.9 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 1.5
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span 
          className="text-8xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(96, 165, 250, 0.4)',
            filter: 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.2))'
          }}
        >
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
    </AnimatePresence>
    
    {/* Add ripple effect on number change */}
    <motion.div
      key={`ripple-${value}`}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"
    />
  </div>
));
AnimatedNumber.displayName = 'AnimatedNumber';

// 添加类型定义
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  unit: string;
}

// 使用 memo 优化纯展示组件
const StatCard = memo(({ label, value, color, unit }: StatCardProps) => {
  // 使用 useMemo 缓存格式化的数值
  const formattedValue = useMemo(() => formatNumber(value), [value]);
  
  return (
    <motion.div
      className="group relative h-full"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-white/[0.1] rounded-2xl blur-xl group-hover:opacity-70 transition-opacity" />
      <div 
        className="relative h-full rounded-2xl backdrop-blur-xl p-8 border border-white/[0.05] flex flex-col justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <h2 className="text-gray-400 text-lg font-medium mb-4 tracking-wide">{label}</h2>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {formattedValue}
          </p>
          <span className={`text-xl bg-gradient-to-r ${color} bg-clip-text text-transparent font-medium`}>
            {unit}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
StatCard.displayName = 'StatCard';

export default function HalvingStats({ stats }: Props) {
  const { halvingPhase } = stats;
  const phaseConfig = HALVING_CONFIG[halvingPhase];
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [error, setError] = useState<string | null>(null);

  const calculateTimeLeft = useCallback(() => {
    let animationFrameId: number;
    let isRunning = true;
    
    const updateTime = () => {
      if (!isRunning) return;

      try {
        // 验证输入数据
        if (!stats.remainingAmount || !stats.averageDailyIncrease) {
          throw new Error('Invalid input data');
        }

        const remainingDays = Math.ceil(
          new Big(sanitizeNumber(stats.remainingAmount))
            .div(new Big(sanitizeNumber(stats.averageDailyIncrease)))
            .toNumber()
        );
        
        // 计算目标时间
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + remainingDays);
        targetDate.setHours(0, 0, 0, 0); // 设置为当天的开始时间
        
        // 计算剩余时间
        const now = new Date().getTime();
        const difference = targetDate.getTime() - now;
        
        if (difference > 0) {
          const newTimeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          };
          
          // 验证计算结果
          if (!validateTimeLeft(newTimeLeft)) {
            throw new Error('Invalid time calculation');
          }
          
          setTimeLeft(newTimeLeft);
          setError(null);
        }
        
        if (document.visibilityState === 'visible') {
          animationFrameId = requestAnimationFrame(updateTime);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // 处理页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isRunning = true;
        updateTime(); // 重新开始动画
      } else {
        isRunning = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }
    };

    // 添加可见性变化监听
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 开始初始更新
    updateTime();
    
    // 清理函数
    return () => {
      isRunning = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [stats]);

  useEffect(() => {
    const cleanup = calculateTimeLeft();
    return () => {
      cleanup();
    };
  }, [calculateTimeLeft]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#1a1f3c] to-[#0a192f]">
      {error && (
        <div className="absolute top-4 right-4 bg-red-500/20 text-red-100 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {/* Add network background */}
      <NetworkBackground />
      
      {/* Existing particle effect */}
      <ParticleEffect />
      
      {/* Add subtle aurora effect */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 to-transparent opacity-50 animate-pulse" />

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center items-center">
        {/* Enhanced title with better 3D effect */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-bold text-center mb-24 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 50px rgba(96, 165, 250, 0.3)',
            filter: 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.2))'
          }}
        >
          DPR {phaseConfig.title} Countdown
        </motion.h1>

        {/* Enhanced countdown timer with improved layout */}
        <div className="w-full max-w-6xl mx-auto mb-16 sm:mb-28">
          <div className="grid grid-cols-4 gap-2 xs:gap-4 sm:gap-6 md:gap-8">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div
                key={unit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
                whileHover={{ scale: 1.02, z: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-2xl blur-xl group-hover:opacity-70 transition-all duration-300" />
                <div 
                  className="relative overflow-hidden rounded-lg sm:rounded-2xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.05]"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transform: 'translateZ(0)'
                  }}
                >
                  <div className="p-3 xs:p-4 sm:p-6 md:p-8">
                    <AnimatedNumber value={value} />
                    <p className="text-gray-400/90 mt-2 sm:mt-4 text-sm sm:text-lg font-medium tracking-wider text-center uppercase">
                      {unit}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats cards with consistent height and enhanced effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {[
            { 
              label: 'Current Issuance', 
              value: stats.currentIssuance.toString(), 
              color: 'from-blue-400 via-blue-500 to-blue-600',
              unit: 'DPR'
            },
            { 
              label: 'Remaining Until Halving', 
              value: stats.remainingAmount.toString(), 
              color: 'from-green-400 via-green-500 to-green-600',
              unit: 'DPR'
            },
            { 
              label: 'Daily Average Increase', 
              value: stats.averageDailyIncrease.toString(), 
              color: 'from-purple-400 via-purple-500 to-purple-600',
              unit: 'DPR'
            }
          ].map(({ label, value, color, unit }) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              color={color}
              unit={unit}
            />
          ))}
        </div>

        {/* Enhanced footer with better typography */}
        <motion.div 
          className="text-center mt-20 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-lg text-gray-400/90 font-medium tracking-wide">
            Estimated completion: {format(getEstimatedDate(Math.ceil(new Big(stats.remainingAmount).div(new Big(stats.averageDailyIncrease)).toNumber())), 'PPP')}
          </p>
          <p className="text-sm text-gray-400/70 tracking-wider">
            Last updated: {format(new Date(), 'PPpp')}
          </p>
        </motion.div>
      </div>
    </div>
  );
} 