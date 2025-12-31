import React from 'react'
import { View } from 'react-native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import ActivityList from '@/components/list/ActivityList'
import { useLanguage } from '@/i18n/useLanguage'
import useTransactionActivityList from '../hooks/useTransactionActivityList'

export default function TransactionActivitySelectScreen() {
  const {
    activityTrx,
    activities,
    isOpenModalExistTrx,
    closeModalExistTrx,
    handleSelectActivity,
  } = useTransactionActivityList()

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList
        data={activities}
        activity={activityTrx}
        onPress={handleSelectActivity}
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExistTrx}
        dismissDialog={closeModalExistTrx}
        title={t('dialog.information')}
        message={t('dialog.have_transaction_draft')}
        cancelText={t('button.ok')}
        onCancel={closeModalExistTrx}
      />
    </View>
  )
}
