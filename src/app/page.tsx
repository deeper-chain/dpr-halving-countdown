'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Big from 'big.js';
import HalvingStats from '@/components/HalvingStats';
import { getApi, getTotalIssuance, getCurrentBlock, getBlockHash, disconnectApi } from '@/lib/api';
import { calculateDailyIncrease, calculateRemainingDays, validateData, determineHalvingPhase, calculateRemainingAmount } from '@/lib/utils';
import { BLOCKS_PER_DAY, CALCULATION_DAYS, MAX_RETRIES, API_TIMEOUT, RETRY_DELAY } from '@/lib/constants';
import type { HalvingStats as HalvingStatsType } from '@/types';
import { HalvingPhase } from '@/lib/constants';

export default function Home() {
  const [stats, setStats] = useState<HalvingStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const dataCache = useRef<{
    timestamp: number;
    data: HalvingStatsType;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      if (dataCache.current && 
          Date.now() - dataCache.current.timestamp < 5 * 60 * 1000) {
        setStats(dataCache.current.data);
        return;
      }

      setIsLoading(true);
      
      const [currentIssuance, currentBlock] = await Promise.race([
        Promise.all([
          getTotalIssuance(),
          getCurrentBlock()
        ]) as Promise<[string, number]>,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
        })
      ]);

      if (!validateData(currentIssuance, currentBlock)) {
        throw new Error('Invalid data received');
      }

      // 确定当前减半阶段
      const currentPhase = determineHalvingPhase(currentIssuance);
      
      // 计算剩余金额
      const remainingAmount = calculateRemainingAmount(currentIssuance, currentPhase);

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

      // 更新缓存
      dataCache.current = {
        timestamp: Date.now(),
        data: {
          currentIssuance,
          remainingAmount,
          estimatedDays,
          averageDailyIncrease: dailyIncrease,
          halvingPhase: currentPhase,
        }
      };

      setStats(dataCache.current.data);
      
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
    let isSubscribed = true;
    
    const fetchAndUpdate = async () => {
      if (!isSubscribed) return;
      await fetchStats();
    };

    fetchAndUpdate();
    
    // 使用 setTimeout 代替 setInterval，可以避免并发请求
    const scheduleNextUpdate = () => {
      setTimeout(() => {
        fetchAndUpdate().then(() => {
          if (isSubscribed) {
            scheduleNextUpdate();
          }
        });
      }, 5 * 60 * 1000);
    };

    scheduleNextUpdate();

    // 网络状态监听
    const handleOnline = () => {
      if (isSubscribed) {
        setError(null);
        fetchAndUpdate();
      }
    };
    
    const handleOffline = () => {
      if (isSubscribed) {
        setError('Network connection lost');
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 清理函数
    return () => {
      isSubscribed = false;
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
