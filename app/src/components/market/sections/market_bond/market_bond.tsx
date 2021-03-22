import { toHex } from 'authereum/dist/utils'
import { ethers } from 'ethers'
import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify, formatBytes32String, parseUnits } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, networkIds } from '../../../../util/networks'
import { calcPrediction, formatBigNumber, formatNumber, getUnit, numberToByte32 } from '../../../../util/tools'
import {
  INVALID_ANSWER_ID,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  TokenEthereum,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { AssetBalance } from '../../common/asset_balance'
import { CurrenciesWrapper } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { OutcomeTable } from '../../common/outcome_table'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  isScalar: boolean
  bondNativeAssetAmount: BigNumber
}

const BottomButtonWrapper = styled(ButtonContainer)`
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const logger = getLogger('Market::Bond')

const MarketBondWrapper: React.FC<Props> = (props: Props) => {
  const { bondNativeAssetAmount, fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const {
    balances,
    question: { currentAnswerBond },
  } = marketMakerData

  const context = useConnectedWeb3Context()
  const { account, library: provider, networkId } = context

  const cpk = useConnectedCPKContext()
  const nativeAsset = getNativeAsset(networkId)
  const symbol = nativeAsset.symbol
  const { realitio } = useContracts(context)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const probabilities = balances.map(balance => balance.probability)

  const [nativeAssetBalance, setNativeAssetBalance] = useState<BigNumber>(Zero)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await provider.getBalance(account || '')
        setNativeAssetBalance(balance)
      } catch (error) {
        setNativeAssetBalance(Zero)
      }
    }
    if (account) {
      fetchBalance()
    }
  }, [account, provider])

  const currentPredictionNumber = calcPrediction(
    props.marketMakerData.outcomeTokenMarginalPrices[1] || '',
    props.marketMakerData.scalarLow || Zero,
    props.marketMakerData.scalarHigh || Zero,
  )
  const bondOutcome = async (isInvalid?: boolean) => {
    if (!cpk) {
      return
    }
    setModalTitle('Bond Outcome')

    try {
      setStatus(Status.Loading)
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }
      console.log(currentPredictionNumber)
      const answer =
        outcomeIndex >= balances.length || isInvalid
          ? INVALID_ANSWER_ID
          : numberToByte32(props.isScalar ? currentPredictionNumber : outcomeIndex, props.isScalar)
      console.log(answer)
      console.log(currentPredictionNumber)
      const number = 20 * 1000000000000000000

      console.log(number.toString(16))

      setMessage(
        `Bonding ${formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals)} ${symbol} on: ${
          props.isScalar
            ? `${currentPredictionNumber.toFixed(2)} ${getUnit(props.marketMakerData.question.title)}`
            : outcomeIndex >= marketMakerData.question.outcomes.length
            ? 'Invalid'
            : marketMakerData.question.outcomes[outcomeIndex]
        }`,
      )

      const question = marketMakerData.question
      logger.log(`Submit Answer questionId: ${question.id}, answer: ${answer}`, bondNativeAssetAmount)

      await cpk.submitAnswer({
        realitio,
        question,
        answer,
        amount: bondNativeAssetAmount,
      })

      await fetchGraphMarketMakerData()

      setStatus(Status.Ready)
      setMessage(
        `Successfully bonded ${formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals)} ${symbol} on ${
          outcomeIndex < marketMakerData.question.outcomes.length
            ? marketMakerData.question.outcomes[outcomeIndex]
            : 'Invalid'
        }`,
      )
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to bond ${symbol}.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  return (
    <>
      {props.isScalar ? (
        <MarketScale
          bondNativeAssetAmount={bondNativeAssetAmount}
          borderTop={true}
          collateral={props.marketMakerData.collateral}
          currentPrediction={
            props.marketMakerData.outcomeTokenMarginalPrices
              ? props.marketMakerData.outcomeTokenMarginalPrices[1]
              : null
          }
          currentTab={MarketDetailsTab.setOutcome}
          fee={props.marketMakerData.fee}
          isBonded={true}
          lowerBound={props.marketMakerData.scalarLow || new BigNumber(0)}
          startingPointTitle={'Current prediction'}
          unit={getUnit(props.marketMakerData.question.title)}
          upperBound={props.marketMakerData.scalarHigh || new BigNumber(0)}
        />
      ) : (
        <OutcomeTable
          balances={balances}
          bonds={marketMakerData.question.bonds}
          collateral={marketMakerData.collateral}
          disabledColumns={[
            OutcomeTableValue.OutcomeProbability,
            OutcomeTableValue.Probability,
            OutcomeTableValue.CurrentPrice,
            OutcomeTableValue.Payout,
          ]}
          isBond
          newBonds={marketMakerData.question.bonds?.map((bond, bondIndex) =>
            bondIndex !== outcomeIndex ? bond : { ...bond, bondedEth: bond.bondedEth.add(bondNativeAssetAmount) },
          )}
          outcomeHandleChange={(value: number) => {
            setOutcomeIndex(value)
          }}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
          showBondChange
        />
      )}

      <GridTransactionDetails>
        <div>
          <>
            <CurrenciesWrapper>
              <AssetBalance
                asset={nativeAsset}
                value={`${formatNumber(formatBigNumber(nativeAssetBalance, TokenEthereum.decimals, 3), 3)}`}
              />
            </CurrenciesWrapper>

            <TextfieldCustomPlaceholder
              disabled
              formField={
                <BigNumberInput
                  decimals={TokenEthereum.decimals}
                  name="bondAmount"
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onChange={() => {}}
                  style={{ width: 0 }}
                  value={bondNativeAssetAmount}
                />
              }
              symbol={symbol}
            />
          </>
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Bond Amount"
              value={`${formatNumber(formatBigNumber(bondNativeAssetAmount, TokenEthereum.decimals))} ${symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Profit"
              value={`${formatNumber(
                formatBigNumber(currentAnswerBond || new BigNumber(0), STANDARD_DECIMALS),
              )} ${symbol}`}
            />

            <TransactionDetailsRow
              state={ValueStates.normal}
              title="Potential Loss"
              value={`${formatNumber(formatBigNumber(bondNativeAssetAmount, STANDARD_DECIMALS))} ${symbol}`}
            />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>

      <BottomButtonWrapper borderTop>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => switchMarketTab(MarketDetailsTab.finalize)}
          style={{ marginRight: 'auto' }}
        >
          Back
        </Button>
        {props.isScalar && (
          <Button buttonType={ButtonType.secondaryLine} onClick={() => bondOutcome(true)}>
            Set Invalid
          </Button>
        )}
        <Button buttonType={ButtonType.primary} onClick={() => bondOutcome(false)}>
          Bond {symbol}
        </Button>
      </BottomButtonWrapper>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        status={status}
        text={message}
        title={modalTitle}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketBond = withRouter(MarketBondWrapper)
