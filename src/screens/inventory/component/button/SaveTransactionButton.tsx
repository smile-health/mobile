import React from 'react'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

interface Props {
  onSubmit: () => void
}
function SaveTransactionButton({ onSubmit }: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <Button
      preset='filled'
      containerClassName='flex-1 gap-x-2'
      text={t('button.save')}
      LeftIcon={Icons.IcCheck}
      leftIconColor={colors.mainText()}
      leftIconSize={20}
      onPress={onSubmit}
      {...getTestID('btn-save-transaction')}
    />
  )
}

export default SaveTransactionButton
