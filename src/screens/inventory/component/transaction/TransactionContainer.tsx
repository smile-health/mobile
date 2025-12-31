import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { trxState, useAppSelector } from '@/services/store'
import { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { TransactionLabelType } from '../../constant/transaction.constant'
import { getMaterialCardProps } from '../../helpers/TransactionHelpers'
import MaterialCard from '../MaterialCard'

interface TransactionContainerProps {
  children: React.ReactNode
  type: TransactionLabelType
}

function TransactionContainer({
  children,
  type,
}: Readonly<TransactionContainerProps>) {
  const { activity, customer, trxMaterial } = useAppSelector(trxState)
  const headerDataProps = getMaterialCardProps(trxMaterial)

  return (
    <View className='bg-white flex-1' {...getTestID(`container-${type}`)}>
      <EntityActivityHeader
        activityName={activity.name}
        entityName={customer?.name}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <ScrollView
          contentContainerClassName='flex-grow'
          keyboardShouldPersistTaps='handled'>
          <MaterialCard {...headerDataProps} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default TransactionContainer
