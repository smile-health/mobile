import React from 'react'
import { View } from 'react-native'
import ActivityList from '@/components/list/ActivityList'
import useInventoryActivityList from '../hooks/stock/useInventoryActivityList'

export default function StockActivitySelectScreen() {
  const { activities, activityMaterialAlert, handleSelectActivity } =
    useInventoryActivityList()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList
        data={activities}
        materialAlert={activityMaterialAlert}
        onPress={handleSelectActivity}
      />
    </View>
  )
}
