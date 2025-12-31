import React, { useCallback, useMemo } from 'react'
import { FlatList, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import EmptyState from '@/components/EmptyState'
import { SearchField } from '@/components/forms'
import { EntityItem } from '@/components/list/EntityItem'
import ListTitle from '@/components/list/ListTitle'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity } from '@/models/'

interface EntityListProps {
  data: BaseEntity[]
  onPress?: (val: BaseEntity) => void
}

export default function DisposalReceiverList({
  data,
  onPress,
}: Readonly<EntityListProps>) {
  const { t } = useLanguage()
  const { control, watch } = useForm<{ name: string }>()
  const watchedName = watch('name')

  const receiverList = useMemo(() => {
    if (!watchedName) return data
    return data.filter((item) =>
      item.name.toLowerCase().includes(watchedName.toLowerCase())
    )
  }, [watchedName, data])

  const renderItem = useCallback(
    ({ item }) => {
      return <EntityItem onPress={onPress} item={item} showFlag={false} />
    },
    [onPress]
  )

  const renderEmptyList = useCallback(() => {
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          testID='empty-state-receiver-list'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
        />
      </View>
    )
  }, [t])

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={receiverList}
      keyExtractor={(item) => String(item.id)}
      contentContainerClassName='pb-4 flex-grow'
      stickyHeaderIndices={[0]}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      ListHeaderComponent={
        <ReceiverListHeader
          control={control}
          count={receiverList.length}
          t={t}
        />
      }
    />
  )
}

function ReceiverListHeader({ control, count, t }) {
  return (
    <View className='bg-white'>
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t('disposal.search_receiver')}
        containerClassName='bg-white px-4 py-3 border-b border-b-whiteTwo'
      />
      <Banner
        title={t('disposal.select_receiver')}
        testID='receiver-list-info'
        titleClassName='flex-1'
        containerClassName='mb-0 mx-4 mt-4'
      />
      <ListTitle title={t('disposal.receiver_list')} itemCount={count} />
    </View>
  )
}
