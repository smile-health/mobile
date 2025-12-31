import React, { useCallback } from 'react'
import { FlatList, View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialListHeader from '@/components/list/MaterialListHeader'
import ReconciliationMaterialItem from './components/ReconciliationMaterialItem'
import useReconciliationMaterial from './hooks/useReconciliationMaterial'

export default function ReconciliationMaterialScreen() {
  const { t, control, activity, materials, handlePressMaterial } =
    useReconciliationMaterial()

  const renderItem = useCallback(
    ({ item }) => (
      <ReconciliationMaterialItem
        name={item.name}
        onPress={() => handlePressMaterial(item)}
      />
    ),
    [handlePressMaterial]
  )

  const renderEmpty = () => (
    <View className='flex-1 items-center'>
      <EmptyState
        testID='empty-state-material'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
      />
    </View>
  )

  const keyExtractor = (item, index) => `${item.id}-${index}`

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity.name} />
      <FlatList
        data={materials}
        contentContainerClassName='flex-grow bg-white'
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <MaterialListHeader control={control} itemCount={materials.length} />
        }
      />
    </View>
  )
}
