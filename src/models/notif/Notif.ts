export interface NotifResponse {
  total: number
  as_vendor: number
  as_customer: number
}

export interface NotifOrderNotReceivedResponse {
  order_not_received: NotifResponse
}

export interface NotifData {
  menuName: string
  notifData?: NotifOrderNotReceivedResponse
}
