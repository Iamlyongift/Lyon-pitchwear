export enum OrderStatus {
  PENDING    = 'pending',
  CONFIRMED  = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED    = 'shipped',
  DELIVERED  = 'delivered',
  CANCELLED  = 'cancelled',
}

export enum PaymentStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED   = 'payment_failed',
  REFUNDED         = 'refunded',
}

export enum DeliveryMethod {
  STANDARD = 'standard',
  EXPRESS  = 'express',
  PICKUP   = 'pickup',
}