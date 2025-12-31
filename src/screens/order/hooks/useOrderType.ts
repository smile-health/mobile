import { OrderTypeResult } from '../types/order'

export const useOrderType = (filter: any): OrderTypeResult => {
  const isVendor = filter.purpose === 'sales'
  const isCustomer = filter.purpose === 'purchase'

  return { isVendor, isCustomer }
}
