import { OrderStatus, PaymentStatus, DeliveryMethod } from '../utils/enums/oderEnum';

// ─── Sub-interfaces ────────────────────────────────────────────────────────────
export interface IOrderItem {
  product:   string; // product _id
  name:      string;
  image:     string;
  price:     number;
  quantity:  number;
  size?:     string;
  color?:    string;
}

export interface IShippingAddress {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  state:    string;
  country:  string;
}

export interface IBankDetails {
  bankName:      string;
  accountNumber: string;
  accountName:   string;
}

// ─── Core Order Interface ──────────────────────────────────────────────────────
export interface IOrder {
  orderNumber:     string;
  user:            any; // user _id
  orderItems:      IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryMethod:  DeliveryMethod;
  deliveryFee:     number;
  subTotal:        number;
  grandTotal:      number;
  orderStatus:     OrderStatus;
  paymentStatus:   PaymentStatus;
  bankDetails:     IBankDetails;
  notes?:          string;
  confirmedAt?:    Date;
  shippedAt?:      Date;
  deliveredAt?:    Date;
  cancelledAt?:    Date;
  cancellationReason?: string;
  createdAt?:      Date;
  updatedAt?:      Date;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface ICreateOrderDTO {
  orderItems: {
    product:  string;
    quantity: number;
    size?:    string;
    color?:   string;
  }[];
  shippingAddress: IShippingAddress;
  deliveryMethod:  DeliveryMethod;
  notes?:          string;
}

export interface IUpdateOrderStatusDTO {
  orderStatus:        OrderStatus;
  cancellationReason?: string;
}

export interface IUpdatePaymentStatusDTO {
  paymentStatus: PaymentStatus;
}

// ─── Service Response ──────────────────────────────────────────────────────────
export interface IOrderServiceResponse {
  success:    boolean;
  data?:      any;
  message?:   string;
  pagination?: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

// ─── Query Params ──────────────────────────────────────────────────────────────
export interface IOrderQueryParams {
  page?:         number;
  limit?:        number;
  orderStatus?:  OrderStatus;
  paymentStatus?: PaymentStatus;
  search?:       string; // search by orderNumber
}
