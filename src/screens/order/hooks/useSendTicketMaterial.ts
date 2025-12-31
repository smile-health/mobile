import { useCallback } from 'react'
import { TicketMaterialRequest } from '@/models/order/TicketMaterial'
import { useSendTicketMaterialMutation } from '@/services/apis/ticket-material.api'

export function useSendTicketMaterial() {
  const [sendTicketMaterial, { isLoading, isSuccess, isError, data, error }] =
    useSendTicketMaterialMutation()

  const send = useCallback(
    async (payload: TicketMaterialRequest) => {
      return await sendTicketMaterial(payload).unwrap()
    },
    [sendTicketMaterial]
  )

  return {
    send,
    isLoading,
    isSuccess,
    isError,
    data,
    error,
  }
}
