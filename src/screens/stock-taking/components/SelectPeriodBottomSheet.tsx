import React, { useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { Period } from '@/models/stock-taking/StockTakingPeriod'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends Omit<BottomSheetProps, 'name'> {
  data: Period[]
  onSelect: (item: Period) => void
}

function SelectPeriodBottomSheet({
  data,
  onSelect,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const handleSelectItem = useCallback(
    (item: Period) => {
      onSelect(item)
      toggleSheet()
    },
    [onSelect, toggleSheet]
  )

  const renderItem = useCallback(
    (item: Period) => {
      return (
        <TouchableOpacity
          key={item.name}
          onPress={() => handleSelectItem(item)}
          className='flex-row items-center px-2 py-3 border-b border-quillGrey'
          {...getTestID(item.name)}>
          <Text className={AppStyles.textMedium} style={flexStyle}>
            {item.name}
          </Text>
          <Icons.IcChevronRightActive />
        </TouchableOpacity>
      )
    },
    [handleSelectItem]
  )

  const renderEmptyList = () => {
    return (
      <View className='flex-1 items-center'>
        <EmptyState
          testID='empty-state-period-list'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
        />
      </View>
    )
  }

  return (
    <BottomSheet
      name='SelectPeriodBottomSheet'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <View className='p-4'>
        <View className='flex-row justify-between items-center mb-4'>
          <Text className={AppStyles.textBold}>
            {t('stock_taking.select_period')}
          </Text>
          <ImageButton
            onPress={toggleSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-filter')}
          />
        </View>
        {data.length > 0
          ? data.map((item) => renderItem(item))
          : renderEmptyList()}
      </View>
    </BottomSheet>
  )
}

export default React.memo(SelectPeriodBottomSheet)
