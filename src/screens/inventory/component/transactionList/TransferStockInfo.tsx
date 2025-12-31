import React from 'react'
import { View } from 'react-native'
import { TFunction } from 'i18next'
import ActivityLabel from '@/components/ActivityLabel'
import { InfoRow } from '@/components/list/InfoRow'

interface Props {
  programName: string | null
  activityName: string | null
  companionActivityName: string | null
  companionProgramName: string | null
  changeQty: number
  t: TFunction
}

function TransferStockInfo({
  activityName,
  programName,
  companionActivityName,
  companionProgramName,
  changeQty,
  t,
}: Readonly<Props>) {
  const isNegativeChange = changeQty < 0

  const fromProgram = isNegativeChange ? programName : companionProgramName
  const fromActivity = isNegativeChange ? activityName : companionActivityName
  const toProgram = isNegativeChange ? companionProgramName : programName
  const toActivity = isNegativeChange ? companionActivityName : activityName

  return (
    <View className='gap-y-1 border-b border-quillGrey pb-1'>
      <View className='flex-row items-center justify-between'>
        <InfoRow
          label={t('label.from')}
          value={fromProgram}
          labelClassName='flex-none mr-1'
        />
        <ActivityLabel name={fromActivity} />
      </View>
      <View className='flex-row items-center justify-between'>
        <InfoRow
          label={t('label.to')}
          value={toProgram}
          labelClassName='flex-none mr-1'
        />
        <ActivityLabel name={toActivity} />
      </View>
    </View>
  )
}

export default React.memo(TransferStockInfo)
