import React, { useMemo } from 'react'
import { Text } from 'react-native'
import { TFunction } from 'i18next'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import {
  disposalStatusDialogConfig,
  disposalStatusNames,
} from '../../disposal-constant'

interface Props {
  status: number
  dialogVisible: boolean
  t: TFunction
  onConfirm: () => void
  onClose: () => void
}

function ShipmentStatusConfirmationDialog(props: Readonly<Props>) {
  const { t, status, dialogVisible, onConfirm, onClose } = props

  const dialogConfig = useMemo(
    () => disposalStatusDialogConfig[status],
    [status]
  )

  return (
    <ConfirmationDialog
      modalVisible={dialogVisible}
      title={t(dialogConfig.title)}
      confirmText={t('button.yes')}
      cancelText={t('button.cancel')}
      onConfirm={onConfirm}
      onCancel={onClose}
      dismissDialog={onClose}
      cancelProps={{
        containerClassName: 'rounded border border-main px-3 py-2',
        textClassName: 'text-main',
        ...getTestID(dialogConfig.cancelTestID),
      }}
      confirmProps={{
        containerClassName: 'rounded bg-main px-3 py-2',
        textClassName: 'text-mainText',
        ...getTestID(dialogConfig.confirmTestID),
      }}>
      <Text className={cn(AppStyles.textRegular, 'mb-6')}>
        {t(dialogConfig.message1)}
        <Text className={AppStyles.textBold}>
          {t(disposalStatusNames[status])}
          {', '}
        </Text>
        {t(dialogConfig.message2)}
      </Text>
    </ConfirmationDialog>
  )
}

export default ShipmentStatusConfirmationDialog
