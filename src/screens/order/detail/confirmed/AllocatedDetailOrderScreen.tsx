import React, { useCallback, useMemo } from 'react'
import { FlatList, SafeAreaView, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import StockActivityButton from '@/screens/inventory/component/button/StockActivityButton'
import SelectActivityStockBottomSheet from '@/screens/inventory/component/transaction/SelectActivityStockBottomSheet'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import AllocatedOrderHeader from '../../component/allocation/AllocatedOrderHeader'
import AllocationMaterialHierarchyRenderer from '../../component/allocation/AllocationMaterialHierarchyRenderer'
import AllocationMaterialNonHierarchyRenderer from '../../component/allocation/AllocationMaterialNonHierarchyRenderer'
import StockInfoModal from '../../component/allocation/StockInfoModal'
import { useAllocatedDetailOrder } from '../../hooks/useAllocatedDetailOrder'

interface Props extends AppStackScreenProps<'AllocatedDetailOrder'> {}

export default function AllocatedDetailOrderScreen({ route }: Props) {
  const { detail, data } = route.params

  const {
    formControl: { watch, setValue, form, control },
    t,
    uiState: {
      isOpenInfoModal,
      isActivitySheetOpen,
      activityStockData,
      setIsActivitySheetOpen,
    },
    actions: {
      handleOpenInfoModal,
      handleCloseInfoModal,
      handleSelectStockFromOtherActivity,
      handleSaveAllocateStock,
    },
    datas: { materialList, additionalStockDetails, draftData },
    status: { isBatch, isHierarchy, isLoadingMaterial },
  } = useAllocatedDetailOrder(detail, data)
  const materialId = data?.material?.id

  const hasChildMaterials = data?.children.length > 0

  const childMaterialIds = useMemo(
    () => data?.children?.map((child) => child.material?.id) ?? [],
    [data?.children]
  )

  const filteredStockDetails = useMemo(() => {
    const found = materialList.find((item) => item.material?.id === materialId)
    const baseDetails = hasChildMaterials
      ? found?.details?.filter((detail) =>
          childMaterialIds.includes(detail.material?.id)
        )
      : found?.details

    if (!baseDetails) return additionalStockDetails || []
    if (!additionalStockDetails || additionalStockDetails.length === 0)
      return baseDetails

    return [...baseDetails, ...additionalStockDetails]
  }, [
    materialId,
    materialList,
    hasChildMaterials,
    childMaterialIds,
    additionalStockDetails,
  ])

  useToolbar({
    title: `${t('label.allocated_stock')}: ${detail.id}`,
  })

  const renderHeader = useCallback(
    () => (
      <AllocatedOrderHeader
        materialName={data.material?.name}
        confirmedQty={data?.confirmed_qty}
        onOpenInfo={handleOpenInfoModal}
        isBatch={isBatch}
        isHierarchy={isHierarchy}
        t={t}
      />
    ),
    [
      data?.confirmed_qty,
      data.material?.name,
      handleOpenInfoModal,
      isBatch,
      isHierarchy,
      t,
    ]
  )

  const renderItem = useCallback(
    ({ item, index }) => {
      const isBatch = item.material.is_managed_in_batch === 1
      const matchedChild = data.children?.find(
        (child) => child.material.id === item.material.id
      )

      // Merge item with extra fields from matched child
      const enrichedItem = {
        ...item,
        recommended_stock: matchedChild?.recommended_stock ?? null,
        qty: matchedChild?.qty ?? null,
        ordered_qty: matchedChild?.ordered_qty ?? null,
        confirmed_qty: matchedChild?.confirmed_qty ?? null,
        allocated_qty: matchedChild?.allocated_qty ?? null,
      }

      return isHierarchy ? (
        <AllocationMaterialHierarchyRenderer
          item={enrichedItem}
          materialParentId={data?.material?.id ?? 1}
          index={index}
          t={t}
          control={control}
          isBatch={isBatch}
          setValue={setValue}
          form={form}
          watch={watch}
          draftData={draftData}
        />
      ) : (
        <AllocationMaterialNonHierarchyRenderer
          item={item}
          index={index}
          t={t}
          control={control}
          isBatch={isBatch}
          setValue={setValue}
          draftData={draftData}
        />
      )
    },
    [
      data.children,
      data?.material?.id,
      isHierarchy,
      t,
      control,
      setValue,
      form,
      watch,
      draftData,
    ]
  )

  const renderStockActivityButton = useCallback(
    () => (
      <View className='my-1'>
        <StockActivityButton onPress={() => setIsActivitySheetOpen(true)} />
      </View>
    ),
    [setIsActivitySheetOpen]
  )

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: detail.activity.name,
          },
          {
            label: t('label.customer'),
            value: detail.customer.name,
          },
        ]}
      />
      <View className='bg-white flex-1'>
        <FlatList
          data={filteredStockDetails}
          keyExtractor={(item) => String(item?.material?.id)}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListFooterComponent={renderStockActivityButton}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='none'
          removeClippedSubviews={false}
          extraData={form.comment}
        />
      </View>
      <View className='flex-row p-4 border-whiteTwo border-t bg-white'>
        <Button
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          containerClassName='flex-1'
          text={t('button.save')}
          LeftIcon={Icons.IcCheck}
          onPress={handleSaveAllocateStock}
          {...getTestID('btn-save-allocation')}
        />
      </View>
      <StockInfoModal
        isVisible={isOpenInfoModal}
        onClose={handleCloseInfoModal}
        vendorName={detail.vendor.name}
        stockInfo={{
          total_qty: data.stock_customer.total_qty,
          min: data.stock_customer.min,
          max: data.stock_customer.max,
          updated_at: data.stock_customer.updated_at,
        }}
        t={t}
      />
      <LoadingDialog
        modalVisible={isLoadingMaterial}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-allocate-order'
      />
      <SelectActivityStockBottomSheet
        activityStocks={activityStockData}
        isOpen={isActivitySheetOpen}
        toggleSheet={() => setIsActivitySheetOpen(false)}
        onSelectActivity={handleSelectStockFromOtherActivity}
      />
    </SafeAreaView>
  )
}
