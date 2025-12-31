import React from 'react'
import { View } from 'react-native'
import EntityList from '@/components/list/EntityList'
import { useLanguage } from '@/i18n/useLanguage'
import { ENTITY_LIST_TYPE, ENTITY_TYPE } from '@/models'
import useEntityList from './hooks/useEntityList'

export default function ConsumptionCustomerListScreen() {
  const { data } = useEntityList(ENTITY_TYPE.CUSTOMER_CONSUMPTION)
  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1'>
      <EntityList
        data={data}
        infoText={t('customer_vendor.info.consumption_customer')}
        type={ENTITY_LIST_TYPE.CUSTOMER}
      />
    </View>
  )
}
