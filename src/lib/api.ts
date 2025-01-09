import { ApiPromise, WsProvider } from '@polkadot/api';
import { DEEPER_NETWORK_ENDPOINT } from './constants';

let api: ApiPromise | null = null;

export async function getApi() {
  if (!api) {
    const provider = new WsProvider(DEEPER_NETWORK_ENDPOINT);
    api = await ApiPromise.create({ provider });
  }
  return api;
}

export async function getTotalIssuance() {
  const api = await getApi();
  const result = await api.query.balances.totalIssuance();
  return result.toString();
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