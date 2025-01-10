import Big from 'big.js';
import { DECIMAL_PLACES, SECOND_HALVING_AMOUNT, THIRD_HALVING_AMOUNT, HALVING_CONFIG, HalvingPhase } from './constants';

// Convert from chain format (with 18 decimals) to human readable format
export function formatBalance(balance: string): string {
  const divisor = new Big(10).pow(DECIMAL_PLACES);
  return new Big(balance).div(divisor).toFixed(2);
}

// Calculate daily increase based on two balances and number of days
export function calculateDailyIncrease(
  currentBalance: string,
  previousBalance: string,
  days: number
): string {
  try {
    if (days <= 0) throw new Error('Invalid days parameter');
    
    const current = new Big(currentBalance);
    const previous = new Big(previousBalance);
    
    if (previous.gt(current)) {
      throw new Error('Previous balance greater than current balance');
    }
    
    const increase = current.minus(previous);
    return increase.div(days).toFixed(0);
  } catch (err) {
    console.error('Error calculating daily increase:', err);
    throw err;
  }
}

// Calculate remaining days until halving
export function calculateRemainingDays(
  dailyIncrease: string,
  remainingAmount: string
): number {
  try {
    const increase = new Big(dailyIncrease);
    const remaining = new Big(remainingAmount);
    
    if (increase.lte(0)) {
      throw new Error('Daily increase must be positive');
    }
    
    return Math.ceil(remaining.div(increase).toNumber());
  } catch (err) {
    console.error('Error calculating remaining days:', err);
    throw err;
  }
}

// Format large numbers with commas
export function formatNumber(num: string): string {
  return new Intl.NumberFormat().format(Number(formatBalance(num)));
}

// Calculate estimated completion date
export function getEstimatedDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// 添加数据验证函数
export function validateData(currentIssuance: string, currentBlock: number): boolean {
  try {
    // 验证发行量
    const issuance = new Big(currentIssuance);
    if (!issuance.gte(0)) return false;
    
    // 验证区块高度
    if (!Number.isInteger(currentBlock) || currentBlock < 0) return false;
    
    return true;
  } catch {
    return false;
  }
}

// 添加新的辅助函数
export function determineHalvingPhase(currentIssuance: string): HalvingPhase {
  const issuance = new Big(currentIssuance);
  
  if (issuance.gte(SECOND_HALVING_AMOUNT)) {
    return HalvingPhase.THIRD;
  }
  return HalvingPhase.SECOND;
}

// 修改计算目标金额的函数
export function getTargetAmount(phase: HalvingPhase): Big {
  return HALVING_CONFIG[phase].target;
}

// 修改计算剩余金额的函数
export function calculateRemainingAmount(currentIssuance: string, phase: HalvingPhase): string {
  const current = new Big(currentIssuance);
  const target = getTargetAmount(phase);
  return target.minus(current).toFixed(0);
} 