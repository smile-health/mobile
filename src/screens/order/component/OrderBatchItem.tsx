import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import CollapsableContainer from '@/components/CollapsableContainer'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateOrderStock } from '@/models/order/Distribution'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT, SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface OrderBatchItemProps {
  stock: CreateOrderStock
  activityName: string
  testID: string
  isSelected: boolean
  showAllocated?: boolean
  children?: React.ReactNode
  onToggleDetail?: () => void
}

function OrderBatchItem({
  testID,
  stock,
  activityName,
  isSelected,
  children,
  showAllocated = true,
  onToggleDetail,
}: Readonly<OrderBatchItemProps>) {
  const { t } = useLanguage()

  const { batch, updated_at, available, allocated, qty, activity_name } = stock
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isSelected ? '180deg' : '0deg') }],
  }))

  const _damping = 20

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(_damping)}
      className='mx-4 border-quillGrey border p-3 mb-2 rounded-sm'>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onToggleDetail}
        {...getTestID(testID)}>
        <View className='flex-row items-center gap-x-2'>
          <Text className={cn(AppStyles.textRegular, 'flex-1')}>
            {batch?.code}
          </Text>
          <ActivityLabel name={activity_name || activityName} />
          <Animated.View style={iconStyle}>
            <Icons.IcExpandMore height={20} width={20} />
          </Animated.View>
        </View>
        <InfoRow
          label={t('label.available_stock')}
          value={numberFormat(available)}
        />
        <Separator />
        <InfoRow
          label={t('label.expired')}
          value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <InfoRow
          label={t('label.manufacturer')}
          value={batch?.manufacture?.name ?? ''}
        />
      </TouchableOpacity>
      <CollapsableContainer expanded={isSelected}>
        <InfoRow
          label={t('label.updated_at')}
          value={convertString(updated_at, SHORT_DATE_TIME_FORMAT)}
          valueClassName='uppercase'
        />
        <InfoRow
          label={t('label.production_date')}
          value={convertString(batch?.production_date, SHORT_DATE_FORMAT)}
          valueClassName='uppercase'
        />
        <Separator />
        {showAllocated && (
          <Animated.View
            layout={LinearTransition.springify().damping(_damping)}>
            <InfoRow
              label={t('label.allocated_stock')}
              value={numberFormat(allocated)}
              valueClassName='uppercase'
            />
            <InfoRow
              label={t('label.stock_on_hand')}
              value={numberFormat(qty)}
            />
            <Separator />
          </Animated.View>
        )}
        {children}
      </CollapsableContainer>
    </Animated.View>
  )
}

export default React.memo(OrderBatchItem)
