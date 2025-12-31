import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton, Button } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface AllocatedOrderActionsProps {
  onCancel: () => void
  onShip: () => void
  t: TFunction
}

export const AllocatedOrderActions: React.FC<AllocatedOrderActionsProps> = ({
  onCancel,
  onShip,
  t,
}) => {
  return (
    <View className='p-4 border-whiteTwo bg-white border-t mt-auto'>
      <View className='flex-row mt-2'>
        <BaseButton
          preset='outlined'
          textClassName={cn(AppStyles.textMedium, 'ml-1 text-main')}
          containerClassName='flex-1 text-center border-main'
          text={t('button.cancel_order')}
          onPress={onCancel}
          testID='btn-cancel-all'
        />
        <View className='w-4' />
        <Button
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          containerClassName='flex-1'
          text={t('button.ship_order')}
          LeftIcon={Icons.IcArrowForward}
          leftIconColor={colors.white}
          onPress={onShip}
          testID='btn-ship-order'
        />
      </View>
    </View>
  )
}
