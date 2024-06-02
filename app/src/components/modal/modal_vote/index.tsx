import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { truncateStringInTheMiddle } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconGrowth, IconJazz } from '../../common/icons'
import { ArrowIcon } from '../../market/common_sections/tables/new_value/img/ArrowIcon'
import { ContentWrapper, ModalNavigation } from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  context: any
  onClose: () => void
  yes: boolean
}

const NavLeft = styled.div`
  display: flex;
  align-items: center;
`
const HeaderText = styled.div`
  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px;
  letter-spacing: 0.2px;
  text-align: left;
  color: #37474f;
`

const TopRow = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`

const TopRowText = styled.div<{ green?: boolean }>`
  margin-left: 10px;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.2px;
  color: ${props => (props.green ? props.theme.colors.green : props.theme.colors.textColorDark)};
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`

const ModalMain = styled.div`
  width: 100%;

  & ${DataRow}:not(:last-child) {
    margin-bottom: 12px;
  }
`
const LightDataItem = styled.div`
  color: ${props => props.theme.textfield.placeholderColor};
`

const GreenDataItem = styled.div`
  display: flex;
  color: ${props => props.theme.colors.green};
  align-items: center;
  font-weight: ${props => props.theme.textfield.fontWeight};
`

const DarkDataItem = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.textColorDark};
  font-weight: ${props => props.theme.textfield.fontWeight};
`

const VoteButton = styled(Button)`
  margin-top: 12px;
  width: 100%;
`

const Divider = styled.div`
  border-top: ${props => props.theme.borders.borderLineDisabled};
  margin: 24px 0;
`
const PercentageText = styled.span<{ lightColor?: boolean }>`
  ${props => props.lightColor && `color:${props.theme.colors.textColorLighter}`};
`

const ModalVote = (props: Props) => {
  const { context, theme, yes } = props
  const { account, balances, cpk, setTxState, txHash, txState } = context

  const { fetchBalances } = balances

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [transactionMessage, setTransactionMessage] = useState<string>('')

  const vote = async () => {
    if (!cpk || !account) {
      return
    }

    try {
      setTransactionMessage(`Vote for Yes`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)
      // await cpk.claimAirdrop({ account })
      await fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  const onClose = () => {
    setIsTransactionModalOpen(false)
    props.onClose()
  }

  return (
    <>
      <Modal isOpen={!isTransactionModalOpen} style={theme.fluidHeightModal}>
        <ContentWrapper>
          <ModalNavigation style={{ padding: '0', marginBottom: '24px' }}>
            <NavLeft>
              <HeaderText>Vote for {yes ? 'Yes' : 'No'}</HeaderText>
            </NavLeft>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <ModalMain>
            <TopRow>
              <IconJazz account={account} size={24} />{' '}
              <TopRowText>{truncateStringInTheMiddle(account, 5, 3)}</TopRowText>
            </TopRow>
            <DataRow>
              <LightDataItem>Locked in Guild</LightDataItem>
              <DarkDataItem>543.43 OMN</DarkDataItem>
            </DataRow>
            <DataRow style={{ marginTop: '12px' }}>
              <LightDataItem>Voting Power</LightDataItem>
              <DarkDataItem>0.64%</DarkDataItem>
            </DataRow>
            <DataRow>
              <LightDataItem>Vote Impact</LightDataItem>
              <DarkDataItem>
                <PercentageText lightColor>30.54%</PercentageText>
                <>
                  <ArrowIcon color={theme.colors.textColorDark} style={{ margin: '0 10px' }} />
                  31.18%
                </>
              </DarkDataItem>
            </DataRow>
          </ModalMain>
        </ContentWrapper>
        <>
          <Divider />
          <ModalMain>
            <ContentWrapper>
              <TopRow>
                <IconGrowth />
                <TopRowText green>You earn</TopRowText>
              </TopRow>
              <DataRow>
                <LightDataItem>For Voting</LightDataItem>
                <GreenDataItem>450.00 OMN</GreenDataItem>
              </DataRow>
              <DataRow>
                <LightDataItem>If Proposal Passes</LightDataItem>
                <GreenDataItem>+50.00 OMN</GreenDataItem>
              </DataRow>
              <VoteButton buttonType={ButtonType.primary} onClick={vote}>
                Vote for {yes ? 'Yes' : 'No'}
              </VoteButton>
            </ContentWrapper>
          </ModalMain>
        </>
      </Modal>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={transactionMessage}
        onClose={onClose}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalVoteWrapper = withTheme(ModalVote)
