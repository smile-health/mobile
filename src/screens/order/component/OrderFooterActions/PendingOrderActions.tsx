import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton, Button } from '@/components/buttons'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { ORDER_TYPE } from '@/utils/Constants'

interface PendingOrderActionsProps {
  isCustomer: boolean
  onEdit: () => void
  onCancel: () => void
  onConfirm: () => void
  t: TFunction
  orderType?: number
  isRequestOrderConfirmRestricted?: boolean
}

export const PendingOrderActions: React.FC<PendingOrderActionsProps> = ({
  isCustomer,
  onEdit,
  onCancel,
  onConfirm,
  t,
  orderType = 1,
  isRequestOrderConfirmRestricted = false,
}) => {
  const { text, icon, onPress, testID } = isCustomer
    ? {
        text: t('button.edit_order'),
        icon: Icons.IcEdit,
        onPress: onEdit,
        testID: 'btn-edit-order',
      }
    : {
        text: t('button.confirm_order'),
        icon: Icons.IcArrowForward,
        onPress: onConfirm,
        testID: 'btn-confirm-order',
      }

  const isRelocation = orderType === ORDER_TYPE.RELOCATION
  const cancelButtonKey = isRelocation
    ? 'button.cancel_relocation'
    : 'button.cancel_order'

  return (
    <View className='p-4 border-whiteTwo bg-white border-t mt-auto'>
      <View className='flex-row mt-2'>
        <BaseButton
          preset='outlined'
          textClassName={cn(AppStyles.textMedium, 'ml-1 text-main')}
          containerClassName='flex-1 text-center border-main'
          text={t(cancelButtonKey)}
          onPress={onCancel}
          testID='btn-cancel-all'
        />
        {(isCustomer || !isRequestOrderConfirmRestricted) && (
          <>
            <View className='w-4' />
            <Button
              preset='filled'
              textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
              containerClassName='flex-1'
              text={text}
              LeftIcon={icon}
              leftIconColor={colors.white}
              onPress={onPress}
              testID={testID}
            />
          </>
        )}
      </View>
    </View>
  )
}
