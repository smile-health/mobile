import React from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { trxState, useAppSelector } from '@/services/store'
import { flexStyle } from '@/theme/AppStyles'

interface Props {
  children: React.ReactNode
}

function TransactionBatchContainer({ children }: Readonly<Props>) {
  const { activity, customer } = useAppSelector(trxState)
  return (
    <View className='bg-white flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        {children}
      </KeyboardAvoidingView>
    </View>
  )
}

export default TransactionBatchContainer
