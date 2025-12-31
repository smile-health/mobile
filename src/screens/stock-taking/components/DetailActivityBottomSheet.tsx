import React, { useCallback } from 'react'
import { View, Text, ListRenderItem, Pressable, FlatList } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { CommonObject } from '@/models/Common'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  activities: CommonObject[]
  onSelectActivty: (item: CommonObject) => void
}

function DetailActivityBottomSheet({
  isOpen,
  toggleSheet,
  activities,
  onSelectActivty,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const renderItem: ListRenderItem<CommonObject> = useCallback(
    ({ item }) => (
      <Pressable
        className='flex-row items-center border border-quillGrey rounded-sm px-2 py-3'
        onPress={() => onSelectActivty(item)}
        {...getTestID(`activity-${item.id}`)}>
        <Text className={AppStyles.textMedium} style={flexStyle}>
          {item.name}
        </Text>
        <Icons.IcChevronRight />
      </Pressable>
    ),
    [onSelectActivty]
  )

  const renderEmptyList = useCallback(() => {
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          testID='empty-state-activity-list'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
        />
      </View>
    )
  }, [t])

  return (
    <BottomSheet
      name='DetailActivityBottomSheet'
      toggleSheet={toggleSheet}
      isOpen={isOpen}
      containerClassName='p-4 min-h-[33%] max-h-full'
      {...bottomSheetProps}>
      <View className='flex-row items-center justify-between'>
        <Text className={AppStyles.textBold}>{t('label.select_activity')}</Text>
        <ImageButton
          onPress={toggleSheet}
          Icon={Icons.IcDelete}
          size={20}
          {...getTestID('btn-close-detail-activity')}
        />
      </View>
      <Text className={AppStyles.labelRegular}>
        {t('stock_taking.add_new_detail')}
      </Text>
      <FlatList
        data={activities}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName='flex-grow gap-y-2 mt-4'
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  )
}

export default React.memo(DetailActivityBottomSheet)
