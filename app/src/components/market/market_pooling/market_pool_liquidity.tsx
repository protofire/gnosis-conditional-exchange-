import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { DOCUMENT_FAQ } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { SharedPropsInterface } from '../../../pages/market_sections/market_pool_liquidity_container'
import { RemoteData } from '../../../util/remote_data'
import { calcAddFundingSendAmounts, calcRemoveFundingSendAmounts } from '../../../util/tools'
import { bigNumberToString } from '../../../util/tools/formatting'
import { MarketDetailsTab, MarketMakerData, OutcomeTableValue } from '../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { ModalTransactionWrapper } from '../../modal'
import { SetAllowance } from '../common_sections/allowance/set_allowance'
import { GridTransactionDetails } from '../common_sections/card_bottom_details/grid_transaction_details'
import { WarningMessage } from '../common_sections/message_text/warning_message'
import { OutcomeTable } from '../common_sections/tables/outcome_table'
import { CurrencySelector } from '../common_sections/user_transactions_tokens/currency_selector'
import { TokenBalance } from '../common_sections/user_transactions_tokens/token_balance'
import { TransactionDetailsCard } from '../common_sections/user_transactions_tokens/transaction_details_card'
import { TransactionDetailsLine } from '../common_sections/user_transactions_tokens/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../common_styled'

import { UserPoolData } from './user_pool_data'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  theme?: any
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  sharedProps: SharedPropsInterface
}

enum Tabs {
  deposit,
  withdraw,
}

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
`

const ButtonBottomRight = styled.div`
  display: flex;
  align-items: center;
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-bottom: 0;
  margin-bottom: 24px;
`
const SetAllowanceStyled = styled(SetAllowance)`
  margin-bottom: 20px;
`

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData, sharedProps } = props
  const {
    activeTab,
    allowance,
    allowanceFinished,
    amountToFund,
    amountToFundDisplay,
    amountToRemove,
    amountToRemoveDisplay,
    claim,
    collateral,
    collateralAmountError,
    collateralBalance,
    deposit,
    depositedTokens,
    depositedTokensTotal,
    disableDepositButton,
    disableDepositTab,
    disableWithdrawButton,
    disableWithdrawTab,
    earnedRewards,
    feeFormatted,
    fundingBalance,
    isNegativeAmountToFund,
    isNegativeAmountToRemove,
    isTransactionModalOpen,
    liquidityMiningCampaign,
    message,
    poolTokens,
    proxyIsUpToDate,
    remainingRewards,
    rewardApr,
    setActiveTab,
    setAmountToFund,
    setAmountToFundDisplay,
    setAmountToRemove,
    setAmountToRemoveDisplay,
    setIsTransactionModalOpen,
    sharesAmountError,
    sharesBalance,
    shouldDisplayMaxButton,
    showSetAllowance,
    showUpgrade,
    stake,
    totalRewards,
    totalUserLiquidity,
    txHash,
    txState,
    unlockCollateral,
    upgradeFinished,
    upgradeProxy,
    userStakedTokens,
    walletBalance,
    withdraw,
  } = sharedProps
  const { balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const history = useHistory()
  const context = useConnectedWeb3Context()

  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(
    amountToFund || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )
  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? balances.map((balance, i) => balance.shares.add(sendAmountsAfterAddingFunding[i]))
    : balances.map(balance => balance.shares)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(
    amountToRemove || Zero,
    balances.map(b => b.holdings),
    totalPoolShares,
  )

  const sharesAfterRemovingFunding = balances.map((balance, i) => {
    return balance.shares.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  const showSharesChange = activeTab === Tabs.deposit ? amountToFund?.gt(0) : amountToRemove?.gt(0)

  const probabilities = balances.map(balance => balance.probability)
  const switchTab = (tab: Tabs) => {
    setAmountToFund(new BigNumber('0'))
    setAmountToRemove(new BigNumber('0'))
    setActiveTab(tab)
  }

  return (
    <>
      <UserPoolData
        collateral={collateral}
        currentApr={rewardApr}
        earnedRewards={earnedRewards}
        remainingRewards={remainingRewards}
        symbol={collateral.symbol}
        totalEarnings={totalEarnings}
        totalPoolShares={totalPoolShares}
        totalRewards={totalRewards}
        totalUserLiquidity={totalUserLiquidity}
        userEarnings={userEarnings}
      />
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={[OutcomeTableValue.OutcomeProbability, OutcomeTableValue.Payout, OutcomeTableValue.Bonded]}
        displayRadioSelection={false}
        newShares={activeTab === Tabs.deposit ? sharesAfterAddingFunding : sharesAfterRemovingFunding}
        probabilities={probabilities}
        showSharesChange={showSharesChange}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab
              active={disableDepositTab ? false : activeTab === Tabs.deposit}
              disabled={disableDepositTab}
              onClick={() => switchTab(Tabs.deposit)}
            >
              Deposit
            </ButtonTab>
            <ButtonTab
              active={disableDepositTab ? true : activeTab === Tabs.withdraw}
              disabled={disableWithdrawTab}
              onClick={() => switchTab(Tabs.withdraw)}
            >
              Withdraw
            </ButtonTab>
          </TabsGrid>
          {activeTab === Tabs.deposit && (
            <>
              <CurrenciesWrapper>
                <CurrencySelector
                  addBalances
                  addNativeAsset
                  balance={walletBalance}
                  context={context}
                  currency={collateral.address}
                  disabled
                />
              </CurrenciesWrapper>

              <TextfieldCustomPlaceholder
                error={!!collateralAmountError}
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToFund"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToFund(e.value)
                      setAmountToFundDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToFund}
                    valueToDisplay={amountToFundDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToFund(collateralBalance)
                  setAmountToFundDisplay(bigNumberToString(collateralBalance, collateral.decimals, 5, true))
                }}
                shouldDisplayMaxButton={shouldDisplayMaxButton}
                symbol={collateral.symbol}
              />

              {collateralAmountError && <GenericError>{collateralAmountError}</GenericError>}
            </>
          )}
          {activeTab === Tabs.withdraw && (
            <>
              <TokenBalance text="Pool Tokens" value={sharesBalance} />

              <TextfieldCustomPlaceholder
                error={!!sharesAmountError}
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToRemove"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToRemove(e.value)
                      setAmountToRemoveDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToRemove}
                    valueToDisplay={amountToRemoveDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToRemove(userStakedTokens.gt(0) ? userStakedTokens : fundingBalance)
                  setAmountToRemoveDisplay(
                    bigNumberToString(
                      userStakedTokens.gt(0) ? userStakedTokens : fundingBalance,
                      collateral.decimals,
                      5,
                      true,
                    ),
                  )
                }}
                shouldDisplayMaxButton
                symbol=""
              />

              {sharesAmountError && <GenericError>{sharesAmountError}</GenericError>}
            </>
          )}
        </div>
        <div>
          {activeTab === Tabs.deposit && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={fee.gt(0)}
                state={ValueStates.success}
                title="Earn Trading Fee"
                value={feeFormatted}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={poolTokens.gt(0)}
                state={(poolTokens.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Pool Tokens"
                value={`${bigNumberToString(poolTokens, collateral.decimals)}`}
              />
            </TransactionDetailsCard>
          )}
          {activeTab === Tabs.withdraw && (
            <TransactionDetailsCard>
              <TransactionDetailsRow
                emphasizeValue={userEarnings.gt(0)}
                state={ValueStates.success}
                title="Earned"
                value={`${bigNumberToString(userEarnings, collateral.decimals)} ${collateral.symbol}`}
              />
              <TransactionDetailsRow
                state={ValueStates.normal}
                title="Deposited"
                value={`${bigNumberToString(depositedTokens, collateral.decimals)} ${collateral.symbol}`}
              />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={depositedTokensTotal.gt(0)}
                state={(depositedTokensTotal.gt(0) && ValueStates.important) || ValueStates.normal}
                title="Total"
                value={`${bigNumberToString(depositedTokensTotal, collateral.decimals)} ${collateral.symbol}`}
              />
            </TransactionDetailsCard>
          )}
        </div>
      </GridTransactionDetails>
      {activeTab === Tabs.deposit && showSetAllowance && (
        <SetAllowanceStyled
          collateral={collateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
        />
      )}
      {activeTab === Tabs.deposit && showUpgrade && (
        <SetAllowanceStyled
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
        />
      )}
      <WarningMessageStyled
        additionalDescription=""
        description="Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before the event occurs and to be aware the market could move abruptly at any time."
        href={DOCUMENT_FAQ}
        hyperlinkDescription="More Info"
      />
      {isNegativeAmountToFund && (
        <WarningMessage
          additionalDescription=""
          danger={true}
          description="Your deposit amount should not be negative."
          href=""
          hyperlinkDescription=""
        />
      )}
      {isNegativeAmountToRemove && (
        <WarningMessage
          additionalDescription=""
          danger
          description="Your withdraw amount should not be negative."
          href=""
          hyperlinkDescription=""
        />
      )}
      <BottomButtonWrapper borderTop>
        <Button
          buttonType={ButtonType.secondaryLine}
          onClick={() => (history.length > 2 ? history.goBack() : history.replace('/liquidity'))}
        >
          Back
        </Button>
        <ButtonBottomRight>
          {liquidityMiningCampaign && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={!(userStakedTokens && userStakedTokens.gt(0) && earnedRewards > 0)}
              onClick={() => claim()}
              style={{ marginRight: 12 }}
            >
              Claim Rewards
            </Button>
          )}
          {liquidityMiningCampaign && fundingBalance.gt(0) && rewardApr > 0 && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={fundingBalance.eq(0)}
              onClick={() => stake()}
              style={{ marginRight: 12 }}
            >
              Stake
            </Button>
          )}
          {activeTab === Tabs.deposit && (
            <Button buttonType={ButtonType.secondaryLine} disabled={disableDepositButton} onClick={deposit}>
              Deposit
            </Button>
          )}
          {activeTab === Tabs.withdraw && (
            <Button buttonType={ButtonType.secondaryLine} disabled={disableWithdrawButton} onClick={withdraw}>
              Withdraw
            </Button>
          )}
        </ButtonBottomRight>
      </BottomButtonWrapper>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={message}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const MarketPoolLiquidity = withRouter(MarketPoolLiquidityWrapper)
