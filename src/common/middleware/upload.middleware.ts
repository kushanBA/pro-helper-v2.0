import multer from "multer";
import { AppError } from "../errors/app-error.ts";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAX_FILES = 12; // NIC front + back + up to 10 work images

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function imageExtension(mimetype: string): string {
  return EXTENSION_BY_MIME[mimetype] ?? "";
}

// Keeps files in memory as Buffers so the service can hand them to the storage
// layer. Routes call e.g. imageUpload.fields([...]) to declare expected fields.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (EXTENSION_BY_MIME[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new AppError(400, "Only JPEG, PNG or WEBP images are allowed"));
    }
  },
});
