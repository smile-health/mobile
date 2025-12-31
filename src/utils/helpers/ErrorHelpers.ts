import { showError } from '../CommonUtils'

const extractOrderItemErrors = (orderItemErrors: any): string => {
  if (!orderItemErrors) return ''

  return Object.values(orderItemErrors)
    .map((item: any) => Object.values(item).flat().join(', '))
    .join('\n')
}

const extractTicketItemErrors = (ticketItemErrors: any): string => {
  if (!ticketItemErrors) return ''

  return Object.values(ticketItemErrors)
    .map((item: any) => Object.values(item).flat().join(', '))
    .join('\n')
}

export const showFormattedError = (error: any) => {
  let errorMessage = error?.message

  const orderItemErrors = extractOrderItemErrors(error?.errors?.order_items)
  if (orderItemErrors) {
    errorMessage += `\n\n${orderItemErrors}`
  }

  const ticketItemErrors = extractTicketItemErrors(error?.errors?.items)
  if (ticketItemErrors) {
    errorMessage += `\n\n${ticketItemErrors}`
  }

  showError(errorMessage)
}

export const getErrorMessage = (error: unknown, t): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message
  }
  return t('error.network_response')
}
