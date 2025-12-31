import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FormProvider } from 'react-hook-form'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackParamList } from '@/navigators'
import {
  orderState,
  useAppSelector,
  vendorState,
  workspaceState,
} from '@/services/store'
import { flexStyle } from '@/theme/AppStyles'
import { ORDER_REASON_TYPE } from '@/utils/Constants'
import useProgramId from '@/utils/hooks/useProgramId'
import { ConfirmationDialogOrder } from './component/ConfirmationDialogOrder'
import { MaterialHeader } from './component/MaterialHeader'
import { MaterialInfo } from './component/MaterialInfo'
import { OrderActions } from './component/OrderActions'
import { OrderForm } from './component/OrderForm'
import { useMaterialDetailForm } from './hooks/useMaterialDetailForm'
import { MaterialData, DispatchActionData } from './types/MaterialDetail'
import { SelectTrademarkButton } from '../order/component/SelectTrademarkButton'
import { useReasonOptions } from '../order/hooks/useReasonOptions'
import { OrderType } from '../order/types/order'

interface MaterialDetailScreenBaseProps<T extends keyof AppStackParamList> {
  navigation: NativeStackNavigationProp<AppStackParamList, T>
  data: MaterialData
  activityName?: string
  dispatchAction: (payload: DispatchActionData) => void
  title: string
  orderType: OrderType
  orderReasonType?: string
  parentMaterial?: MaterialData
  editableQty?: boolean
  isTrademark?: boolean
  isOrderItem?: boolean
}

export const MaterialDetailScreenBase = <T extends keyof AppStackParamList>({
  navigation,
  data,
  activityName,
  dispatchAction,
  title,
  orderType,
  orderReasonType,
  parentMaterial,
  editableQty,
  isTrademark,
  isOrderItem,
}: MaterialDetailScreenBaseProps<T>) => {
  const { vendor } = useAppSelector(vendorState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { drafts } = useAppSelector(orderState)

  const programId = useProgramId()

  const {
    methods,
    quantity,
    reason,
    isDialogOpen,
    shouldShowDropdownReason,
    isSaveDisabled,
    currentMinMax,
    qtyMaterial,
    activeActivity,
    toggleDialog,
    handleSave,
    getOrderRecommendation,
    recommendedStock,
    handleSubmit,
    handleTrademark,
    detailOrder,
  } = useMaterialDetailForm(
    data,
    navigation,
    dispatchAction,
    orderType,
    parentMaterial,
    isOrderItem
  )

  const { reasonRegularOptions, reasonRelocationOptions } = useReasonOptions()
  const reasonOptions =
    orderReasonType === ORDER_REASON_TYPE.RELOCATION
      ? reasonRelocationOptions
      : reasonRegularOptions

  useToolbar({ title })

  const hasQuantity = Number(quantity) > 0
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const orderDraft = programId ? (drafts.regular?.[programId] ?? []) : []
  const hasMaterialHierarchy = orderDraft.some(
    (item) =>
      item.material_id === data.id &&
      Array.isArray(item.material_hierarchy) &&
      item.material_hierarchy.length > 0
  )
  const showTrademarkButton = isHierarchy && !isTrademark
  const resolvedActivityName = detailOrder?.activity?.name || activityName || ''
  const resolvedVendorName = detailOrder?.vendor?.name || vendor?.name || ''

  const shouldShowTrademarkButton = () => {
    if (!showTrademarkButton) return false
    if (!hasQuantity) return true
    return hasMaterialHierarchy
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={16}
      style={flexStyle}>
      <ScrollView
        contentContainerClassName='flex-grow'
        keyboardShouldPersistTaps='handled'>
        <View className='flex-1 bg-white'>
          <MaterialHeader
            activityName={resolvedActivityName}
            activeActivity={activeActivity}
            vendorName={resolvedVendorName}
          />

          <MaterialInfo
            data={data}
            qtyMaterial={qtyMaterial}
            currentMinMax={currentMinMax}
            isHierarchy={isHierarchy}
            isTrademark={isTrademark}
          />

          <FormProvider {...methods}>
            <OrderForm
              dataReason={reasonOptions}
              quantity={String(quantity)}
              reason={reason}
              shouldShowDropdownReason={shouldShowDropdownReason}
              getOrderRecommendation={getOrderRecommendation}
              editable={editableQty}
            />
          </FormProvider>

          {shouldShowTrademarkButton() && (
            <SelectTrademarkButton
              isEdit={hasMaterialHierarchy}
              onPress={handleTrademark}
            />
          )}
        </View>
      </ScrollView>

      <OrderActions isSaveDisabled={isSaveDisabled} onPress={handleSubmit} />

      <ConfirmationDialogOrder
        isDialogOpen={isDialogOpen}
        toggleDialog={toggleDialog}
        handleSave={handleSave}
        recommendedStock={recommendedStock}
      />
    </KeyboardAvoidingView>
  )
}
