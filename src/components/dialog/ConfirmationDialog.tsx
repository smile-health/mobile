import React from 'react'
import { View, Text } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { useBackHandler } from '@/utils/hooks/useBackHandler'
import { Button, ButtonProps } from '../buttons'
import Portal from '../portals/Portal'

export interface ConfirmationDialogProps {
  title?: string
  message?: React.ReactNode | string
  confirmText?: string
  cancelText?: string
  modalVisible?: boolean
  confirmProps?: ButtonProps
  cancelProps?: ButtonProps
  backdropClassName?: string
  containerClassName?: string
  titleClassName?: string
  messageClassName?: string
  buttonContainerClassName?: string
  children?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  dismissDialog: () => void
}

const renderButton = (
  text: string,
  onPress: () => void,
  textClassName: string,
  props: any
) => (
  <Button
    text={text}
    onPress={onPress}
    textClassName={textClassName}
    {...props}
  />
)

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { t } = useLanguage()
  const {
    modalVisible,
    title = t('dialog.confirmation'),
    message,
    confirmText = t('button.yes'),
    cancelText = t('button.back'),
    confirmProps,
    cancelProps,
    backdropClassName,
    containerClassName,
    titleClassName,
    messageClassName,
    buttonContainerClassName,
    children,
    dismissDialog,
    onCancel,
    onConfirm,
  } = props

  const className = {
    backdrop: cn(
      'absolute inset-0 bg-blackTransparent px-4',
      backdropClassName
    ),
    container: cn('bg-white p-4 rounded w-full', containerClassName),
    title: cn(
      AppStyles.textBoldLarge,
      'text-charcoalGrey mb-4',
      titleClassName
    ),
    message: cn(
      AppStyles.textRegular,
      'text-charcoalGrey mb-6',
      messageClassName
    ),
    buttonContainer: cn(
      'flex-row justify-end items-center gap-x-2',
      buttonContainerClassName
    ),
    confirm: cn(AppStyles.textMedium, 'text-charcoalGrey px-2'),
    cancel: cn(AppStyles.textMedium, 'text-main px-2'),
  }

  useBackHandler(() => {
    if (modalVisible) {
      dismissDialog()
      return true
    }
    return false
  }, [modalVisible, dismissDialog])

  return modalVisible ? (
    <Portal name='ConfirmDialog'>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        className={className.backdrop}>
        <View className='flex-1 items-center justify-center'>
          <View className={className.container}>
            <Text className={className.title}>{title}</Text>
            {!!message && <Text className={className.message}>{message}</Text>}
            {children}
            <View className={className.buttonContainer}>
              {onCancel &&
                renderButton(
                  cancelText,
                  onCancel,
                  className.cancel,
                  cancelProps
                )}
              {onConfirm &&
                renderButton(
                  confirmText,
                  () => {
                    onConfirm()
                  },
                  className.confirm,
                  confirmProps
                )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Portal>
  ) : null
}
