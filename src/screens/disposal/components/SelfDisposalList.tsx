import React, { useCallback } from 'react'
import { SectionList, SectionListRenderItemInfo } from 'react-native'
import { Icons } from '@/assets/icons'
import CircularLoadingIndicator from '@/components/CircularLoadingIndicator'
import EmptyState from '@/components/EmptyState'
import ListSectionDateSeparator from '@/components/list/ListSectionDateSeparator'
import { useLanguage } from '@/i18n/useLanguage'
import { SelfDisposalListRecord } from '@/models/disposal/SelfDisposalList'
import SelfDisposalListItem from './SelfDisposalListItem'
interface SelfDisposalSection {
  title: string // The formatted date
  data: SelfDisposalListRecord[]
}

interface SelfDisposalListProps {
  data: SelfDisposalSection[]
  onEndReached: () => void
  isLoading: boolean
}

export default function SelfDisposalList({
  data,
  onEndReached,
  isLoading,
}: Readonly<SelfDisposalListProps>) {
  const { t } = useLanguage()
  const renderItem = useCallback(
    ({ item }: SectionListRenderItemInfo<SelfDisposalListRecord>) => (
      <SelfDisposalListItem item={item} />
    ),
    []
  )

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <ListSectionDateSeparator
        date={section.title}
        count={section.data.length}
      />
    ),
    []
  )

  const renderFooter = useCallback(() => {
    if (!isLoading) return null
    return <CircularLoadingIndicator />
  }, [isLoading])

  // SectionList requires unique key for each item
  const keyExtractor = useCallback(
    (item: SelfDisposalListRecord, index: number) =>
      String(item.disposal_stock.id) + String(index),
    []
  )

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        testID='empty-state-self-disposal'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
      />
    ),
    [t]
  )

  return (
    <SectionList
      sections={data}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerClassName='gap-2 p-4'
      stickySectionHeadersEnabled={false}
    />
  )
}
