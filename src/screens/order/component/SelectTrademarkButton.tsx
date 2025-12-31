import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface Props {
  onPress: () => void
  isEdit?: boolean
}

export const SelectTrademarkButton: React.FC<Props> = ({ onPress, isEdit }) => {
  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1'>
      <TouchableOpacity
        className={cn(AppStyles.rowCenterAlign, 'px-4  gap-2')}
        onPress={onPress}>
        <Icons.IcAdd fill={colors.main()} />
        <Text className={cn(AppStyles.textRegular, 'text-main')}>
          {isEdit ? t('button.edit_trademark') : t('button.select_trademark')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
