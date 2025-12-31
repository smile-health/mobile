import React from 'react'
import { View } from 'react-native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import ActivityList from '@/components/list/ActivityList'
import { useLanguage } from '@/i18n/useLanguage'
import { ORDER_KEY } from '@/utils/Constants'
import useOrderActivity from '../hooks/useOrderActivity'

export default function RegularSelectActivityScreen() {
  const {
    activities,
    orderActivity,
    handleSelectActivity,
    closeModalExistOrder,
    isOpenModalExistOrder,
  } = useOrderActivity(ORDER_KEY.REGULAR)

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList
        data={activities}
        activity={orderActivity}
        onPress={handleSelectActivity}
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExistOrder}
        dismissDialog={closeModalExistOrder}
        title={t('dialog.information')}
        message={t('dialog.have_order_draft')}
        cancelText={t('button.ok')}
        onCancel={closeModalExistOrder}
      />
    </View>
  )
}
