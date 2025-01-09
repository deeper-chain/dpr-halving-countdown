import { ApiPromise, WsProvider } from '@polkadot/api';
import { DEEPER_NETWORK_ENDPOINT } from './constants';

let api: ApiPromise | null = null;

export async function getApi(): Promise<ApiPromise> {
  if (!api || !api.isConnected) {
    const provider = new WsProvider(DEEPER_NETWORK_ENDPOINT);
    api = await ApiPromise.create({ provider });
  }
  return api;
}

export async function getTotalIssuance(): Promise<string> {
  const api = await getApi();
  const result = await api.query.balances.totalIssuance();
  return result.toString();
}

export async function getCurrentBlock(): Promise<number> {
  const api = await getApi();
  const header = await api.rpc.chain.getHeader();
  return header.number.toNumber();
}

export async function getBlockHash(blockNumber: number): Promise<string> {
  const api = await getApi();
  const hash = await api.rpc.chain.getBlockHash(blockNumber);
  return hash.toString();
} 