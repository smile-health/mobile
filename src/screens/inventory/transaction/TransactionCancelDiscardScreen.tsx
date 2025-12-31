import React from 'react'
import { FlatList, View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { homeState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import CancelDiscardFilter from '../component/transaction/CancelDiscard/CancelDiscardFilter'
import CancelDiscardFilterBottomSheet from '../component/transaction/CancelDiscard/CancelDiscardFilterBottomSheet'
import TransactionDiscardItem from '../component/transaction/CancelDiscard/TransactionDiscardItem'
import useCancelDiscardTransaction from '../hooks/transactionCreate/useCancelDiscardTransaction'

interface Props extends AppStackScreenProps<'TransactionCancelDiscard'> {}

const TransactionDiscardListHeader = ({ itemCount }: { itemCount: number }) => {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <View className='flex-row bg-lightestBlue p-2 rounded-sm border-bluePrimary border gap-2'>
        <Icons.IcInfo height={16} width={16} fill={colors.marine} />
        <Text className={cn(AppStyles.textRegularSmall, 'flex-1')}>
          {t('transaction.please_select_transaction')}
        </Text>
      </View>
      <ListTitle
        title={t('label.discard_list')}
        itemCount={itemCount}
        className='px-0'
      />
    </React.Fragment>
  )
}

function TransactionCancelDiscardScreen({ route }: Props) {
  const { stock } = route.params
  const { activeMenu } = useAppSelector(homeState)
  const {
    isDisableSave,
    filter,
    isOpenFilter,
    transactionList,
    handleToggleFilter,
    handleRefreshList,
    shouldShowLoading,
    handleLoadMore,
    handleApplyFilter,
    checkIsSelected,
    handleSelectItem,
    handleSubmit,
  } = useCancelDiscardTransaction()

  const { t } = useLanguage()

  useToolbar({
    title: t(activeMenu?.name ?? '', activeMenu?.key ?? ''),
    actions: <RefreshHomeAction onRefresh={handleRefreshList} />,
  })

  const renderItem = ({ item }) => {
    return (
      <TransactionDiscardItem
        item={item}
        selected={checkIsSelected(item)}
        onPress={handleSelectItem}
        testID={`TransactionDiscardItem-${item.id}`}
      />
    )
  }

  const renderEmpty = () => (
    <View className='flex-1 h-full items-center'>
      <EmptyState
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
        testID='empty-state-transaction-discard'
      />
    </View>
  )
  return (
    <View className='flex-1 bg-catskillWhite'>
      <CancelDiscardFilter
        filter={filter}
        stock={stock}
        onApply={handleApplyFilter}
        onOpenFilter={handleToggleFilter}
      />
      <FlatList
        data={transactionList}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='flex-grow p-4'
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <TransactionDiscardListHeader itemCount={transactionList.length} />
        }
      />
      <CancelDiscardFilterBottomSheet
        isOpen={isOpenFilter}
        filter={filter}
        toggleSheet={handleToggleFilter}
        onApply={handleApplyFilter}
      />
      <View className='bg-white px-4 py-5 border-quillGrey border-t'>
        <Button
          preset='filled'
          disabled={isDisableSave}
          containerClassName='gap-x-2'
          text={t('button.save')}
          leftIconColor={colors.mainText()}
          LeftIcon={Icons.IcCheck}
          leftIconSize={20}
          onPress={handleSubmit}
          {...getTestID('btn-save-cancel-discard-transaction')}
        />
      </View>
      <LoadingDialog
        testID='loadingdialog-transaction-discard'
        modalVisible={shouldShowLoading}
      />
    </View>
  )
}

export default TransactionCancelDiscardScreen
