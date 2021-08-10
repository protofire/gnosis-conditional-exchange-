import React, { DOMAttributes } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { IconInfo } from '../../../../common/icons'
import { Circle } from '../../../common_styled'

export enum ValueStates {
  error,
  important,
  normal,
  success,
}

const Wrapper = styled.div`
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 14px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Title = styled.h4`
  color: #424242;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
  display: flex;
  align-items: center;
`

const Value = styled.p<{ state: ValueStates; emphasizeValue?: boolean }>`
  color: ${props =>
    (!props.emphasizeValue && props.state === ValueStates.success && props.theme.colors.textColorLightish) ||
    (props.state === ValueStates.success && props.theme.colors.green) ||
    (props.state === ValueStates.error && props.theme.colors.error) ||
    (props.state === ValueStates.important && props.theme.colors.textColorDark) ||
    props.theme.colors.textColorLightish};
    };
  font-weight: ${props => (props.emphasizeValue ? '500' : '400')};
  margin: 0;
  
`

interface Props extends DOMAttributes<HTMLDivElement> {
  emphasizeValue?: boolean
  state?: ValueStates
  tooltip?: string
  title: string
  value: string
}

export const TransactionDetailsRow: React.FC<Props> = props => {
  const { emphasizeValue = false, state = ValueStates.normal, title, value, tooltip, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>
        {title}
        {tooltip ? (
          <>
            <Circle data-arrow-color="transparent" data-for="fee" data-tip={tooltip}>
              <IconInfo />
            </Circle>
          </>
        ) : null}
      </Title>
      <Value emphasizeValue={emphasizeValue} state={state}>
        {value}
      </Value>
      <ReactTooltip
        className="customMarketTooltip"
        data-multiline={true}
        effect="solid"
        id="fee"
        offset={{ top: 0, left: -1 }}
        place="top"
        type="light"
      />
    </Wrapper>
  )
}
