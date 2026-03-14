import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types/orderType';
import { OrderStatus, PaymentStatus, DeliveryMethod } from '../utils/enums/oderEnum';

export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

// ─── Delivery fees ─────────────────────────────────────────────────────────────
export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  [DeliveryMethod.STANDARD]: 2500,
  [DeliveryMethod.EXPRESS]:  5000,
  [DeliveryMethod.PICKUP]:   0,
};

const OrderItemSchema = new Schema(
  {
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    image:    { type: String, default: '' },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size:     { type: String },
    color:    { type: String },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    country:  { type: String, default: 'Nigeria' },
  },
  { _id: false }
);

const BankDetailsSchema = new Schema(
  {
    bankName:      { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName:   { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber:     { type: String, unique: true },
    user:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems:      { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    deliveryMethod:  { type: String, enum: Object.values(DeliveryMethod), default: DeliveryMethod.STANDARD },
    deliveryFee:     { type: Number, default: 0 },
    subTotal:        { type: Number, required: true },
    grandTotal:      { type: Number, required: true },
    orderStatus:     { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    paymentStatus:   { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.AWAITING_PAYMENT },
    bankDetails:     { type: BankDetailsSchema, required: true },
    notes:           { type: String },
    confirmedAt:     { type: Date },
    shippedAt:       { type: Date },
    deliveredAt:     { type: Date },
    cancelledAt:     { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true, versionKey: false }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });

// ─── Auto-generate order number before saving ──────────────────────────────────
OrderSchema.pre('save', async function (this: IOrderDocument) {
  if (this.orderNumber) return;
  const count = await mongoose.model('Order').countDocuments();
  const padded = String(count + 1).padStart(5, '0');
  const year = new Date().getFullYear();
  this.orderNumber = `LYN-${year}-${padded}`;
});

export default mongoose.model<IOrderDocument>('Order', OrderSchema);
