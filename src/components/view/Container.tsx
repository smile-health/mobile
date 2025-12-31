import React from 'react'
import { SafeAreaView, StatusBar, View } from 'react-native'

interface Props {
  containerClassName?: string
  children: React.ReactNode
  statusBarColor: string
}

export default function Container(props: Readonly<Props>) {
  return (
    <SafeAreaView className='flex flex-1'>
      <StatusBar
        barStyle='light-content'
        backgroundColor={props.statusBarColor}
      />
      <View className={props.containerClassName}>{props.children}</View>
    </SafeAreaView>
  )
}
