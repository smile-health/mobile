import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import {
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  UseFormClearErrors,
} from 'react-hook-form'
import * as yup from 'yup'
import { Button } from '@/components/buttons'
import { RadioButtonGroup } from '@/components/buttons/RadioButtonGroup'
import PickerSelect from '@/components/filter/PickerSelect'
import InputDate from '@/components/forms/InputDate'
import { TextField } from '@/components/forms/TextField'
import { IOptions } from '@/models/Common'
import { useAppSelector, workspaceState } from '@/services/store'
import {
  MAXIMUM_DATE_TICKET,
  MINIMUM_DATE_TICKET,
  PAGE,
  PAGINATE,
} from '@/utils/Constants'
import { navigate } from '@/utils/NavigationUtils'
import { getRadioOptions } from '../../helpers/TicketHelpers'
import { useOrderList } from '../../hooks/useOrderList'
import { createTicketSchema } from '../../schema/CreateTicketSchema'

type FormFields = yup.InferType<typeof createTicketSchema>

interface TicketFormSectionProps {
  readonly t: TFunction
  readonly control: Control<FormFields>
  readonly errors: FieldErrors<FormFields>
  readonly watch: UseFormWatch<FormFields>
  readonly setValue: UseFormSetValue<FormFields>
  readonly clearErrors: UseFormClearErrors<FormFields>
}

export default function TicketFormSection({
  t,
  control,
  errors,
  watch,
  setValue,
  clearErrors,
}: TicketFormSectionProps) {
  const [isSearchingOrderId, setIsSearchingOrderId] = useState(false)

  const arrivalDate = watch('arrivalDate')
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const { orders_number, isLoading, isFetching, refetch } = useOrderList({
    paginate: PAGINATE,
    page: PAGE,
    customer_id: selectedWorkspace?.entity_id,
  })

  const doNumber = watch('doNumber')
  const isSubmitted = watch('isSubmitted')

  useEffect(() => {
    setValue('doNumber', '')
    setValue('arrivalDate', undefined as any)

    clearErrors(['doNumber', 'arrivalDate'])
  }, [isSubmitted, setValue, clearErrors])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const orderOptions = useMemo(
    () =>
      orders_number.map((order) => ({
        label: order.id.toString(),
        value: order.id,
      })),
    [orders_number]
  )

  const handleSelectOrder = useCallback(
    (item: IOptions) => {
      setValue('doNumber', item.value.toString())
    },
    [setValue]
  )

  const handleSearchOrder = useCallback((text: string) => {
    setIsSearchingOrderId(text.trim().length > 0)
  }, [])

  const shouldShowButtonToDetailOrder = isSubmitted === 1 && doNumber !== ''
  const handlePress = () => {
    navigate('OrderDetail', { id: Number(doNumber), preview: true })
  }

  const renderDoNumberField = useMemo(
    () =>
      isSubmitted === 1 ? (
        <PickerSelect
          name='doNumber'
          testID='doNumber-picker'
          data={orderOptions}
          onSelect={handleSelectOrder}
          value={doNumber ? Number(doNumber) : null}
          title={t('ticket.order_number')}
          label={t('ticket.order_number')}
          search
          searchPlaceholder={t('ticket.order_number')}
          errors={errors.doNumber?.message as string}
          errorTestID='doNumber-error'
          isMandatory
          onRefresh={handleRefresh}
          isLoading={isLoading || isFetching}
          onSearch={handleSearchOrder}
          isSearching={isSearchingOrderId}
        />
      ) : (
        <TextField
          name='doNumber'
          control={control}
          label={t('ticket.do_number')}
          placeholder={t('ticket.do_number')}
          isMandatory
          errors={errors.doNumber?.message as string}
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isSubmitted,
      orderOptions,
      handleSelectOrder,
      doNumber,
      t,
      errors.doNumber?.message,
      control,
    ]
  )

  return (
    <View className='px-4 pt-2'>
      <Text className='text-gray-500 mb-1'>{t('ticket.section_1')}</Text>
      <Text className='font-bold text-lg mb-2'>{t('ticket.ticket_form')}</Text>
      <View className='flex-1'>
        <RadioButtonGroup
          label={t('ticket.is_submitted_smile')}
          items={getRadioOptions()}
          name='isSubmitted'
          control={control}
          labelField='label'
          valueField='value'
          horizontal={true}
          isMandatory
        />

        {renderDoNumberField}

        <InputDate
          label={t('ticket.arrival_date')}
          date={arrivalDate}
          onDateChange={(date: Date | null | undefined) => {
            if (date) {
              setValue('arrivalDate', date, { shouldValidate: true })
            }
          }}
          minimumDate={MINIMUM_DATE_TICKET}
          maximumDate={MAXIMUM_DATE_TICKET}
          isMandatory
          className='flex-1'
          errors={errors.arrivalDate?.message as string}
        />

        {shouldShowButtonToDetailOrder && (
          <View className='mt-6 flex-row justify-start'>
            <Button
              preset='outlined-primary'
              text={t('ticket.view_order_detail')}
              onPress={handlePress}
            />
          </View>
        )}
      </View>
    </View>
  )
}
