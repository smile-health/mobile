import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import InputDate from '@/components/forms/InputDate'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { InfoRow } from '@/components/list/InfoRow'
import LoadingDialog from '@/components/LoadingDialog'
import Separator from '@/components/separator/Separator'
import { HighlightedText } from '@/components/text/HighlightedText'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import HierarchyMaterialRenderer from '../../../order/component/shipped/HierarchyMaterialRenderer'
import WarningBox from '../../component/detail/WarningBox'
import OrderCommentSection from '../../component/section/OrderCommentSection'
import NonHierarchyMaterialRenderer from '../../component/shipped/NonHierarchyMaterialRenderer'
import { useReceiveOrder } from '../../hooks/useReceiveOrder'

// Memoized child components to prevent unnecessary re-renders
const MemoizedHierarchyMaterialRenderer = React.memo(HierarchyMaterialRenderer)
const MemoizedNonHierarchyMaterialRenderer = React.memo(
  NonHierarchyMaterialRenderer
)

// Main component with proper default export
function ReceiveOrderScreen(props) {
  const {
    data,
    orderId,
    user,
    control,
    errors,
    form,
    isDialogOpen,
    toggleDialog,
    onConfirmReceiveOrder,
    isLoading,
    flatListRef,
    commentInputRef,
    actualReceiptDate,
    handleDateChange,
    t,
    setValue,
    isHierarchy,
    isReceiveDisabled,
  } = useReceiveOrder(props)

  // Memoize orderItems to prevent re-computation
  const orderItems = useMemo(() => data?.order_items || [], [data?.order_items])

  // Memoize formProps to prevent object recreation
  const formProps = useMemo(
    () =>
      form as {
        order_items?: {
          receives?: {
            received_qty: number
            material_status?: number
          }[]
        }[]
      },
    [form]
  )

  // Memoize header items to prevent recreation
  const headerItems = useMemo(
    () => [
      { label: t('label.order'), value: String(orderId) },
      { label: t('label.vendor'), value: user?.entity?.name },
    ],
    [t, orderId, user?.entity?.name]
  )

  const renderItem = useCallback(
    ({ item, index }) => {
      const isBatch = item.material?.is_managed_in_batch === 1
      const isMaterialSensitive = item.material?.is_temperature_sensitive === 1
      const isChildren = item?.children && item?.children?.length > 0
      const typedSetValue = setValue as (name: string, value: number) => void

      return (
        <View className='mx-4 border-quillGrey border p-2 mb-2 rounded-sm'>
          {isChildren && (
            <Text
              className={cn(AppStyles.textBoldSmall, 'text-mediumGray mt-1')}>
              {t('label.active_ingredient_material')}
            </Text>
          )}
          <Text className={AppStyles.textBoldMedium}>
            {item.material?.name}
          </Text>
          <InfoRow
            label={t('label.shipped_qty')}
            value={numberFormat(item.shipped_qty)}
            valueClassName={AppStyles.textBoldSmall}
            labelClassName='mt-1'
          />
          <InfoRow
            label={t('label.ordered_qty')}
            value={numberFormat(item.ordered_qty)}
            labelClassName='mt-1'
          />
          <Separator className='my-2' />

          {isChildren ? (
            <View>
              <Text
                className={cn(
                  AppStyles.textBoldSmall,
                  'text-mediumGray mt-1 mb-2'
                )}>
                {t('label.trademark_material')}
              </Text>
              {item?.children?.map((child, childIdx) => {
                return (
                  <MemoizedHierarchyMaterialRenderer
                    key={child.material.id}
                    child={child}
                    index={index}
                    childIdx={childIdx}
                    control={control}
                    formProps={formProps}
                    setValue={typedSetValue}
                    t={t}
                    isHierarchy={isHierarchy}
                  />
                )
              })}
            </View>
          ) : (
            <MemoizedNonHierarchyMaterialRenderer
              isBatch={isBatch}
              isMaterialSensitive={isMaterialSensitive}
              item={item}
              index={index}
              control={control}
              formProps={formProps}
              setValue={typedSetValue}
              t={t}
            />
          )}
        </View>
      )
    },
    [control, formProps, isHierarchy, setValue, t]
  )

  const renderHeader = useCallback(
    () => (
      <View className={cn(AppStyles.rowBetween, 'mx-4 my-2')}>
        <Text className={AppStyles.textBold}>{t('label.item')}</Text>
        <Text className={AppStyles.textRegularSmall}>
          {t('label.total')}{' '}
          <Text className={cn(AppStyles.textBoldSmall, 'text-medium-gray')}>
            {t('label.count_items', { count: orderItems.length })}
          </Text>
        </Text>
      </View>
    ),
    [t, orderItems.length]
  )

  // Separate ref for comment input to maintain focus
  const stableCommentInputRef = useMemo(
    () => commentInputRef,
    [commentInputRef]
  )

  const renderFooter = useCallback(
    () => (
      <View>
        <View className='bg-lightBlueGray w-full h-2' />
        <View className='px-4 py-2 bg-white'>
          <InputDate
            isMandatory
            date={actualReceiptDate}
            label={t('label.actual_receipt_date')}
            onDateChange={handleDateChange('fulfilled_at')}
            maximumDate={new Date()}
            errors={errors.fulfilled_at?.message}
            helper={t('transaction.helpers.selected_actual_date')}
          />
        </View>
        <OrderCommentSection
          control={control as any}
          inputRef={stableCommentInputRef}
          errors={errors.comment?.message}
          t={t}
        />
        <WarningBox
          title={t('order.accept_warning_title')}
          subTitle={t('order.accept_warning_subtitle')}
          containerClassName='mx-4'
          icon={<Icons.IcWarning />}
        />
      </View>
    ),
    [
      actualReceiptDate,
      control,
      errors,
      handleDateChange,
      stableCommentInputRef,
      t,
    ]
  )

  // Memoize keyExtractor to prevent re-creation
  const keyExtractor = useCallback((item) => String(item.id), [])

  // Memoize FlatList props to prevent unnecessary re-renders
  const flatListProps = useMemo(
    () => ({
      keyboardShouldPersistTaps: 'handled' as const,
      keyboardDismissMode: 'none' as const,
      removeClippedSubviews: false,
      showsVerticalScrollIndicator: false,
      // Remove extraData completely to prevent keyboard dismiss
    }),
    []
  )

  return (
    <KeyboardAvoidingView
      style={flexStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className='flex-1 bg-lightBlueGray'>
        <HeaderMaterial items={headerItems} />
        <View className='bg-white flex-1'>
          <FlatList
            ref={flatListRef}
            data={orderItems}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            {...flatListProps}
          />
        </View>

        <View className='p-4 bg-white border-t border-quillGrey'>
          <Button
            disabled={isReceiveDisabled}
            preset='filled'
            containerClassName='bg-main gap-x-2'
            text={t('button.received_order')}
            onPress={toggleDialog}
            LeftIcon={Icons.IcArrowForward}
            {...getTestID('btn-received-order')}
          />
        </View>

        <ConfirmationDialog
          modalVisible={isDialogOpen}
          dismissDialog={toggleDialog}
          onCancel={toggleDialog}
          onConfirm={onConfirmReceiveOrder}
          title={`${t('button.received_order')}?`}
          message={
            <HighlightedText
              text={t('dialog.confirm_order_received')}
              keywords={['Received', 'Diterima']}
            />
          }
          cancelText={t('button.cancel')}
          cancelProps={{
            textClassName: 'text-main px-2',
            containerClassName: 'rounded-md border border-main px-3 py-2',
            ...getTestID('btn-cancel-order'),
          }}
          confirmProps={{
            textClassName: 'text-white',
            containerClassName:
              'rounded-md border border-main bg-main px-3 py-2',
            ...getTestID('btn-receive-order'),
          }}
        />

        <LoadingDialog
          modalVisible={isLoading}
          title={t('dialog.hang_tight') as ParseKeys}
          message={t('dialog.processing_message')}
          containerClassName='p-6'
          titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
          messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
          testID='loading-received-order'
        />
      </View>
    </KeyboardAvoidingView>
  )
}

// Proper default export
export default ReceiveOrderScreen
