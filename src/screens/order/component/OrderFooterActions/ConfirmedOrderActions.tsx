import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton, Button } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface ConfirmedOrderActionsProps {
  onCancel: () => void
  onAllocate: () => void
  t: TFunction
}

export const ConfirmedOrderActions: React.FC<ConfirmedOrderActionsProps> = ({
  onCancel,
  onAllocate,
  t,
}) => {
  return (
    <View className='p-4 border-whiteTwo bg-white border-t mt-auto'>
      <View className='flex-row mt-2'>
        <BaseButton
          preset='outlined-primary'
          textClassName={cn(AppStyles.textMedium, 'text-main')}
          containerClassName='flex-1 text-center'
          text={t('button.cancel_order')}
          onPress={onCancel}
          testID='btn-cancel-all'
        />
        <View className='w-4' />
        <Button
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          containerClassName='flex-1'
          text={t('button.allocate_stock')}
          LeftIcon={Icons.IcArrowForward}
          leftIconColor={colors.white}
          onPress={onAllocate}
          testID='btn-confirm-order'
        />
      </View>
    </View>
  )
}
