import Big from 'big.js';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function validateBalance(balance: string): boolean {
  try {
    const num = new Big(balance);
    return num.gte(0) && num.lt(new Big(10).pow(50));
  } catch {
    return false;
  }
}

export function validateBlockNumber(blockNumber: number): boolean {
  return Number.isInteger(blockNumber) && blockNumber >= 0;
}

export function sanitizeNumber(value: string): string {
  return value.replace(/[^0-9.]/g, '');
}

export function validateTimeLeft(timeLeft: TimeLeft): boolean {
  const { days, hours, minutes, seconds } = timeLeft;
  return (
    Number.isInteger(days) && days >= 0 &&
    Number.isInteger(hours) && hours >= 0 && hours < 24 &&
    Number.isInteger(minutes) && minutes >= 0 && minutes < 60 &&
    Number.isInteger(seconds) && seconds >= 0 && seconds < 60
  );
} 