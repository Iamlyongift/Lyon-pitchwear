import Joi from 'joi';
import {
  ProductCategory,
  ProductSize,
  ProductStatus,
  KitSubCategory,
  GymGearSubCategory,
  TrainingEquipmentSubCategory,
} from '../enums/productEnum';

const allSubCategories = [
  ...Object.values(KitSubCategory),
  ...Object.values(GymGearSubCategory),
  ...Object.values(TrainingEquipmentSubCategory),
];

export const createProductValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .required(),
  subCategory: Joi.string()
    .valid(...allSubCategories)
    .optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  sizes: Joi.array()
    .items(Joi.string().valid(...Object.values(ProductSize)))
    .optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  inStock: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional(),
  sku: Joi.string().pattern(/^[A-Z0-9-]+$/).uppercase().min(3).max(20).required(),
});

export const updateProductValidator = Joi.object({
  name:           Joi.string().trim().min(2).max(100).optional(),
  description:    Joi.string().trim().min(10).max(2000).optional(),
  price:          Joi.number().positive().optional(),
  category:       Joi.string().valid(...Object.values(ProductCategory)).optional(),
  subCategory:    Joi.string().optional(),
  sizes:          Joi.array().items(Joi.string()).optional(),
  colors:         Joi.array().items(Joi.string()).optional(),
  sku:            Joi.string().pattern(/^[A-Z0-9-]+$/).uppercase().optional(),
  featured:       Joi.boolean().optional(),
  inStock:        Joi.boolean().optional(),
  status:         Joi.string().valid(...Object.values(ProductStatus)).optional(),
  existingImages: Joi.array().items(Joi.string()).optional(), // ← add this
});

export const productQueryValidator = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .optional(),
  subCategory: Joi.string().optional(),
  inStock: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...Object.values(ProductStatus))
    .optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string()
    .valid('price', 'name', 'createdAt', 'featured')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});
