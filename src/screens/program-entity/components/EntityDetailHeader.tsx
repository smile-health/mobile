import React from 'react'
import { Control } from 'react-hook-form'
import { SearchField } from '@/components/forms'
import ListTitle from '@/components/list/ListTitle'
import { useLanguage } from '@/i18n/useLanguage'
import { BaseEntity, ENTITY_TYPE, EntityType } from '@/models'
import EntityInfo from './EntityInfo'

interface Props {
  type: EntityType | 'user_entity'
  entity: BaseEntity
  control: Control<any>
  itemCount: number
  onSearch: (text: string) => void
}

const infoTitle = {
  [ENTITY_TYPE.CUSTOMER]: 'customer_vendor.customer_info',
  [ENTITY_TYPE.VENDOR]: 'customer_vendor.vendor_info',
  user_entity: 'label.entity',
}

const StockTakingMaterialListHeader = ({
  type,
  entity,
  control,
  itemCount,
  onSearch,
}: Readonly<Props>) => {
  const { t } = useLanguage()

  return (
    <React.Fragment>
      <EntityInfo
        title={t(infoTitle[type])}
        name={entity.name}
        address={entity.address}
        t={t}
      />
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t('customer_vendor.search_username')}
        containerClassName='bg-white px-4 py-3 border-b border-quillGrey'
        onChangeText={onSearch}
      />
      <ListTitle title={t('customer_vendor.user_list')} itemCount={itemCount} />
    </React.Fragment>
  )
}

export default React.memo(StockTakingMaterialListHeader)
