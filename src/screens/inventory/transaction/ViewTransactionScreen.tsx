import React from 'react'
import { View } from 'react-native'
import { ParseKeys } from 'i18next'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { homeState, useAppSelector } from '@/services/store'
import TransactionFilterBottomSheet from '../component/transactionList/TransactionFilterBottomSheet'
import TransactionList from '../component/transactionList/TransactionList'
import TransactionListFilter from '../component/transactionList/TransactionListFilter'
import useTransactionList from '../hooks/transactionList/useTransactionList'

export default function ViewTransactionScreen() {
  const { activeMenu } = useAppSelector(homeState)
  const { t } = useLanguage()

  const {
    sections,
    page,
    filter,
    filterText,
    isOpenFilter,
    shouldShowLoading,
    activityList,
    trxTypeList,
    materialList,
    currentProgramName,
    isHierarchy,
    handleRefreshList,
    handleToggleFilter,
    handleResetFilter,
    handleApplyFilter,
    handleLoadMore,
  } = useTransactionList()

  useToolbar({
    title: t(activeMenu?.name as ParseKeys, activeMenu?.key || ''),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  return (
    <View className='flex-1 bg-slate-100'>
      <TransactionListFilter
        filter={filter}
        onApply={handleApplyFilter}
        filterText={filterText}
        onOpenFilter={handleToggleFilter}
        onResetFilter={handleResetFilter}
      />
      <TransactionList
        filter={filter}
        sections={sections}
        onEndReach={handleLoadMore}
        isHierarchy={isHierarchy}
        programName={currentProgramName}
        isLoading={shouldShowLoading && page > 1}
      />
      <TransactionFilterBottomSheet
        filter={filter}
        isOpen={isOpenFilter}
        isHierarchy={isHierarchy}
        name='TransactionFilterBottomSheet'
        toggleSheet={handleToggleFilter}
        transactionTypes={trxTypeList}
        activities={activityList}
        materials={materialList}
        onApply={handleApplyFilter}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading && page === 1}
        testID='loading-dialog-transaction-list'
      />
    </View>
  )
}
