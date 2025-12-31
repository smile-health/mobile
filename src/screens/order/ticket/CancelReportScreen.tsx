import React, { useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useForm, FieldValues } from 'react-hook-form'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import OrderCommentSection from '@/screens/order/component/section/OrderCommentSection'
import { useTicketDetail } from '@/screens/order/hooks/useTicketDetail'
import { getTestID } from '@/utils/CommonUtils'
import { TICKET_STATUS } from '@/utils/Constants'

interface Props extends AppStackScreenProps<'CancelReport'> {}

interface CancelReportForm extends FieldValues {
  comment: string
}

interface UpdateEventReportPayload {
  update_status_id: number
  comment?: string
}

export default function CancelReportScreen({ route }: Props) {
  const { ticketId } = route.params
  const { t } = useLanguage()
  const navigation = useNavigation()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const {
    control,
    formState: { errors },
    getValues,
  } = useForm<CancelReportForm>({
    defaultValues: {
      comment: '',
    },
  })

  const { handleUpdateEventReport } = useTicketDetail(ticketId)

  useToolbar({
    title: t(['title.cancel_report']),
  })

  const handleCancelPress = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmCancel = async () => {
    try {
      const { comment } = getValues()
      const trimmedComment = comment.trim()
      const updateData: UpdateEventReportPayload = {
        update_status_id: TICKET_STATUS.CANCELED,
      }

      if (trimmedComment) {
        updateData.comment = trimmedComment
      }

      await handleUpdateEventReport(updateData)
      setShowConfirmDialog(false)
      navigation.goBack()
    } catch {
      setShowConfirmDialog(false)
    }
  }

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <View className='flex-1'>
        <OrderCommentSection
          t={t}
          control={control as any}
          errors={errors.comment?.message}
        />
      </View>

      <View className='bg-white p-4 mt-auto'>
        <Button
          preset='outlined'
          text={t(['button.cancel_ticket'])}
          onPress={handleCancelPress}
          {...getTestID('btn-cancel-report')}
        />
      </View>

      <ConfirmationDialog
        modalVisible={showConfirmDialog}
        title={t(['dialog.cancel_ticket'])}
        message={t(['dialog.confirmation_cancel_ticket'])}
        confirmText={t(['button.yes'])}
        cancelText={t(['button.cancel'])}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirmDialog(false)}
        dismissDialog={() => setShowConfirmDialog(false)}
      />
    </View>
  )
}
