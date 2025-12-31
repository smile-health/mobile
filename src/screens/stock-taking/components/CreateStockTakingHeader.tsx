import React from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import StockTakingMandatoryLabel from './StockTakingMandatoryLabel'
import StockTakingMaterialItem from './StockTakingMaterialItem'

interface Props {
  name: string
  remainingQty: number
  isHierarchy?: boolean
  isMandatory?: boolean
  parentMaterial?: {
    name: string
    remainingQty: number
    isMandatory?: boolean
  }
}

const MaterialTypeLabel = React.memo(
  ({ isHierarchy, t }: { isHierarchy?: boolean; t: TFunction }) => (
    <Text className={AppStyles.labelBold}>
      {isHierarchy ? t('label.trademark_material') : t('label.material')}
    </Text>
  )
)

MaterialTypeLabel.displayName = 'MaterialTypeLabel'

function CreateStockTakingHeader({
  isHierarchy,
  parentMaterial,
  ...rest
}: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <View className='p-4 gap-y-2 bg-lightGrey border-b border-lightGreyMinimal'>
      {parentMaterial && (
        <View className='gap-y-1 pb-2 border-b border-lightGreyMinimal'>
          <Text className={AppStyles.labelBold}>
            {t('label.active_ingredient_material')}
          </Text>
          <Text className={AppStyles.textBold}>{parentMaterial.name}</Text>
          <View className='flex-row items-center justify-end'>
            {parentMaterial.isMandatory && <StockTakingMandatoryLabel t={t} />}
            <Text className='text-mediumGray font-mainRegular text-xxs self-end'>
              {`${t('label.remaining_stock')}: `}
              <Text className='font-mainBold text-marine text-xs'>
                {numberFormat(parentMaterial.remainingQty)}
              </Text>
            </Text>
          </View>
        </View>
      )}
      <MaterialTypeLabel isHierarchy={isHierarchy} t={t} />
      <StockTakingMaterialItem className='mx-0 mb-0' {...rest} />
    </View>
  )
}

export default React.memo(CreateStockTakingHeader)
