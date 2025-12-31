import React from 'react'
import { View } from 'react-native'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { MENU_NAMES } from '@/utils/Constants'
import SelfDisposalList from '../components/SelfDisposalList'
import SelfDisposalListFilter from '../components/SelfDisposalListFilter'
import SelfDisposalListFilterBottomSheet from '../components/SelfDisposalListFilterBottomSheet'
import useSelfDisposalList from '../hooks/useSelfDisposalList'

export default function ViewSelfDisposalListScreen() {
  const { t } = useLanguage()

  const {
    activityList,
    materialList,
    sections,
    page,
    filter,
    filterText,
    isOpenFilter,
    shouldShowLoading,
    handleRefreshList,
    handleToggleFilter,
    handleApplyFilter,
    handleLoadMore,
  } = useSelfDisposalList()

  useToolbar({
    title: t(MENU_NAMES.DISPOSAL.LIST_SELF_DISPOSAL),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  return (
    <View className='flex-1 bg-slate-100'>
      <SelfDisposalListFilter
        filter={filter}
        filterText={filterText}
        onOpenFilter={handleToggleFilter}
        onApply={handleApplyFilter}
      />

      <SelfDisposalList
        data={sections}
        onEndReached={handleLoadMore}
        isLoading={shouldShowLoading && page > 1}
      />

      <SelfDisposalListFilterBottomSheet
        filter={filter}
        isOpen={isOpenFilter}
        toggleSheet={handleToggleFilter}
        onApply={handleApplyFilter}
        activities={activityList}
        materials={materialList}
      />

      <LoadingDialog
        modalVisible={shouldShowLoading && page === 1}
        testID='loading-dialog-self-disposal-list'
      />
    </View>
  )
}
