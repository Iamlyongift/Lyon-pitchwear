import Product from "../models/productModel";
import { deleteImagesFromCloudinary } from "../library/helpers/uploadImages";
import {
  ICreateProductDTO,
  IUpdateProductDTO,
  IProductQueryParams,
  IProductServiceResponse,
} from "../types/productType";
import { ProductStatus } from "../utils/enums/productEnum";

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTION                               */
/* -------------------------------------------------------------------------- */

const serviceError = (error: any): IProductServiceResponse => ({
  success: false,
  message: error.message,
});

/* -------------------------------------------------------------------------- */
/*                               GET ALL PRODUCTS                             */
/* -------------------------------------------------------------------------- */

export const getAllProductsService = async (
  query: IProductQueryParams
): Promise<IProductServiceResponse> => {
  try {
    const {
      category,
      subCategory,
      inStock,
      featured,
      status = ProductStatus.ACTIVE,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, any> = { status };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (typeof inStock === "boolean") filter.inStock = inStock;
    if (typeof featured === "boolean") filter.featured = featured;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return serviceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                             GET PRODUCT BY ID                              */
/* -------------------------------------------------------------------------- */

export const getProductByIdService = async (
  id: string
): Promise<IProductServiceResponse> => {
  try {
    const product = await Product.findById(id).lean();

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error: any) {
    return serviceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                         GET PRODUCTS BY CATEGORY                           */
/* -------------------------------------------------------------------------- */

export const getProductsByCategoryService = async (
  category: string,
  query: IProductQueryParams
): Promise<IProductServiceResponse> => {
  return getAllProductsService({ ...query, category: category as any });
};

/* -------------------------------------------------------------------------- */
/*                               CREATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const createProductService = async (
  dto: ICreateProductDTO
): Promise<IProductServiceResponse> => {
  try {
    const existing = await Product.findOne({ sku: dto.sku.toUpperCase() });

    if (existing) {
      return {
        success: false,
        message: `SKU "${dto.sku}" already exists`,
      };
    }

    const product = await Product.create(dto);

    return {
      success: true,
      data: product.toObject(),
      message: "Product created successfully",
    };
  } catch (error: any) {
    return serviceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               UPDATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const updateProductService = async (
  id: string,
  dto: IUpdateProductDTO,
  newImages: string[] = []
): Promise<IProductServiceResponse> => {
  try {
    const existing = await Product.findById(id);

    if (!existing) {
      return { success: false, message: "Product not found" };
    }

    const imagesToKeep: string[] = dto.existingImages ?? existing.images;

    const imagesToDelete = existing.images.filter(
      (url) => !imagesToKeep.includes(url)
    );

    await deleteImagesFromCloudinary(imagesToDelete);

    const finalImages = [...imagesToKeep, ...newImages];

    const { existingImages: _, ...cleanDto } = dto;

    const updated = await Product.findByIdAndUpdate(
      id,
      { ...cleanDto, images: finalImages },
      { new: true, runValidators: true }
    ).lean();

    return {
      success: true,
      data: updated,
      message: "Product updated successfully",
    };
  } catch (error: any) {
    return serviceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               DELETE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const deleteProductService = async (
  id: string
): Promise<IProductServiceResponse> => {
  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    await deleteImagesFromCloudinary(product.images);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error: any) {
    return serviceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                              TOGGLE FEATURED                               */
/* -------------------------------------------------------------------------- */

export const toggleFeaturedService = async (
  id: string
): Promise<IProductServiceResponse> => {
  try {
    const product = await Product.findById(id);

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    product.featured = !product.featured;
    await product.save();

    return {
      success: true,
      data: product.toObject(),
      message: `Product ${product.featured ? "featured" : "unfeatured"}`,
    };
  } catch (error: any) {
    return serviceError(error);
  }
};