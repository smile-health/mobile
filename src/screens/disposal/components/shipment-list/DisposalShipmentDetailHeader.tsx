import React, { useState } from 'react'
import { Text, View } from 'react-native'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentDetail } from '@/models/disposal/DisposalShipmentList'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import SenderReceiverInfo from './SenderReceiverInfo'
import useShipmentStatusHistory from '../../hooks/useShipmentStatusHistory'

interface Props {
  data: IDisposalShipmentDetail
}

function getUserTimestamp(user, date, t) {
  const name = [user.firstname, user.lastname].join(' ').trim()
  const time = convertString(date, SHORT_DATE_TIME_FORMAT).toUpperCase()

  return t('label.date_by_name', { date: time, name })
}

function DisposalShipmentDetailHeader({ data }: Readonly<Props>) {
  const { t } = useLanguage()
  const { id, customer, vendor, no_document } = data

  const histories = useShipmentStatusHistory(data, t)

  const [isShowDetail, setIsShowDetail] = useState(false)

  const toggleDetail = () => setIsShowDetail((prev) => !prev)
  return (
    <View className='bg-white p-4'>
      <Text className={cn(AppStyles.textBold, 'flex-1 mb-2')}>
        {t('disposal.detail_title_id', { id })}
      </Text>
      <SenderReceiverInfo
        senderName={vendor.name}
        senderAddress={vendor.address}
        receiverName={customer.name}
        receiverAddress={customer.address}
        t={t}
      />
      {isShowDetail && (
        <View className='gap-y-4 mt-4'>
          <View className='border-t border-quillGrey pt-4'>
            <InfoRow
              label={t('disposal.disposal_report_number')}
              value={no_document}
              valueClassName='font-mainBold'
            />
          </View>
          <View className='border-t border-quillGrey py-4 gap-y-1'>
            <Text className={AppStyles.labelBold}>
              {t('disposal.disposal_shipment_status_history')}
            </Text>
            {histories.map((item) => (
              <InfoRow
                key={item.label}
                label={item.label}
                value={getUserTimestamp(item.user, item.date, t)}
              />
            ))}
          </View>
        </View>
      )}
      <Button
        text={t(isShowDetail ? 'button.show_less' : 'button.show_all')}
        containerClassName='self-end mt-4'
        textClassName='text-right text-main'
        onPress={toggleDetail}
        {...getTestID('btn-toggle-disposal-shipment-detail')}
      />
    </View>
  )
}

export default DisposalShipmentDetailHeader
