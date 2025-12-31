import React from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { TextField } from '@/components/forms'
import InputDate from '@/components/forms/InputDate'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { HighlightedText } from '@/components/text/HighlightedText'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import OrderCommentSection from '../../component/section/OrderCommentSection'
import VendorCustomerSection from '../../component/section/VendorCustomerSection'
import { useShippedOrder } from '../../hooks/useShippedOrder'

interface Props extends AppStackScreenProps<'ShipOrder'> {}

export default function ShipOrderScreen({ route, navigation }: Props) {
  const { t } = useLanguage()
  const { data } = route.params

  const {
    control,
    errors,
    isLoading,
    arrivalDate,
    deliveryDate,
    isDialogOpen,
    handleDateChange,
    handleShipOrder,
    toogleCancelDialog,
    canShipOrder,
  } = useShippedOrder(data.id, navigation)

  useToolbar({
    title: `${t('button.ship_order')}: ${data.id}`,
  })

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: data.activity.name,
          },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='bg-white p-4'>
          <Banner
            testID='banner-order-shipment'
            title={t('order.banner.order_shipment_review_confirmation')}
          />
          <Text className={cn(AppStyles.textBold, 'mb-2')}>
            {t('order.detail')}
          </Text>
          <VendorCustomerSection
            vendor={data.vendor}
            customer={data.customer}
            t={t}
          />
          <TextField
            name='sales_ref'
            control={control}
            label={t('label.sales_reference')}
            placeholder={t('label.sales_reference')}
            labelClassName='mt-2'
            errors={errors.sales_ref?.message}
            {...getTestID('textfield-sales-reference')}
          />
          <InputDate
            date={arrivalDate}
            label={t('label.estimated_arrival_date')}
            maximumDate={new Date()}
            className='flex-none mt-2'
            onDateChange={handleDateChange('estimated_date')}
          />
          <InputDate
            isMandatory
            date={deliveryDate}
            label={t('label.actual_shipment_date')}
            maximumDate={new Date()}
            className='flex-none mt-4'
            onDateChange={handleDateChange('actual_shipment_date')}
          />
          <Text
            className={cn(AppStyles.textRegularSmall, 'text-mediumGray mt-1')}>
            {t('order.info_select_actual_date')}
          </Text>
        </View>
        <OrderCommentSection t={t} control={control} />
      </ScrollView>
      <View className='p-4 border-whiteTwo bg-white border-t mt-auto'>
        <Button
          disabled={canShipOrder}
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          text={t('button.ship_order')}
          LeftIcon={Icons.IcArrowForward}
          leftIconColor={colors.white}
          onPress={toogleCancelDialog}
          testID='btn-ship-order'
        />
      </View>
      <ConfirmationDialog
        modalVisible={isDialogOpen}
        dismissDialog={toogleCancelDialog}
        onCancel={toogleCancelDialog}
        onConfirm={handleShipOrder}
        title={`${t('button.ship_order')}?`}
        message={
          <HighlightedText
            text={t('dialog.confirmation_ship_order')}
            keywords={['Shipped', 'Dikirim']}
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
          containerClassName: 'rounded-md border bg-main px-3 py-2',
          ...getTestID('btn-ship-order'),
        }}
      />
      <LoadingDialog
        modalVisible={isLoading}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-ship-order'
      />
    </SafeAreaView>
  )
}
