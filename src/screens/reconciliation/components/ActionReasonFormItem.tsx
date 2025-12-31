import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import { Button } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { useLanguage } from '@/i18n/useLanguage'
import { ActionReasonData } from '@/models/reconciliation/CreateReconciliation'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import { ReconciliationFormItem } from '../schema/CreateReconciliationSchema'

interface Props {
  index: number
  isLastIndex: boolean
  reasons: ActionReasonData[]
  actions: ActionReasonData[]
  onDelete: (index: number) => void
}

function ActionReasonFormItem({
  index,
  isLastIndex,
  reasons,
  actions,
  onDelete,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ReconciliationFormItem>()

  const shouldShowDeleteButton = isLastIndex && index !== 0

  const handleChangeReasonAction = useCallback(
    (name) => (item: ActionReasonData) => {
      const field =
        `action_reasons.${index}.${name}` as Path<ReconciliationFormItem>
      setValue(field, item.title, { shouldValidate: true })
      trigger('action_reasons')
    },
    [index, setValue, trigger]
  )

  const getErrorMessage = (field: string) =>
    errors.action_reasons?.[index]?.[field]?.message
  return (
    <View className='rounded-sm p-2 border border-quillGrey'>
      <Text className={AppStyles.labelBold}>
        {t('label.reason_num', { num: index + 1 })}
      </Text>
      <Dropdown
        data={reasons}
        control={control}
        name={`action_reasons.${index}.reason_id`}
        preset='bottom-border'
        label={t('label.reason')}
        placeholder={t('label.reason')}
        onChangeValue={handleChangeReasonAction('reason_title')}
        labelField='title'
        valueField='id'
        isMandatory
        errors={getErrorMessage('reason_id')}
        {...getTestID(`dropdown-reason-${index}`)}
      />
      <Dropdown
        data={actions}
        control={control}
        name={`action_reasons.${index}.action_id`}
        preset='bottom-border'
        label={t('label.action')}
        placeholder={t('label.action')}
        onChangeValue={handleChangeReasonAction('action_title')}
        labelField='title'
        valueField='id'
        isMandatory
        errors={getErrorMessage('action_id')}
        {...getTestID(`dropdown-action-${index}`)}
      />
      {shouldShowDeleteButton && (
        <Button
          text={t('button.delete')}
          onPress={() => onDelete(index)}
          containerClassName='self-end mt-2'
          textClassName='text-lavaRed'
          {...getTestID('btn-delete-reason-action')}
        />
      )}
    </View>
  )
}

export default React.memo(ActionReasonFormItem)
