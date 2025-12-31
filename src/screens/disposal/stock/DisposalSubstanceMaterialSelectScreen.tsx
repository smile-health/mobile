import React from 'react'
import { View } from 'react-native'
import { ParseKeys } from 'i18next'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { homeState, useAppSelector } from '@/services/store'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import DisposalMaterialList from '../component/DisposalMaterialList'
import { useDisposalSubstanceMaterialStock } from '../hooks/useDisposalSubstanceMaterialStock'

export default function DisposalSubstanceMaterialSelectScreen() {
  const {
    stockActivity,
    stockList,
    loadMore,
    hasMoreData,
    shouldShowLoading,
    page,
    refresh,
    navigateToTrademarkMaterialList,
  } = useDisposalSubstanceMaterialStock({})

  const { activeMenu } = useAppSelector(homeState)
  const { t } = useLanguage()

  useToolbar({
    title: t(activeMenu?.name as ParseKeys, activeMenu?.key ?? ''),
    actions: <RefreshHomeAction onRefresh={refresh} />,
  })

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={stockActivity?.name} />
      <DisposalMaterialList
        type={MATERIAL_LIST_TYPE.VIEW_DISPOSAL_SUBSTANCE_STOCK}
        data={stockList}
        title={t('label.active_ingredient_material_list')}
        onPressMaterial={navigateToTrademarkMaterialList}
        onEndReach={hasMoreData ? loadMore : undefined}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading && page === 1}
        testID='loading-dialog-disposal-substance-material-list'
      />
    </View>
  )
}
