import type { Big as BigType } from 'big.js';

export interface HalvingStats {
  currentIssuance: string;
  remainingAmount: string;
  estimatedDays: number;
  averageDailyIncrease: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// 导出 Big 类型
export type Big = BigType; 