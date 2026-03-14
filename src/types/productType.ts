import { ProductCategory, ProductSize, ProductStatus } from "../utils/enums/productEnum";
export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  subCategory?: string;
  images: string[];
  sizes?: ProductSize[];
  colors?: string[];
  inStock: boolean;
  featured: boolean;
  status: ProductStatus;
  sku: string;
  rating:      number;      // ← add this
  ratingCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  subCategory?: string;
  images?: string[];
  sizes?: ProductSize[];
  colors?: string[];
  inStock?: boolean;
  featured?: boolean;
  status?: ProductStatus;
  sku: string;
}

export interface IUpdateProductDTO extends Partial<ICreateProductDTO> {
    existingImages: string[];
}

export interface IProductQueryParams {
  category?: ProductCategory;
  subCategory?: string;
  inStock?: boolean;
  featured?: boolean;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IProductServiceResponse {
  success: boolean;
  data?: IProduct | IProduct[] | null;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
