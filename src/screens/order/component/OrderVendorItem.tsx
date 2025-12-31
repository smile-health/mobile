import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { BaseEntity } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface VendorItemProps {
  item: BaseEntity
  containerClassName: string
  onPress: (item: BaseEntity) => void
}

export function OrderVendorItem({
  item,
  onPress,
  containerClassName,
}: Readonly<VendorItemProps>) {
  const { name, address = '-' } = item
  const handleOnPress = () => {
    onPress(item)
  }
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleOnPress}
      className={cn(
        containerClassName,
        'flex-row items-center p-2 border border-quillGrey mb-1'
      )}
      {...getTestID(`vendor-item-${item.id}`)}>
      <View className='flex-1'>
        <Text
          className={AppStyles.textMedium}
          numberOfLines={1}
          ellipsizeMode='tail'>
          {name}
        </Text>
        <Text
          className={cn(AppStyles.textRegularSmall, 'text-xxs text-mediumGray')}
          numberOfLines={1}
          ellipsizeMode='tail'>
          {address}
        </Text>
      </View>
      <Icons.IcChevronRight height={16} width={16} />
    </TouchableOpacity>
  )
}
