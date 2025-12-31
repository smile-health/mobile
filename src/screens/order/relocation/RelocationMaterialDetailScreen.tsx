import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { MaterialInfo } from '@/screens/shared/component/MaterialInfo'
import { OrderForm } from '@/screens/shared/component/OrderForm'
import { useAppSelector, workspaceState } from '@/services/store'
import { flexStyle } from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { SelectTrademarkButton } from '../component/SelectTrademarkButton'
import useRelocationMaterialDetailForm from '../hooks/relocation/useRelocationMaterialDetailForm'
import { useReasonOptions } from '../hooks/useReasonOptions'

interface Props extends AppStackScreenProps<'RelocationMaterialDetail'> {}

export default function RelocationMaterialDetailScreen({ route }: Props) {
  const data = route.params?.material

  const { selectedWorkspace } = useAppSelector(workspaceState)

  const { t } = useLanguage()

  const {
    methods,
    quantity,
    reason,
    activity,
    vendor,
    relocations,
    qtyMaterial,
    currentMinMax,
    getOrderRecommendation,
    shouldShowDropdownReason,
    handleSave,
    isSaveDisabled,
    handleNavigateToTrademark,
  } = useRelocationMaterialDetailForm({ data })
  const { reasonRelocationOptions } = useReasonOptions()

  const hasQuantity = Number(quantity) > 0
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const hasMaterialHierarchy = relocations.some(
    (item) =>
      item.material_id === data.id &&
      Array.isArray(item.material_hierarchy) &&
      item.material_hierarchy.length > 0
  )
  const shouldShowTrademarkButton =
    isHierarchy && (!hasQuantity || hasMaterialHierarchy)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={flexStyle}>
      <ScrollView
        contentContainerClassName='flex-grow'
        keyboardShouldPersistTaps='handled'>
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
            isHierarchy={isHierarchy}
          />

          <FormProvider {...methods}>
            <OrderForm
              dataReason={reasonRelocationOptions}
              quantity={String(quantity)}
              reason={String(reason)}
              shouldShowDropdownReason={shouldShowDropdownReason}
              getOrderRecommendation={getOrderRecommendation}
              editable={!hasMaterialHierarchy}
            />
          </FormProvider>

          {shouldShowTrademarkButton && (
            <SelectTrademarkButton
              isEdit={hasMaterialHierarchy}
              onPress={handleNavigateToTrademark}
            />
          )}
        </View>
      </ScrollView>
      <View className='p-4 bg-white mt-auto border-t border-quillGrey'>
        <Button
          disabled={isSaveDisabled}
          preset='filled'
          containerClassName='bg-main gap-x-2'
          text={t('button.save')}
          LeftIcon={Icons.IcCheck}
          onPress={handleSave}
          {...getTestID('btn-save-relocation')}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
