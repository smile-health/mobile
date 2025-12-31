import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { AssetInventory } from '@/models/asset-inventory/AssetInventory'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getStatusBadgeStyle, getStatusTextStyle } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface AssetInfoItemProps {
  label: string
  value: string
  valueStyle?: string
}

const AssetInfoItem = ({
  label,
  value,
  valueStyle = AppStyles.textMediumSmall,
}: AssetInfoItemProps) => {
  return (
    <View className='flex-row items-center'>
      <Text className={cn(AppStyles.labelRegular, 'w-28')}>{label}</Text>
      <Text className={cn(valueStyle, 'text-midnightBlue flex-1')}>
        {value}
      </Text>
    </View>
  )
}

function AssetInventoryItem({ item }: { readonly item: AssetInventory }) {
  const navigation = useNavigation()

  const { t } = useLanguage()

  const assetType = item.asset_type.name ?? item.other_asset_type_name
  const assetModel = item.asset_model?.name ?? item.other_asset_model_name
  const manufacturer = item.manufacture?.name ?? item.other_manufacture_name

  const navigateToInventoryDetail = () => {
    navigation.navigate('AssetInventoryDetail', { id: item.id })
  }

  return (
    <TouchableOpacity
      className={cn(AppStyles.card, 'gap-2')}
      activeOpacity={0.8}
      onPress={navigateToInventoryDetail}>
      <View>
        <View className={AppStyles.rowCenter}>
          <Text className={cn(AppStyles.textBold, 'flex-1')}>{assetType}</Text>
          <Icons.IcChevronRight />
        </View>

        <AssetInfoItem
          label={t('asset.serial_number')}
          value={item.serial_number}
          valueStyle={AppStyles.textBoldSmall}
        />
      </View>
      <View className={AppStyles.borderBottom} />
      <View>
        <AssetInfoItem label={t('asset.asset_model')} value={assetModel} />
        <AssetInfoItem label={t('asset.manufacturer')} value={manufacturer} />
      </View>
      <View className={AppStyles.borderBottom} />
      <View className={AppStyles.rowBetween}>
        {item?.working_status?.id ? (
          <View className={getStatusBadgeStyle(item.working_status.id)}>
            <Text className={getStatusTextStyle(item.working_status.id)}>
              {item?.working_status.name ?? '-'}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Text className={cn(AppStyles.labelMedium, 'flex-1 text-right')}>
          {t('label.updated_at')}{' '}
          {convertString(item.updated_at, SHORT_DATE_TIME_FORMAT).toUpperCase()}{' '}
          {t('label.by').toLowerCase()} {item.user_updated_by.firstname}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default AssetInventoryItem
