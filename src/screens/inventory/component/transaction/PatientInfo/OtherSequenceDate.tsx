import React, { useMemo } from 'react'
import { Path, useFormContext } from 'react-hook-form'
import InputDate from '@/components/forms/InputDate'
import { CompletedSequenceForm } from '@/screens/inventory/schema/CompletedSequenceSchema'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'

interface OtherSequenceDateProps {
  parentIndex: number
  index: number
  title: string
}

const getDate = (value?: string | null) => {
  return (value ? stringToDate(value) : undefined) as Date | undefined
}

const getDateFieldName = (
  parentIndex: number,
  index: number
): Path<CompletedSequenceForm> => {
  return `patients.${parentIndex}.data.${index}.actual_transaction_date`
}

function OtherSequenceDate({
  parentIndex,
  index,
  title,
}: Readonly<OtherSequenceDateProps>) {
  const fieldName: Path<CompletedSequenceForm> = `patients.${parentIndex}.data.${index}`
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CompletedSequenceForm>()

  const defaultMaxDate = watch('actual_consumption_date')
  const actualTransactionDate = watch(`${fieldName}.actual_transaction_date`)
  const prevDateString = watch(getDateFieldName(parentIndex, index - 1))
  const nextDateString = watch(getDateFieldName(parentIndex, index + 1))

  const actualConsumptionDate = getDate(defaultMaxDate)

  const prevDate = useMemo(
    () => getDate(prevDateString as string | undefined),
    [prevDateString]
  )
  const currentDate = useMemo(
    () => getDate(actualTransactionDate),
    [actualTransactionDate]
  )

  const nextDate = useMemo(
    () => getDate(nextDateString as string | undefined),
    [nextDateString]
  )

  const errorMessage =
    errors.patients?.[parentIndex]?.data?.[index]?.actual_transaction_date
      ?.message

  const handleDateChange = (date: Date) => {
    setValue(
      `${fieldName}.actual_transaction_date`,
      dateToString(date, DATE_FILTER_FORMAT),
      { shouldValidate: true }
    )
  }

  return (
    <InputDate
      date={currentDate}
      label={title}
      placeholder={title}
      minimumDate={prevDate}
      maximumDate={nextDate ?? actualConsumptionDate}
      className='flex-1'
      onDateChange={handleDateChange}
      isMandatory
      errors={errorMessage}
      testID={`inputdate-other-sequence-${parentIndex}-${index}`}
    />
  )
}

export default React.memo(OtherSequenceDate)
