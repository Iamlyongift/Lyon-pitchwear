import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../types/reviewType';
import { ReviewStatus } from '../utils/enums/reviewEnum';

export interface IReviewDocument extends Omit<IReview, '_id'>, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    user:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    order:   { type: Schema.Types.ObjectId, ref: 'Order',   required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   { type: String, required: true, trim: true },
    body:    { type: String, required: true, trim: true },
    status:  { type: String, enum: Object.values(ReviewStatus), default: ReviewStatus.PENDING },
  },
  { timestamps: true, versionKey: false }
);

// ─── One review per user per product per order ─────────────────────────────────
ReviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });
ReviewSchema.index({ product: 1, status: 1 });

// ─── Auto-update product rating after save/delete ─────────────────────────────
const updateProductRating = async (productId: any) => {
  const result = await mongoose.model('Review').aggregate([
    { $match: { product: productId, status: ReviewStatus.APPROVED } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating  = result[0]?.avgRating || 0;
  const ratingCount = result[0]?.count    || 0;

  await mongoose.model('Product').findByIdAndUpdate(productId, {
    rating:      Math.round(avgRating * 10) / 10,
    ratingCount,
  });
};

ReviewSchema.post('save', async function () {
  await updateProductRating(this.product);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateProductRating(doc.product);
});

export default mongoose.model<IReviewDocument>('Review', ReviewSchema);
