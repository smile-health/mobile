import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import MultiSelectBottomSheet from '@/components/bottomsheet/MultiSelectBottomSheet'
import { ImageButton } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { concatString, getTestID } from '@/utils/CommonUtils'

interface Props {
  programIds: number[]
  programs: IOptions[]
  onResetFilter: () => void
  onApplyFilter: (programIds: number[]) => void
}

function NotificationFilter({
  programIds,
  programs,
  onApplyFilter,
  onResetFilter,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const [isOpenProgramFilter, setIsOpenProgramFilter] = useState(false)

  const shouldShowFilterProgramText = programIds.length > 0

  const filterText = useMemo(() => {
    const selectedProgramNames = programs
      .filter((p) => programIds.includes(p.value))
      .map((p) => p.label)
    if (shouldShowFilterProgramText) {
      return {
        chip: `${programIds.length} ${t('label.programs')}`,
        selected: concatString(selectedProgramNames),
      }
    }
    return {
      chip: t('label.all_program'),
    }
  }, [programIds, programs, shouldShowFilterProgramText, t])

  const toggleProgramFilter = () => {
    setIsOpenProgramFilter((prev) => !prev)
  }

  return (
    <React.Fragment>
      <View className='px-4 py-3 border-b border-quillGrey items-start'>
        <Pressable
          onPress={toggleProgramFilter}
          className='flex-row px-2 py-1 gap-x-1 rounded-3xl bg-catskillWhite border border-quillGrey'
          {...getTestID('filterchip-program')}>
          <Text className={AppStyles.textMediumSmall}>{filterText.chip}</Text>
          <Icons.IcExpandMore width={16} height={16} />
        </Pressable>
      </View>
      {shouldShowFilterProgramText && (
        <View className='bg-polynesianBlue px-4 py-1 gap-y-1 border-b border-quillGrey'>
          <View className='flex-row items-start gap-x-1'>
            <Text className={cn(AppStyles.textBoldSmall, 'flex-1')}>
              {t('label.program')}
              {': '}
              {filterText.selected}
            </Text>
            <ImageButton
              onPress={onResetFilter}
              Icon={Icons.IcDelete}
              size={16}
              {...getTestID('btn-reset-filters')}
            />
          </View>
        </View>
      )}
      <MultiSelectBottomSheet
        name='ProgramFilterBottomSheet'
        isOpen={isOpenProgramFilter}
        toggleSheet={toggleProgramFilter}
        data={programs}
        value={programIds}
        onApply={onApplyFilter}
        confirmButtonProps={{ containerClassName: 'flex-1 bg-bluePrimary' }}
        resetButtonProps={{
          containerClassName: 'flex-1 border-bluePrimary',
          textClassName: 'text-bluePrimary',
        }}
      />
    </React.Fragment>
  )
}

export default React.memo(NotificationFilter)
