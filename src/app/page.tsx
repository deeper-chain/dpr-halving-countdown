'use client';

import { useEffect, useState, useCallback } from 'react';
import Big from 'big.js';
import HalvingStats from '@/components/HalvingStats';
import { getApi, getTotalIssuance, getCurrentBlock, getBlockHash, disconnectApi } from '@/lib/api';
import { calculateDailyIncrease, calculateRemainingDays, validateData } from '@/lib/utils';
import { BLOCKS_PER_DAY, CALCULATION_DAYS, MAX_RETRIES, API_TIMEOUT, RETRY_DELAY } from '@/lib/constants';
import type { HalvingStats as HalvingStatsType } from '@/types';

export default function Home() {
  const [stats, setStats] = useState<HalvingStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 添加请求超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
      });

      // 添加类型断言
      const [currentIssuance, currentBlock] = await Promise.race([
        Promise.all([
          getTotalIssuance(),
          getCurrentBlock()
        ]) as Promise<[string, number]>,
        timeoutPromise
      ]);

      // 数据验证
      if (!validateData(currentIssuance, currentBlock)) {
        throw new Error('Invalid data received');
      }

      // 计算目标金额
      const targetAmount = new Big(2_000_000_000).times(new Big(10).pow(18));
      const currentAmount = new Big(currentIssuance);
      const remainingAmount = targetAmount.minus(currentAmount).toFixed(0);

      // 获取历史数据
      const previousBlock = currentBlock - (BLOCKS_PER_DAY * CALCULATION_DAYS);
      const blockHash = await getBlockHash(previousBlock);
      const api = await getApi();
      const previousIssuance = await api.query.balances.totalIssuance.at(blockHash);

      // 计算每日增长
      const dailyIncrease = calculateDailyIncrease(
        currentIssuance,
        previousIssuance.toString(),
        CALCULATION_DAYS
      );

      // 计算估计天数
      const estimatedDays = calculateRemainingDays(dailyIncrease, remainingAmount);

      // 验证计算结果
      if (!Number.isFinite(estimatedDays)) {
        throw new Error('Invalid calculation result');
      }

      setStats({
        currentIssuance,
        remainingAmount,
        estimatedDays,
        averageDailyIncrease: dailyIncrease,
      });
      
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching stats:', err);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchStats, RETRY_DELAY * (retryCount + 1));
      } else {
        setError(
          err instanceof Error 
            ? `Failed to fetch data: ${err.message}` 
            : 'An unexpected error occurred'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchStats();
    
    // 添加网络状态监听
    const handleOnline = () => {
      setError(null);
      fetchStats();
    };
    const handleOffline = () => {
      setError('Network connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      disconnectApi().catch(console.error);
    };
  }, [fetchStats]);

  // 优化错误展示
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500/10 to-red-600/10">
        <div className="text-center p-8 rounded-lg backdrop-blur-lg border border-red-500/20">
          <h2 className="text-xl font-bold mb-4 text-red-500">Error</h2>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setRetryCount(0);
              fetchStats();
            }}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 优化加载状态
  if (!stats || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="text-gray-400">Loading statistics...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">
              Retry attempt {retryCount} of {MAX_RETRIES}...
            </p>
          )}
        </div>
      </div>
    );
  }

  return <HalvingStats stats={stats} />;
}
