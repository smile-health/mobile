import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import PickerSelectBottomSheet from '@/components/bottomsheet/PickerSelectBottomSheet'
import EmptyState from '@/components/EmptyState'
import {
  getTicketMaterials,
  removeTicketMaterial,
} from '@/services/features/ticketReason.slice'
import { useAppSelector, useAppDispatch } from '@/services/store'
import { isNewMaterial } from '@/utils/helpers/MaterialHelpers'
import { MaterialPickerOption } from '../../types/order'
import WarningBox from '../detail/WarningBox'
import TicketMaterialItem from '../ticket/TicketMaterialItem'

interface TicketMaterialSectionProps {
  readonly t: TFunction
  readonly materials: MaterialPickerOption[]
}

export default function TicketMaterialSection({
  t,
  materials,
}: TicketMaterialSectionProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null)

  const ticketMaterials = useAppSelector(getTicketMaterials)
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  useFocusEffect(
    useCallback(() => {
      if (!ticketMaterials?.length) return

      for (const material of ticketMaterials) {
        let shouldRemove = false

        shouldRemove = material.is_managed_in_batch
          ? !material.batches?.length
          : !material.name?.trim() || !material.qty

        if (shouldRemove) {
          dispatch(removeTicketMaterial(material.id))
        }
      }
    }, [ticketMaterials, dispatch])
  )

  const newMaterials = [
    {
      label: t('ticket.new_material'),
      value: 0,
      isBatch: false,
    },
    ...materials,
  ]

  const handleAddMaterial = (item: MaterialPickerOption) => {
    setSelectedMaterial(item.value)
    setShowPicker(false)
    if (item.value === 0) {
      navigation.navigate('TicketingAddNewMaterial')
    } else {
      navigation.navigate('TicketMaterialDetail', {
        material: {
          id: item.value,
          name: item.label,
          is_managed_in_batch: item.isBatch,
          isSubmitted: 0,
        },
      })
    }
  }

  const handlePress = useCallback(
    (item) => {
      const isNewMaterialItem = isNewMaterial(item.id)

      if (isNewMaterialItem) {
        navigation.navigate('TicketingAddNewMaterial', {
          material: item,
          mode: item.is_managed_in_batch ? 'batch' : 'non-batch',
          isEdit: true,
        })
      } else {
        navigation.navigate('TicketMaterialDetail', {
          material: item,
          mode: item.is_managed_in_batch ? 'batch' : 'non-batch',
          isEdit: true,
        })
      }
    },
    [navigation]
  )

  const renderFooter = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className='my-4 flex-row items-center'>
        <Text className='text-xl text-main mr-1 mt-[-4]'>+</Text>
        <Text className='text-main'>{`${t('ticket.add_material')}(s)`}</Text>
      </TouchableOpacity>
    ),
    [t]
  )

  const renderMaterialItem = useCallback(
    ({ item }) => (
      <TicketMaterialItem
        item={item}
        t={t}
        handlePress={() => handlePress(item)}
      />
    ),
    [t, handlePress]
  )

  const renderEmpty = () => (
    <View className='flex-1 h-[350] items-center'>
      <EmptyState
        testID='empty-state-entity-list'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_material_message')}
      />
    </View>
  )

  const isRenderHeader = ticketMaterials?.length ? null : renderFooter
  const isRenderFooter = ticketMaterials?.length ? renderFooter : null

  return (
    <View className='px-4'>
      <Text className='text-gray-500 mt-4 mb-1'>{t('ticket.section_2')}</Text>
      <Text className='font-bold text-lg mb-2'>
        {t('ticket.material_data')}
      </Text>
      <WarningBox
        icon={<Icons.IcWarning width={18} height={18} />}
        title={t('ticket.material_input_guide')}
        subTitle={t('ticket.material_input_guide_subtitle')}
      />
      <FlatList
        data={ticketMaterials}
        renderItem={renderMaterialItem}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={isRenderHeader}
        ListFooterComponent={isRenderFooter}
        showsVerticalScrollIndicator={false}
      />
      {showPicker && (
        <PickerSelectBottomSheet
          isOpen={showPicker}
          toggleSheet={() => setShowPicker(false)}
          data={newMaterials}
          value={selectedMaterial}
          onSelect={handleAddMaterial}
          title={t('ticket.add_material')}
          search
          searchPlaceholder={t('search_material_name')}
          name='material-picker'
        />
      )}
    </View>
  )
}
