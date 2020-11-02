import React from 'react'

import { MarketMakerData } from '../../../../util/types'

import { MarketBuy } from './market_buy'

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  fetchMarketMakerData: () => Promise<void>
}

const MarketBuyContainer: React.FC<Props> = (props: Props) => {
  return <MarketBuy {...props} />
}

export { MarketBuyContainer }
