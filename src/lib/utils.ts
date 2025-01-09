import Big from 'big.js';
import { DECIMAL_PLACES } from './constants';

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
  const current = new Big(currentBalance);
  const previous = new Big(previousBalance);
  const increase = current.minus(previous);
  return increase.div(days).toFixed(0);
}

// Calculate remaining days until halving
export function calculateRemainingDays(
  dailyIncrease: string,
  remainingAmount: string,
): number {
  const daily = new Big(dailyIncrease);
  const remaining = new Big(remainingAmount);
  
  if (daily.eq(0)) {
    return Infinity;
  }
  
  return Math.ceil(Number(remaining.div(daily).toFixed(2)));
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