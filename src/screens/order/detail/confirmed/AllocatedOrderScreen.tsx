import React, { useCallback, useRef } from 'react'
import { FlatList, SafeAreaView, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { OrderAllocatedItem } from '../../component/OrderAllocatedItem'
import OrderCommentSection from '../../component/section/OrderCommentSection'
import { useAllocatedOrder } from '../../hooks/useAllocatedOrder'

interface Props extends AppStackScreenProps<'AllocatedOrder'> {}

export default function AllocatedOrderScreen({ navigation, route }: Props) {
  const { t } = useLanguage()
  const { data } = route.params

  const commentInputRef = useRef(null)

  const {
    control,
    handleSubmit,
    handleDeleteOrders,
    form,
    allocatedDraft,
    shouldShowButtonFooter,
    toggleDialog,
    showDeleteAllDialog,
  } = useAllocatedOrder(data)

  useToolbar({
    title: `${t('label.allocated_stock')}: ${data.id}`,
  })

  const renderHeader = useCallback(
    () => (
      <View className={cn(AppStyles.rowBetween, 'm-4')}>
        <Text className={AppStyles.textBold}>{t('label.item')}</Text>
        <Text className={AppStyles.textRegularSmall}>
          {t('label.total')}{' '}
          <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
            {t('label.count_items', { count: data.order_items.length })}
          </Text>
        </Text>
      </View>
    ),
    [t, data.order_items.length]
  )
  const getLabel = useCallback(
    (materialId: number) => {
      if (allocatedDraft) {
        const directOrder = allocatedDraft?.find(
          (o) => o?.material_id === materialId
        )

        if (directOrder) {
          const allocatedQty = Number(directOrder.total_draft_allocated_qty)
          if (allocatedQty === 0) return ''

          return t('order.allocated_qty_entered', {
            qty: numberFormat(Number(directOrder.total_draft_allocated_qty)),
          })
        }
      }

      return ''
    },
    [allocatedDraft, t]
  )

  const renderItem = useCallback(
    ({ item }) => {
      const allocatedLabel = getLabel(item?.material?.id)
      const directOrder = allocatedDraft?.find(
        (o) => o?.material_id === item?.material?.id
      )
      const totalDraftAllocatedQty = directOrder?.total_draft_allocated_qty || 0
      return (
        <OrderAllocatedItem
          item={item}
          totalDraftAllocatedQty={totalDraftAllocatedQty}
          t={t}
          allocatedLabel={allocatedLabel}
          onAllocate={() =>
            navigation.navigate('AllocatedDetailOrder', {
              data: item,
              detail: data,
            })
          }
        />
      )
    },
    [allocatedDraft, data, getLabel, navigation, t]
  )
  const renderFooter = useCallback(
    () => (
      <OrderCommentSection control={control} inputRef={commentInputRef} t={t} />
    ),
    [control, commentInputRef, t]
  )

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: data.activity.name,
          },
          {
            label: t('label.customer'),
            value: data.customer.name,
          },
        ]}
      />
      <View className='bg-white flex-1'>
        <FlatList
          data={data.order_items}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='none'
          removeClippedSubviews={false}
          extraData={form.comment}
        />
      </View>
      {shouldShowButtonFooter && (
        <View className='flex-row p-4 border-whiteTwo border-t gap-x-2 bg-white'>
          <Button
            preset='outlined'
            textClassName={cn(AppStyles.textMedium, 'ml-1 text-main')}
            containerClassName='flex-1 text-center border-main'
            text={t('button.delete_all')}
            LeftIcon={Icons.IcClose}
            onPress={toggleDialog}
            {...getTestID('btn-delete-all-order')}
          />
          <Button
            preset='filled'
            textClassName={cn(AppStyles.textMedium, 'text-white ml-1')}
            containerClassName='flex-1'
            text={t('button.save_allocation')}
            LeftIcon={Icons.IcArrowForward}
            onPress={handleSubmit}
            {...getTestID('btn-save-allocation')}
          />
        </View>
      )}
      <ConfirmationDialog
        modalVisible={showDeleteAllDialog}
        dismissDialog={toggleDialog}
        onCancel={toggleDialog}
        onConfirm={handleDeleteOrders}
        title={t('dialog.delete_all_item')}
        message={t('dialog.delete_all')}
        cancelText={t('button.cancel')}
        cancelProps={{
          textClassName: 'text-main',
          containerClassName: 'rounded border border-main px-3 py-2',
          ...getTestID('btn-cancel-delete-all'),
        }}
        confirmProps={{
          textClassName: 'text-white',
          containerClassName: 'rounded bg-main px-3 py-2',
          ...getTestID('btn-confirm-delete-all'),
        }}
      />
    </SafeAreaView>
  )
}
