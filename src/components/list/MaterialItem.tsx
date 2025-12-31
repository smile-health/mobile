import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { AppNotifActivityMaterial } from '@/models/notif/AppNotifMaterial'
import { disposalQtyLabel } from '@/screens/disposal/disposal-constant'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { MATERIAL_LIST_TYPE, SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { MaterialListType } from './MaterialList'

export interface MaterialItemProps {
  name: string
  updatedAt: string
  qty: number
  min: number
  max: number
  showQuantity?: boolean
  className?: string
  withUpdateLabel?: boolean
  transactionLabel?: string
  type?: MaterialListType
  alert?: AppNotifActivityMaterial
  onPress?: () => void
}

interface ColorScheme {
  background: string
  text: string
}

function MaterialAlertIndicator({ expired, nearExpired }) {
  return (
    <View className='flex-row items-center gap-x-1'>
      {!!expired && <View className='h-2 w-2 rounded-full bg-lavaRed' />}
      {!!nearExpired && (
        <View className='h-2 w-2 rounded-full bg-vividOrange' />
      )}
    </View>
  )
}

const getColorScheme = (
  type: string,
  showQuantity: boolean,
  qty: number,
  min: number,
  max: number
): ColorScheme => {
  switch (true) {
    case type === MATERIAL_LIST_TYPE.VIEW_STOCK:
    case type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_SUBSTANCE_STOCK:
    case type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK: {
      return { background: 'bg-white', text: 'text-marine' }
    }
    case !showQuantity: {
      return { background: 'bg-white', text: 'text-marine' }
    }
    case qty === 0: {
      return { background: 'bg-softPink', text: 'text-lavaRed' }
    }
    case qty < min: {
      return { background: 'bg-softIvory', text: 'text-vividOrange' }
    }
    case qty >= min && qty <= max: {
      return { background: 'bg-mintGreen', text: 'text-greenPrimary' }
    }
    case qty > max && max > 0 && min > 0: {
      return { background: 'bg-aliceBlue', text: 'text-deepBlue' }
    }
    default: {
      return { background: 'bg-mintGreen', text: 'text-greenPrimary' }
    }
  }
}

const TransactionLabel = React.memo<{ label: string }>(({ label }) => (
  <View
    {...getTestID(label)}
    className={cn(
      AppStyles.rowCenterAlign,
      'border-t border-lightGreyMinimal mt-2 pt-2'
    )}>
    <Icons.IcFlag />
    <Text className={cn(AppStyles.textRegularSmall, 'text-scienceBlue ml-1')}>
      {label}
    </Text>
  </View>
))

TransactionLabel.displayName = 'TransactionLabel'

function MaterialItem(props: Readonly<MaterialItemProps>) {
  const { t } = useLanguage()
  const {
    name,
    updatedAt,
    qty,
    min,
    max,
    className,
    withUpdateLabel = true,
    showQuantity = true,
    onPress,
    transactionLabel,
    alert,
    type = MATERIAL_LIST_TYPE.NORMAL,
  } = props

  const { expired, expired_in_30_day } = alert ?? {}

  const colorScheme = useMemo(
    () => getColorScheme(type, showQuantity, qty, min, max),
    [type, showQuantity, qty, min, max]
  )

  const formattedData = useMemo(
    () => ({
      date: updatedAt ? convertString(updatedAt, SHORT_DATE_TIME_FORMAT) : '-',
      qty: numberFormat(qty),
    }),
    [updatedAt, qty]
  )

  const quantityInfo = useMemo(() => {
    if (
      type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_SUBSTANCE_STOCK ||
      type === MATERIAL_LIST_TYPE.VIEW_DISPOSAL_TRADEMARK_STOCK
    ) {
      return {
        label: `${t(disposalQtyLabel)}: `,
        qty: formattedData.qty,
      }
    }

    return {
      label: `${t('label.available_stock')}: `,
      qty: formattedData.qty,
    }
  }, [type, t, formattedData])

  const updateInfo = (
    <View className={AppStyles.rowBetween}>
      <Text className='text-mediumGray font-mainRegular text-xxs'>
        {withUpdateLabel
          ? `${t('label.updated_at')} ${formattedData.date}`
          : ''}
      </Text>

      {showQuantity && (
        <Text className='text-mediumGray font-mainRegular text-xxs'>
          {quantityInfo.label}
          <Text className={cn(colorScheme.text, 'font-mainBold text-xs')}>
            {quantityInfo.qty}
          </Text>
        </Text>
      )}
    </View>
  )

  return (
    <Pressable
      className={cn(
        colorScheme.background,
        'p-2 border border-lightGreyMinimal rounded-sm',
        className
      )}
      onPress={onPress}
      {...getTestID(`material-list-${name}`)}>
      <View>
        {alert && (
          <MaterialAlertIndicator
            expired={expired}
            nearExpired={expired_in_30_day}
          />
        )}
        <View className={'flex-row gap-x-2'}>
          <View className='flex-1 gap-y-0.5'>
            <Text className={AppStyles.textMedium}>{name}</Text>
            {updateInfo}
          </View>
          {onPress && <Icons.IcChevronRight height={16} width={16} />}
        </View>
        {transactionLabel && <TransactionLabel label={transactionLabel} />}
      </View>
    </Pressable>
  )
}

export default React.memo(MaterialItem)
