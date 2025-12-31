import React from 'react'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  onPress: () => void
  disabled: boolean
}

function NextMaterialButton({ onPress, disabled }: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <Button
      preset='outlined-primary'
      containerClassName='flex-1 gap-x-2'
      text={t('button.next_material')}
      LeftIcon={Icons.IcArrowRight}
      leftIconColor={colors.main()}
      leftIconSize={20}
      disabled={disabled}
      onPress={onPress}
      {...getTestID('btn-next-material')}
    />
  )
}

export default NextMaterialButton
