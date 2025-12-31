import React from 'react'
import { View } from 'react-native'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

type ActionButtonProps = {
  text: string
  onPress: () => void | Promise<void>
  LeftIcon?: React.FC<any>
  preset?: 'outlined' | 'filled'
  testID?: string
}

type ConfirmationDialogProps = {
  title: string
  message: string
  isVisible: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

type ScreenFooterActionsProps = {
  primaryAction: ActionButtonProps
  secondaryAction?: ActionButtonProps
  confirmationDialog?: ConfirmationDialogProps
}

export default function ScreenFooterActions({
  primaryAction,
  secondaryAction,
  confirmationDialog,
}: Readonly<ScreenFooterActionsProps>) {
  const { t } = useLanguage()

  const renderButton = (action: ActionButtonProps, isPrimary: boolean) => {
    const preset = action.preset ?? (isPrimary ? 'filled' : 'outlined')
    const textClassName = isPrimary ? 'text-mainText' : 'text-main'
    const containerClassName = `flex-1 gap-x-2 ${
      isPrimary ? 'bg-main' : 'border-main'
    }`

    return (
      <Button
        preset={preset}
        textClassName={textClassName}
        containerClassName={containerClassName}
        text={action.text}
        LeftIcon={action.LeftIcon}
        leftIconColor={isPrimary ? colors.mainText() : colors.main()}
        onPress={action.onPress}
        {...getTestID(action.testID)}
      />
    )
  }

  return (
    <>
      <View className='flex-row p-4 bg-white border-quillGrey border-t gap-x-2'>
        {secondaryAction && renderButton(secondaryAction, false)}
        {renderButton(primaryAction, true)}
      </View>

      {confirmationDialog && (
        <ConfirmationDialog
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          cancelText={t('button.cancel')}
          modalVisible={confirmationDialog.isVisible}
          dismissDialog={confirmationDialog.onCancel}
          onCancel={confirmationDialog.onCancel}
          onConfirm={confirmationDialog.onConfirm}
          cancelProps={{
            containerClassName: 'rounded border border-main px-3 py-2',
            textClassName: 'text-main',
            ...getTestID('btn-cancel-dialog'),
          }}
          confirmProps={{
            containerClassName: 'rounded bg-main px-3 py-2',
            textClassName: 'text-white',
            ...getTestID('btn-confirm-dialog'),
          }}
        />
      )}
    </>
  )
}
