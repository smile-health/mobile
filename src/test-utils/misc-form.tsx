import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

/** Bungkus komponen dengan FormProvider; `onForm` menerima methods untuk dipakai test. */
export function FormWrapper({
  defaultValues,
  onForm,
  children,
}: {
  defaultValues: any
  onForm?: (m: any) => void
  children: React.ReactNode
}) {
  const methods = useForm({ defaultValues })
  onForm?.(methods)
  return <FormProvider {...methods}>{children}</FormProvider>
}
