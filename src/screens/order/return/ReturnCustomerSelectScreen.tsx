import React from 'react'
import { View } from 'react-native'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import EntityList from '@/components/list/EntityList'
import { useLanguage } from '@/i18n/useLanguage'
import { ENTITY_TYPE } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { ORDER_KEY } from '@/utils/Constants'
import { useSelectEntity } from '../hooks/useSelectEntity'

interface Props extends AppStackScreenProps<'ReturnCustomerSelect'> {}

export default function ReturnCustomerSelectScreen({ navigation }: Props) {
  const { t } = useLanguage()

  const { activeActivity, entities, handleSelectEntity } = useSelectEntity({
    entityType: ENTITY_TYPE.VENDOR,
    navigateTo: 'ReturnMaterialSelect',
    setOrderKey: ORDER_KEY.RETURN,
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
