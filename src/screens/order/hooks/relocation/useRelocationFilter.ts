import { useCallback, useEffect, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity } from '@/models'
import { IOptions } from '@/models/Common'
import { GetOrderFilters } from '@/models/order/Order'
import { setOrderFilter } from '@/services/features/order.slice'
import { orderState, useAppDispatch, useAppSelector } from '@/services/store'
import { showError } from '@/utils/CommonUtils'
import {
  ORDER_TYPE,
  orderIntegrationListNames,
  orderTypeListNames,
} from '@/utils/Constants'
import { stringToDate } from '@/utils/DateFormatUtils'

export const useRelocationFilter = ({
  vendor,
  customer,
  toggleSheet,
}: {
  vendor: BaseEntity[]
  customer: BaseEntity[]
  toggleSheet: () => void
}) => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { filter } = useAppSelector(orderState)

  const isSales = filter.purpose === 'sales'

  const { watch, reset, setValue, handleSubmit } = useForm<GetOrderFilters>({
    defaultValues: {
      customer_id: filter.customer_id,
      vendor_id: filter.vendor_id,
      activity_id: filter.activity_id,
      from_date: filter.from_date,
      to_date: filter.to_date,
      type: filter.type,
      integration: filter.integration,
    },
  })

  const form = watch()

  const transformToOptions = (items: BaseEntity[]) =>
    items.map((item) => ({ label: item.name, value: item.id }))

  const vendorOptions = transformToOptions(vendor)
  const customerOptions = transformToOptions(customer)

  const ORDER_TYPE_LIST = useMemo(
    () =>
      Object.entries(orderTypeListNames).map(([key, value]) => ({
        value: Number(key),
        label: t(value),
      })),
    [t]
  )

  const ORDER_INTEGRATION_LIST = useMemo(
    () =>
      Object.entries(orderIntegrationListNames).map(([key, value]) => ({
        value: key,
        label: value,
      })),
    []
  )

  const entityConfig = useMemo(
    () => ({
      list: isSales ? customerOptions : vendorOptions,
      label: isSales ? t('label.customer') : t('label.vendor'),
      name: isSales ? 'customer_id' : 'vendor_id',
      value: isSales ? form.customer_id : form.vendor_id,
    }),
    [
      isSales,
      customerOptions,
      vendorOptions,
      t,
      form.customer_id,
      form.vendor_id,
    ]
  )

  const [startDate, endDate] = useMemo(
    () => [
      form.from_date ? stringToDate(form.from_date) : undefined,
      form.to_date ? stringToDate(form.to_date) : undefined,
    ],
    [form.from_date, form.to_date]
  )

  useEffect(() => {
    reset({
      customer_id: filter.customer_id,
      vendor_id: filter.vendor_id,
      activity_id: filter.activity_id,
      from_date: filter.from_date,
      to_date: filter.to_date,
      type: filter.type,
      integration: filter.integration,
    })
  }, [filter, reset])

  const handleResetFilter = () => {
    reset({
      ...filter,
      customer_id: null,
      vendor_id: null,
      activity_id: null,
      from_date: null,
      to_date: null,
      type: null,
      integration: null,
    })
  }

  const dismissBottomSheet = () => {
    reset({
      customer_id: filter.customer_id,
      vendor_id: filter.vendor_id,
      activity_id: filter.activity_id,
      from_date: filter.from_date,
      to_date: filter.to_date,
      type: filter.type,
    })
    toggleSheet()
  }

  const handleSelectOrderType = useCallback(
    (item: IOptions) => setValue('type', item.value),
    [setValue]
  )

  const handleSelectOrderIntegration = useCallback(
    (item: IOptions) => setValue('integration', item.value),
    [setValue]
  )

  const handleSelectEntity = useCallback(
    (item: IOptions) => {
      return isSales
        ? setValue('customer_id', String(item.value))
        : setValue('vendor_id', String(item.value))
    },
    [isSales, setValue]
  )

  const handleSelectActivity = useCallback(
    (item: IOptions) => setValue('activity_id', item.value),
    [setValue]
  )

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      setValue('from_date', start)
      setValue('to_date', end)
    },
    [setValue]
  )

  const onPressApply: SubmitHandler<GetOrderFilters> = (data) => {
    if (startDate && endDate && startDate > endDate) {
      showError(t('error.invalid_range_date_filter'))
      return
    }
    dispatch(setOrderFilter(data))
    toggleSheet()
  }

  const isRelocationDisabled = form.type === ORDER_TYPE.RELOCATION && !isSales

  return {
    form,
    actions: {
      handleSubmit,
      handleResetFilter,
      handleApplyDateRange,
      handleSelectActivity,
      handleSelectEntity,
      handleSelectOrderType,
      handleSelectOrderIntegration,
      onPressApply,
      dismissBottomSheet,
    },
    data: {
      ORDER_TYPE_LIST,
      ORDER_INTEGRATION_LIST,
    },
    flags: {
      isRelocationDisabled,
    },
    entityConfig,
  }
}
