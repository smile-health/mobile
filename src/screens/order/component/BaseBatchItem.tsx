import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Control } from 'react-hook-form'
import ActivityLabel from '@/components/ActivityLabel'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber } from '@/components/forms'
import { Stock } from '@/models/shared/Material'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { materialStatuses } from '@/utils/Constants'

interface StockBaseBatch extends Stock {
  activity_name?: string
}

interface InputProps {
  errors?: string
  valueQty: string
  valueMaterialStatus?: string
  nameQty: string
  nameMaterialStatus?: string
  onChangeQty: (value: string) => void
  onChangeMaterialStatus: (value: number) => void
  onFocusQty: () => void
}

interface BaseBatchItemProps {
  stock: StockBaseBatch
  index: number
  control: Control<any>
  t: TFunction
  isMaterialSensitive?: boolean
  containerClassName?: string
  children?: React.ReactNode
  inputProps: InputProps
}

const BaseBatchItem: React.FC<BaseBatchItemProps> = ({
  stock,
  control,
  t,
  children,
  isMaterialSensitive,
  containerClassName,
  inputProps,
}) => {
  const stockActivityName =
    stock?.activity_name || stock?.activity?.name || null

  return (
    <View>
      <View
        className={cn(
          'border-quillGrey border p-2 my-1 rounded-sm',
          containerClassName
        )}>
        <View className='flex-row items-center gap-x-2 mb-3'>
          <Text className={cn(AppStyles.textRegularMedium, 'flex-1')}>
            {stock?.batch?.code}
          </Text>
          <ActivityLabel name={stockActivityName} />
        </View>
        {children}
        <InputNumber
          isMandatory
          name={inputProps.nameQty}
          control={control}
          value={String(inputProps?.valueQty)}
          onChangeText={(val) => inputProps.onChangeQty(val)}
          label={t('label.received_qty')}
          placeholder={t('label.received_qty')}
          errors={inputProps.errors}
          onFocus={inputProps.onFocusQty}
          {...getTestID(`textfield-receive-qty)`)}
        />
        {isMaterialSensitive && (
          <Dropdown
            data={materialStatuses}
            preset='bottom-border'
            name={inputProps.nameMaterialStatus ?? ''}
            control={control}
            onChangeValue={(val) =>
              inputProps.onChangeMaterialStatus(val.value)
            }
            value={inputProps.valueMaterialStatus}
            label={t('label.material_status')}
            placeholder={t('label.material_status')}
            isMandatory
            {...getTestID(`dropdown-material-status-${stock?.id}`)}
          />
        )}
      </View>
    </View>
  )
}

export default memo(BaseBatchItem)
