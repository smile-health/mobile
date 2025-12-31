import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icons } from '@/assets/icons'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface ReconciliationMaterialProps {
  name: string
  className?: string
  onPress?: () => void
}

function ReconciliationMaterialItem({
  name,
  className,
  onPress,
}: Readonly<ReconciliationMaterialProps>) {
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
        </View>
        <Icons.IcChevronRight height={16} width={16} />
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(ReconciliationMaterialItem)
