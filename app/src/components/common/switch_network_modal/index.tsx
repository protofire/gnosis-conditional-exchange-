import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { MAIN_NETWORKS, XDAI_NETWORKS } from '../../../common/constants'
import { IconNetwork } from '../icons'

const ModalBackground = styled.div`
  height: 100vh;
  width: 100vw;
  position: absolute;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.switchNetworkModal.backgroundColor};
`

const Modal = styled.div`
  border-radius: 8px;
  background: ${props => props.theme.switchNetworkModal.modalColor};
  border: 1px solid ${props => props.theme.switchNetworkModal.borderColor};
  box-shadow: ${props => props.theme.switchNetworkModal.boxShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 40px;
  padding-bottom: 24px;
  padding-right: 32px;
  padding-left: 32px;
`

const ModalTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 32px auto;
`

const ModalConnectedBall = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: ${props => props.theme.switchNetworkModal.connectionBall};
  margin-right: 10px;
`

const ModalText = styled.p`
  font-size: ${props => props.theme.switchNetworkModal.primaryFontSize};
  font-weight: 400;
  color: ${props => props.theme.switchNetworkModal.primaryTextColor};
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 12px;
`

const ModalSubText = styled.p`
  font-size: ${props => props.theme.switchNetworkModal.secondaryFontSize};
  font-weight: 400;
  color: ${props => props.theme.switchNetworkModal.secondaryTextColor};
  margin-top: 0;
  margin-bottom: 12px;
`

const ModalHelpLink = styled.a`
  font-size: ${props => props.theme.switchNetworkModal.secondaryFontSize};
  font-weight: 400;
  color: ${props => props.theme.switchNetworkModal.linkTextColor};
`

const ModalButton = styled.button`
  height: 40px;
  width: 252px;
  border-radius: ${props => props.theme.buttonRound.borderRadius};
  background: ${props => props.theme.buttonPrimary.backgroundColor};
  color: ${props => props.theme.buttonPrimary.color};
  font-size: ${props => props.theme.switchNetworkModal.secondaryFontSize};
  font-weight: 500;
  border: 1px solid ${props => props.theme.buttonPrimary.borderColor};
  cursor: pointer;
`

interface Props {
  currentNetworkId: string | 0 | undefined
}

export const SwitchNetworkModal: React.FC<Props> = props => {
  const { currentNetworkId } = props

  enum networks {
    mainnet = 'Mainnet',
    xdai = 'xDAI',
  }

  const [currentNetwork, setCurrentNetwork] = useState(
    MAIN_NETWORKS.includes(currentNetworkId || '')
      ? networks.mainnet
      : XDAI_NETWORKS.includes(currentNetworkId || '')
      ? networks.xdai
      : '',
  )

  useEffect(() => {
    const newNetwork = MAIN_NETWORKS.includes(currentNetworkId || '')
      ? networks.mainnet
      : XDAI_NETWORKS.includes(currentNetworkId || '')
      ? networks.xdai
      : ''
    if (newNetwork.length && newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork)
    }
  }, [currentNetwork, currentNetworkId, networks.mainnet, networks.xdai])

  const setLocation = (network: string) => {
    if (network === networks.mainnet) {
      // TODO: Set to proper domain
      location.assign('http://localhost:3000')
    } else if (network === networks.xdai) {
      // TODO: Set to proper domain
      location.assign('http://localhost:3001')
    }
  }

  return (
    <ModalBackground>
      <Modal>
        <IconNetwork />
        <ModalTextWrapper>
          <ModalText>
            <ModalConnectedBall />
            Connected to {currentNetwork}
          </ModalText>
          <ModalSubText>
            Please connect to the {currentNetwork === networks.mainnet ? networks.xdai : networks.mainnet} Network
          </ModalSubText>
          {currentNetwork !== networks.xdai && (
            <ModalHelpLink
              href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup"
              rel="noopener noreferrer"
              target="_blank"
            >
              how do I connect to xDAI?
            </ModalHelpLink>
          )}
        </ModalTextWrapper>
        <ModalButton onClick={() => setLocation(currentNetwork)}>Continue with {currentNetwork}</ModalButton>
      </Modal>
    </ModalBackground>
  )
}
