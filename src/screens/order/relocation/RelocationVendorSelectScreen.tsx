import React from 'react'
import { View } from 'react-native'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import EntityList from '@/components/list/EntityList'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { homeState, useAppSelector } from '@/services/store'
import useRelocationVendorList from '../hooks/relocation/useRelocationVendorList'

export default function RelocationVendorSelectScreen() {
  const { activeMenu } = useAppSelector(homeState)

  const {
    activity,
    entitites,
    vendorRelocation,
    isOpenModalExist,
    closeModalExist,
    handleSelectVendor,
    isLoading,
    refetchVendorList,
  } = useRelocationVendorList()

  const { t } = useLanguage()

  useToolbar({
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    actions: <RefreshHomeAction onRefresh={refetchVendorList} />,
  })

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity.name} />
      <EntityList
        data={entitites}
        entity={vendorRelocation}
        onPress={handleSelectVendor}
        type='vendor'
      />
      <ConfirmationDialog
        modalVisible={isOpenModalExist}
        title={t('dialog.information')}
        message={t('dialog.have_order_draft')}
        cancelText={t('button.ok')}
        dismissDialog={closeModalExist}
        onCancel={closeModalExist}
      />
      <LoadingDialog
        modalVisible={isLoading}
        testID='loading-dialog-vendor-relocation'
      />
    </View>
  )
}
