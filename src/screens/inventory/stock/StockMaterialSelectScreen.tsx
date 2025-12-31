import React from 'react'
import { View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import MaterialList from '@/components/list/MaterialList'
import useInventoryMaterialList from '../hooks/stock/useInventoryMaterialList'

export default function StockMaterialSelectScreen() {
  const { stockActivity, materialList, alerts, handlePressMaterial } =
    useInventoryMaterialList()

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={stockActivity?.name} />
      <MaterialList
        data={materialList}
        alerts={alerts}
        onPressMaterial={handlePressMaterial}
      />
    </View>
  )
}
