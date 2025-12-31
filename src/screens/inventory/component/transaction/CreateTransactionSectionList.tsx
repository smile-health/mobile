import React from 'react'
import { SectionList, Text, SectionListProps, View } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { StockItem } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { BATCH_TYPE } from '../../constant/transaction.constant'
import { getMaterialCardProps } from '../../helpers/TransactionHelpers'
import MaterialCard from '../MaterialCard'

export interface CreateTransactionSectionListProps<T>
  extends SectionListProps<T> {
  materialData: StockItem
  showMinMax?: boolean
}

function CreateTransactionSectionList<T>(
  props: Readonly<CreateTransactionSectionListProps<T>>
) {
  const { materialData, showMinMax = true, ...sectionListProps } = props
  const { t } = useLanguage()

  const headerDataProps = getMaterialCardProps(materialData, showMinMax)

  const renderHeader = () => {
    return <MaterialCard {...headerDataProps} />
  }

  const isEmptySection = sectionListProps.sections.every(
    (s) => s.data.length === 0
  )

  const renderSectionHeader = ({ section }) => {
    const shouldShowSection = section.data.length > 0
    if (section.fieldname === BATCH_TYPE.ACTIVE && isEmptySection) {
      return (
        <View className='m-4'>
          <Text className={cn(AppStyles.labelBold, 'text-sm mb-2')}>
            {t(section.title)}
          </Text>
          <View className='flex-1 items-center mt-14'>
            <EmptyState
              Icon={Icons.IcEmptyStateOrder}
              title={t('empty_state.no_data_available')}
              subtitle={t('empty_state.no_data_message')}
              testID='empty-state-active-batches'
            />
          </View>
        </View>
      )
    }
    return shouldShowSection ? (
      <Text className={cn(AppStyles.labelBold, 'text-sm m-4 mb-2')}>
        {t(section.title)}
      </Text>
    ) : null
  }

  return (
    <SectionList
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={renderHeader}
      renderSectionHeader={renderSectionHeader}
      contentContainerClassName='pb-6'
      {...sectionListProps}
    />
  )
}

export default React.memo(CreateTransactionSectionList)
