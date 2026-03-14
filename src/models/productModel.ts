import mongoose, { Schema, Document } from 'mongoose';
import { ProductCategory, ProductSize, ProductStatus } from '../utils/enums/productEnum';
import { IProduct } from '../types/productType';

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: [true, 'Product category is required'],
    },
    subCategory: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      enum: Object.values(ProductSize),
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
    },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster queries
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });

export default mongoose.model<IProductDocument>('Product', ProductSchema);
