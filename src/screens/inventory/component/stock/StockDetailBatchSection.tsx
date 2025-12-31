import React from 'react'
import { SectionList, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import {
  StockBatchSection,
  StockBatchSectionHeader,
  StockDetail,
} from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import StockDetailBatchItem from './StockDetailBatchItem'
import StockDetailHeader, { StockDetailHeaderProps } from './StockDetailHeader'

interface StockDetailBatchSectionProps {
  isBatch: boolean
  detail: StockDetail | null
  sections: StockBatchSection[]
  parentMaterialName?: string
  parentStockQty?: number
}

function StockDetailBatchSection({
  isBatch,
  sections,
  detail,
  parentMaterialName,
  parentStockQty,
}: Readonly<StockDetailBatchSectionProps>) {
  const { t } = useLanguage()

  const headerProps = getHeaderProps(detail, parentMaterialName, parentStockQty)

  const renderHeader = () => {
    return <StockDetailHeader {...headerProps} />
  }

  const renderSectionHeader = ({ section }: StockBatchSectionHeader) => {
    if (!isBatch || section.data.length === 0) return null
    return (
      <Text className={cn(AppStyles.labelBold, 'text-sm m-4 mb-2')}>
        {t(section.title)}
      </Text>
    )
  }

  const renderItem = ({ item }) => {
    return <StockDetailBatchItem item={item} testID={`item-${item.name}`} />
  }

  return (
    <SectionList
      keyExtractor={(item, index) => `${index}-${item.id}`}
      sections={sections}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerClassName='bg-white flex-grow'
    />
  )
}
export default React.memo(StockDetailBatchSection)

const getHeaderProps = (
  detail: StockDetail | null,
  parentMaterialName?: string,
  parentStockQty?: number
): StockDetailHeaderProps => {
  const {
    material,
    updated_at = '',
    total_qty = 0,
    total_available_qty = 0,
    total_allocated_qty = 0,
    min = 0,
    max = 0,
  } = detail || {}

  return {
    name: material?.name ?? '',
    updatedAt: updated_at,
    qty: total_qty,
    min,
    max,
    available: total_available_qty,
    allocated: total_allocated_qty,
    parentMaterialName,
    parentStockQty,
    title: parentMaterialName ? 'label.trademark_material' : undefined,
    className: parentMaterialName ? 'pt-2' : undefined,
    titleClassName: parentMaterialName ? AppStyles.labelBold : undefined,
  }
}
