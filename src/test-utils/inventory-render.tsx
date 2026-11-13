import React from 'react'
import { render } from '@testing-library/react-native'
import { FormProvider, useForm } from 'react-hook-form'

/** Render komponen yang memakai useFormContext dengan nilai default form. */
export const renderWithForm = async (
  ui: React.ReactElement,
  defaultValues: any = {},
  capture?: (form: any) => void
) => {
  const Wrapper = ({ children }: any) => {
    const form = useForm({ defaultValues })
    capture?.(form)
    return <FormProvider {...form}>{children}</FormProvider>
  }
  return await render(ui, { wrapper: Wrapper })
}

export const nav = () => require('@react-navigation/native').__nav
export const route = () => require('@react-navigation/native').__route
