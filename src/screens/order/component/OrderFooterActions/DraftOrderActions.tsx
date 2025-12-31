import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton, Button } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface DraftOrderActionsProps {
  onValidate: () => void
  onCancel: () => void
  t: TFunction
}

export const DraftOrderActions: React.FC<DraftOrderActionsProps> = ({
  onCancel,
  onValidate,
  t,
}) => {
  return (
    <View className='p-4 bg-white border-whiteTwo  border-t mt-auto'>
      <View className='mt-2 flex-row'>
        <BaseButton
          preset='outlined-primary'
          containerClassName='flex-1 text-center'
          text={t('button.cancel_order')}
          textClassName={cn(AppStyles.textMedium, 'text-main')}
          onPress={onCancel}
          testID='btn-cancel-all'
        />
        <View className='w-4' />
        <Button
          preset='filled'
          containerClassName='flex-1'
          text={t('button.validate_order')}
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          LeftIcon={Icons.IcArrowForward}
          leftIconColor={colors.white}
          onPress={onValidate}
          testID='btn-validate-order'
        />
      </View>
    </View>
  )
}
