import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-side only, never sent to browser
  secure: true,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export function validateImageFile(file: { type: string; size: number }) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG or WEBP images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image must be smaller than 8MB.");
  }
}

/**
 * Uploads a base64/data-URI or buffer-derived string to Cloudinary under a
 * folder, applying automatic quality/format optimization.
 */
export async function uploadImage(
  fileDataUri: string,
  folder: "gallery" | "services" | "courses" | "intakes" | "banners" | "applications" | "settings"
) {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder: `kevo-nails-academy/${folder}`,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
