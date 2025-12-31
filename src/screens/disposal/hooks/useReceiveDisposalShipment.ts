import { useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentDetail } from '@/models/disposal/DisposalShipmentList'
import { useReceiveDisposalShipmentMutation } from '@/services/apis'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'
import {
  createReceivePayload,
  getReceiveShipmentItems,
} from '../helper/DisposalShipmentListHelper'
import {
  getReceiveDefaultValue,
  ReceiveShipmentForm,
  ReceiveShipmentFormSchema,
} from '../schema/ReceiveDisposalShipmentSchema'

export const isFormFilled = (form): boolean => {
  return form.items.every(
    (item) =>
      item.stocks?.length &&
      item.stocks.every((stock) => stock.received_qty > 0)
  )
}

function useReceiveDisposalShipment(data: IDisposalShipmentDetail) {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const [receiveShipment, { isLoading }] = useReceiveDisposalShipmentMutation()
  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const methods = useForm<ReceiveShipmentForm>({
    mode: 'onChange',
    resolver: yupResolver(ReceiveShipmentFormSchema),
    defaultValues: getReceiveDefaultValue(data),
  })

  const form = methods.watch()

  const disposalItems = useMemo(() => {
    return getReceiveShipmentItems(data.disposal_items)
  }, [data.disposal_items])

  const isSaveDisabled = useMemo(() => {
    return (
      !isFormFilled(form) || Object.values(methods.formState.errors).length > 0
    )
  }, [form, methods.formState.errors])

  const openDialog = () => setIsOpenDialog(true)
  const closeDialog = () => setIsOpenDialog(false)

  const confirmSubmitReceive = async () => {
    try {
      const payload = createReceivePayload(form)
      await receiveShipment(payload).unwrap()
      showSuccess(t('disposal.success_receive_shipment'))
      navigation.goBack()
    } catch (error) {
      showError(formatErrorMessage(error))
    } finally {
      closeDialog()
    }
  }

  return {
    disposalItems,
    methods,
    isSaveDisabled,
    isOpenDialog,
    isLoading,
    openDialog,
    closeDialog,
    confirmSubmitReceive,
  }
}

export default useReceiveDisposalShipment
