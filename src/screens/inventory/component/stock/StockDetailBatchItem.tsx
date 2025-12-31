import React, { useState } from 'react'
import { Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { Stock } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import BaseStockBatchItem from './BaseStockBatchItem'
import BatchDetailBottomSheet from './BatchDetailBottomSheet'

interface StockDetailBatchItemProps {
  item: Stock
  testID: string
}

function StockDetailBatchItem({
  item,
  testID,
}: Readonly<StockDetailBatchItemProps>) {
  const { budget_source } = item
  const { t } = useLanguage()
  const [openDetail, setOpenDetail] = useState(false)

  const toggleDetailBottomSheet = () => setOpenDetail((prev) => !prev)

  return (
    <>
      <BaseStockBatchItem item={item} testID={testID}>
        {!!budget_source && (
          <View className='border border-quillGrey p-2 gap-y-2 rounded-sm'>
            <View className='flex-row items-center justify-between gap-x-1'>
              <Text className={AppStyles.textBold}>
                {t('label.budget_info')}
              </Text>
              <Button
                text={t('label.details')}
                textClassName='text-main text-sm'
                onPress={toggleDetailBottomSheet}
                RightIcon={Icons.IcChevronRightActive}
                rightIconColor={colors.main()}
                rightIconSize={20}
                {...getTestID('btn-edit-add-actual-qty')}
              />
            </View>
            <InfoRow
              label={t('asset.budget_source')}
              value={budget_source?.name ?? '-'}
            />
          </View>
        )}
      </BaseStockBatchItem>
      <BatchDetailBottomSheet
        stock={item}
        isOpen={openDetail}
        toggleSheet={toggleDetailBottomSheet}
        name={`BatchDetail_${item.batch?.code}`}
      />
    </>
  )
}

export default React.memo(StockDetailBatchItem)
