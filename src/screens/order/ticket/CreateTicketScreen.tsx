import React, { useRef, useMemo, useCallback } from 'react'
import { View, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import TicketFormSection from '@/screens/order/component/section/TicketFormSection'
import TicketMaterialSection from '@/screens/order/component/section/TicketMaterialSection'
import { useConfirmDialog } from '@/screens/order/hooks/useConfirmDialog'
import { useCreateTicket } from '@/screens/order/hooks/useCreateTicket'
import { useGetReasonsQuery } from '@/services/apis/reason.api'
import { clearTicketMaterials, getMaterialOption } from '@/services/features'
import { setIgnoreConfirm } from '@/services/features/ticketReason.slice'
import { useAppDispatch, useAppSelector } from '@/services/store'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import { STEPS } from '@/utils/Constants'

export default function CreateTicketScreen() {
  useGetReasonsQuery()

  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const materialList = useAppSelector(getMaterialOption)

  const {
    step,
    mainButtonLabel,
    handleMainButton,
    mainButtonDisabled,
    control,
    errors,
    watch,
    setValue,
    handlePrevious,
    clearErrors,
  } = useCreateTicket({ t })

  const initialFormRef = useRef(watch())
  const formValue = watch()

  const isDirty = useMemo(() => {
    const currentValue = JSON.stringify(formValue)
    const initialValue = JSON.stringify(initialFormRef.current)
    return currentValue !== initialValue
  }, [formValue])

  const clearDataOnBack = useCallback(() => {
    handlePrevious()
    dispatch(clearTicketMaterials())
  }, [handlePrevious, dispatch])

  const {
    showConfirm,
    handleCancelLeave,
    handleConfirmLeave,
    handleBackPress,
  } = useConfirmDialog({
    isDirty,
    onConfirm: () => dispatch(clearTicketMaterials()),
    clearDataOnBack,
  })

  useToolbar({
    title: t('button.create_ticket'),
  })

  useFocusEffect(
    useCallback(() => {
      dispatch(setIgnoreConfirm(false))
    }, [dispatch])
  )

  const renderSectionBar = () => (
    <View className='flex-row items-center px-4 pt-4 mb-2'>
      <View className='flex-1 flex-row items-center'>
        <View className={'h-1.5 rounded bg-main flex-1 transition-all'} />
        <View
          className={`h-1.5 rounded ${step === 2 ? 'bg-main' : 'bg-lightBlueGray'} flex-1 transition-all ml-1`}
        />
      </View>
    </View>
  )

  const renderCurrentStep = () => {
    switch (step) {
      case STEPS.FORM: {
        return (
          <TicketFormSection
            t={t}
            errors={errors}
            control={control}
            watch={watch}
            setValue={setValue}
            clearErrors={clearErrors}
          />
        )
      }
      case STEPS.MATERIALS: {
        return (
          <TicketMaterialSection
            t={t}
            materials={materialList.map((item) => ({
              ...item,
              isBatch:
                typeof item.isBatch === 'number'
                  ? item.isBatch === 1
                  : item.isBatch,
            }))}
          />
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <View className='bg-white flex-1'>
      {renderSectionBar()}
      <ScrollView keyboardShouldPersistTaps='handled'>
        {renderCurrentStep()}
      </ScrollView>

      <View className='flex-row border-t border-quillGrey p-4 gap-x-2'>
        {step === 2 && (
          <Button
            preset='outlined-primary'
            text={t('button.back')}
            onPress={handleBackPress}
            LeftIcon={Icons.IcBack}
            leftIconColor={colors.main()}
            containerClassName='w-1/2 me-1 text-center gap-x-2'
            {...getTestID('btn-previous')}
          />
        )}
        <Button
          preset='filled'
          text={mainButtonLabel}
          onPress={handleMainButton}
          disabled={mainButtonDisabled}
          leftIconDisabledColor={colors.lightGrey}
          leftIconColor={colors.white}
          LeftIcon={Icons.IcArrowRight}
          containerClassName='flex-1 bg-main gap-x-2'
          {...getTestID('btn-apply')}
        />
      </View>

      <ConfirmationDialog
        modalVisible={showConfirm}
        title={t('dialog.unsaved_changes')}
        message={t('dialog.unsaved_changes_message')}
        confirmText={t('button.yes')}
        cancelText={t('button.cancel')}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        dismissDialog={handleCancelLeave}
      />
    </View>
  )
}
