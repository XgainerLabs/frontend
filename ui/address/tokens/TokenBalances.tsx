import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import { ZERO } from 'lib/consts';
import getCurrencyValue from 'lib/getCurrencyValue';
import { currencyUnits } from 'lib/units';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import { getTokensTotalInfo } from '../utils/tokenUtils';
import useFetchTokens from '../utils/useFetchTokens';
import TokenBalancesItem from './TokenBalancesItem';

const TokenBalances = () => {
  const router = useRouter();

  const hash = router.query.hash?.toString();

  const addressQuery = useApiQuery('address', {
    pathParams: { hash },
    queryOptions: { enabled: Boolean(hash), refetchOnMount: false },
  });

  const tokenQuery = useFetchTokens({ hash });

  if (addressQuery.isError || tokenQuery.isError) {
    return <DataFetchAlert/>;
  }

  const addressData = addressQuery.data;
  const { valueStr: nativeValue, usdBn: nativeUsd } = getCurrencyValue({
    value: addressData?.coin_balance || '0',
    accuracy: 8,
    accuracyUsd: 2,
    exchangeRate: addressData?.exchange_rate,
    decimals: String(config.chain.currency.decimals),
  });

  const tokensInfo = getTokensTotalInfo(tokenQuery.data);
  const prefix = tokensInfo.isOverflow ? '>' : '';
  const tokensNumText = tokensInfo.num > 0 ?
    `${ prefix }${ tokensInfo.num } ${ tokensInfo.num > 1 ? 'tokens' : 'token' }` :
    '';

  return (
    <Flex columnGap={ 3 } rowGap={ 3 } mt={{ base: '6px', lg: 0 }} flexDirection={{ base: 'column', lg: 'row' }}>
      <TokenBalancesItem
        name={`${ currencyUnits.ether } Balance` }
        value={`${ nativeValue } ${ currencyUnits.ether }`}
        isLoading={ addressQuery.isPending || tokenQuery.isPending }
      />
      <TokenBalancesItem
        name="Tokens"
        value={
          tokensNumText
        }
        isLoading={ addressQuery.isPending || tokenQuery.isPending }
      />
    </Flex>
  );
};

export default TokenBalances;
