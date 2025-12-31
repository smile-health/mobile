import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { FieldValue } from '@/components/list/FieldValue'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { MaterialCardValue } from '@/screens/inventory/component/MaterialCard'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  DISPOSAL_QTY_TYPE,
  disposalQtyLabel,
  disposalQtyTypeLabel,
} from '../disposal-constant'

export interface DisposalStockDetailHeaderProps {
  parentMaterialName?: string
  parentQty?: number
  materialName?: string
  materialQty?: number
  updatedAt: string
  discardQty?: number
  receivedQty?: number
}

const STATIC_STYLES = {
  textTinyGray: 'text-[10px] text-mediumGray',
  container: 'bg-lightGrey',
  parentSection: 'mx-4 py-4',
  trademarkSection: 'mx-4 py-4',
  cardContainer: 'p-2 bg-white my-2',
  cardRow: 'flex-row gap-x-2',
} as const

function DisposalStockDetailHeader(
  props: Readonly<DisposalStockDetailHeaderProps>
) {
  const {
    parentMaterialName,
    parentQty = 0,
    materialName,
    materialQty = 0, // Fixed typo
    updatedAt,
    discardQty = 0,
    receivedQty = 0,
  } = props

  // Only show parent material info if parentMaterialName exists
  if (!parentMaterialName) {
    return <View className={STATIC_STYLES.container} />
  }

  return (
    <View className={STATIC_STYLES.container}>
      <ParentMaterialInfo
        substanceName={parentMaterialName}
        trademarkName={materialName}
        substanceQty={parentQty}
        updatedAt={updatedAt}
        trademarkQty={materialQty}
        discardQty={discardQty}
        receivedQty={receivedQty}
      />
    </View>
  )
}

export default React.memo(DisposalStockDetailHeader)

const ParentMaterialInfo = React.memo(function ParentMaterialInfo({
  substanceName,
  trademarkName,
  substanceQty,
  trademarkQty,
  updatedAt,
  discardQty,
  receivedQty,
}: Readonly<{
  substanceName?: string
  trademarkName?: string
  substanceQty: number
  trademarkQty: number
  updatedAt: string
  discardQty: number
  receivedQty: number
}>) {
  const { t } = useLanguage()

  // Only memoize truly expensive operations
  const formattedDateTime = useMemo(
    () => convertString(updatedAt, SHORT_DATE_TIME_FORMAT),
    [updatedAt]
  )

  return (
    <>
      <View className={STATIC_STYLES.parentSection}>
        <FieldValue
          label={t('label.active_ingredient_material')}
          value={substanceName}
          labelClassName={AppStyles.labelBold}
          valueClassName='font-mainBold my-1'
        />

        <InfoRow label={t(disposalQtyLabel)} value={substanceQty} />
      </View>

      <View className={cn(AppStyles.borderTop, STATIC_STYLES.trademarkSection)}>
        <Text className={cn(AppStyles.labelBold, 'text-warmGrey')}>
          {t('label.trademark_material')}
        </Text>

        <View className={cn(AppStyles.border, STATIC_STYLES.cardContainer)}>
          <Text className={cn(AppStyles.textMedium, 'mb-1')}>
            {trademarkName}
          </Text>

          <InfoRow
            labelClassName={STATIC_STYLES.textTinyGray}
            valueClassName={STATIC_STYLES.textTinyGray}
            label={`${t('label.updated_at')} ${formattedDateTime}`}
            value={`${t(disposalQtyLabel)}: ${trademarkQty}`}
          />
        </View>

        <View className={STATIC_STYLES.cardRow}>
          <MaterialCardValue
            labelClassName={cn(STATIC_STYLES.textTinyGray, 'mb-1')}
            label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.DISCARD])}
            value={discardQty}
          />
          <MaterialCardValue
            labelClassName={cn(STATIC_STYLES.textTinyGray, 'mb-1')}
            label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.RECEIVED])}
            value={receivedQty}
          />
        </View>
      </View>
    </>
  )
})
