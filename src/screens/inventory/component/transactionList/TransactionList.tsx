import React, { useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  SectionList,
  SectionListData,
  View,
} from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import ListSectionDateSeparator from '@/components/list/ListSectionDateSeparator'
import { useLanguage } from '@/i18n/useLanguage'
import {
  Transaction,
  TransactionListFilter,
} from '@/models/transaction/Transaction'
import colors from '@/theme/colors'
import { isDateToday } from '@/utils/DateFormatUtils'
import TransactionItem from './TransactionItem'

interface TrxListSection {
  key: string
  title: string
  data: Transaction[]
}

interface TrxListSectionHeader {
  section: SectionListData<Transaction, TrxListSection>
}

interface TransactionListProps {
  filter: TransactionListFilter
  sections: TrxListSection[]
  isHierarchy: boolean
  programName: string
  isLoading: boolean
  onEndReach: () => void
}

function TransactionList(props: Readonly<TransactionListProps>) {
  const { filter, sections, isLoading, programName, isHierarchy, onEndReach } =
    props
  const { t } = useLanguage()

  const emptyState = useMemo(() => {
    const isFilterApplied = Object.keys(filter).length > 2
    const showTodayMessage = isDateToday(filter.start_date) && !isFilterApplied
    return {
      title: showTodayMessage
        ? t('empty_state.no_transaction_today')
        : t('empty_state.no_transaction_found'),
      subtitle: showTodayMessage
        ? t('empty_state.no_transaction_message')
        : t('empty_state.no_match_any_data_message'),
      icon: showTodayMessage
        ? Icons.IcEmptyStateOrder
        : Icons.IcEmptyStateSearch,
    }
  }, [filter, t])

  const renderItem = useCallback(
    ({ item }) => (
      <TransactionItem
        item={item}
        programName={programName}
        isHierarchy={isHierarchy}
      />
    ),
    [isHierarchy, programName]
  )

  const renderSectionHeader = ({ section }: TrxListSectionHeader) => (
    <ListSectionDateSeparator
      date={section.title}
      count={section.data.length}
    />
  )

  const renderFooter = () => {
    if (!isLoading) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.app()} />
      </View>
    )
  }

  const renderEmpty = () => (
    <EmptyState
      testID='empty-state-transaction'
      Icon={emptyState.icon}
      title={emptyState.title}
      subtitle={emptyState.subtitle}
    />
  )
  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      onEndReached={onEndReach}
      onEndReachedThreshold={0.5}
      initialNumToRender={5}
      keyExtractor={(item) => String(item.id)}
      contentContainerClassName='flex-grow bg-lightBlueGray'
      showsHorizontalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  )
}

export default React.memo(TransactionList)
