import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../../theme'
import { Colors } from '../../../../../theme/types'
import { getOutcomeColor } from '../../../../../theme/utils'

const BarDiagramWrapper = styled.div`
  display: flex;
  min-width: 100px;
`

const Outcome = styled.div`
  flex-grow: 1;
`

const OutcomeText = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 0 10px;
`

const OutcomeName = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 12px 0 0;
  text-align: left;
  white-space: nowrap;
`

const OutcomeValue = styled.p`
  color: ${props => props.theme.colors.textColorDark};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  text-align: right;
  white-space: nowrap;
`

const ProgressBar = styled.div<{ height?: number }>`
  background-color: #f5f5f5;
  border-radius: 4px;
  height: ${props => (props.height ? props.height : 6)}px;
  overflow: hidden;
`

export const Progress = styled.div<{ width: number; outcomeIndex?: number; selected?: boolean; color?: keyof Colors }>`
  background-color: ${props =>
    props.color
      ? props.theme[props.color]
      : props.outcomeIndex && getOutcomeColor(props.outcomeIndex).medium
      ? props.selected
        ? getOutcomeColor(props.outcomeIndex).darker
        : getOutcomeColor(props.outcomeIndex).medium
      : '#333'};
  border-radius: 4px;
  height: 100%;
  transition: width 0.25s ease-out, background-color 0.25s ease-out;
  width: ${props => props.width}%;
`
const Relative = styled.div<{ color: keyof Colors; quorum: number }>`
  position: relative;
  left:${props => `${props.quorum}%`};
  border-radius: 4px 4px 0 0;
  background-color: ${({ color, theme }) => color && (theme as any)[color]}

  width: 4px;
  height: 4px;
`
const AdditionalTextStyle = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
`

Progress.defaultProps = {
  outcomeIndex: 0,
  selected: false,
  width: 0,
}

interface Props extends DOMAttributes<HTMLDivElement> {
  outcomeIndex?: number
  outcomeName?: string
  probability: number
  selected?: boolean
  winningBadge?: React.ReactNode
  additionalTextLeft?: string
  additionalTextRight?: string
  color?: keyof Colors
  progressBarHeight?: number
  displayText?: boolean
  quorum?: number
}

export const BarDiagram: React.FC<Props> = (props: Props) => {
  const {
    additionalTextLeft,
    additionalTextRight,
    color,
    displayText = true,
    outcomeIndex,
    outcomeName,
    probability,
    progressBarHeight,
    quorum,
    selected,
    winningBadge,
    ...restProps
  } = props

  return (
    <BarDiagramWrapper {...restProps}>
      <Outcome>
        {displayText && (
          <OutcomeText>
            {outcomeName && <OutcomeName>{outcomeName}</OutcomeName>}
            {winningBadge}
            <OutcomeValue>{probability.toFixed(2)}%</OutcomeValue>
          </OutcomeText>
        )}
        {quorum && <Relative color={probability > quorum ? 'primary1' : 'primary4'} quorum={quorum} />}
        <ProgressBar height={progressBarHeight}>
          <Progress color={color} outcomeIndex={outcomeIndex} selected={selected} width={probability}></Progress>
        </ProgressBar>
        {additionalTextLeft && additionalTextRight && (
          <OutcomeText style={{ marginTop: '10px', marginBottom: '0px' }}>
            <AdditionalTextStyle>{additionalTextLeft}</AdditionalTextStyle>
            <AdditionalTextStyle>{additionalTextRight}</AdditionalTextStyle>
          </OutcomeText>
        )}
      </Outcome>
    </BarDiagramWrapper>
  )
}
