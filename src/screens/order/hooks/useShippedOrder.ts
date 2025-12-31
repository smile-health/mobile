import { useCallback, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackParamList } from '@/navigators'
import { useShipOrderMutation } from '@/services/apis'
import { showError, showSuccess } from '@/utils/CommonUtils'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import {
  getErrorMessage,
  showFormattedError,
} from '@/utils/helpers/ErrorHelpers'
import { ShipOrderSchema } from '../schema/ShipOrderSchema'

export const useShippedOrder = (
  orderId: number,
  navigation: NativeStackNavigationProp<AppStackParamList, 'ShipOrder'>
) => {
  const { t } = useLanguage()
  const [shipOrder, { isLoading }] = useShipOrderMutation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(ShipOrderSchema()),
    mode: 'onChange',
    defaultValues: {
      sales_ref: '',
      comment: '',
      estimated_date: '',
      taken_by_customer: 0,
      actual_shipment_date: '',
    },
  })

  const form = watch()

  const handleDateChange = useCallback(
    (field: 'estimated_date' | 'actual_shipment_date') => (val: Date) => {
      setValue(field, dateToString(val, DATE_FILTER_FORMAT))
    },
    [setValue]
  )

  const toogleCancelDialog = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  const normalizeNullable = (value?: string | null): string | null => {
    return value?.trim() ? value : null
  }

  const processShipOrder = async () => {
    if (isLoading) return
    try {
      const payload = {
        id: orderId,
        sales_ref: normalizeNullable(form.sales_ref),
        estimated_date: normalizeNullable(form.estimated_date),
        taken_by_customer: Number(form.taken_by_customer),
        actual_shipment_date: form.actual_shipment_date,
        comment: normalizeNullable(form.comment),
      }

      const response = await shipOrder(payload)

      if (response?.error) {
        showFormattedError(response?.error)
        return
      }

      showSuccess(t('order.success_ship_order'), 'snackbar-success-ship-order')
      navigation.goBack()
    } catch (error) {
      showError(getErrorMessage(error, t))
    }
  }

  const handleShipOrder = async () => {
    setIsDialogOpen(false)
    await processShipOrder()
  }

  const arrivalDate = form.estimated_date
    ? stringToDate(form.estimated_date)
    : undefined

  const deliveryDate = form.actual_shipment_date
    ? stringToDate(form.actual_shipment_date)
    : undefined

  return {
    form,
    control,
    errors,
    isLoading,
    arrivalDate,
    deliveryDate,
    isDialogOpen,
    handleDateChange,
    handleShipOrder,
    toogleCancelDialog,
    canShipOrder: !form.actual_shipment_date || isLoading,
  }
}
