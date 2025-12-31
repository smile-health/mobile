import React from 'react'
import { View, Text } from 'react-native'
import { ParseKeys, TFunction } from 'i18next'
import InputDate from '@/components/forms/InputDate'
import HeaderMaterial, { HeaderItem } from '@/components/header/HeaderMaterial'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface OrderHeaderSectionProps {
  t: TFunction
  activityName?: string
  title?: string
  vendorName?: string
  vendorAddress?: string
  customerName?: string
  customerAddress?: string
  date: Date | undefined | null
  onDateChange?: (val: Date) => void
  totalItem: number
  headerItems?: HeaderItem[]
  containerClassName?: string
  showDivider?: boolean
  showDate?: boolean
  isMandatoryDate?: boolean
  disabledDate?: boolean
  labelDate?: ParseKeys
}

const getDefaultHeaderItems = (
  t: TFunction,
  vendorName?: string,
  activityName?: string
): HeaderItem[] => [
  { label: t('label.vendor'), value: vendorName },
  { label: t('label.activity'), value: activityName },
]

export default function OrderHeaderSection({
  t,
  activityName,
  title,
  vendorName,
  vendorAddress,
  customerName,
  customerAddress,
  date,
  onDateChange = () => {},
  totalItem,
  headerItems,
  containerClassName,
  showDivider = true,
  showDate = false,
  isMandatoryDate = true,
  disabledDate = false,
  labelDate = 'label.required_by_date',
}: Readonly<OrderHeaderSectionProps>) {
  const finalHeaderItems =
    headerItems ?? getDefaultHeaderItems(t, vendorName, activityName)

  return (
    <View>
      <HeaderMaterial items={finalHeaderItems} />
      <View className={cn('bg-white p-4 mb-2', containerClassName)}>
        {title && (
          <Text className={cn(AppStyles.textBold, 'mb-2')}>{title}</Text>
        )}

        {vendorAddress && (
          <View className='border border-whiteTwo p-2 mb-2'>
            <Text
              className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
              {t('label.vendor')}
            </Text>
            <Text className={cn(AppStyles.textBold, 'mb-1')}>{vendorName}</Text>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {vendorAddress}
            </Text>
          </View>
        )}

        {customerAddress && (
          <View className='border border-whiteTwo p-2 mb-2'>
            <Text
              className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
              {t('label.customer')}
            </Text>
            <Text className={cn(AppStyles.textBold, 'mb-1')}>
              {customerName}
            </Text>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {customerAddress}
            </Text>
          </View>
        )}

        {showDate && (
          <InputDate
            isMandatory={isMandatoryDate}
            disabled={disabledDate}
            date={date}
            label={t(labelDate)}
            minimumDate={new Date()}
            className='flex-1 bg-white'
            onDateChange={onDateChange}
          />
        )}
      </View>

      {showDivider && <View className='bg-lightBlueGray w-full h-2' />}

      <View className={cn(AppStyles.rowBetween, 'p-4')}>
        <Text className={cn(AppStyles.textBoldMedium, 'text-midnightBlue')}>
          {t('label.item')}
        </Text>
        <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
          {t('label.total')}
          <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
            {t('label.count_items', { count: totalItem })}
          </Text>
        </Text>
      </View>
    </View>
  )
}
