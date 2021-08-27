import React, { DOMAttributes, useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../../contexts'
import { useRealityLink } from '../../../../../hooks'
import {
  GraphResponseLiquidityMiningCampaign,
  useGraphLiquidityMiningCampaigns,
} from '../../../../../hooks/useGraphLiquidityMiningCampaigns'
import { useTokenPrice } from '../../../../../hooks/useTokenPrice'
import { StakingService } from '../../../../../services/staking'
import { getToken, networkIds } from '../../../../../util/networks'
import { formatNumber } from '../../../../../util/tools'
import { Arbitrator, KlerosItemStatus, KlerosSubmission, Token } from '../../../../../util/types'
import { IconAlert, IconApy, IconArbitrator, IconCategory, IconOracle, IconVerified } from '../../../../common/icons'

const AdditionalMarketDataWrapper = styled.div`
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -25px;
  width: ${props => props.theme.mainContainer.maxWidth};

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    width: calc(100% + 25px * 2);
    height: auto;
  }
`

const AdditionalMarketDataLeft = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 20px 0px 20px;
  flex-wrap: wrap;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-wrap: wrap !important;
    width: 100%;
    padding: 14px 24px;
    padding-bottom: 4px;
    & > * {
      margin: 0 !important;
      margin-right: 22px !important;
      margin-bottom: 10px !important;
    }
  }
`

const AdditionalMarketDataSectionTitle = styled.p<{ isError?: boolean; isSuccess?: boolean }>`
  margin: 0;
  margin-left: 8px;
  font-size: ${props => props.theme.textfield.fontSize};
  line-height: 16px;
  white-space: nowrap;
  color: ${({ isError, isSuccess, theme }) =>
    isError ? theme.colors.alert : isSuccess ? theme.colors.green : theme.colors.clickable};
  font-weight: ${({ isSuccess }) => (isSuccess ? '500' : '400')};
  &:first-letter {
    text-transform: capitalize;
  }
`

const AdditionalMarketDataSectionWrapper = styled.a<{
  noColorChange?: boolean
  isError?: boolean
  isSuccess?: boolean
  customColor?: string
  noMarginLeft?: boolean
  hasMarginRight?: boolean
}>`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: ${props => (props.noMarginLeft ? '0px' : '14px')};
  margin-right: ${props => (props.hasMarginRight ? '14px' : '0px')};
  margin-bottom: 14px;
  text-transform: capitalize;
  &:hover {
    p {
      color: ${props =>
        props.isError
          ? props.theme.colors.alertHover
          : props.isSuccess
          ? props.theme.colors.darkGreen
          : props.theme.colors.primaryLight};
    }
    svg {
      circle {
        stroke: ${props => (props.customColor ? props.customColor : props.theme.colors.primaryLight)};
      }
      path {
        fill: ${props =>
          props.customColor
            ? props.customColor
            : props.noColorChange
            ? ''
            : props.isError
            ? props.theme.colors.alertHover
            : props.theme.colors.primaryLight};
      }

      path:nth-child(even) {
        fill: ${props => (props.customColor ? props.customColor : props.theme.colors.primaryLight)};
      }
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 11px;
    &:nth-of-type(1) {
      margin-left: 0;
    }
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  collateral: Token
  oracle: string
  id: string
  curatedByDxDaoOrKleros: boolean
  curatedByDxDao: boolean
  submissionIDs: KlerosSubmission[]
  ovmAddress: string
  title: string
  address: string
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { address, arbitrator, category, collateral, curatedByDxDaoOrKleros, id, oracle, submissionIDs, title } = props

  const context = useConnectedWeb3Context()
  const { cpk, library: provider, networkId, relay } = context

  const realitioBaseUrl = useRealityLink(!!relay)
  const realitioUrl = id ? `${realitioBaseUrl}/#!/question/${id}` : `${realitioBaseUrl}/`
  submissionIDs.sort((s1, s2) => {
    if (s1.status === KlerosItemStatus.Registered) return -1
    if (s2.status === KlerosItemStatus.Registered) return 1
    if (s1.status === KlerosItemStatus.ClearingRequested) return -1
    if (s2.status === KlerosItemStatus.ClearingRequested) return 1
    if (s1.status === KlerosItemStatus.RegistrationRequested) return -1
    if (s2.status === KlerosItemStatus.RegistrationRequested) return 1
    return 0
  })

  const queryParams = new URLSearchParams()
  queryParams.append('col1', title)
  queryParams.append('col2', `https://omen.eth.link/#/${address}`)

  const [rewardApr, setRewardApr] = useState(0)
  const [liquidityMiningCampaign, setLiquidityMiningCampaign] = useState<Maybe<GraphResponseLiquidityMiningCampaign>>()

  const { tokenPrice } = useTokenPrice(getToken(networkId, 'omn').address)
  const { tokenPrice: collateralPrice } = useTokenPrice(collateral.address)

  const { liquidityMiningCampaigns } = useGraphLiquidityMiningCampaigns()

  useEffect(() => {
    if (liquidityMiningCampaigns) {
      const marketLiquidityMiningCampaign = liquidityMiningCampaigns.filter(campaign => {
        return campaign.fpmm.id === address
      })[0]
      setLiquidityMiningCampaign(marketLiquidityMiningCampaign)
    }
  }, [liquidityMiningCampaigns, address])

  useEffect(() => {
    const fetchStakingData = async () => {
      if (!liquidityMiningCampaign) {
        throw 'No liquidity mining campaign'
      }

      const stakingService = new StakingService(provider, cpk && cpk.address, liquidityMiningCampaign.id)

      const { rewardApr } = await stakingService.getStakingData(
        getToken(networkId, 'omn'),
        cpk?.address || '',
        collateralPrice, // Assume pool token value is 1 unit of collateral
        tokenPrice,
        Number(liquidityMiningCampaign.endsAt),
        liquidityMiningCampaign.rewardAmounts[0],
        Number(liquidityMiningCampaign.duration),
      )

      setRewardApr(rewardApr)
    }

    cpk && liquidityMiningCampaign && fetchStakingData()
  }, [cpk, cpk?.address, liquidityMiningCampaign, networkId, provider, tokenPrice, collateralPrice])

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper
          href={`/#/24h-volume/category/${encodeURI(category)}`}
          noColorChange={true}
          noMarginLeft={true}
        >
          <IconCategory size={'24'} />
          <AdditionalMarketDataSectionTitle>{category}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-for="marketData"
          data-tip={`This market uses the ${oracle} oracle which crowd-sources the correct outcome.`}
          href={realitioUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconOracle size={'24'} />
          <AdditionalMarketDataSectionTitle>{oracle}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-for="marketData"
          data-tip={`This market uses ${arbitrator.name} as the final arbitrator.`}
          href={arbitrator.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconArbitrator size={'24'} />
          <AdditionalMarketDataSectionTitle>{arbitrator.name}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        {rewardApr > 0 && (
          <AdditionalMarketDataSectionWrapper
            customColor={'#4B948F'}
            data-arrow-color="transparent"
            data-for="marketData"
            data-tip={'Current liquidity mining rewards APR.'}
            // Update if we change verified data section
            hasMarginRight={context.networkId === networkIds.XDAI}
            isSuccess={true}
          >
            <IconApy />
            <AdditionalMarketDataSectionTitle isSuccess={rewardApr > 0}>
              {rewardApr === Infinity ? '--' : formatNumber(rewardApr.toString())}% APR
            </AdditionalMarketDataSectionTitle>
          </AdditionalMarketDataSectionWrapper>
        )}
        {context.networkId !== networkIds.XDAI && (
          <AdditionalMarketDataSectionWrapper
            data-arrow-color="transparent"
            data-for="marketData"
            data-tip={
              curatedByDxDaoOrKleros
                ? 'This Market is verified by DXdao or Kleros and therefore valid.'
                : 'This Market has not been verified and may be invalid.'
            }
            hasMarginRight={true}
            isError={!curatedByDxDaoOrKleros}
          >
            {curatedByDxDaoOrKleros ? <IconVerified size={'24'} /> : <IconAlert size={'24'} />}
            <AdditionalMarketDataSectionTitle isError={!curatedByDxDaoOrKleros}>
              {curatedByDxDaoOrKleros ? 'Verified' : 'Not Verified'}
            </AdditionalMarketDataSectionTitle>
          </AdditionalMarketDataSectionWrapper>
        )}
      </AdditionalMarketDataLeft>
      <ReactTooltip
        className="customMarketTooltip"
        data-multiline={true}
        effect="solid"
        id="marketData"
        offset={{ top: 0 }}
        place="top"
        type="light"
      />
    </AdditionalMarketDataWrapper>
  )
}
