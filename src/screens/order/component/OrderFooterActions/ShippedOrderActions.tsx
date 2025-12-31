import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface ShippedOrderActionsProps {
  onReceive: () => void
  t: TFunction
}

export const ShippedOrderActions: React.FC<ShippedOrderActionsProps> = ({
  onReceive,
  t,
}) => {
  return (
    <View className='p-4 border-whiteTwo bg-white border-t mt-auto'>
      <Button
        preset='filled'
        textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
        text={t('button.received_order')}
        LeftIcon={Icons.IcArrowForward}
        leftIconColor={colors.white}
        onPress={onReceive}
        testID='btn-ship-order'
      />
    </View>
  )
}
