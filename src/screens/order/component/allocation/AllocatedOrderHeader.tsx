import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { BaseButton } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface AllocatedOrderHeaderProps {
  materialName?: string
  confirmedQty?: number
  onOpenInfo: () => void
  isBatch?: boolean
  isHierarchy?: boolean
  t: TFunction
}

function AllocatedOrderHeader({
  materialName,
  confirmedQty,
  onOpenInfo,
  isBatch,
  isHierarchy,
  t,
}: Readonly<AllocatedOrderHeaderProps>) {
  return (
    <>
      {isHierarchy && (
        <Text className={cn(AppStyles.textBold, 'text-mediumGray mt-2 mx-4')}>
          {t('label.active_ingredient_material')}
        </Text>
      )}
      <View className='mx-4 border-quillGrey border p-2 m-4 rounded-sm'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>{materialName}</Text>
        <InfoRow
          label={t('label.confirmed_qty')}
          value={numberFormat(confirmedQty)}
          labelClassName='mt-1'
        />
        <Separator className='my-2' />
        <View className={AppStyles.rowCenterAlign}>
          <Text className={cn(AppStyles.labelRegular, 'mr-1')}>
            {t('label.view_stock_customer')}
          </Text>
          <BaseButton
            onPress={onOpenInfo}
            {...getTestID('btn-open-info-modal')}>
            <Icons.IcInfo height={16} width={16} fill={colors.marine} />
          </BaseButton>
        </View>
      </View>
      {isBatch && (
        <Text className={cn(AppStyles.textBold, 'text-mediumGray mb-2 mx-4')}>
          {t('label.trademark_material')}
        </Text>
      )}
    </>
  )
}

export default memo(AllocatedOrderHeader)
