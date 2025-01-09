import { ApiPromise, WsProvider } from '@polkadot/api';
import { DEEPER_NETWORK_ENDPOINT } from './constants';

let api: ApiPromise | null = null;

export async function getApi(): Promise<ApiPromise> {
  if (!api || !api.isConnected) {
    const provider = new WsProvider(DEEPER_NETWORK_ENDPOINT);
    
    // 添加错误处理和重连逻辑
    provider.on('error', (error) => {
      console.warn('WebSocket error:', error);
      api = null; // 重置 API 实例
    });

    provider.on('disconnected', () => {
      console.warn('WebSocket disconnected');
      api = null;
    });

    // 创建 API 实例时添加自定义选项
    api = await ApiPromise.create({ 
      provider,
      throwOnConnect: true, // 连接错误时抛出异常
      throwOnUnknown: false, // 忽略未知的 RPC 方法
      noInitWarn: true, // 禁用初始化警告
    });
  }
  return api;
}

export async function getTotalIssuance(): Promise<string> {
  try {
    const api = await getApi();
    const result = await api.query.balances.totalIssuance();
    return result.toString();
  } catch (error) {
    console.error('Error getting total issuance:', error);
    throw error;
  }
}

export async function getCurrentBlock(): Promise<number> {
  try {
    const api = await getApi();
    const header = await api.rpc.chain.getHeader();
    return header.number.toNumber();
  } catch (error) {
    console.error('Error getting current block:', error);
    throw error;
  }
}

export async function getBlockHash(blockNumber: number): Promise<string> {
  try {
    const api = await getApi();
    const hash = await api.rpc.chain.getBlockHash(blockNumber);
    return hash.toString();
  } catch (error) {
    console.error('Error getting block hash:', error);
    throw error;
  }
}

// 添加清理函数
export async function disconnectApi(): Promise<void> {
  if (api && api.isConnected) {
    await api.disconnect();
    api = null;
  }
} 