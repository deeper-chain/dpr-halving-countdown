import { ApiPromise, WsProvider } from '@polkadot/api';
import { DEEPER_NETWORK_ENDPOINT, MAX_RETRY_ATTEMPTS, RETRY_DELAY } from './constants';
import { validateBalance } from './validation';

let api: ApiPromise | null = null;
let connectionAttempts = 0;

// 添加重试逻辑和错误处理
async function connectWithRetry(): Promise<ApiPromise> {
  try {
    const provider = new WsProvider(DEEPER_NETWORK_ENDPOINT);
    const newApi = await ApiPromise.create({ provider });
    connectionAttempts = 0;
    return newApi;
  } catch (err) {
    connectionAttempts++;
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      throw new Error(`Failed to connect to Deeper Network: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return connectWithRetry();
  }
}

export async function getApi() {
  if (!api || !api.isConnected) {
    api = await connectWithRetry();
  }
  return api;
}

// 添加数据验证和错误处理
export async function getTotalIssuance() {
  try {
    const api = await getApi();
    const result = await api.query.balances.totalIssuance();
    const balance = result.toString();
    
    // 验证返回的余额
    if (!validateBalance(balance)) {
      throw new Error('Invalid balance received');
    }
    
    return balance;
  } catch (error) {
    console.error('Error fetching total issuance:', error);
    throw error;
  }
}

export async function getBlockHash(blockNumber: number) {
  const api = await getApi();
  return await api.rpc.chain.getBlockHash(blockNumber);
}

export async function getCurrentBlock() {
  const api = await getApi();
  const header = await api.rpc.chain.getHeader();
  return header.number.toNumber();
} 