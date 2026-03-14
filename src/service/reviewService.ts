import Review from '../models/reviewModel';
import Order from '../models/orderModel';
import { ICreateReviewDTO, IUpdateReviewDTO, IReviewServiceResponse } from '../types/reviewType';
import { ReviewStatus } from '../utils/enums/reviewEnum';
import { OrderStatus } from '../utils/enums/oderEnum';

// ─── Create Review ─────────────────────────────────────────────────────────────
export const createReviewService = async (
  userId: string,
  dto: ICreateReviewDTO
): Promise<IReviewServiceResponse> => {
  try {
    // 1. Verify the user actually ordered and received this product
    const order = await Order.findOne({
      _id:         dto.order,
      user:        userId,
      orderStatus: OrderStatus.DELIVERED,
      'orderItems.product': dto.product,
    });

    if (!order) {
      return {
        success: false,
        message: 'You can only review products from delivered orders',
      };
    }

    // 2. Check if review already exists
    const existing = await Review.findOne({
      user:    userId,
      product: dto.product,
      order:   dto.order,
    });

    if (existing) {
      return { success: false, message: 'You have already reviewed this product' };
    }

    // 3. Create review
   // ✅ Auto-approve — goes live immediately
const review = await Review.create({ 
  ...dto, 
  user: userId, 
  status: ReviewStatus.APPROVED,
});
    await review.populate('user', 'firstName lastName');

    return { success: true, data: review, message: 'Review submitted successfully. It will be visible after moderation.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get Reviews for a Product (public — approved only) ───────────────────────
export const getProductReviewsService = async (
  productId: string,
  page = 1,
  limit = 10
): Promise<IReviewServiceResponse> => {
  try {
    const skip = (page - 1) * limit;
    const filter = { product: productId, status: ReviewStatus.APPROVED };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Rating summary
    const ratingSummary = await Review.aggregate([
      { $match: { product: { $eq: require('mongoose').Types.ObjectId.createFromHexString(productId) }, status: ReviewStatus.APPROVED } },
      {
        $group: {
          _id:       null,
          avgRating: { $avg: '$rating' },
          total:     { $sum: 1 },
          five:      { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          four:      { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          three:     { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          two:       { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          one:       { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    return {
      success: true,
      data: {
        reviews,
        summary: ratingSummary[0] || { avgRating: 0, total: 0 },
      },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get My Reviews ────────────────────────────────────────────────────────────
export const getMyReviewsService = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<IReviewServiceResponse> => {
  try {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ user: userId }),
    ]);
    return {
      success: true,
      data: reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Update My Review ──────────────────────────────────────────────────────────
export const updateMyReviewService = async (
  userId: string,
  reviewId: string,
  dto: IUpdateReviewDTO
): Promise<IReviewServiceResponse> => {
  try {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) return { success: false, message: 'Review not found' };

    // Reset to pending after edit — needs re-moderation
    Object.assign(review, { ...dto, status: ReviewStatus.PENDING });
    await review.save();

    return { success: true, data: review, message: 'Review updated. It will be visible after moderation.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Delete My Review ──────────────────────────────────────────────────────────
export const deleteMyReviewService = async (
  userId: string,
  reviewId: string
): Promise<IReviewServiceResponse> => {
  try {
    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) return { success: false, message: 'Review not found' };
    return { success: true, message: 'Review deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin — Get All Reviews ───────────────────────────────────────────────────
export const getAllReviewsService = async (
  page = 1,
  limit = 20,
  status?: ReviewStatus
): Promise<IReviewServiceResponse> => {
  try {
    const skip   = (page - 1) * limit;
    const filter: any = {};
    if (status) filter.status = status;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user',    'firstName lastName email')
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      success: true,
      data: reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin — Approve / Reject Review ──────────────────────────────────────────
export const moderateReviewService = async (
  reviewId: string,
  status: ReviewStatus
): Promise<IReviewServiceResponse> => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );
    if (!review) return { success: false, message: 'Review not found' };
    return { success: true, data: review, message: `Review ${status}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin — Delete Any Review ─────────────────────────────────────────────────
export const adminDeleteReviewService = async (
  reviewId: string
): Promise<IReviewServiceResponse> => {
  try {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return { success: false, message: 'Review not found' };
    return { success: true, message: 'Review deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
