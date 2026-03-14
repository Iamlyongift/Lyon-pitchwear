import Order from '../models/orderModel';
import Product from '../models/productModel';
import User from '../models/userModel';
import { OrderStatus, PaymentStatus } from '../utils/enums/oderEnum';

export interface IDashboardStats {
  overview: {
    totalRevenue:    number;
    totalOrders:     number;
    totalProducts:   number;
    totalCustomers:  number;
    pendingOrders:   number;
    deliveredOrders: number;
  };
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts:    { name: string; image: string; totalSold: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders:   any[];
}

export const getDashboardStatsService = async (): Promise<{
  success: boolean;
  data?: IDashboardStats;
  message?: string;
}> => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      revenueData,
      ordersByStatus,
      recentOrders,
      topProductsData,
      monthlyData,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ orderStatus: OrderStatus.PENDING }),
      Order.countDocuments({ orderStatus: OrderStatus.DELIVERED }),

      // Total confirmed revenue
      Order.aggregate([
        { $match: { paymentStatus: PaymentStatus.PAYMENT_CONFIRMED } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),

      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // 5 most recent orders
      Order.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Top 5 selling products by quantity
      Order.aggregate([
        { $match: { paymentStatus: PaymentStatus.PAYMENT_CONFIRMED } },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id:       '$orderItems.product',
            name:      { $first: '$orderItems.name' },
            image:     { $first: '$orderItems.image' },
            totalSold: { $sum: '$orderItems.quantity' },
            revenue:   { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: 1, image: 1, totalSold: 1, revenue: 1 } },
      ]),

      // Revenue by last 6 months
      Order.aggregate([
        {
          $match: {
            paymentStatus: PaymentStatus.PAYMENT_CONFIRMED,
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
        },
        {
          $group: {
            _id:     { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$grandTotal' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueByMonth = monthlyData.map((m: any) => ({
      month:   `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      orders:  m.orders,
    }));

    return {
      success: true,
      data: {
        overview: {
          totalRevenue:    revenueData[0]?.total || 0,
          totalOrders,
          totalProducts,
          totalCustomers,
          pendingOrders,
          deliveredOrders,
        },
        revenueByMonth,
        topProducts:    topProductsData,
        ordersByStatus,
        recentOrders,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
