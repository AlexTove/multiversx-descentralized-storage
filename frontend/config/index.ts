import { EnvironmentsEnum } from '@/types/sdkDappTypes';

export * from './sharedConfig';

export const contractAddress = process.env.CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqlydm7pxum5us8v3aa2f7r6rk47xy2wr4d8ss36mp0h';

export const API_URL = 'https://devnet-template-api.multiversx.com';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.devnet;
