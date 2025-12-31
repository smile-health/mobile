import React from 'react'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

interface StockActivityButtonProps {
  onPress: () => void
}

function StockActivityButton({ onPress }: Readonly<StockActivityButtonProps>) {
  const { t } = useLanguage()
  return (
    <Button
      containerClassName='gap-x-2 self-start ml-4 mt-2'
      LeftIcon={Icons.IcAdd}
      leftIconSize={20}
      leftIconColor={colors.main()}
      text={t('button.take_stock_from_other_activity')}
      textClassName='text-main'
      onPress={onPress}
      {...getTestID('btn-take-stock-activity')}
    />
  )
}

export default React.memo(StockActivityButton)
