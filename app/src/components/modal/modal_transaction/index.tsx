import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import { TwitterShareButton } from 'react-share'
import styled, { withTheme } from 'styled-components'

import { CONFIRMATION_COUNT } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { TYPE } from '../../../theme'
import { getBlockExplorer, getTxHashBlockExplorerURL } from '../../../util/networks'
import { isValidHttpUrl } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Spinner } from '../../common'
import { IconClose, IconDone, IconFail, IconTwitter } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
`

const ModalButton = styled(Button)`
  width: 100%;
`
const ModalTokenIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 10px;
`

const ModalButtonWrapper = styled.a`
  width: 100%;
  margin-top: 12px;
`

const ModalButtonText = styled.span`
  margin-left: 12px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon?: any
  isOpen: boolean
  message: string
  onClose: () => void
  theme?: any
  txHash: string
  txState: TransactionStep
  confirmations: number
  confirmationsRequired?: number
  netId?: number
  tweet?: string
  shareUrl?: string
}

export const ModalTransaction = (props: Props) => {
  const {
    confirmations,
    confirmationsRequired = CONFIRMATION_COUNT,
    icon,
    isOpen,
    message,
    netId,
    onClose,
    shareUrl,
    theme,
    tweet,
    txHash,
    txState,
  } = props
  const context = useConnectedWeb3Context()
  const networkId = netId ? netId : context.networkId

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const etherscanDisabled =
    (txState !== TransactionStep.transactionSubmitted &&
      txState !== TransactionStep.transactionConfirmed &&
      txState !== TransactionStep.confirming) ||
    !txHash

  const blockExplorer =
    getBlockExplorer(networkId)
      .charAt(0)
      .toUpperCase() + getBlockExplorer(networkId).slice(1)

  const shareOnTwitter = tweet && shareUrl

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        {txState === TransactionStep.transactionConfirmed ? (
          <IconDone />
        ) : txState === TransactionStep.error ? (
          <IconFail />
        ) : (
          <Spinner big={true} style={{ marginTop: '10px' }} />
        )}
        <TYPE.heading3
          alignItems={'center'}
          color={'text1'}
          display={'flex'}
          marginBottom={'8px'}
          marginTop={'28px'}
          textAlign={'center'}
        >
          {message}
          {isValidHttpUrl(icon) ? <ModalTokenIcon src={icon} /> : icon}
        </TYPE.heading3>
        <TYPE.bodyRegular color={'text2'} margin={'0px'} textAlign={'center'}>
          {txState === TransactionStep.waitingConfirmation
            ? 'Confirm Transaction'
            : txState === TransactionStep.transactionSubmitted
            ? 'Transaction Submitted'
            : txState === TransactionStep.confirming
            ? `${confirmations} out of ${confirmationsRequired} Confirmations`
            : txState === TransactionStep.transactionConfirmed
            ? 'Transaction Confirmed'
            : txState === TransactionStep.error
            ? 'Transaction Failed'
            : ''}
        </TYPE.bodyRegular>
        <ButtonContainer>
          {shareOnTwitter && (
            <TwitterShareButton style={{ width: '100%', marginTop: '12px' }} title={tweet} url={shareUrl}>
              <ModalButton buttonType={ButtonType.secondaryLine} disabled={etherscanDisabled}>
                <IconTwitter />
                <ModalButtonText>Share on twitter</ModalButtonText>
              </ModalButton>
            </TwitterShareButton>
          )}
          <ModalButtonWrapper
            href={etherscanDisabled ? undefined : getTxHashBlockExplorerURL(networkId, txHash)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ModalButton buttonType={ButtonType.secondaryLine} disabled={etherscanDisabled}>
              View on {blockExplorer}
            </ModalButton>
          </ModalButtonWrapper>
        </ButtonContainer>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalTransactionWrapper = withTheme(ModalTransaction)
