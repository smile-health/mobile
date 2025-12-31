import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { homeState, useAppSelector } from '@/services/store'
import StockTakingMaterialList from './components/StockTakingMaterialList'
import StockTakingMaterialListHeader from './components/StockTakingMaterialListHeader'
import StockTakingPeriodHeader from './components/StockTakingPeriodHeader'
import { useStockTakingMaterial } from './hooks/useStockTakingMaterial'
import { useStockTakingPeriod } from './hooks/useStockTakingPeriod'

interface Props extends AppStackScreenProps<'StockTakingMaterial'> {}

export default function StockTakingMaterialScreen({
  navigation,
  route,
}: Props) {
  const { activeMenu } = useAppSelector(homeState)
  const { t } = useLanguage()

  const {
    selectedPeriod,
    periodList,
    isLoadingPeriod,
    handleSelectPeriod,
    refreshPeriodList,
    dispatch,
    setPeriod,
  } = useStockTakingPeriod()

  const {
    page,
    title,
    searchControl,
    materialList,
    isLoadingMaterial,
    handleRefreshMaterial,
    handleSelectMaterial,
    handleLoadMore,
    handleSearchMaterial,
  } = useStockTakingMaterial(selectedPeriod)

  const handleRefreshList = () => {
    refreshPeriodList()
    handleRefreshMaterial()
  }

  useToolbar({
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  useEffect(() => {
    if (route.params?.needRefresh) {
      handleRefreshMaterial()
      navigation.setParams({ needRefresh: false })
    }
  }, [handleRefreshMaterial, navigation, route.params?.needRefresh])

  useEffect(
    () => () => {
      dispatch(setPeriod())
    },
    [dispatch, setPeriod]
  )

  return (
    <View className='flex-1 bg-white'>
      <StockTakingPeriodHeader
        period={selectedPeriod}
        periodList={periodList}
        onSelectPeriod={handleSelectPeriod}
      />

      {selectedPeriod && (
        <StockTakingMaterialListHeader
          title={title}
          control={searchControl}
          itemCount={materialList.length}
          onSearch={handleSearchMaterial}
        />
      )}

      {selectedPeriod ? (
        <StockTakingMaterialList
          materials={materialList}
          isLoading={isLoadingMaterial && page === 1}
          isLoadMore={isLoadingMaterial}
          onLoadMore={handleLoadMore}
          onSelectMaterial={handleSelectMaterial}
          emptyMessage={t('empty_state.no_data_message')}
        />
      ) : (
        <View className='flex-1 items-center'>
          <EmptyState
            testID='empty-state-period'
            Icon={Icons.IcEmptyStateOrder}
            title={t('empty_state.no_data_available')}
            subtitle={t('empty_state.no_stock_taking_period')}
          />
        </View>
      )}

      <LoadingDialog
        testID='loadingdialog-period'
        modalVisible={isLoadingPeriod}
      />
    </View>
  )
}
