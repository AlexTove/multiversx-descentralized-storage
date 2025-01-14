import { EnvironmentsEnum } from '@/types/sdkDappTypes';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqycdr8f5v4h4lfayexey6kxptsp6z7rzxrruqdvws6f';
export const API_URL = 'https://devnet-template-api.multiversx.com';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.devnet;
