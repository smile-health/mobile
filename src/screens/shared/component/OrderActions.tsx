import React from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { getTestID } from '@/utils/CommonUtils'

interface OrderActionsProps {
  isSaveDisabled: boolean
  onPress: () => void
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  isSaveDisabled,
  onPress,
}) => {
  const { t } = useLanguage()

  return (
    <View className='p-4 bg-white mt-auto border-t border-quillGrey'>
      <Button
        disabled={isSaveDisabled}
        preset='filled'
        containerClassName='bg-main gap-x-2'
        text={t('button.save')}
        LeftIcon={Icons.IcCheck}
        onPress={onPress}
        {...getTestID('btn-save-order')}
      />
    </View>
  )
}
