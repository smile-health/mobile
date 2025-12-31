import React from 'react'
import { View } from 'react-native'
import EntityList from '@/components/list/EntityList'
import { ENTITY_LIST_TYPE, ENTITY_TYPE } from '@/models'
import useEntityList from './hooks/useEntityList'

export default function VendorListScreen() {
  const { data, handlePressEntity } = useEntityList(ENTITY_TYPE.VENDOR)

  return (
    <View className='bg-white flex-1'>
      <EntityList
        data={data}
        showInfo={false}
        onPress={handlePressEntity}
        type={ENTITY_LIST_TYPE.VENDOR}
      />
    </View>
  )
}
