import React from 'react'
import { View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { AppStackScreenProps } from '@/navigators'
import { MaterialInfo } from '@/screens/shared/component/MaterialInfo'
import { OrderForm } from '@/screens/shared/component/OrderForm'
import { getTestID } from '@/utils/CommonUtils'
import useRelcoationTrademarkDetailForm from '../hooks/relocation/useRelocationTrademarkDetailForm'

interface Props
  extends AppStackScreenProps<'RelocationTrademarkMaterialDetail'> {}

export default function RelocationTrademarkMaterialDetailScreen({
  route,
}: Props) {
  const data = route.params?.material

  const {
    t,
    methods,
    quantity,
    reason,
    activity,
    vendor,
    qtyMaterial,
    currentMinMax,
    getOrderRecommendation,
    handleSaveTrademark,
  } = useRelcoationTrademarkDetailForm({ data })

  return (
    <View className='bg-white flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityLabel='label.vendor'
        entityName={vendor?.name}
      />

      <MaterialInfo
        data={data}
        qtyMaterial={qtyMaterial}
        currentMinMax={currentMinMax}
        isTrademark
      />

      <FormProvider {...methods}>
        <OrderForm
          quantity={String(quantity)}
          reason={String(reason)}
          shouldShowDropdownReason={false}
          getOrderRecommendation={getOrderRecommendation}
        />
      </FormProvider>

      <View className='p-4 bg-white mt-auto border-t border-quillGrey'>
        <Button
          disabled={!quantity}
          preset='filled'
          containerClassName='bg-main gap-x-2'
          text={t('button.save')}
          LeftIcon={Icons.IcCheck}
          onPress={handleSaveTrademark}
          {...getTestID('btn-save-relocation-trademark')}
        />
      </View>
    </View>
  )
}
