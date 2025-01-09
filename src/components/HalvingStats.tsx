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
    const total = 20_000_000_000 * Math.pow(10, 18); // 20 billion with 18 decimals
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
    <div className="max-w-4xl mx-auto p-6 space-y-8 dark:bg-gray-900 dark:text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">
        DPR Second Halving Countdown
      </h1>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-8">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-2">Current Issuance</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(stats.currentIssuance)} DPR
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-2">Remaining Until Halving</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(stats.remainingAmount)} DPR
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-2">Daily Average Increase</h2>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {formatNumber(stats.averageDailyIncrease)} DPR
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-2">Time Until Halving</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {timeLeft}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Estimated completion: {estimatedDate}
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
        Last updated: {format(lastUpdate, 'PPpp')}
      </div>
    </div>
  );
} 