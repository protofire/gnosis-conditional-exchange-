import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory, useLocation, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected, useConnectedWeb3Context } from '../../../../contexts'
import { useGraphMarketUserTxData } from '../../../../hooks'
import { useRealityLink } from '../../../../hooks/useRealityLink'
import { MarketBondContainer } from '../../../../pages/market_sections/market_bond_container'
import { MarketBuyContainer } from '../../../../pages/market_sections/market_buy_container'
import { MarketHistoryContainer } from '../../../../pages/market_sections/market_history_container'
import { MarketPoolLiquidityContainer } from '../../../../pages/market_sections/market_pool_liquidity_container'
import { MarketSellContainer } from '../../../../pages/market_sections/market_sell_container'
import { MarketVerifyContainer } from '../../../../pages/market_sections/market_verify_container'
import { getNativeAsset, networkIds } from '../../../../util/networks'
import { getUnit, isDust } from '../../../../util/tools'
import { BalanceItem, MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { MarketScale } from '../../common_sections/card_bottom_details/market_scale'
import { MarketTopDetailsOpen } from '../../common_sections/card_top_details/market_top_details_open'
import { WarningMessage } from '../../common_sections/message_text/warning_message'
import { OutcomeTable } from '../../common_sections/tables/outcome_table'
import { ViewCard } from '../../common_sections/view_card'
import { MarketNavigation } from '../../market_navigation'

export const TopCard = styled(ViewCard)`
  padding: 24px;
  padding-bottom: 0;
  margin-bottom: 24px;
`

export const BottomCard = styled(ViewCard)``

export const StyledButtonContainer = styled(ButtonContainer)`
  margin: 0 -24px;
  margin-bottom: -1px;
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.border {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const MarketBottomNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

const MarketBottomFinalizeNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;
  & > * + * {
    margin-left: 12px;
  }
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  isScalar: boolean
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const Wrapper = (props: Props) => {
  const { fetchGraphMarketMakerData, isScalar, marketMakerData } = props
  const realitioBaseUrl = useRealityLink()
  const history = useHistory()
  const location = useLocation()
  const context = useConnectedWeb3Context()
  const cpk = context.cpk

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    creator,
    fee,
    isQuestionFinalized,
    outcomeTokenMarginalPrices,
    payouts,
    question,
    scalarHigh,
    scalarLow,
    totalPoolShares,
  } = marketMakerData
  const { library: provider, networkId } = context

  const nativeAsset = getNativeAsset(networkId)
  const initialBondAmount =
    networkId === networkIds.XDAI ? parseUnits('10', nativeAsset.decimals) : parseUnits('0.01', nativeAsset.decimals)

  const [bondNativeAssetAmount, setBondNativeAssetAmount] = useState<BigNumber>(
    question.currentAnswerBond ? new BigNumber(question.currentAnswerBond).mul(2) : initialBondAmount,
  )

  const [blocktime, setBlocktime] = useState<number>()

  const isQuestionOpen = question.resolution.valueOf() < (blocktime ? blocktime : Date.now())

  useEffect(() => {
    if (question.currentAnswerBond && !new BigNumber(question.currentAnswerBond).mul(2).eq(bondNativeAssetAmount)) {
      setBondNativeAssetAmount(new BigNumber(question.currentAnswerBond).mul(2))
    }
    // eslint-disable-next-line
  }, [question.currentAnswerBond])

  useEffect(() => {
    const shouldFinalize = async () => {
      const block = await provider.getBlock('latest')
      const timestamp = block.timestamp * 1000
      const resolution = new Date(question.resolution).getTime()
      if (resolution < timestamp) {
        setCurrentTab(MarketDetailsTab.finalize)
        fetchGraphMarketMakerData()
      } else {
        setTimeout(shouldFinalize, 2000)
      }
      setBlocktime(timestamp)
    }
    shouldFinalize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return shares && !isDust(shares, collateral.decimals)
  })

  const probabilities = balances.map(balance => balance.probability)
  const hasFunding = totalPoolShares.gt(0)

  const renderTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.Payout,
      OutcomeTableValue.Outcome,
      OutcomeTableValue.Probability,
      OutcomeTableValue.Bonded,
    ]
    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }
    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        probabilities={probabilities}
      />
    )
  }

  const renderFinalizeTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.OutcomeProbability,
      OutcomeTableValue.Probability,
      OutcomeTableValue.CurrentPrice,
      OutcomeTableValue.Payout,
    ]

    return (
      <OutcomeTable
        balances={balances}
        bonds={question.bonds}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        isBond
        payouts={payouts}
        probabilities={probabilities}
        withWinningOutcome
      />
    )
  }

  const finalizeButtons = (
    <MarketBottomFinalizeNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        onClick={() => {
          window.open(`${realitioBaseUrl}/#!/question/${question.id}`)
        }}
      >
        Call Arbitrator
      </Button>
      <Button
        buttonType={ButtonType.primary}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.setOutcome)
        }}
      >
        Set Outcome
      </Button>
    </MarketBottomFinalizeNavGroupWrapper>
  )

  const buySellButtons = (
    <MarketBottomNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!userHasShares || !hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.sell)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.buy)
        }}
      >
        Buy
      </Button>
    </MarketBottomNavGroupWrapper>
  )

  const isFinalizing = isQuestionOpen && !isQuestionFinalized

  const [currentTab, setCurrentTab] = useState(
    isQuestionFinalized || !isFinalizing ? MarketDetailsTab.swap : MarketDetailsTab.finalize,
  )

  const switchMarketTab = (newTab: MarketDetailsTab) => {
    setCurrentTab(newTab)
  }

  const isMarketCreator = cpk && creator === cpk.address.toLowerCase()

  const { fetchData: fetchGraphMarketUserTxData, liquidityTxs, status, trades } = useGraphMarketUserTxData(
    marketMakerAddress,
    cpk?.address.toLowerCase(),
    isMarketCreator || false,
    context.networkId,
  )

  useEffect(() => {
    if ((isQuestionFinalized || !isFinalizing) && currentTab === MarketDetailsTab.finalize) {
      setCurrentTab(MarketDetailsTab.swap)
    }
    // eslint-disable-next-line
  }, [isQuestionFinalized, isFinalizing])

  useEffect(() => {
    if (location.pathname.includes('buy')) setCurrentTab(MarketDetailsTab.buy)
    if (location.pathname.includes('sell')) setCurrentTab(MarketDetailsTab.sell)
    if (location.pathname.includes('pool')) setCurrentTab(MarketDetailsTab.pool)
    if (location.pathname.includes('verify')) setCurrentTab(MarketDetailsTab.verify)
    if (location.pathname.includes('history')) setCurrentTab(MarketDetailsTab.history)
    if (location.pathname.includes('set_outcome')) setCurrentTab(MarketDetailsTab.setOutcome)
    if (location.pathname.includes('finalize')) setCurrentTab(MarketDetailsTab.finalize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentTab === MarketDetailsTab.swap) return history.replace(`/${marketMakerAddress}`)
    return history.replace(`/${marketMakerAddress}/${currentTab.toLowerCase()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab])

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen blocktime={blocktime} marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
          blocktime={blocktime}
          marketMakerData={marketMakerData}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === MarketDetailsTab.swap && (
          <>
            {isScalar ? (
              <>
                <MarketScale
                  balances={balances}
                  borderTop={true}
                  collateral={collateral}
                  currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}
                  fee={fee}
                  liquidityTxs={liquidityTxs}
                  lowerBound={scalarLow || new BigNumber(0)}
                  positionTable={true}
                  startingPointTitle={'Current prediction'}
                  status={status}
                  trades={trades}
                  unit={getUnit(question.title)}
                  upperBound={scalarHigh || new BigNumber(0)}
                />
              </>
            ) : (
              renderTableData()
            )}
            {!hasFunding && !isQuestionOpen && (
              <WarningMessageStyled
                additionalDescription={''}
                description={'Trading is disabled due to lack of liquidity.'}
                grayscale={true}
                href={''}
                hyperlinkDescription={''}
              />
            )}
            <WhenConnected>
              <StyledButtonContainer className={!hasFunding || isQuestionOpen ? 'border' : ''}>
                <Button
                  buttonType={ButtonType.secondaryLine}
                  onClick={() => {
                    history.goBack()
                  }}
                >
                  Back
                </Button>
                {buySellButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === MarketDetailsTab.finalize ? (
          <>
            {isScalar ? (
              <MarketScale
                borderTop={true}
                collateral={collateral}
                currentAnswer={question.currentAnswer}
                currentAnswerBond={question.currentAnswerBond}
                currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}
                currentTab={MarketDetailsTab.finalize}
                isBonded={true}
                lowerBound={scalarLow || new BigNumber(0)}
                startingPointTitle={'Current prediction'}
                unit={getUnit(question.title)}
                upperBound={scalarHigh || new BigNumber(0)}
              />
            ) : (
              renderFinalizeTableData()
            )}
            <WhenConnected>
              <StyledButtonContainer>
                <Button
                  buttonType={ButtonType.secondaryLine}
                  onClick={() => {
                    history.goBack()
                  }}
                >
                  Back
                </Button>
                {finalizeButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        ) : null}
        {currentTab === MarketDetailsTab.setOutcome && (
          <MarketBondContainer
            bondNativeAssetAmount={bondNativeAssetAmount}
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.pool && (
          <MarketPoolLiquidityContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.history && <MarketHistoryContainer marketMakerData={marketMakerData} />}
        {currentTab === MarketDetailsTab.buy && (
          <MarketBuyContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.sell && (
          <MarketSellContainer
            currentTab={currentTab}
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.verify && (
          <MarketVerifyContainer
            context={context}
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
