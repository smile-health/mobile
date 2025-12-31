import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { IDisposalShipmentDetailItem } from '@/models/disposal/DisposalShipmentList'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface Props {
  item: IDisposalShipmentDetailItem
  onPressDetail: (item: IDisposalShipmentDetailItem) => void
}

function DisposalShipmentDetailItem({ item, onPressDetail }: Readonly<Props>) {
  const { t } = useLanguage()
  const { id, master_material, qty } = item

  const handlePressDetail = useCallback(() => {
    onPressDetail(item)
  }, [item, onPressDetail])

  return (
    <View className='bg-white px-4 pb-2'>
      <View className='border border-quillGrey p-2 mb-2 rounded-sm gap-y-1'>
        <View className='flex-row items-center'>
          <Text className={AppStyles.labelBold} style={flexStyle}>
            {t('label.trademark_material')}
          </Text>
          <Button
            text={t('disposal.detail')}
            textClassName='text-main text-sm'
            onPress={handlePressDetail}
            RightIcon={Icons.IcChevronRightActive}
            rightIconColor={colors.main()}
            rightIconSize={20}
            {...getTestID(`btn-shipment-item-${id}`)}
          />
        </View>
        <Text className={AppStyles.textBold}>{master_material.name}</Text>
        <InfoRow
          label={t('disposal.disposal_shipment_qty')}
          value={numberFormat(qty)}
          valueClassName='font-mainBold'
        />
      </View>
    </View>
  )
}

export default React.memo(DisposalShipmentDetailItem)
