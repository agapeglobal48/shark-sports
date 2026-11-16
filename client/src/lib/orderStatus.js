// Names and colours for order statuses, used by the account page and the admin panel.
export const ORDER_STATUS = {
  PENDING: { label: 'Awaiting payment', admin: 'Unpaid checkout', cls: 'bg-bone/10 text-mute' },
  PAID: { label: 'Order received', admin: 'New, to pack', cls: 'bg-blaze/15 text-blaze' },
  PROCESSING: { label: 'Being prepared', admin: 'Packing', cls: 'bg-amber-500/15 text-amber-400' },
  SHIPPED: { label: 'Shipped', admin: 'Shipped', cls: 'bg-sky-500/15 text-sky-400' },
  DELIVERED: { label: 'Delivered', admin: 'Delivered', cls: 'bg-emerald-500/15 text-emerald-400' },
  CANCELLED: { label: 'Cancelled', admin: 'Cancelled', cls: 'bg-bone/10 text-mute' },
  REFUNDED: { label: 'Refunded', admin: 'Refunded', cls: 'bg-bone/10 text-mute' },
}

export const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const dateTimeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
