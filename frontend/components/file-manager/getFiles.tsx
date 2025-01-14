import { useEffect, useState } from 'react';

import { useGetNetworkConfig } from '@/hooks';
import { ContractFunction, ResultsParser, ProxyNetworkProvider } from '@/utils';
import { smartContract } from '@/utils/smartContract';

const resultsParser = new ResultsParser();

export const useGetFilesTransaction = () => {
  const { network } = useGetNetworkConfig();
  // const [pingAmount, setPingAmount] = useState<string>('0');

  const proxy = new ProxyNetworkProvider(network.apiAddress);

  // const getPingAmount = async () => {
  //   try {
  //     const query = smartContract.createQuery({
  //       func: new ContractFunction('files')
  //     });
  //     const queryResponse = await proxy.queryContract(query);

  //     const endpointDefinition = smartContract.getEndpoint('files');

  //     const { firstValue: amount } = resultsParser.parseQueryResponse(
  //       queryResponse,
  //       endpointDefinition
  //     );
  //     console.log(amount);
  //     return '';
  //     // setPingAmount(amount?.valueOf()?.toString(10));
  //   } catch (err) {
  //     console.error('Unable to call getPingAmount', err);
  //   }
  // };

  // useEffect(() => {
  //   getPingAmount();
  // }, []);

  return 'pingAmount';
};
