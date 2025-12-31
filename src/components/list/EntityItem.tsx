import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { BaseEntity } from '@/models'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'

interface EntityItemProps {
  item: BaseEntity
  showFlag: boolean
  onPress?: (item: BaseEntity) => void
}

export function EntityItem({
  item,
  showFlag,
  onPress,
}: Readonly<EntityItemProps>) {
  const { name, address = '-' } = item
  const handleOnPress = () => {
    if (onPress) onPress(item)
  }
  return (
    <Pressable
      onPress={handleOnPress}
      className='flex-row items-center p-2 border border-quillGrey mb-1 mx-4 gap-x-2'
      {...getTestID(`entity-item-${item.id}`)}>
      <View className='flex-1'>
        <Text
          className={AppStyles.textMedium}
          numberOfLines={1}
          ellipsizeMode='tail'>
          {name}
        </Text>
        <Text
          className={cn(AppStyles.labelRegular, 'text-xxs')}
          numberOfLines={1}
          ellipsizeMode='tail'>
          {address}
        </Text>
      </View>
      {showFlag && <Icons.IcFlag height={16} width={16} />}
      {onPress && <Icons.IcChevronRight height={16} width={16} />}
    </Pressable>
  )
}
