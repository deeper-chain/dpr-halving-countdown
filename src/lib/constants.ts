import Big from 'big.js';

export const DEEPER_NETWORK_ENDPOINT = 'wss://mainnet-full.deeper.network';

export const BLOCKS_PER_DAY = 17280;
export const DECIMAL_PLACES = 18;
export const TARGET_HALVING_AMOUNT = new Big(2_000_000_000).times(new Big(10).pow(18));
export const CALCULATION_DAYS = 7;

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 2000;
export const MAX_WEBSOCKET_RECONNECT_ATTEMPTS = 5;
export const DATA_REFRESH_INTERVAL = 60000;

export const MAX_RETRIES = 3;
export const API_TIMEOUT = 15000;
export const REFRESH_INTERVAL = 5 * 60 * 1000;

export type BigNumber = Big; 