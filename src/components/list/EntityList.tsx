import React, { useMemo } from 'react'
import { FlatList, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { Control, useForm } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity, ENTITY_LIST_TYPE, EntityListType } from '@/models/'
import { EntityItem } from './EntityItem'
import ListTitle from './ListTitle'
import Banner from '../banner/Banner'
import EmptyState from '../EmptyState'
import { SearchField } from '../forms'

interface EntityListProps {
  data: BaseEntity[]
  type: EntityListType
  entity?: BaseEntity
  infoText?: string
  showInfo?: boolean
  onPress?: (val: BaseEntity) => void
}

export default function EntityList({
  data,
  type = ENTITY_LIST_TYPE.CUSTOMER,
  entity,
  infoText,
  showInfo = true,
  onPress,
}: Readonly<EntityListProps>) {
  const { t } = useLanguage()
  const { control, watch } = useForm<{ name: string }>()
  const watchedName = watch('name')

  const filteredItems = useMemo(() => {
    if (!watchedName) return data
    return data.filter((item) =>
      item.name.toLowerCase().includes(watchedName.toLowerCase())
    )
  }, [watchedName, data])

  const renderItem = ({ item }) => {
    const showFlag = entity?.id === item.id
    return <EntityItem onPress={onPress} item={item} showFlag={showFlag} />
  }

  const renderEmptyList = () => {
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          testID='empty-state-entity-list'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
        />
      </View>
    )
  }

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={filteredItems}
      keyExtractor={(item) => String(item.id)}
      stickyHeaderIndices={[0]}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      contentContainerClassName='pb-4 flex-grow'
      ListHeaderComponent={
        <EntityListHeader
          itemCount={data.length}
          control={control}
          type={type}
          infoText={infoText}
          showInfo={showInfo}
        />
      }
    />
  )
}

const entityTypeSchema: Record<
  string,
  { title: ParseKeys; placeholder: ParseKeys; info: ParseKeys }
> = {
  customer: {
    title: 'label.customer_list',
    placeholder: 'search_customer_name',
    info: 'home.select_customer',
  },
  vendor: {
    title: 'label.vendor_list',
    placeholder: 'search_vendor_name',
    info: 'home.select_vendor',
  },
}

const EntityListHeader = ({
  itemCount,
  control,
  type,
  infoText,
  showInfo,
}: {
  itemCount: number
  control: Control<any>
  type: keyof typeof entityTypeSchema
  infoText?: string
  showInfo: boolean
}) => {
  const { t } = useLanguage()
  return (
    <View className='bg-white'>
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t(entityTypeSchema[type].placeholder)}
        containerClassName='bg-white px-4 py-2 border-b border-b-whiteTwo'
      />
      {showInfo && (
        <Banner
          title={infoText ?? t(entityTypeSchema[type].info)}
          testID='entity-list-info'
          titleClassName='flex-1'
          containerClassName='mb-0 mx-4 mt-4'
        />
      )}
      <ListTitle
        title={t(entityTypeSchema[type].title)}
        itemCount={itemCount}
      />
    </View>
  )
}
