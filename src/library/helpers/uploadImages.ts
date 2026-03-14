import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request } from "express";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_FOLDER = "lyon-pitchwear/products";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];

/* -------------------------------------------------------------------------- */
/*                               FILE FILTER                                  */
/* -------------------------------------------------------------------------- */

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

/* -------------------------------------------------------------------------- */
/*                              CLOUDINARY STORAGE                            */
/* -------------------------------------------------------------------------- */

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req: Request, file: Express.Multer.File) => ({
    folder: CLOUDINARY_FOLDER,
    allowed_formats: ALLOWED_FORMATS,
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto" },
    ],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

/* -------------------------------------------------------------------------- */
/*                                MULTER SETUP                                */
/* -------------------------------------------------------------------------- */

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/*
upload.single("image")        // single image
upload.array("images", 5)     // multiple images
upload.fields([...])          // mixed fields
*/

/* -------------------------------------------------------------------------- */
/*                         CLOUDINARY HELPER FUNCTIONS                        */
/* -------------------------------------------------------------------------- */

export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split("/");
  const path = parts.slice(parts.indexOf("lyon-pitchwear")).join("/");
  return path.split(".")[0];
};

export const deleteImageFromCloudinary = async (url: string): Promise<void> => {
  const publicId = getPublicIdFromUrl(url);
  await cloudinary.uploader.destroy(publicId);
};

export const deleteImagesFromCloudinary = async (
  urls: string[]
): Promise<void> => {
  if (!urls.length) return;
  await Promise.all(urls.map(deleteImageFromCloudinary));
};

export default cloudinary;