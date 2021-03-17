import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { DOCUMENT_VALIDITY_RULES, STANDARD_DECIMALS } from '../../../../../../common/constants'
import { ConnectedWeb3Context } from '../../../../../../hooks'
import { formatBigNumber } from '../../../../../../util/tools'
import { Arbitrator } from '../../../../../../util/types'
import { ButtonType } from '../../../../../button/button_styling_types'
import { DateField, FormRow, Textfield } from '../../../../../common'
import { BigNumberInput, BigNumberInputReturn } from '../../../../../common/form/big_number_input'
import { QuestionInput } from '../../../../../common/form/question_input'
import { Arbitrators } from '../../../../common/arbitrators'
import { Categories } from '../../../../common/categories'
import { WarningMessage } from '../../../../common/warning_message'

import { ButtonCategory, ButtonCategoryTextOverflow } from './ask_question_step'

const RowWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  & > * {
    width: calc(50% - 10px);
    margin-bottom: 0;
  }
`

const NumericalInput = styled(BigNumberInput)<{ error?: string }>`
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => (props.error ? props.theme.colors.alert : props.theme.textfield.borderColor)};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  color: ${props => props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  line-height: 1.2;
  height: ${props => props.theme.textfield.height};
  outline: ${props => props.theme.textfield.outline};
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  transition: border-color 0.15s ease-in-out;
  width: 100%;
  &:hover {
    border-color: ${props => (props.error ? `${props.theme.colors.alert}` : props.theme.textfield.borderColorOnHover)};
  }
  &:active,
  &:focus {
    border-color: ${props => (props.error ? `${props.theme.colors.alert}` : props.theme.textfield.borderColorActive)};
  }
  &::placeholder {
    color: ${props => props.theme.textfield.placeholderColor};
    font-size: ${props => props.theme.textfield.placeholderFontSize};
    font-size: ${props => props.theme.textfield.placeholderFontWeight};
  }
  &:read-only,
  [readonly] {
    cursor: not-allowed;
  }
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`

interface Props {
  context: ConnectedWeb3Context
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn) => any
  handleDateChange: (date: Date | null) => any
  question: string
  resolution: Date | null
  lowerBound: Maybe<BigNumber>
  upperBound: Maybe<BigNumber>
  startingPoint: Maybe<BigNumber>
  unit: string
  tomorrow: Date
  categoriesCustom: string[]
  category: string
  categoryButtonFocus: boolean
  first: number
  handleCategoryChange: (e: any) => void
  loadMoreButton: boolean
  setFirst: React.Dispatch<React.SetStateAction<number>>
  toggleCategoryButtonFocus: () => void
  arbitrator: Arbitrator
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  arbitratorsCustom: Arbitrator[]
}

export const CreateScalarMarket = (props: Props) => {
  const {
    arbitrator,
    arbitratorsCustom,
    categoriesCustom,
    category,
    categoryButtonFocus,
    context,
    first,
    handleArbitratorChange,
    handleCategoryChange,
    handleChange,
    handleDateChange,
    loadMoreButton,
    lowerBound,
    question,
    resolution,
    setFirst,
    startingPoint,
    toggleCategoryButtonFocus,
    tomorrow,
    unit,
    upperBound,
  } = props

  let lowerBoundError
  let startingPointError
  let upperBoundError
  let startingPointNumber
  let lowerBoundNumber
  let upperBoundNumber
  // if the input values aren't null the number is cast to BigNumber with 18 decimals and precision value of 2
  if (startingPoint !== null) {
    startingPointNumber = formatBigNumber(startingPoint, 18, 2)
  }

  if (lowerBound !== null) {
    lowerBoundNumber = formatBigNumber(lowerBound, 18, 2)
  }

  if (upperBound !== null) {
    upperBoundNumber = formatBigNumber(upperBound, 18, 2)
  }
  //check for values to be non negative integers
  if (startingPointNumber !== undefined && startingPointNumber < '0') {
    startingPointError = 'Value must be greater than 0'
  }

  if (lowerBoundNumber !== undefined && lowerBoundNumber < '0') {
    lowerBoundError = 'Value must be greater than 0'
  }

  if (upperBoundNumber !== undefined && upperBoundNumber < '0') {
    upperBoundError = 'Value must be greater than 0'
  }
  //checks if error is appropriate or not. if true, displays error and removes decimals from numbers in error message.
  //checks for starting point to not be undefined and not equal 0. this prevents unwanted error messages like "lower bound must be less than 0."
  if (
    Number(startingPointNumber) > Number(upperBoundNumber) &&
    upperBoundNumber !== undefined &&
    Number(upperBoundNumber) > 0
  ) {
    startingPointError = `Value must be less than ${upperBoundNumber.slice(0, upperBoundNumber.length - 3)}`
  }

  if (
    Number(lowerBoundNumber) > Number(startingPointNumber) &&
    startingPointNumber !== undefined &&
    Number(startingPointNumber) > 0
  ) {
    lowerBoundError = `Value must be less than ${startingPointNumber.slice(0, startingPointNumber.length - 3)}`
  }

  if (
    Number(lowerBoundNumber) > Number(upperBoundNumber) &&
    upperBoundNumber !== undefined &&
    Number(upperBoundNumber) > 0
  ) {
    lowerBoundError = `Value must be less than ${upperBoundNumber.slice(0, upperBoundNumber.length - 3)}`
  }

  return (
    <>
      <FormRow
        formField={
          <QuestionInput
            context={context}
            disabled={false}
            name="question"
            onChange={handleChange}
            placeholder="What question do you want the world predict?"
            value={question}
          />
        }
      />

      <RowWrapper>
        <Row>
          <FormRow
            error={lowerBoundError}
            formField={
              <NumericalInput
                decimals={STANDARD_DECIMALS}
                error={lowerBoundError}
                min={0}
                name="lowerBound"
                onChange={handleChange}
                placeholder={'0'}
                value={lowerBound}
                valueToDisplay={''}
              />
            }
            style={{ marginTop: 0 }}
            title={'Lower Bound'}
          />

          <FormRow
            error={upperBoundError}
            formField={
              <NumericalInput
                decimals={STANDARD_DECIMALS}
                error={upperBoundError}
                min={0}
                name="upperBound"
                onChange={handleChange}
                placeholder={'1000'}
                value={upperBound}
              />
            }
            style={{ marginTop: 0 }}
            title={'Upper Bound'}
          />
        </Row>
        <Row>
          <FormRow
            error={startingPointError}
            formField={
              <NumericalInput
                decimals={STANDARD_DECIMALS}
                error={startingPointError}
                min={0}
                name="startingPoint"
                onChange={handleChange}
                placeholder={'500'}
                value={startingPoint}
              />
            }
            title={'Starting Point'}
          />
          <FormRow
            formField={<Textfield name="unit" onChange={handleChange} placeholder="Ether" value={unit} />}
            title={'Unit of measurement'}
          />
        </Row>
        <Row>
          <FormRow
            formField={
              <DateField
                disabled={false}
                minDate={tomorrow}
                name="resolution"
                onChange={handleDateChange}
                selected={resolution}
              />
            }
            style={{ marginBottom: '20px' }}
            title={'Closing Date (UTC)'}
          />
          <FormRow
            formField={
              <ButtonCategory
                buttonType={ButtonType.secondaryLine}
                disabled={false}
                focus={categoryButtonFocus}
                isACategorySelected={category !== ''}
                onClick={toggleCategoryButtonFocus}
              >
                <ButtonCategoryTextOverflow>{category ? category : 'Select Category'}</ButtonCategoryTextOverflow>
              </ButtonCategory>
            }
            style={{ marginBottom: '20px' }}
            title={'Category'}
          />
        </Row>
      </RowWrapper>
      {categoryButtonFocus && (
        <Categories
          categories={categoriesCustom}
          first={first}
          loadMoreButton={loadMoreButton}
          name="category"
          onChange={handleCategoryChange}
          selectedCategory={category.toLowerCase()}
          setFirst={setFirst}
        />
      )}
      <FormRow
        formField={
          <Arbitrators
            customValues={arbitratorsCustom}
            disabled={false}
            networkId={context.networkId}
            onChangeArbitrator={handleArbitratorChange}
            value={arbitrator}
          />
        }
        style={{ marginTop: 0, marginBottom: 0 }}
        title={'Arbitrator'}
      />
      <WarningMessage
        additionalDescription={'.'}
        description={
          "Set the market closing date at least 6 days after the correct outcome will be known and make sure that this market won't be "
        }
        href={DOCUMENT_VALIDITY_RULES}
        hyperlinkDescription={'invalid'}
      />
    </>
  )
}
