import React from 'react'
import { FlatList, View, Text, TouchableOpacity } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { StockDetail } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  activityStocks: StockDetail[]
  onSelectActivity: (item: StockDetail) => void
}

function SelectActivityStockBottomSheet({
  activityStocks,
  onSelectActivity,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderHeader = () => (
    <View className='flex-row items-center'>
      <Text className={cn(AppStyles.textBold, 'flex-1')}>
        {t('section.select_another_activity')}
      </Text>
      <ImageButton Icon={Icons.IcDelete} size={20} onPress={toggleSheet} />
    </View>
  )
  const renderItem = ({ item }) => {
    const name = item.activity?.name ?? item.activity_name ?? ''

    return (
      <TouchableOpacity
        className='py-2'
        onPress={() => onSelectActivity(item)}
        {...getTestID(`ActivityStockItem-${name}`)}>
        <Text className={AppStyles.textRegular}>{name}</Text>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View className='flex-1 items-center'>
      <EmptyState
        testID='empty-state-activity-stock'
        Icon={Icons.IcEmptyStateOrder}
        title={t('empty_state.no_data_available')}
        subtitle={t('empty_state.no_data_message')}
      />
    </View>
  )

  return (
    <BottomSheet
      name='SelectActivityStockBottomSheet'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <FlatList
        data={activityStocks}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerClassName='bg-white p-4 gap-y-2'
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  )
}

export default SelectActivityStockBottomSheet
