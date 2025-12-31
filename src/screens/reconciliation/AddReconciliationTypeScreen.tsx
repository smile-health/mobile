import React, { useCallback } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { FormProvider } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InputNumber } from '@/components/forms'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import { InfoRow } from '@/components/list/InfoRow'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import ActionReasonFormItem from './components/ActionReasonFormItem'
import useReconciliationTypeForm from './hooks/useReconciliationTypeForm'

const checkIsDisableAdd = (actionReasons) => {
  return actionReasons.some((ar) => !ar.reason_id || !ar.action_id)
}

export default function AddReconciliationTypeScreen() {
  const {
    t,
    activityName,
    materialName,
    form,
    methods,
    errors,
    actions,
    reasons,
    shouldShowLoading,
    handleChangeActualQty,
    handleDeleteActionReason,
    handleAddActionReason,
    handleSave,
    handleRefreshOptions,
  } = useReconciliationTypeForm()

  const {
    action_reasons = [],
    recorded_qty,
    actual_qty,
    reconciliation_category_label: categoryLabel,
  } = form

  const renderActionReasonForm = useCallback(
    (index) => {
      const isLastIndex = action_reasons.length - 1 === index
      return (
        <ActionReasonFormItem
          key={`action-reasons-${index}`}
          actions={actions}
          reasons={reasons}
          index={index}
          isLastIndex={isLastIndex}
          onDelete={handleDeleteActionReason}
        />
      )
    },
    [action_reasons, actions, handleDeleteActionReason, reasons]
  )

  const renderSectionFooter = useCallback(() => {
    const haveError = !!errors.action_reasons
    const isDisableButton = checkIsDisableAdd(action_reasons) || haveError
    return (
      <View className='bg-white pb-4 w-full gap-y-4'>
        {errors.action_reasons?.message && (
          <Text className={cn(AppStyles.textRegular, 'text-warmPink')}>
            {errors.action_reasons.message}
          </Text>
        )}
        <Button
          LeftIcon={Icons.IcAdd}
          leftIconSize={20}
          leftIconColor={colors.main()}
          containerClassName='gap-x-2 self-start'
          text={t('reconciliation.reason_action')}
          textClassName='text-main'
          onPress={handleAddActionReason}
          disabled={isDisableButton}
          {...getTestID('btn-add-patient')}
        />
      </View>
    )
  }, [action_reasons, errors.action_reasons, handleAddActionReason, t])

  useToolbar({
    title: t('home.menu.reconciliation'),
    actions: <RefreshHomeAction onRefresh={handleRefreshOptions} />,
  })

  return (
    <View className='bg-lightBlueGray flex-1'>
      <ActivityHeader name={activityName} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={flexStyle}>
        <FormProvider {...methods}>
          <ScrollView contentContainerClassName='flex-grow'>
            <View className='bg-white p-4 gap-y-2'>
              <Text className={AppStyles.textBold}>{materialName}</Text>
              <View className='gap-y-2 p-2 rounded-sm border border-quillGrey'>
                <Text className={AppStyles.textRegular}>{categoryLabel}</Text>
                <InfoRow
                  label={t('common.smile')}
                  value={numberFormat(recorded_qty)}
                />
              </View>
              <InputNumber
                name='actual_qty'
                control={methods.control}
                label={t('reconciliation.real_input', { type: categoryLabel })}
                placeholder={t('reconciliation.real_input', {
                  type: categoryLabel,
                })}
                labelClassName='capitalize'
                onChangeText={handleChangeActualQty}
                value={String(actual_qty ?? '')}
                errors={errors.actual_qty?.message}
                isMandatory
                {...getTestID(`textfield-actual-qty`)}
              />
            </View>
            {!!action_reasons?.length && (
              <View className='flex-grow bg-white p-4 mt-2 gap-y-2'>
                <Text className={AppStyles.textBold}>
                  {t('reconciliation.reason_action')}
                </Text>
                {action_reasons.map((_, index) =>
                  renderActionReasonForm(index)
                )}
                {renderSectionFooter()}
              </View>
            )}
          </ScrollView>
          <View className='bg-white p-4 border-whiteTwo border-t'>
            <Button
              preset='filled'
              text={t('button.save')}
              LeftIcon={Icons.IcCheck}
              onPress={handleSave}
              leftIconColor={colors.mainText()}
              textClassName='ml-2'
              {...getTestID('btn-save')}
            />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
      <LoadingDialog
        testID='loading-dialog-action-reason-options'
        modalVisible={shouldShowLoading}
      />
    </View>
  )
}
