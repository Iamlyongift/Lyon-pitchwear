import { Request, Response } from "express";
import {
  getAllProductsService,
  getProductByIdService,
  getProductsByCategoryService,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleFeaturedService,
} from "../service/productService";
import { getParam } from "../library/helpers/requestHelper";
import {
  createProductValidator,
  updateProductValidator,
  productQueryValidator,
} from "../utils/validators/productValidator";

/* -------------------------------------------------------------------------- */
/*                             VALIDATION HELPER                              */
/* -------------------------------------------------------------------------- */

const validate = (schema: any, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map((d: any) => d.message),
    };
  }

  return { isValid: true, value };
};

/* -------------------------------------------------------------------------- */
/*                               GET ALL PRODUCTS                             */
/* -------------------------------------------------------------------------- */

export const getAllProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = validate(productQueryValidator, req.query);

  if (!validation.isValid) {
    res.status(400).json({ success: false, message: validation.errors });
    return;
  }

  const result = await getAllProductsService(validation.value);
  res.status(result.success ? 200 : 500).json(result);
};

/* -------------------------------------------------------------------------- */
/*                              GET PRODUCT BY ID                             */
/* -------------------------------------------------------------------------- */

export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getProductByIdService(req.params.id as string);

  res.status(result.success ? 200 : 404).json(result);
};

/* -------------------------------------------------------------------------- */
/*                          GET PRODUCTS BY CATEGORY                          */
/* -------------------------------------------------------------------------- */

export const getProductsByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = validate(productQueryValidator, req.query);

  if (!validation.isValid) {
    res.status(400).json({ success: false, message: validation.errors });
    return;
  }

  const result = await getProductsByCategoryService(
    req.params.category as string,
    validation.value,
  );

  res.status(result.success ? 200 : 500).json(result);
};

/* -------------------------------------------------------------------------- */
/*                               CREATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const uploadedImages = req.files
      ? (req.files as Express.Multer.File[]).map((file: any) => file.path)
      : [];

    const body = { ...req.body, images: uploadedImages };
    const validation = validate(createProductValidator, body);

    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.errors });
      return;
    }

    const result = await createProductService(validation.value);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error.message); // ← add this
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                               UPDATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const newImages = req.files
    ? (req.files as Express.Multer.File[]).map((file: any) => file.path)
    : [];

  const body = { ...req.body };

  const validation = validate(updateProductValidator, body);

  if (!validation.isValid) {
    res.status(400).json({ success: false, message: validation.errors });
    return;
  }

  const result = await updateProductService(
    getParam(req, "id"),
    validation.value,
    newImages,
  );
  res.status(result.success ? 200 : 404).json(result);
};
/* -------------------------------------------------------------------------- */
/*                               DELETE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await deleteProductService(req.params.id as string);

  res.status(result.success ? 200 : 404).json(result);
};

/* -------------------------------------------------------------------------- */
/*                               TOGGLE FEATURED                              */
/* -------------------------------------------------------------------------- */

export const toggleFeatured = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await toggleFeaturedService(req.params.id as string);

  res.status(result.success ? 200 : 404).json(result);
};
