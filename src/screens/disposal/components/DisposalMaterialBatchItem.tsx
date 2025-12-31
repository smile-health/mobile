import React, { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import ActivityLabel from '@/components/ActivityLabel'
import { Button } from '@/components/buttons'
import CollapsableContainer from '@/components/CollapsableContainer'
import { InfoRow } from '@/components/list/InfoRow'
import Separator from '@/components/separator/Separator'
import { useLanguage } from '@/i18n/useLanguage'
import { AddDisposalForm } from '@/models/disposal/CreateSelfDisposal'
import { DisposalDetailMaterialStockItem } from '@/models/disposal/DisposalStock'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import DisposalQtyInfo from './DisposalQtyInfo'
import {
  DISPOSAL_QTY_TYPE,
  disposalItemLabel,
  disposalQtyLabel,
  disposalQtyTypeLabel,
  DisposalType,
} from '../disposal-constant'

interface MaterialBatchItemProps {
  type: DisposalType
  stock: DisposalDetailMaterialStockItem
  expanded: boolean
  activity: string
  onToggleExpand: (stockId: number) => void
  quantities?: AddDisposalForm | null
  onEdit?: () => void
}

export default function DisposalMaterialBatchItem({
  type,
  stock,
  expanded,
  activity,
  onToggleExpand,
  quantities,
  onEdit,
}: Readonly<MaterialBatchItemProps>) {
  const { t } = useLanguage()
  const navigation = useNavigation()
  const batch = stock.batch
  const label = disposalItemLabel[type]

  const discardQty = stock.disposal_discard_qty ?? 0
  const receivedQty = stock.disposal_received_qty ?? 0
  const disposalQty = discardQty + receivedQty

  const handlePress = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigation.navigate('AddDisposal', { disposalStock: stock, type })
    }
  }

  const renderQtyItem = useCallback(
    (item, qtyType) => (
      <DisposalQtyInfo
        key={`${qtyType}-${item.disposal_stock_id}`}
        item={item}
        t={t}
      />
    ),
    [t]
  )

  return (
    <View className='bg-white rounded-sm border border-paleGreyTwo mb-2 p-3'>
      <Pressable
        onPress={() => onToggleExpand(stock.id)}
        className='flex-row items-center justify-between'>
        <View className='flex-1'>
          <View className='flex-row items-center'>
            <Text className={cn(AppStyles.textRegular, 'flex-1')}>
              {batch?.code}
            </Text>
            <ActivityLabel name={activity} className='mr-2' />
            <Icons.IcExpandMore rotation={expanded ? 180 : 0} />
          </View>

          <InfoRow label={t(disposalQtyLabel)} value={disposalQty} />
          <Separator className='mb-1' />
          {batch != null && (
            <>
              <InfoRow
                label={t('label.expired_date')}
                value={convertString(batch?.expired_date, SHORT_DATE_FORMAT)}
              />
              <InfoRow
                label={t('label.manufacturer')}
                value={batch?.manufacture?.name || '-'}
              />
            </>
          )}
        </View>
      </Pressable>
      <CollapsableContainer expanded={expanded} className=''>
        {batch != null && (
          <>
            <InfoRow
              label={t('label.production_date')}
              value={convertString(batch?.production_date, SHORT_DATE_FORMAT)}
            />
            <Separator className='mb-1' />
          </>
        )}

        <InfoRow
          label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.DISCARD])}
          value={numberFormat(discardQty)}
        />
        <InfoRow
          label={t(disposalQtyTypeLabel[DISPOSAL_QTY_TYPE.RECEIVED])}
          value={numberFormat(receivedQty)}
        />
        <Separator />

        {quantities ? (
          <View className='border border-quillGrey mt-2 rounded-md p-3'>
            <View className='flex-row justify-between items-center mb-2'>
              <Text className={cn(AppStyles.textBold)}>{t(label.qty)}</Text>
              <Button
                text={t('button.edit')}
                textClassName='text-main text-sm'
                onPress={handlePress}
                RightIcon={Icons.IcChevronRightActive}
                rightIconColor={colors.main()}
                rightIconSize={20}
                {...getTestID(`btn-edit-disposal-qty-${stock.id}`)}
              />
            </View>

            {/* Display Discard Section */}
            {quantities.discard && quantities.discard.length > 0 && (
              <View className='mb-2'>
                <Text className={AppStyles.labelBold}>
                  {t(label.stockDiscard)}
                </Text>
                {quantities.discard.map((item) =>
                  renderQtyItem(item, 'discard')
                )}
              </View>
            )}

            {/* Display Received Section */}
            {quantities.received && quantities.received.length > 0 && (
              <View>
                <Separator className='mb-2' />
                <Text className={AppStyles.labelBold}>
                  {t(label.stockReceived)}
                </Text>
                {quantities.received.map((item) =>
                  renderQtyItem(item, 'received')
                )}
              </View>
            )}
          </View>
        ) : (
          <Button
            preset='outlined-primary'
            text={t(label.button)}
            onPress={handlePress}
            {...getTestID(`btn-add-disposal-qty-${stock.id}`)}
          />
        )}
      </CollapsableContainer>
    </View>
  )
}
