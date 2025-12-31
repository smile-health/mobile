import React, { useCallback, useState } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Icons } from '@/assets/icons'
import CircularLoadingIndicator from '@/components/CircularLoadingIndicator'
import EmptyState from '@/components/EmptyState'
import { SearchField } from '@/components/forms'

import ListTitle from '@/components/list/ListTitle'
import { SelfDisposal } from '@/models/disposal/CreateSelfDisposal'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import { DisposalMaterialInfoModal } from './DisposalMaterialInfoModal'
import DisposalMaterialItem from './DisposalMaterialItem'
import { DisposalType, disposalTypeLabel } from '../disposal-constant'

interface DisposalMaterialListProps {
  control: Control<any>
  data: DisposalStockItemResponse[]
  totalItems: number
  isFetching: boolean
  disposal: Record<number, SelfDisposal>
  type?: DisposalType
  onSelectMaterial: (material: DisposalStockItemResponse) => void
  onEndReached: () => void
}

function getDisposalQty(disposal, materialId) {
  return disposal?.[materialId]?.disposal
    ?.flatMap((item) => [...item.discard, ...item.received])
    ?.reduce((sum, cur) => {
      return sum + cur.disposal_qty
    }, 0)
}

export default function DisposalMaterialList({
  control,
  data,
  totalItems,
  isFetching,
  disposal,
  type,
  onSelectMaterial,
  onEndReached,
}: Readonly<DisposalMaterialListProps>) {
  const { t } = useTranslation()
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false)

  const handleOpenInfoModal = () => {
    setIsOpenInfoModal(true)
  }

  const handleCloseInfoModal = () => {
    setIsOpenInfoModal(false)
  }

  const renderHeader = useCallback(
    () => (
      <View className='flex-grow'>
        <SearchField
          testID='search-field-name'
          control={control}
          name='name'
          placeholder={t('search_material_name')}
          containerClassName='bg-white px-4 py-2 border-b border-b-whiteTwo'
        />
        <ListTitle
          title={t('label.material_list')}
          itemCount={totalItems}
          onPressInfo={handleOpenInfoModal}
          withInfoIcon
        />
      </View>
    ),
    [control, t, totalItems]
  )

  const getLabel = useCallback(
    (materialId: number) => {
      const total = getDisposalQty(disposal, materialId)

      if (total == null || total === 0 || !type) {
        return null
      }

      return t(disposalTypeLabel[type], { qty: total })
    },
    [disposal, t, type]
  )

  const renderItem: ListRenderItem<DisposalStockItemResponse> = useCallback(
    ({ item }) => {
      const label = getLabel(item.material.id)
      return (
        <DisposalMaterialItem
          material={item}
          label={label}
          onPress={() => onSelectMaterial(item)}
        />
      )
    },
    [getLabel, onSelectMaterial]
  )

  const renderLoader = useCallback(() => {
    if (!isFetching) return null

    return <CircularLoadingIndicator />
  }, [isFetching])

  const renderEmpty = () => {
    if (isFetching) return null
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
          testID='empty-state-disposal-material'
        />
      </View>
    )
  }

  const keyExtractor = useCallback(
    (item: DisposalStockItemResponse, index: number) =>
      item?.material_id?.toString() + index,
    []
  )

  return (
    <View className='pb-6 flex-1'>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderLoader}
        ListEmptyComponent={renderEmpty}
        contentContainerClassName='flex-grow gap-2'
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
      <DisposalMaterialInfoModal
        isOpenInfoModal={isOpenInfoModal}
        handleCloseInfoModal={handleCloseInfoModal}
      />
    </View>
  )
}
