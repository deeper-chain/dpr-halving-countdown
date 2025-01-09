import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { HalvingStats as HalvingStatsType } from '@/types';
import { formatNumber, getEstimatedDate } from '@/lib/utils';

interface Props {
  stats: HalvingStatsType;
}

export default function HalvingStats({ stats }: Props) {
  const [timeLeft, setTimeLeft] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [estimatedDate, setEstimatedDate] = useState<string>('');

  useEffect(() => {
    const days = stats.estimatedDays;
    const hours = Math.floor((days % 1) * 24);
    setTimeLeft(`${Math.floor(days)} days ${hours} hours`);
    setLastUpdate(new Date());

    // Calculate progress percentage
    const total = 20_000_000_000 * Math.pow(10, 18);
    const current = BigInt(stats.currentIssuance);
    const percentage = Number((current * BigInt(100)) / BigInt(total));
    setProgress(percentage);

    // 处理预计完成日期
    try {
      const date = getEstimatedDate(days);
      setEstimatedDate(format(date, 'PPP'));
    } catch (err) {
      console.error('Error formatting date:', err);
      setEstimatedDate('Date calculation error');
    }
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-12 px-4">
      {/* Main countdown section */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <h1 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          DPR Second Halving Countdown
        </h1>
        
        {/* Circular progress with countdown */}
        <div className="relative w-64 h-64 mx-auto mb-12">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-gray-700"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r="120"
              cx="128"
              cy="128"
            />
            <circle
              className="text-blue-500"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r="120"
              cx="128"
              cy="128"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-bold">{Math.floor(stats.estimatedDays)}</div>
            <div className="text-xl">Days Left</div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Current Issuance</h2>
          <p className="text-3xl font-bold text-blue-400">
            {formatNumber(stats.currentIssuance)} DPR
          </p>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Remaining Until Halving</h2>
          <p className="text-3xl font-bold text-green-400">
            {formatNumber(stats.remainingAmount)} DPR
          </p>
        </div>

        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Daily Average Increase</h2>
          <p className="text-3xl font-bold text-purple-400">
            {formatNumber(stats.averageDailyIncrease)} DPR
          </p>
        </div>
      </div>

      {/* Estimated completion date */}
      <div className="text-center mt-12 text-gray-400">
        <p>Estimated completion: {estimatedDate}</p>
        <p className="text-sm mt-2">Last updated: {format(lastUpdate, 'PPpp')}</p>
      </div>
    </div>
  );
} 