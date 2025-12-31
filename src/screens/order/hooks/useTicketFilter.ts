import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  GetEventReportFilters,
  TicketFilterFormValues,
} from '@/models/order/EventReport'
import { setTicketFilter } from '@/services/features/ticket.slice'
import { ticketState, useAppDispatch, useAppSelector } from '@/services/store'
import {
  TICKET_FILTER_DEFAULT_VALUES,
  TICKET_FILTER_FORM_KEYS,
} from '@/utils/Constants'

export function useTicketFilter() {
  const dispatch = useAppDispatch()
  const { filter } = useAppSelector(ticketState)

  const { control, handleSubmit, reset, setValue } =
    useForm<TicketFilterFormValues>({
      defaultValues: TICKET_FILTER_DEFAULT_VALUES,
    })

  const updateFormValues = useCallback(() => {
    for (const key of TICKET_FILTER_FORM_KEYS) {
      setValue(key, filter[key] ?? '')
    }
  }, [filter, setValue])

  const applyFilter = useCallback(
    (data: TicketFilterFormValues) => {
      const filterData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value || undefined])
      ) as Partial<GetEventReportFilters>

      dispatch(setTicketFilter(filterData))
    },
    [dispatch]
  )

  return {
    filter,
    control,
    handleSubmit,
    updateFormValues,
    applyFilter,
    resetFilter: reset,
  }
}
