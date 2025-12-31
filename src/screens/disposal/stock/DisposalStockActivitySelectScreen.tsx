import React from 'react'
import { View } from 'react-native'
import ActivityList from '@/components/list/ActivityList'
import useDisposalActivityList from '../hooks/useDisposalActivityList'

export default function DisposalStockActivitySelectScreen() {
  const { handleSelectActivity, activities } = useDisposalActivityList()

  return (
    <View className='bg-white flex-1 p-4'>
      <ActivityList data={activities} onPress={handleSelectActivity} />
    </View>
  )
}
