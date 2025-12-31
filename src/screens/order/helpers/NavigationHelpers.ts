import { navigateAndReset } from '@/utils/NavigationUtils'

const RESET_LEVEL = 1

export const navigateToOrderDetail = (
  orderId: number,
  type?: number,
  resetLevel = RESET_LEVEL
) => {
  navigateAndReset(
    [
      { name: 'Workspace' },
      { name: 'Home' },
      { name: 'ViewOrder' },
      {
        name: 'OrderDetail',
        params: { id: orderId, type: type },
      },
    ],
    resetLevel
  )
}

const RESET_LEVEL_TICKET = 2

export const navigateToTicketDetail = (
  ticketId: number,
  resetLevel = RESET_LEVEL_TICKET
) => {
  navigateAndReset(
    [
      { name: 'Workspace' },
      { name: 'Home' },
      {
        name: 'TicketDetail',
        params: { id: ticketId },
      },
    ],
    resetLevel
  )
}
