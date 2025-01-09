'use client';

import { useEffect, useState } from 'react';
import Big from 'big.js';
import HalvingStats from '@/components/HalvingStats';
import { getApi, getTotalIssuance, getCurrentBlock, getBlockHash } from '@/lib/api';
import { calculateDailyIncrease, calculateRemainingDays } from '@/lib/utils';
import { BLOCKS_PER_DAY, CALCULATION_DAYS } from '@/lib/constants';
import type { HalvingStats as HalvingStatsType } from '@/types';

export default function Home() {
  const [stats, setStats] = useState<HalvingStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    try {
      // Get current total issuance
      const currentIssuance = await getTotalIssuance();
      
      // Calculate remaining amount until 20 billion
      const targetAmount = new Big(2_000_000_000)
        .times(new Big(10).pow(18));
      const currentAmount = new Big(currentIssuance);
      const remainingAmount = targetAmount
        .minus(currentAmount)
        .toFixed(0);
      
      // Get current block number
      const currentBlock = await getCurrentBlock();
      
      // Calculate block number from 7 days ago
      const previousBlock = currentBlock - (BLOCKS_PER_DAY * CALCULATION_DAYS);
      
      // Get block hash from 7 days ago
      const blockHash = await getBlockHash(previousBlock);
      
      // Get API instance
      const api = await getApi();
      
      // Get total issuance from 7 days ago
      const previousIssuance = await api.query.balances.totalIssuance.at(blockHash);
      
      // Calculate daily increase
      const dailyIncrease = calculateDailyIncrease(
        currentIssuance,
        previousIssuance.toString(),
        CALCULATION_DAYS
      );
      
      // Calculate estimated days
      const estimatedDays = calculateRemainingDays(
        dailyIncrease,
        remainingAmount,
      );

      setStats({
        currentIssuance,
        remainingAmount,
        estimatedDays,
        averageDailyIncrease: dailyIncrease,
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch halving statistics. Please try again later.');
    }
  }

  useEffect(() => {
    fetchStats();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      // Close WebSocket connection when component unmounts
      getApi().then(api => api.disconnect());
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center p-4">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return <HalvingStats stats={stats} />;
}
