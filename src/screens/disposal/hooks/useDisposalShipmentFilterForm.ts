import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { IOptions } from '@/models/Common'
import { IDisposalShipmentFilter } from '@/models/disposal/DisposalShipmentList'

interface Props {
  filter: IDisposalShipmentFilter
  isOpen: boolean
}

const initialFilterForm = {
  from_date: undefined,
  to_date: undefined,
  vendor_id: undefined,
  customer_id: undefined,
  activity_id: undefined,
}

function useDisposalShipmentFilterForm({ filter, isOpen }: Props) {
  const { handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: filter,
  })
  const form = watch()

  const handleApplyDateRange = useCallback(
    (start: string, end: string) => {
      reset((prev) => ({ ...prev, from_date: start, to_date: end }))
    },
    [reset]
  )

  const handleSelect = useCallback(
    (field: keyof IDisposalShipmentFilter) => (item: IOptions) => {
      setValue(field, item.value)
    },
    [setValue]
  )

  const handleResetFilter = () => {
    reset(initialFilterForm)
  }

  useEffect(() => {
    if (isOpen) {
      reset(filter)
    }
  }, [filter, isOpen, reset])

  return {
    form,
    reset,
    handleSelect,
    handleApplyDateRange,
    handleResetFilter,
    handleSubmit,
  }
}

export default useDisposalShipmentFilterForm
