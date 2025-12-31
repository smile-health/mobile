import React from 'react'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface ConfirmationDialogOrderProps {
  isDialogOpen: boolean
  toggleDialog: () => void
  handleSave: () => void
  recommendedStock: number
}

export const ConfirmationDialogOrder: React.FC<
  ConfirmationDialogOrderProps
> = ({ isDialogOpen, toggleDialog, handleSave, recommendedStock }) => {
  const { t } = useLanguage()

  return (
    <ConfirmationDialog
      modalVisible={isDialogOpen}
      dismissDialog={toggleDialog}
      onCancel={toggleDialog}
      onConfirm={handleSave}
      title={t('dialog.order_not_recommended_title')}
      message={t('dialog.order_not_recommended_subtitle', {
        qty: numberFormat(recommendedStock),
      })}
      cancelText={t('button.cancel')}
      cancelProps={{
        textClassName: 'text-deepBlue px-2',
        containerClassName: 'rounded-md border border-deepBlue px-3 py-2',
        ...getTestID('btn-cancel-order'),
      }}
      confirmProps={{
        textClassName: 'text-white',
        containerClassName: 'rounded-md border bg-deepBlue px-3 py-2',
        ...getTestID('btn-save-order'),
      }}
    />
  )
}
