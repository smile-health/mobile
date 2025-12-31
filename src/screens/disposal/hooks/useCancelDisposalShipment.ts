import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { useCancelDisposalShipmentMutation } from '@/services/apis'
import { formatErrorMessage, showError, showSuccess } from '@/utils/CommonUtils'

export default function useCancelDisposalShipment(id: number) {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const [cancelDisposalShipment, { isLoading }] =
    useCancelDisposalShipmentMutation()
  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const { control, watch } = useForm({
    defaultValues: { comment: '' },
  })
  const comment = watch('comment')

  const openDialog = () => setIsOpenDialog(true)
  const closeDialog = () => setIsOpenDialog(false)

  const confirmSubmitCancel = async () => {
    if (isLoading) return
    try {
      await cancelDisposalShipment({
        id,
        comment: comment || undefined,
      }).unwrap()
      navigation.goBack()
      showSuccess(t('disposal.success_cancel_shipment'))
    } catch (error) {
      showError(formatErrorMessage(error))
    } finally {
      closeDialog()
    }
  }

  return {
    control,
    isOpenDialog,
    isLoading,
    openDialog,
    closeDialog,
    confirmSubmitCancel,
  }
}
