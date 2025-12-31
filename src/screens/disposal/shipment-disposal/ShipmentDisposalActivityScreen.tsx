import React from 'react'
import { View } from 'react-native'
import ActivityList from '@/components/list/ActivityList'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useDisposalActivity from '../hooks/useDisposalActivity'

export default function ShipmentDisposalActivityScreen() {
  const { activities, handleSelectActivity } = useDisposalActivity(
    DISPOSAL_TYPE.SHIPMENT
  )

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList data={activities} onPress={handleSelectActivity} />
    </View>
  )
}
