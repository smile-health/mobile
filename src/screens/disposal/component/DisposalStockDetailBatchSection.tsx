import React from 'react'
import { SectionList, Text } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { DisposalDetailMaterialItem } from '@/models/disposal/DisposalStock'
import { StockBatchSection } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import DisposalMaterialDetailFooter from './DisposalMaterialDetailFooter'
import DisposalMaterialDetailHeader, {
  DisposalMaterialDetailHeaderProps,
} from './DisposalMaterialDetailHeader'
import DisposalStockBatchItem from './DisposalStockBatchItem'

interface StockDetailBatchSectionProps {
  isBatch: boolean
  detail: DisposalDetailMaterialItem
  sections: StockBatchSection[]
  parentMaterialName?: string
  parentStockQty?: number
}

function DisposalStockDetailBatchSection({
  isBatch,
  sections,
  detail,
  parentMaterialName,
  parentStockQty,
}: Readonly<StockDetailBatchSectionProps>) {
  const { t } = useLanguage()

  const headerProps: DisposalMaterialDetailHeaderProps = {
    detail,
    parentMaterialName,
    parentStockQty,
  }

  const renderHeader = () => {
    return <DisposalMaterialDetailHeader {...headerProps} />
  }

  const renderFooter = () => {
    return <DisposalMaterialDetailFooter {...headerProps} />
  }

  const renderSectionHeader = ({ section }) => {
    if (!isBatch || section.data.length === 0) return null
    return (
      <Text className={cn(AppStyles.labelBold, 'text-sm m-4 mb-2')}>
        {t(section.title)}
      </Text>
    )
  }

  const renderItem = ({ item }) => {
    return (
      <DisposalStockBatchItem disposalStock={item} isManagedInBatch={isBatch} />
    )
  }

  return (
    <SectionList
      keyExtractor={(item, index) => `${index}-${item.id}`}
      sections={sections}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerClassName='bg-white flex-grow'
    />
  )
}
export default React.memo(DisposalStockDetailBatchSection)
