import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import EntityList from '@/components/list/EntityList'
import { useLanguage } from '@/i18n/useLanguage'
import { ENTITY_TYPE, BaseEntity } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { orderState, useAppSelector } from '@/services/store'
import { ORDER_KEY } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import { loadExistingOrderEntity } from '../helpers/OrderHelpers'
import { useSelectEntity } from '../hooks/useSelectEntity'

interface Props extends AppStackScreenProps<'RegularVendorSelect'> {}

export default function RegularVendorSelectScreen({ navigation }: Props) {
  const { t } = useLanguage()
  const programId = useProgramId()

  const { drafts } = useAppSelector(orderState)
  const orderDraft = drafts.regular?.[programId] || []
  const hasOrder = orderDraft.length > 0

  const [orderEntity, setOrderEntity] = useState<BaseEntity | undefined>()

  useFocusEffect(
    useCallback(() => {
      const fetchExistingEntity = async () => {
        const existingEntity = await loadExistingOrderEntity(programId)
        if (existingEntity) {
          setOrderEntity(existingEntity)
        }
      }

      fetchExistingEntity()
    }, [programId])
  )

  const { activeActivity, entities, handleSelectEntity } = useSelectEntity({
    entityType: ENTITY_TYPE.VENDOR,
    navigateTo: 'RegularMaterialSelect',
    setOrderKey: ORDER_KEY.REGULAR,
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
        type='vendor'
        entity={hasOrder ? orderEntity : undefined}
      />
    </View>
  )
}
