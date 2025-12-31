import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import PickerSelectBottomSheet from '@/components/bottomsheet/PickerSelectBottomSheet'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'

interface Props {
  statusId: number | null
  data: IOptions[]
  onApplyFilter: (id: IOptions) => void
  onResetFilter?: () => void
}

export default function AssetFilter({
  statusId,
  data,
  onApplyFilter,
}: Readonly<Props>) {
  const [isOpenFilter, setIsOpenFilter] = useState(false)

  const { t } = useLanguage()

  const filterText = useMemo(() => {
    const selectedStatus = data.find((val) => val.value === statusId)

    if (statusId !== null && statusId !== 0 && selectedStatus) {
      return `${t('asset.working_status')}: ${selectedStatus.label}`
    }

    return t('asset.all_working_status')
  }, [statusId, data, t])

  const toggleStatusFilter = () => {
    setIsOpenFilter((prev) => !prev)
  }

  return (
    <>
      <View className={cn(AppStyles.borderBottom, 'p-4 flex-row')}>
        <Pressable
          onPress={toggleStatusFilter}
          className='flex-row px-2 py-1 gap-x-1 rounded-3xl bg-catskillWhite border border-quillGrey'>
          <Text className={AppStyles.textMediumSmall}>{filterText}</Text>
          <Icons.IcExpandMore width={16} height={16} />
        </Pressable>
      </View>

      <PickerSelectBottomSheet
        name='WorkingStatusFilterBottomSheet'
        isOpen={isOpenFilter}
        title={t('asset.working_status')}
        data={data}
        value={statusId}
        radioButtonColor={colors.honeyFlower}
        toggleSheet={toggleStatusFilter}
        onSelect={onApplyFilter}
      />
    </>
  )
}
