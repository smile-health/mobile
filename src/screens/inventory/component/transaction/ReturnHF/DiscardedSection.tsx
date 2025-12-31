import React, { useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button, ImageButton } from '@/components/buttons'
import Dropdown from '@/components/dropdown/Dropdown'
import { InputNumber, TextField } from '@/components/forms'
import { useLanguage } from '@/i18n/useLanguage'
import { TrxReasonOption } from '@/models/transaction/TransactionCreate'
import { ReturnHFForm } from '@/screens/inventory/schema/ReturnHealthFacilitySchema'
import { getTrxReasons } from '@/services/features'
import { useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { TRANSACTION_TYPE } from '@/utils/Constants'

interface Props {
  index: number
}

function DiscardedSection({ index }: Readonly<Props>) {
  const transactionReasons = useAppSelector((state) =>
    getTrxReasons(state, TRANSACTION_TYPE.DISCARDS)
  )
  const { t } = useLanguage()
  const {
    watch,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ReturnHFForm>()

  const fieldName: Path<ReturnHFForm> = `selectedTrx.${index}`
  const itemBrokenQtyFieldName: Path<ReturnHFForm> = `selectedTrx.${index}.broken_qty`
  const itemTrxReasonFieldName: Path<ReturnHFForm> = `selectedTrx.${index}.transaction_reason_id`
  const {
    change_qty,
    open_vial_qty,
    close_vial_qty,
    is_any_discard,
    broken_qty,
    transaction_reason,
    is_open_vial,
    broken_open_vial,
    broken_close_vial,
  } = watch(fieldName)

  const isOther = !!transaction_reason?.is_other
  const returnedQty = is_open_vial
    ? (open_vial_qty ?? 0) + (close_vial_qty ?? 0)
    : (change_qty ?? 0)
  const discardedQty = is_open_vial
    ? (broken_open_vial ?? 0) + (broken_close_vial ?? 0)
    : (broken_qty ?? 0)

  const numberOfReturn = useMemo(() => {
    return discardedQty ? returnedQty - discardedQty : 0
  }, [discardedQty, returnedQty])

  const setIsAnyDiscard = () => {
    setValue(`${fieldName}.is_any_discard`, true, {
      shouldValidate: true,
    })
    trigger([itemTrxReasonFieldName, itemBrokenQtyFieldName])
  }

  const deleteIsAnyDiscard = () => {
    const data = {
      is_any_discard: undefined,
      broken_qty: undefined,
      transaction_reason_id: null,
      transaction_reason: null,
    }
    for (const [key, value] of Object.entries(data)) {
      setValue(`${fieldName}.${key}` as Path<ReturnHFForm>, value, {
        shouldValidate: true,
      })
    }
    trigger([itemTrxReasonFieldName, itemBrokenQtyFieldName])
  }

  const handleChangeQty = useCallback(
    (field: string) => (value: string) => {
      const fieldBrokenQty = `${fieldName}.${field}` as Path<ReturnHFForm>
      setValue(fieldBrokenQty, value ? Number(value) : undefined, {
        shouldValidate: true,
      })
    },
    [fieldName, setValue]
  )

  const handleChangeReason = useCallback(
    (value: TrxReasonOption) => {
      setValue(`${fieldName}.transaction_reason`, value)
      trigger([`${fieldName}.other_reason`])
    },
    [fieldName, trigger, setValue]
  )

  const getFieldError = (field: string) => {
    return errors.selectedTrx?.[index]?.[field]?.message
  }

  return (
    <React.Fragment>
      {returnedQty > 0 && (
        <View className='flex-row items-center mt-2'>
          <Button
            containerClassName='flex-1 items-center gap-x-2 justify-start'
            textClassName='text-main'
            text={t('button.is_anything_discarded')}
            LeftIcon={Icons.IcAdd}
            leftIconColor={colors.main()}
            onPress={setIsAnyDiscard}
            {...getTestID('btn-is-any-discarded')}
          />
          {is_any_discard && (
            <ImageButton
              size={20}
              Icon={Icons.IcTrash}
              onPress={deleteIsAnyDiscard}
              {...getTestID('btn-remove-is-any-discarded')}
            />
          )}
        </View>
      )}
      {is_any_discard && (
        <View>
          {is_open_vial ? (
            <React.Fragment>
              <InputNumber
                name={`${fieldName}.broken_open_vial`}
                control={control}
                label={t('transaction.open_vial_field.discard')}
                placeholder={t('transaction.open_vial_field.discard')}
                errors={getFieldError('broken_open_vial')}
                value={String(broken_open_vial ?? '')}
                onChangeText={handleChangeQty('broken_open_vial')}
                {...getTestID('textfield-broken-open-vial')}
              />
              <InputNumber
                name={`${fieldName}.broken_close_vial`}
                control={control}
                label={t('transaction.close_vial_field.discard')}
                placeholder={t('transaction.close_vial_field.discard')}
                errors={getFieldError('broken_close_vial')}
                value={String(broken_close_vial ?? '')}
                onChangeText={handleChangeQty('broken_close_vial')}
                {...getTestID('textfield-broken-close-vial')}
              />
            </React.Fragment>
          ) : (
            <InputNumber
              name={`${fieldName}.broken_qty`}
              control={control}
              label={t('transaction.field.discard')}
              placeholder={t('transaction.field.discard')}
              errors={getFieldError('broken_qty')}
              value={String(broken_qty ?? '')}
              onChangeText={handleChangeQty('broken_qty')}
              {...getTestID('textfield-broken-qty')}
            />
          )}
          <Dropdown
            data={transactionReasons}
            preset='bottom-border'
            name={`${fieldName}.transaction_reason_id`}
            control={control}
            label={t('label.discard_reason')}
            placeholder={t('label.discard_reason')}
            isMandatory
            onChangeValue={handleChangeReason}
            errors={getFieldError('transaction_reason_id')}
            {...getTestID(`dropdown-transaction-reason-return`)}
          />
          {isOther && (
            <TextField
              name={`${fieldName}.other_reason`}
              control={control}
              label={t('label.other_reason')}
              placeholder={t('label.other_reason')}
              isMandatory
              errors={getFieldError('other_reason')}
              {...getTestID(`textfield-other-reason-return`)}
            />
          )}
          <Text className={AppStyles.labelRegular}>
            {t('transaction.helpers.number_of_return')}
            <Text className='text-marine'> {numberOfReturn}</Text>
          </Text>
        </View>
      )}
    </React.Fragment>
  )
}

export default DiscardedSection
