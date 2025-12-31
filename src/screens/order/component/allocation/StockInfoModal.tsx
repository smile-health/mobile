import React, { memo } from 'react'
import { Modal, Text, View } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import Separator from '@/components/separator/Separator'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { LONG_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'

interface StockInfoModalProps {
  isVisible: boolean
  onClose: () => void
  vendorName: string
  stockInfo: {
    total_qty: number
    min: number
    max: number
    updated_at: string
  }
  t: TFunction
}

function StockInfoModal({
  isVisible,
  onClose,
  vendorName,
  stockInfo,
  t,
}: Readonly<StockInfoModalProps>) {
  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType='fade'
      transparent>
      <View className={cn(AppStyles.modalOverlay, 'px-4')}>
        <View className='bg-white p-4 rounded-sm gap-y-2 self-center w-full'>
          <View className={AppStyles.rowBetween}>
            <Text className={AppStyles.textBoldSmall}>
              {t('label.stock_at')}{' '}
              <Text className={cn(AppStyles.textBoldSmall, 'uppercase')}>
                {vendorName}
              </Text>
            </Text>
            <ImageButton
              onPress={onClose}
              Icon={Icons.IcDelete}
              color={colors.mediumGray}
              size={20}
              {...getTestID('btn-close-modal-info')}
            />
          </View>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('label.stock_on_hand')}:{' '}
            <Text className={cn(AppStyles.textBoldSmall, 'uppercase')}>
              {numberFormat(stockInfo.total_qty)}
            </Text>
          </Text>
          <View className={AppStyles.rowCenterAlign}>
            <View className={cn(AppStyles.rowCenterAlign, 'mr-2')}>
              <Icons.IcMin />
              <Text
                className={cn(
                  AppStyles.textRegularSmall,
                  'text-mediumGray ml-1'
                )}>
                {t('label.min')}:{' '}
                <Text
                  className={cn(AppStyles.textBoldSmall, 'text-midnightBlue')}>
                  {numberFormat(stockInfo.min)}
                </Text>
              </Text>
            </View>
            <View className='w-[1px] h-full bg-quillGrey' />
            <View className={cn(AppStyles.rowCenterAlign, 'ml-2')}>
              <Icons.IcMax />
              <Text
                className={cn(
                  AppStyles.textRegularSmall,
                  'text-mediumGray ml-1'
                )}>
                {t('label.max')}:{' '}
                <Text
                  className={cn(AppStyles.textBoldSmall, 'text-midnightBlue')}>
                  {numberFormat(stockInfo.max)}
                </Text>
              </Text>
            </View>
          </View>
          <Separator />
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('label.last_updated_stock_on')}{' '}
            <Text
              className={cn(
                AppStyles.textBoldSmall,
                'text-mediumGray uppercase'
              )}>
              {convertString(stockInfo.updated_at, LONG_DATE_TIME_FORMAT)}
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  )
}

export default memo(StockInfoModal)
