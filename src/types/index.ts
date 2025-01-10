import type { Big as BigType } from 'big.js';
import { HalvingPhase } from '@/lib/constants';

export interface HalvingStats {
  currentIssuance: string;
  remainingAmount: string;
  estimatedDays: number;
  averageDailyIncrease: string;
  halvingPhase: HalvingPhase;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// 导出 Big 类型
export type Big = BigType; 