import Order, { DELIVERY_FEES } from '../models/orderModel';
import Product from '../models/productModel';
import {
  ICreateOrderDTO,
  IUpdateOrderStatusDTO,
  IUpdatePaymentStatusDTO,
  IOrderServiceResponse,
  IOrderQueryParams,
} from '../types/orderType';
import { OrderStatus, PaymentStatus } from '../utils/enums/oderEnum';

// ─── Bank details from env ─────────────────────────────────────────────────────
const getBankDetails = () => ({
  bankName:      process.env.BANK_NAME      || 'Your Bank Name',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0000000000',
  accountName:   process.env.BANK_ACCOUNT_NAME   || 'Lyon Pitchwear',
});

// ─── Place Order ───────────────────────────────────────────────────────────────
export const createOrderService = async (
  userId: string,
  dto: ICreateOrderDTO
): Promise<IOrderServiceResponse> => {
  try {
    // 1. Fetch all products and validate they exist + are in stock
    const productIds = dto.orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return { success: false, message: 'One or more products not found' };
    }

    // 2. Build order items with current prices
    const orderItems = dto.orderItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      if (!product.inStock) throw new Error(`${product.name} is out of stock`);

      return {
        product:  product._id.toString(),
        name:     product.name,
        image:    product.images?.[0] || '',
        price:    product.price,
        quantity: item.quantity,
        size:     item.size,
        color:    item.color,
      };
    });

    // 3. Calculate totals
    const subTotal    = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = DELIVERY_FEES[dto.deliveryMethod];
    const grandTotal  = subTotal + deliveryFee;

    // 4. Create order
    const order = await Order.create({
      user:            userId,
      orderItems,
      shippingAddress: dto.shippingAddress,
      deliveryMethod:  dto.deliveryMethod,
      deliveryFee,
      subTotal,
      grandTotal,
      orderStatus:   OrderStatus.PENDING,
      paymentStatus: PaymentStatus.AWAITING_PAYMENT,
      bankDetails:   getBankDetails(),
      notes:         dto.notes,
    });

    return {
      success: true,
      data:    order,
      message: 'Order placed successfully. Please transfer the total amount to the bank details provided.',
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get My Orders (customer) ──────────────────────────────────────────────────
export const getMyOrdersService = async (
  userId: string,
  query: IOrderQueryParams
): Promise<IOrderServiceResponse> => {
  try {
    const { page = 1, limit = 10, orderStatus } = query;
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };
    if (orderStatus) filter.orderStatus = orderStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      success: true,
      data:    orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get My Single Order (customer) ───────────────────────────────────────────
export const getMyOrderByIdService = async (
  userId: string,
  orderId: string
): Promise<IOrderServiceResponse> => {
  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) return { success: false, message: 'Order not found' };
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get All Orders (admin) ────────────────────────────────────────────────────
export const getAllOrdersService = async (
  query: IOrderQueryParams
): Promise<IOrderServiceResponse> => {
  try {
    const { page = 1, limit = 10, orderStatus, paymentStatus, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (orderStatus)   filter.orderStatus   = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search)        filter.orderNumber   = { $regex: search, $options: 'i' };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      success: true,
      data:    orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get Single Order (admin) ──────────────────────────────────────────────────
export const getOrderByIdService = async (
  orderId: string
): Promise<IOrderServiceResponse> => {
  try {
    const order = await Order.findById(orderId)
      .populate('user', 'firstName lastName email phone')
      .lean();
    if (!order) return { success: false, message: 'Order not found' };
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Update Order Status (admin) ───────────────────────────────────────────────
export const updateOrderStatusService = async (
  orderId: string,
  dto: IUpdateOrderStatusDTO
): Promise<IOrderServiceResponse> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Prevent updating a delivered or cancelled order
    if (order.orderStatus === OrderStatus.DELIVERED)
      return { success: false, message: 'Cannot update a delivered order' };
    if (order.orderStatus === OrderStatus.CANCELLED)
      return { success: false, message: 'Cannot update a cancelled order' };

    // Set timestamps based on new status
    if (dto.orderStatus === OrderStatus.SHIPPED)    order.shippedAt   = new Date();
    if (dto.orderStatus === OrderStatus.DELIVERED)  order.deliveredAt = new Date();
    if (dto.orderStatus === OrderStatus.CONFIRMED)  order.confirmedAt = new Date();
    if (dto.orderStatus === OrderStatus.CANCELLED) {
      order.cancelledAt        = new Date();
      order.cancellationReason = dto.cancellationReason;
    }

    order.orderStatus = dto.orderStatus;
    await order.save();

    return { success: true, data: order, message: `Order status updated to ${dto.orderStatus}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Update Payment Status (admin) ─────────────────────────────────────────────
export const updatePaymentStatusService = async (
  orderId: string,
  dto: IUpdatePaymentStatusDTO
): Promise<IOrderServiceResponse> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    order.paymentStatus = dto.paymentStatus;

    // Auto-confirm order when payment is confirmed
    if (
      dto.paymentStatus === PaymentStatus.PAYMENT_CONFIRMED &&
      order.orderStatus === OrderStatus.PENDING
    ) {
      order.orderStatus = OrderStatus.CONFIRMED;
      order.confirmedAt = new Date();
    }

    await order.save();

    return { success: true, data: order, message: `Payment status updated to ${dto.paymentStatus}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Cancel Order (customer) ───────────────────────────────────────────────────
export const cancelMyOrderService = async (
  userId: string,
  orderId: string
): Promise<IOrderServiceResponse> => {
  try {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { success: false, message: 'Order not found' };

    // Customer can only cancel pending orders
    if (order.orderStatus !== OrderStatus.PENDING)
      return { success: false, message: 'Only pending orders can be cancelled' };

    order.orderStatus    = OrderStatus.CANCELLED;
    order.cancelledAt    = new Date();
    order.cancellationReason = 'Cancelled by customer';
    await order.save();

    return { success: true, data: order, message: 'Order cancelled successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
