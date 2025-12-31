import React from 'react'
import { View } from 'react-native'
import ActivityList from '@/components/list/ActivityList'
import useReconciliationActivity from './hooks/useReconciliationActivity'

export default function ReconciliationActivityScreen() {
  const { activities, handleSelectActivity } = useReconciliationActivity()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList data={activities} onPress={handleSelectActivity} />
    </View>
  )
}
