import React from 'react'
import { View } from 'react-native'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import EntityList from '@/components/list/EntityList'
import { useLanguage } from '@/i18n/useLanguage'
import { ENTITY_TYPE } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { ORDER_KEY } from '@/utils/Constants'
import { useSelectEntity } from '../hooks/useSelectEntity'

interface Props extends AppStackScreenProps<'DistributionCustomerSelect'> {}

export default function DistributionCustomerSelectScreen({
  navigation,
}: Props) {
  const { t } = useLanguage()

  const { activeActivity, entities, handleSelectEntity } = useSelectEntity({
    entityType: ENTITY_TYPE.CUSTOMER,
    navigateTo: 'DistributionMaterial',
    setOrderKey: ORDER_KEY.DISTRIBUTION,
  })

  return (
    <View className='bg-white flex-1'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: activeActivity?.name,
          },
        ]}
      />
      <EntityList
        data={entities}
        onPress={(item) => handleSelectEntity(item, navigation)}
        type='customer'
      />
    </View>
  )
}
