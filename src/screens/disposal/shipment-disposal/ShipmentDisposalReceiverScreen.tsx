import React, { useEffect } from 'react'
import { View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import DisposalReceiverList from '../components/DisposalReceiverList'
import useDisposalReceiver from '../hooks/useDisposalReceiver'

export default function ShipmentDisposalReceiverScreen() {
  const { activity, data, handleClearReceiver, handlePressReceiver } =
    useDisposalReceiver()

  useEffect(() => {
    return () => {
      handleClearReceiver()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity.name} />
      <DisposalReceiverList data={data} onPress={handlePressReceiver} />
    </View>
  )
}
