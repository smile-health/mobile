import React, { useCallback } from 'react'
import { View } from 'react-native'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { DisposalMethod } from '@/models/disposal/DisposalMethod'
import { AppStackScreenProps } from '@/navigators'
import DisposalMethodList from '../components/DisposalMethodList'
import useDisposalMethod from '../hooks/useDisposalMethod'

interface Props extends AppStackScreenProps<'DisposalMethodSelect'> {}

export default function DisposalMethodSelectScreen({ navigation }: Props) {
  const { methods, isLoading, activity, saveDisposalMethod } =
    useDisposalMethod()

  const onMethodPressed = useCallback(
    (method: DisposalMethod) => {
      saveDisposalMethod(method)
      navigation.navigate('SelfDisposalMaterial')
    },
    [navigation, saveDisposalMethod]
  )

  return (
    <View className='bg-white flex-1'>
      <ActivityHeader name={activity?.name} />
      <DisposalMethodList
        data={methods}
        isLoading={isLoading}
        onPressMethod={onMethodPressed}
      />
    </View>
  )
}
