import React from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/buttons'
import { TextField } from '@/components/forms'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import ShipmentStatusConfirmationDialog from '../components/shipment-list/ShipmentStatusConfirmationDialog'
import { DISPOSAL_STATUS } from '../disposal-constant'
import useCancelDisposalShipment from '../hooks/useCancelDisposalShipment'

interface Props extends AppStackScreenProps<'CancelDisposalShipment'> {}

export default function CancelDisposalShipmentScreen({ route }: Props) {
  const { t } = useLanguage()
  const {
    control,
    isLoading,
    isOpenDialog,
    openDialog,
    closeDialog,
    confirmSubmitCancel,
  } = useCancelDisposalShipment(route.params.data.id)

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <View className='bg-white p-4 gap-y-2'>
        <Text className={AppStyles.textBold}>{t('label.comment')}</Text>
        <TextField
          name='comment'
          control={control}
          label={t('label.comment')}
          placeholder={t('label.enter_comment')}
          returnKeyType='done'
          {...getTestID('textfield-comment')}
        />
      </View>
      <View className='bg-white p-4 mt-auto'>
        <Button
          preset='outlined-primary'
          text={t('disposal.cancel_shipment')}
          onPress={openDialog}
          {...getTestID('btn-submit-cancel-disposal-shipment')}
        />
      </View>
      <ShipmentStatusConfirmationDialog
        status={DISPOSAL_STATUS.CANCELLED}
        dialogVisible={isOpenDialog}
        onClose={closeDialog}
        onConfirm={confirmSubmitCancel}
        t={t}
      />
      <LoadingDialog
        modalVisible={isLoading}
        title={'dialog.hang_tight'}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn(AppStyles.textRegular, 'mt-4')}
        messageClassName={AppStyles.labelRegular}
        testID='loading-dialog-cancel-order'
      />
    </View>
  )
}
