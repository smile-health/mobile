import React, { useMemo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import StockTakingMandatoryLabel from './StockTakingMandatoryLabel'

interface StockTakingMaterialProps {
  name: string
  remainingQty: number
  isMandatory?: boolean
  className?: string
  lastStockTaking?: string | null
  showArrow?: boolean
  onPress?: () => void
}

function StockTakingMaterialItem({
  name,
  remainingQty,
  lastStockTaking,
  isMandatory,
  showArrow,
  className,
  onPress,
}: Readonly<StockTakingMaterialProps>) {
  const { t } = useLanguage()

  const stockTakingDateLabel = useMemo(() => {
    if (!lastStockTaking) return ''
    const date = convertString(
      lastStockTaking,
      SHORT_DATE_TIME_FORMAT
    ).toUpperCase()

    return t('label.last_stock_taking_at', { date })
  }, [lastStockTaking, t])
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      className={cn(
        'bg-white p-2 mb-2 mx-4 border border-lightGreyMinimal rounded-sm',
        className
      )}
      onPress={onPress}>
      <View className='flex-row items-center gap-x-2'>
        <View style={flexStyle}>
          <Text className={AppStyles.textMedium}>{name}</Text>
          <View className='flex-row items-center justify-end'>
            {isMandatory && <StockTakingMandatoryLabel t={t} />}
            <Text className='text-mediumGray font-mainRegular text-xxs self-end'>
              {`${t('label.remaining_stock')}: `}
              <Text className='font-mainBold text-marine text-xs'>
                {numberFormat(remainingQty)}
              </Text>
            </Text>
          </View>
        </View>
        {showArrow && <Icons.IcChevronRight height={16} width={16} />}
      </View>
      {stockTakingDateLabel && (
        <View
          className={cn(
            AppStyles.rowCenterAlign,
            'border-t border-lightGreyMinimal gap-x-1 mt-2 pt-2'
          )}>
          <Icons.IcCheckDone />
          <Text className={cn(AppStyles.textRegularSmall, 'text-greenPrimary')}>
            {stockTakingDateLabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default React.memo(StockTakingMaterialItem)
