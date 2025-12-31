import React from 'react'
import { View } from 'react-native'
import ActivityList from '@/components/list/ActivityList'
import useDisposalActivity from './hooks/useDisposalActivity'

export default function SelfDisposalActivityScreen() {
  const { activities, handleSelectActivity } = useDisposalActivity()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList data={activities} onPress={handleSelectActivity} />
    </View>
  )
}
