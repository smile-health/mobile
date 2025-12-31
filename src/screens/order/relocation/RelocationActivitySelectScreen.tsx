import React from 'react'
import { View } from 'react-native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import ActivityList from '@/components/list/ActivityList'
import { useLanguage } from '@/i18n/useLanguage'
import useRelocationActivityList from '../hooks/relocation/useRelocationActivityList'

export default function RelocationActivitySelectScreen() {
  const {
    activityRelocation,
    activities,
    isOpenModalExist,
    closeModalExist,
    handleSelectActivity,
  } = useRelocationActivityList()

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList
        data={activities}
        activity={activityRelocation}
        onPress={handleSelectActivity}
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExist}
        title={t('dialog.information')}
        message={t('dialog.have_order_draft')}
        cancelText={t('button.ok')}
        dismissDialog={closeModalExist}
        onCancel={closeModalExist}
      />
    </View>
  )
}
