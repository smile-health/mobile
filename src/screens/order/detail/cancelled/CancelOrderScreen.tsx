import React from 'react'
import { View, Text } from 'react-native'
import { ParseKeys } from 'i18next'
import { BaseButton } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import Dropdown from '@/components/dropdown/Dropdown'
import { TextField } from '@/components/forms'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { MAX_INPUT_LENGTH } from '@/utils/Constants'
import { useCancelOrder } from '../../hooks/useCancelOrder'

interface Props extends AppStackScreenProps<'CancelOrder'> {}

export default function CancelOrderScreen({ navigation, route }: Props) {
  const { orderId, type } = route.params

  const {
    formControl: {
      control,
      errors,
      watch: { reason },
    },
    datas: { orderCancelReasonData },
    status: {
      isOtherReason,
      isDisabledCancelOrder,
      isLoading,
      cancelButtonKey,
    },
    uiState: { isCancelOrderDialogOpen },
    actions: { toggleCancelOrderDialog, handleCancelOrder },
  } = useCancelOrder(navigation, orderId, type)
  const { t } = useLanguage()

  useToolbar({
    title: `${cancelButtonKey}: ${orderId}`,
  })

  return (
    <View className='flex-1 bg-lightGrey'>
      <View className='bg-white p-4 mb-2'>
        <Text className={cn(AppStyles.textBoldMedium, 'mb-2')}>
          {t('label.reason_of_cancellation')}
        </Text>
        <Dropdown
          isMandatory
          preset='bottom-border'
          name='reason'
          control={control}
          data={orderCancelReasonData}
          label={t('label.select_reason')}
          placeholder={t('label.select_reason')}
          labelField='value'
          valueField='reason_id'
          value={reason}
          errors={errors.reason?.message}
          itemTestIDField='id'
          itemAccessibilityLabelField='id'
          {...getTestID('dropdown-reason')}
        />
        {isOtherReason && (
          <TextField
            name='other_reason_text'
            control={control}
            maxLength={MAX_INPUT_LENGTH}
            label={t('label.other_reason')}
            placeholder={t('label.other_reason')}
            isMandatory
            errors={errors.other_reason_text?.message}
            {...getTestID('textfield-other-reason')}
          />
        )}
      </View>
      <View className='bg-white p-4 mb-2'>
        <Text className={cn(AppStyles.textBoldMedium, 'mb-2')}>
          {t('label.comment')}
        </Text>
        <TextField
          isMandatory
          name='comment'
          control={control}
          label={t('label.enter_comment')}
          placeholder={t('label.enter_comment')}
          labelClassName='mt-2'
          returnKeyType='done'
          errors={errors.comment?.message}
          {...getTestID('textfield-comment')}
        />
      </View>

      <View className='bg-white p-4 mt-auto'>
        <BaseButton
          preset='outlined'
          textClassName={cn(AppStyles.textMedium, 'text-main')}
          disabledTextClassName='text-lightSkyBlue'
          containerClassName='text-center border-main'
          disabledContainerClassName='bg-white border-lightSkyBlue'
          text={cancelButtonKey}
          onPress={toggleCancelOrderDialog}
          disabled={isDisabledCancelOrder}
          testID='btn-cancel-all'
        />
      </View>
      <ConfirmationDialog
        modalVisible={isCancelOrderDialogOpen}
        dismissDialog={toggleCancelOrderDialog}
        onCancel={toggleCancelOrderDialog}
        onConfirm={handleCancelOrder}
        title={t('dialog.cancel_order')}
        message={t('dialog.confirmation_cancel_order')}
        cancelText={t('button.cancel')}
        cancelProps={{
          textClassName: 'text-main px-2',
          containerClassName: 'rounded-md border border-main px-3 py-2',
          ...getTestID('btn-cancel-order'),
        }}
        confirmProps={{
          textClassName: 'text-white',
          containerClassName: 'rounded-md border border-main bg-main px-3 py-2',
          ...getTestID('btn-confirm-logout'),
        }}
      />
      <LoadingDialog
        modalVisible={isLoading}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-cancel-order'
      />
    </View>
  )
}
