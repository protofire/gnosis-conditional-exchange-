import React from 'react'
import styled from 'styled-components'

import { version as appVersion } from '../../../../../package.json'
import { DOCUMENT_FAQ, DOCUMENT_VALIDITY_RULES, SHOW_FOOTER } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../contexts'
import { useContracts } from '../../../../hooks'
import { getAddressBlockExplorerURL } from '../../../../util/networks'

const Wrapper = styled.div<{ paddingBottomSmall?: boolean }>`
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: center;
  line-height: 1.2;
  padding-bottom: ${props => (props.paddingBottomSmall ? '10px' : '30px')};
  padding-top: 10px;
  width: 100%;
  position: relative;
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const Break = styled.span`
  font-weight: 700;
  margin: 0 8px;

  &:last-child {
    display: none;
  }
`

export const Footer = () => {
  const context = useConnectedWeb3Context()
  const { marketMakerFactory } = useContracts(context)

  return SHOW_FOOTER ? (
    <>
      <Wrapper paddingBottomSmall>
        <Link href="https://github.com/protofire/gnosis-conditional-exchange">Version {appVersion}</Link>
        <Break>·</Break>
        <Link
          href={getAddressBlockExplorerURL(context.networkId, marketMakerFactory.address)}
          rel="noopener noreferrer"
          target="_blank"
        >
          Omen Contract
        </Link>
        <Break>·</Break>
        <Link href="https://explore.duneanalytics.com/dashboard/omen-stats" rel="noopener noreferrer" target="_blank">
          Statistics
        </Link>
        <Break>·</Break>
        <Link href="http://alchemy.daostack.io/dao/0x519b70055af55a007110b4ff99b0ea33071c720a">Propose Token</Link>
        <Break>·</Break>
        <Link href={DOCUMENT_FAQ} rel="noopener noreferrer" target="_blank">
          FAQ
        </Link>
        <Break>·</Break>
        <Link href={DOCUMENT_VALIDITY_RULES} rel="noopener noreferrer" target="_blank">
          Market Rules
        </Link>
        <Break>·</Break>
        <Link href="https://dxdao.eth.link" rel="noopener noreferrer" target="_blank">
          DXdao.eth
        </Link>
        <Break>·</Break>
        <Link href="https://twitter.com/Omen_eth" rel="noopener noreferrer" target="_blank">
          Twitter
        </Link>
        <Break>·</Break>
        <Link href="https://t.me/omen_eth" rel="noopener noreferrer" target="_blank">
          Telegram
        </Link>
      </Wrapper>
    </>
  ) : null
}
