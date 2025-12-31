import React from 'react'
import { ORDER_STATUS } from '@/utils/Constants'
import { AllocatedOrderActions } from '../component/OrderFooterActions/AllocatedOrderActions'
import { ConfirmedOrderActions } from '../component/OrderFooterActions/ConfirmedOrderActions'
import { DraftOrderActions } from '../component/OrderFooterActions/DraftOrderActions'
import { PendingOrderActions } from '../component/OrderFooterActions/PendingOrderActions'
import { ShippedOrderActions } from '../component/OrderFooterActions/ShippedOrderActions'
import { OrderFooterActionProps } from '../types/order'

export const useOrderFooterActions = ({
  status,
  isVendor,
  isCustomer,
  t,
  onValidate,
  onEdit,
  onCancel,
  onShip,
  onConfirm,
  onReceive,
  onAllocate,
  orderType,
  preview = false,
  isRequestOrderConfirmRestricted,
}: OrderFooterActionProps) => {
  if (preview) return null

  const renderDraftOrderActions = () => (
    <DraftOrderActions onCancel={onCancel} onValidate={onValidate} t={t} />
  )

  const renderPendingOrderActions = () => (
    <PendingOrderActions
      isCustomer={isCustomer}
      onEdit={onEdit}
      onCancel={onCancel}
      onConfirm={onConfirm}
      t={t}
      orderType={orderType}
      isRequestOrderConfirmRestricted={isRequestOrderConfirmRestricted}
    />
  )

  const renderConfirmedActitons = () => (
    <ConfirmedOrderActions onCancel={onCancel} onAllocate={onAllocate} t={t} />
  )

  const renderAllocatedActions = () => (
    <AllocatedOrderActions onCancel={onCancel} onShip={onShip} t={t} />
  )

  const renderShippedActions = () => (
    <ShippedOrderActions onReceive={onReceive} t={t} />
  )

  if (status === ORDER_STATUS.DRAFT && isCustomer)
    return renderDraftOrderActions()
  if (status === ORDER_STATUS.PENDING) return renderPendingOrderActions()
  if (status === ORDER_STATUS.CONFIRMED && isVendor)
    return renderConfirmedActitons()
  if (status === ORDER_STATUS.ALLOCATED && isVendor)
    return renderAllocatedActions()
  if (status === ORDER_STATUS.SHIPPED && isCustomer)
    return renderShippedActions()

  return null
}
